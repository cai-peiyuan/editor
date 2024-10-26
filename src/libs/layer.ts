import styleLayerDic from '../config/layer-dic.json'
import sourceLayerDic from '../config/source-layer.json'
import {getToken} from "../libs/auth";
import {latest} from '@maplibre/maplibre-gl-style-spec'
import { LayerSpecification } from 'maplibre-gl'


export function changeType(layer: LayerSpecification, newType: string) {
  const changedPaintProps: LayerSpecification["paint"] = { ...layer.paint }
  Object.keys(changedPaintProps).forEach(propertyName => {
    if(!(propertyName in latest['paint_' + newType])) {
      delete changedPaintProps[propertyName as keyof LayerSpecification["paint"]]
    }
  })

  const changedLayoutProps: LayerSpecification["layout"] = { ...layer.layout }
  Object.keys(changedLayoutProps).forEach(propertyName => {
    if(!(propertyName in latest['layout_' + newType])) {
      delete changedLayoutProps[propertyName as keyof LayerSpecification["layout"]]
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
export function changeProperty(layer: LayerSpecification, group: keyof LayerSpecification | null, property: string, newValue: any) {
  // Remove the property if undefined

  if(newValue === undefined) {
    if(group) {
      const newLayer: any = {
        ...layer,
        // Change object so the diff works in ./src/components/map/MaplibreGlMap.jsx
        [group]: {
          ...layer[group] as any
        }
      };
      delete newLayer[group][property];

      // Remove the group if it is now empty
      if (Object.keys(newLayer[group]).length < 1) {
        delete newLayer[group];
      }
      return newLayer;
    } else {
      const newLayer: any = {
        ...layer
      };
      delete newLayer[property];
      return newLayer;
    }
  } else {
    if (group) {
      return {
        ...layer,
        [group]: {
          ...layer[group] as any,
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
  /*if(layerid === 'roadoverlying'){
    console.log(layerid)
    console.log(layerDic)
    console.log(layerDic['styleLayer'])
    console.log(layerDic['styleLayer'][layerid])
  }*/
  return runConfig.styleLayerLang && runConfig.styleLayerLang == 'en' ? layerid : (layerDic['styleLayer'][layerid] || styleLayerDic[layerid] || layerid);
}

/**
 * 数据源图层的id获取图层别名
 * @param id
 */
export function getSourceLayerChnNameById(id) {
  return runConfig.sourceLayerLang && runConfig.sourceLayerLang == 'en' ? id : (layerDic['sourceLayer'][id] || sourceLayerDic[id] || id);
}

/**
 * 将数据源图层信息添加至msp
 * @param layerSource
 * @param layerId
 */
export function addSourceLayerToMsp(layerSource, layerId) {
//  {"id":null,"layerType":"source","layerGroup":null,"layerId":"1","layerName":"1","layerComment":"1"}
  fetch(api_config.url + '/open/editor/mapStyleEditorLayer', {
    method: "POST",
    mode: 'cors',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      'Authorization': getToken(),
    },
    body: JSON.stringify({
      "id": null,
      "layerType": "source",
      "layerGroup": layerSource,
      "layerId": layerId,
      "layerName": sourceLayerDic[layerId],
      "layerComment": sourceLayerDic[layerId]
    })
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


/**
 * 将样式图层信息添加至msp
 * @param layerGroup
 * @param layerId
 */
export function addStyleLayerToMsp(layerGroup, layerId, layerName, layerComment) {
//  {"id":null,"layerType":"source","layerGroup":null,"layerId":"1","layerName":"1","layerComment":"1"}

  fetch(api_config.url + '/open/editor/mapStyleEditorLayer', {
    method: "POST",
    mode: 'cors',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      'Authorization': getToken(),
    },
    body: JSON.stringify({
      "id": null,
      "layerType": "style",
      "layerGroup": layerGroup,
      "layerId": layerId,
      "layerName": layerName,
      "layerComment": layerComment
    })
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

/**
 * 根据图层样式文件分析图层字典表
 * @param mapStyle
 */
export function getLayerChnNameDicByStyleFile(mapStyle) {
  let styleLayerDic = {
    'background': "背景"
  }
  let sourceLayerDic = {
    'background': "背景"
  }
  console.log("分析字典表。。。。")
  mapStyle.layers.forEach((layer, index) => {
    if (layer["source-layer"] && runConfig.addSourceLayerToMsp && runConfig.addSourceLayerToMsp === true) {
      if (layerDic['sourceLayer'][layer["source-layer"]]) {
      } else {
        addSourceLayerToMsp(layer["source"], layer["source-layer"])
      }
      // sourceLayerDic[layer["source-layer"]] = layer["source-layer"];
    }
    if (layer.metadata) {
      if (layer.metadata.type_level1_chn && layer.metadata.type_level1_eng) {
        styleLayerDic[layer.metadata.type_level1_eng] = layer.metadata.type_level1_chn
        // addStyleLayerToMsp('type_level1_eng', layer.metadata.type_level1_eng, layer.metadata.type_level1_chn ,'type_level1_eng' );
      }
      if (layer.metadata.type_level2_chn && layer.metadata.type_level2_eng) {
        styleLayerDic[layer.metadata.type_level2_eng] = layer.metadata.type_level2_chn
        styleLayerDic[layer.id] = layer.metadata.type_level2_chn
        // addStyleLayerToMsp('type_level2_eng', layer.type_level2_eng, layer.metadata.type_level2_chn ,'type_level2_eng' );
      }
      if (layer.metadata.type_level3_chn && layer.metadata.type_level3_eng) {
        styleLayerDic[layer.metadata.type_level3_eng] = layer.metadata.type_level3_chn

        // addStyleLayerToMsp('type_level3_eng', layer.type_level3_eng, layer.metadata.type_level3_chn ,'type_level3_eng' );
      }
      if (layer.metadata["maputnik:comment"]) {
        styleLayerDic[layer.id] = layer.metadata["maputnik:comment"]
        if (runConfig.addStyleLayerCommentToMsp && runConfig.addStyleLayerCommentToMsp === true) {
          if (layerDic['styleLayer'][layer.id]) {

          } else {
            addStyleLayerToMsp(layer.metadata.type_level2_chn || layer.id, layer.id, layer.metadata["maputnik:comment"], layer.metadata["maputnik:comment"] || layer.metadata.type_level2_chn || layer.id);
          }
        }
      }
    }
  })
  console.log(JSON.stringify(styleLayerDic))
  console.log(JSON.stringify(sourceLayerDic))
}

export function layerPrefix(name: string) {
  return name.replace(' ', '-').replace('_', '-').split('-')[0]
}

export function findClosestCommonPrefix(layers: LayerSpecification[], idx: number) {
  const currentLayerPrefix = layerPrefix(layers[idx].id)
  let closestIdx = idx
  for (let i = idx; i > 0; i--) {
    const previousLayerPrefix = layerPrefix(layers[i-1].id)
    if(previousLayerPrefix === currentLayerPrefix) {
      closestIdx = i - 1
    } else {
      return closestIdx
    }
  }
  return closestIdx
}
