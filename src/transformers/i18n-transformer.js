import { parse } from 'vue/compiler-sfc';
import MagicString from 'magic-string';

import store from '../store';
import transformTemplate from '../schedule/template/transformTemplate';

const i18nTransformer = (fileInfo, api) => {
  try {
    const filePath = fileInfo.path;
    store.set('filePath', filePath);
    const i18nMap = store.get('i18nMap');
    i18nMap.set(filePath, new Map());

    const { source } = fileInfo;
    const ms = new MagicString(source);
    store.set('ms', ms);

    const { descriptor } = parse(source);
    store.set('descriptor', descriptor);

    // 处理阶段
    transformTemplate();

    return ms.toString();
  } catch (error) {
    console.error(`❌ [i18n-tool] 处理文件失败: ${fileInfo.path}`);
    console.error(error);

    return fileInfo.source;
  }
};

export default i18nTransformer;
