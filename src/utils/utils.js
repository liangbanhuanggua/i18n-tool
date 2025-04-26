import { v5 as uuidv5 } from 'uuid';

import store from '../store';

const hasChinese = (str) => /[\u4e00-\u9fa5]/.test(str);

const isHardCoded = (str) => {
  return hasChinese(str);
};

const genKey = (text) => {
  const filePath = store.get('filePath');
  const i18nMap = store.get('i18nMap');

  const uuid = uuidv5(text, uuidv5.URL);
  i18nMap.get(filePath).set(uuid, text);

  return uuid;
};

export { hasChinese, isHardCoded, genKey };
