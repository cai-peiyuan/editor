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
      "token":getToken(),
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
      "token":getToken(),
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


/**
 * 计算某个图层分组中是否显示与隐藏
 * @param groupId
 * @param layers
 */
export function getGroupVisibilityButtonStatus(groupId, layers){
  let groupLayers = groupedLayerMap.groupToLayer[groupId];
  let layerIdsArry = groupLayers.map(layer => layer.layerId) //分组下的图层id，在样式文件中的id
  let allLayerVisibility = 'none';

  //一定要将数据复制出来 不然会修改原来的数据
  let copyLayers = layers.slice(0);
  for (let i = 0; i < copyLayers.length; i++) {
    let layer = copyLayers[i];
    if(layerIdsArry.includes(layer.id)) {
      const changedLayout = 'layout' in layer ? {...layer.layout} : {}
      if(!changedLayout.visibility || changedLayout.visibility === 'visible'){
        allLayerVisibility = 'visible'
      }
    }
  }
  return allLayerVisibility;
}
