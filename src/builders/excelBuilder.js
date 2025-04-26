import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

import store from '../store';

const excelBuilder = async () => {
  const projectRoot = process.cwd();
  const outputDir = path.join(projectRoot, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 目录 ${outputDir} 不存在，已创建`);
  }

  const i18nMap = store.get('i18nMap');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('i18n');
  sheet.columns = [
    { header: '文件路径', key: 'FILE_PATH', width: 120 },
    { header: '内容哈希', key: 'CONTENT_HASH', width: 50 },
    { header: '原文本', key: 'ORIGINAL_TEXT', width: 50 },
    { header: 'I18n Key', key: 'I18N_KEY', width: 50 },
    { header: '中文', key: 'CHINESE', width: 30 },
    { header: '英文', key: 'ENGLISH', width: 30 },
  ];
  for (const [filePath, kvMap] of i18nMap) {
    for (const [CONTENT_HASH, ORIGINAL_TEXT] of kvMap) {
      sheet.addRow({
        FILE_PATH: filePath,
        CONTENT_HASH,
        ORIGINAL_TEXT,
        I18N_KEY: '',
        CHINESE: '',
        ENGLISH: '',
      });
    }
  }
  const outputFile = path.join(outputDir, 'i18n.xlsx');
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
    console.log(`🗑️ 已删除旧文件：${outputFile}`);
  }
  await workbook.xlsx.writeFile(outputFile);
  console.log(`✅ i18n Excel 已保存到 ${outputFile}`);
  process.exit(0);
};

export default excelBuilder;
