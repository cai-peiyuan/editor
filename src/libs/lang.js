import langDict from '../config/lang.json'


/**
 * 获取翻译字段
 * @param lableCode
 * @returns {*}
 */
export function getLableName(lableCode) {
  let lang = window.lang || "zh";
  if(langDict[lableCode] && langDict[lableCode][lang]){
    return langDict[lableCode][lang];
  }else{
    return  lableCode;
  }
}
