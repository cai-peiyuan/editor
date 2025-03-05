import langDict from '../config/lang.json'
import {getToken} from "../util/auth";

/**
 * 获取翻译字段
 * @param labelCode
 * @returns {*}
 */
export function getLabelName(labelCode) {
  let lang = runConfig.lang || "zh";
  if (langDic[labelCode] && langDic[labelCode][lang]) {
    return langDic[labelCode][lang];
  } else if (langDict[labelCode] && langDict[labelCode][lang]) {
    return langDict[labelCode][lang];
  } else {
    return labelCode;
  }
}

/**
 * 保存字典到msp服务
 */
export function saveLangToMsp() {
  Object.keys(langDict).map(k => {
    if (langDic[k]) {
      // 已经有的不提交了

    } else {
      // 没有的提交保存
      fetch(api_config.url + '/api/mapStyleEditorLang', {
        method: "POST",
        mode: 'cors',
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          'Authorization': getToken(),
        },
        body: JSON.stringify({"id": null, "langKey": k, "langEn": langDict[k]['en'], "langZh": langDict[k]['zh']})
      })
        .then(function (response) {
          return response.json();
        })
        .then((body) => {
          console.log(body)
        })
        .catch(function (error) {
          if (error) console.error(error)
        })

    }
  })
}
