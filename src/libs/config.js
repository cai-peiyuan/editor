import {getToken} from "../libs/auth";
/**
 * 获取图层配置信息
 */
export async function getAppConfig() {
  //const res = await fetch(api_config.url + '/api/mapStyleEditorConfig/runConfig/editor1', {
  const res = await fetch(api_config.url + '/open/editor/mapStyleEditorConfig/runConfig/editor1', {
    method: "GET",
    mode: 'cors',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      'Authorization': getToken(),
    }
  });
  const result = await res.json();
  return result;

  /*
    .then(function (response) {
      return response.json();
    })
    .then((body) => {
      console.log(body)
    })
    .catch(function (error) {
      if (error) console.error(error)
    })*/
}


export async function getAppConfig1() {
  const res = await fetch(api_config.url + '/api/mapStyleEditorConfig/runConfig/editor1', {
    method: "GET",
    mode: 'cors',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      'Authorization': getToken(),
    }
  }).then(function (response) {
      return response.json();
    })
    .then((body) => {
      return (body)
    })
    .catch(function (error) {
      if (error) console.error(error)
    })
}

