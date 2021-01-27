import {getToken} from "../util/auth";
/**
 * 获取图层配置信息
 */
export function getAppConfig() {
  fetch(api_config.url + '/api/mapStyle/editorConfig', {
    method: "GET",
    mode: 'cors',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      'Authorization': getToken(),
    }
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
