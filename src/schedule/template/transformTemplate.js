import { baseParse, transform, NodeTypes } from '@vue/compiler-core';
import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';
import { isString } from 'lodash';

import store from '../../store';
import { genKey } from '../../utils/utils';

const transformTemplate = () => {
  const descriptor = store.get('descriptor');
  const ms = store.get('ms');

  const { template } = descriptor;
  if (!template) {
    return;
  }

  const content = template.content ?? '';
  const ast = baseParse(content, { comments: true });
  const offsetBase = template.loc.start.offset;

  transform(ast, {
    nodeTransforms: [
      // 处理文本节点
      (node) => {
        if (node.type !== NodeTypes.TEXT) {
          return;
        }

        // 原值
        const raw = node.content;
        if (raw.includes('{{ $imt(')) {
          return;
        }

        const start = offsetBase + node.loc.start.offset;
        const end = offsetBase + node.loc.end.offset;
        const key = genKey(raw);
        const replacement = `{{ $imt('${key}') }}`;

        ms.overwrite(start, end, replacement);
      },

      // 处理插值
      (node) => {
        if (node.type !== NodeTypes.INTERPOLATION) {
          return;
        }

        const exprNode = node.content;
        if (exprNode.content.includes("$imt('")) {
          return;
        }

        const exprStart = offsetBase + node.content.loc.start.offset;
        const exprSrc = content.slice(
          node.content.loc.start.offset,
          node.content.loc.end.offset
        );

        const exprAst = babelParse(exprSrc, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });

        traverse(exprAst, {
          StringLiteral(path) {
            // 原值
            const raw = path.node.value;

            const litStart = path.node.start;
            const litEnd = path.node.end;

            const start = exprStart + litStart;
            const end = exprStart + litEnd;
            const key = genKey(raw);
            const replacement = `$imt('${key}')`;

            ms.overwrite(start, end, replacement);
          },
        });
      },

      // 处理属性
      (node) => {
        if (node.type !== NodeTypes.ELEMENT) {
          return;
        }

        node.props.forEach((prop) => {
          if (!(prop.type === NodeTypes.ATTRIBUTE && prop.value)) {
            return;
          }

          const raw = prop.value.content;

          if (!isString(raw) || raw.includes("$imt('")) {
            return;
          }

          const start = offsetBase + prop.loc.start.offset;
          const end = offsetBase + prop.loc.end.offset;
          const key = genKey(raw);
          const replacement = `:${prop.name}="$imt('${key}')"`;

          ms.overwrite(start, end, replacement);
        });
      },
    ],
  });
};

export default transformTemplate;
