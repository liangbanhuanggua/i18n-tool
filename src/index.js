import path from 'path';
import { glob } from 'glob';
import { run } from 'jscodeshift/src/Runner';

import excelBuilder from './builders/excelBuilder';
import store from './store';

const main = async () => {
  const projectRoot = process.cwd();
  const pattern = path.join(projectRoot, 'test/**/*.vue');
  const files = glob.sync(pattern);

  if (!files.length) {
    console.warn(`⚠️ 没有匹配到文件：${pattern}`);
    return;
  }

  console.log(`🚀 找到 ${files.length} 个 .vue 文件，开始处理…`);

  const options = {
    transform: path.join(projectRoot, 'src/transformers/i18n-transformer.js'),
    extensions: 'vue',
    babel: true,
    parser: 'babel',
    runInBand: true,
  };

  const i18nMap = new Map();
  store.set('i18nMap', i18nMap);
  try {
    await run(options.transform, files, options);
    await excelBuilder();
  } catch (error) {
    console.log(error);
  }
};

main();
