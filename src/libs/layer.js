import {latest} from '@mapbox/mapbox-gl-style-spec'
import styleLayerDic from '../config/layer-dic.json'
import sourceLayerDic from '../config/source-layer.json'
import {getToken} from "../util/auth";

export function changeType(layer, newType) {
  const changedPaintProps = { ...layer.paint }
  Object.keys(changedPaintProps).forEach(propertyName => {
    if(!(propertyName in latest['paint_' + newType])) {
      delete changedPaintProps[propertyName]
    }
  })

  const changedLayoutProps = { ...layer.layout }
  Object.keys(changedLayoutProps).forEach(propertyName => {
    if(!(propertyName in latest['layout_' + newType])) {
      delete changedLayoutProps[propertyName]
    }
  })

  return {
    ...layer,
    paint: changedPaintProps,
    layout: changedLayoutProps,
    type: newType,
  }
}

/** A {@property} in either the paint our layout {@group} has changed
 * to a {@newValue}.
 */
export function changeProperty(layer, group, property, newValue) {
  // Remove the property if undefined
  if(newValue === undefined) {
    if(group) {
      const newLayer = {
        ...layer,
        // Change object so the diff works in ./src/components/map/MapboxGlMap.jsx
        [group]: {
          ...layer[group]
        }
      };
      delete newLayer[group][property];

      // Remove the group if it is now empty
      if(Object.keys(newLayer[group]).length < 1) {
        delete newLayer[group];
      }
      return newLayer;
    } else {
      const newLayer = {
        ...layer
      };
      delete newLayer[property];
      return newLayer;
    }
  }
  else {
    if(group) {
      return {
        ...layer,
        [group]: {
          ...layer[group],
          [property]: newValue
        }
      }
    } else {
      return {
        ...layer,
        [property]: newValue
      }
    }
  }
}

/**
 * 根据图层的layerid获取图层别名
 * @param layerid
 */
export function getStyleLayerChnNameById(layerid) {
  return runConfig.styleLayerLang && runConfig.styleLayerLang =='en' ? layerid : (layerDic['style'][layerid] || styleLayerDic[layerid] || layerid);
}
/**
 * 数据源图层的id获取图层别名
 * @param id
 */
export function getSourceLayerChnNameById(id) {
  return runConfig.sourceLayerLang && runConfig.sourceLayerLang =='en' ? id : (layerDic['source'][layerid] || sourceLayerDic[id] || id);
}

/**
 * 将数据源图层信息添加至msp
 * @param layerSource
 * @param layerId
 */
export function addSourceLayerToMsp(layerSource, layerId){
//  {"id":null,"layerType":"source","layerGroup":null,"layerId":"1","layerName":"1","layerComment":"1"}

    fetch(api_config.url + '/api/mapStyleEditorLayer', {
      method: "POST",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        'Authorization': getToken(),
      },
      body: JSON.stringify({"id":null,"layerType":"source","layerGroup":layerSource,"layerId":layerId,"layerName":sourceLayerDic[layerId],"layerComment":sourceLayerDic[layerId]})
    })
      .then(function(response) {
        return response.json();
      })
      .then((body) => {
        console.log(body)
      })
      .catch(function(error) {
        if(error) console.error(error)
      })
}


/**
 * 将样式图层信息添加至msp
 * @param layerGroup
 * @param layerId
 */
export function addStyleLayerToMsp(layerGroup, layerId, layerName, layerComment){
//  {"id":null,"layerType":"source","layerGroup":null,"layerId":"1","layerName":"1","layerComment":"1"}

  fetch(api_config.url + '/api/mapStyleEditorLayer', {
    method: "POST",
    mode: 'cors',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      'Authorization': getToken(),
    },
    body: JSON.stringify({"id":null,"layerType":"style","layerGroup":layerGroup,"layerId":layerId,"layerName":layerName,"layerComment":layerComment})
  })
    .then(function(response) {
      return response.json();
    })
    .then((body) => {
      console.log(body)
    })
    .catch(function(error) {
      if(error) console.error(error)
    })
}

/**
 * 根据图层样式文件分析图层字典表
 * @param mapStyle
 */
export function getLayerChnNameDicByStyleFile(mapStyle) {
  let layerDic = {
    'background': "背景"
  }
  let sourceLayerDic = {
    'background': "背景"
  }
  console.log("分析字典表。。。。")
  mapStyle.layers.forEach((layer, index) => {
    if(layer["source-layer"]){
      // addSourceLayerToMsp(layer["source"], layer["source-layer"])
      sourceLayerDic[layer["source-layer"]] = layer["source-layer"];
    }
    if(layer.metadata){
      if(layer.metadata.type_level1_chn && layer.metadata.type_level1_eng){
        layerDic[layer.metadata.type_level1_eng] = layer.metadata.type_level1_chn
        // addStyleLayerToMsp('type_level1_eng', layer.metadata.type_level1_eng, layer.metadata.type_level1_chn ,'type_level1_eng' );
      }
      if(layer.metadata.type_level2_chn && layer.metadata.type_level2_eng){
        layerDic[layer.metadata.type_level2_eng] = layer.metadata.type_level2_chn
        layerDic[layer.id] = layer.metadata.type_level2_chn
        // addStyleLayerToMsp('type_level2_eng', layer.type_level2_eng, layer.metadata.type_level2_chn ,'type_level2_eng' );
        // addStyleLayerToMsp(layer.metadata.type_level2_chn, layer.id, layer.metadata.type_level2_chn || layer.metadata["maputnik:comment"]  ,layer.metadata["maputnik:comment"] || layer.metadata.type_level2_chn );
      }
      if(layer.metadata.type_level3_chn && layer.metadata.type_level3_eng){
        layerDic[layer.metadata.type_level3_eng] = layer.metadata.type_level3_chn

        // addStyleLayerToMsp('type_level3_eng', layer.type_level3_eng, layer.metadata.type_level3_chn ,'type_level3_eng' );
      }
      if(layer.metadata["maputnik:comment"]){
       // layerDic[layer.id] = layer.metadata["maputnik:comment"]
      }
    }
  })
  console.log(JSON.stringify(layerDic))
  console.log(JSON.stringify(sourceLayerDic))
}
