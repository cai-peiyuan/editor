import {latest} from '@mapbox/mapbox-gl-style-spec'
import styleLayerDic from '../config/layer-dic.json'
import sourceLayerDic from '../config/source-layer.json'

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
  return runConfig.styleLayerLang && runConfig.styleLayerLang =='en' ? layerid : (styleLayerDic[layerid] || layerid);
}
/**
 * 数据源图层的id获取图层别名
 * @param id
 */
export function getSourceLayerChnNameById(id) {
  return runConfig.sourceLayerLang && runConfig.sourceLayerLang =='en' ? id : (sourceLayerDic[id] || id);
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
      sourceLayerDic[layer["source-layer"]] = layer["source-layer"];
    }
    if(layer.metadata){
      if(layer.metadata.type_level1_chn && layer.metadata.type_level1_eng){
        layerDic[layer.metadata.type_level1_eng] = layer.metadata.type_level1_chn
      }
      if(layer.metadata.type_level2_chn && layer.metadata.type_level2_eng){
        layerDic[layer.metadata.type_level2_eng] = layer.metadata.type_level2_chn
        layerDic[layer.id] = layer.metadata.type_level2_chn
      }
      if(layer.metadata.type_level3_chn && layer.metadata.type_level3_eng){
        layerDic[layer.metadata.type_level3_eng] = layer.metadata.type_level3_chn
      }
      if(layer.metadata["maputnik:comment"]){
       // layerDic[layer.id] = layer.metadata["maputnik:comment"]
      }
    }
  })
  console.log(JSON.stringify(layerDic))
  console.log(JSON.stringify(sourceLayerDic))
}
