import {latest} from '@mapbox/mapbox-gl-style-spec'

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
export function getLayerChnNameById(layerid) {
  // let layerChnName = layerid;
  let layerDic = {
    'hdmap': "高精度地图",
    'wocean_z2_z8': "3-9级海洋",
    'wroad': "国外道路",
    'croad': "国内道路",
    "0": "0",
    "background": "背景",
    "base": "背景",
    "ocean": "海洋",
    "land": "陆地",
    "grass": "绿地",
    "river": "河流",
    "river_poly": "河流面",
    "island": "岛屿",
    "island_poly": "岛屿面",
    "river_line": "河流线",
    "border": "界线",
    "wborder": "外国行政界线",
    "cborder": "中国行政界线",
    "road": "道路",
    "road_99": "国外道路",
    "road_42000": "国道",
    "road_42000_line": "国道道路",
    "shape": "界线",
    "aoi": "功能区",
    "parking": "停车场",
    "building": "建筑物",
    "building_sport": "运动场",
    "metro": "地铁",
    "metro_poly": "地铁面",
    "walk": "过街天桥",
    "railway": "铁路",
    "railway_high_speed_line": "高铁线路名称标注",
    "road_51000": "省道",
    "road_51000_line": "省道",
    "road_41000": "高速",
    "road_41000_line": "高速道路",
    "road_43000": "城市快速路",
    "road_43000_line": "城市快速路",
    "road_44000": "城市主干路",
    "road_44000_line": "城市主干路",
    "road_walk": "小路",
    "road_walk_line": "小路",
    "road_49": "小路",
    "road_49_line": "小路",
    "road_54000": "县乡村内部道路",
    "road_54000_line": "县乡村内部道路",
    "road_53000": "乡公路",
    "road_53000_line": "乡公路",
    "road_47000": "城市普通道路",
    "road_47000_line": "城市普通道路",
    "road_45000": "城市次干路",
    "road_45000_line": "城市次干路",
    "road_52000": "县道",
    "road_52000_line": "县道",
    "road_dferry": "高速",
    "road_dferry_line": "轮渡",
    "metro_line": "地铁线",
    "crosswalk": "人行横道",
    "island_symbol": "岛屿标注",
    "river_symbol": "河流标注",
    "administrative": "行政区划标注",
    "administrative_chn": "国外",
    "administrative_190105": "中国区县、地级市行政区划名称",
    "administrative_190002": "中国省会城市名称",
    "administrative_190001": "中国首都名称",
    "administrative_195000": "世界国家首都城市名称",
    "administrative_191000": "中国名称",
    "administrative_192000": "世界大洲名称",
    "administrative_193000": "世界海洋名称",
    "administrative_disputed": "印度实际控制区、巴基斯坦实际控制区",
    "road_symbol_arrow": "箭头",
    "road_symbol_arrow2": "箭头2",
    "realroadcross": "交通信号灯",
    "metro_symbol_exit": "地铁出入口标注",
    "metro_line_symbol": "地铁线标注",
    "hdmap_road": "高精度道路",
    "dlm": "道路面",
    "zxd": "中心岛",
    "qhd": "渠化岛",
    "fgd": "分隔岛",
    "sfz_417": "收费站",
    "gld": "隔离带",
    "lhd": "绿化带",
    "bjm": "背景面",
    "xraqd": "行人安全岛",
    "bx": "标线",
    "rxhd": "人行横道",
    "tzx": "停止线",
    "fpw": "防爬网",
    "sm": "水马",
    "jsq": "减速丘",
    "hl": "护栏",
    "fxw": "防眩网",
    "fxb": "防眩板",
    "spz": "声屏障",
    "lmwz": "路面文字",
    "dxjt": "导向箭头",
    "zxjsbs": "向减速标识",
    "lmfh": "路面符号",
    "road_45000_symbol": "城市次干路标注",
    "road_52000_symbol": "县道标注",
    "road_51000_symbol": "省道标注",
    "road_42000_symbol": "国道标注",
    "road_41000_symbol": "高速标注",
    "road_dferry_symbol": "轮渡标注",
    "building_texture": "建筑物基础",
    "xzqh": "行政区划",
    "city": "地市行政区划",
    "county_poly": "区县行政区划",
    "city_poly": "地市行政区划",
    "poi": "兴趣点",
    "poi_01": "汽车服务",
    "poi_0101": "加油站",
    "poi_0100": "汽车服务相关",
    "metro_symbol_station": "地铁站标注_未开通",
    "poi_15": "交通设施服务",
    "poi_1504": "长途汽车站",
    "poi_1501": "机场相关",
    "poi_1502": "火车站",
    "poi_19": "地名地址信息",
    "poi_1901": "普通地名",
    "poi_11": "风景名胜",
    "poi_1102": "风景名胜"
  }
  return layerDic[layerid] || layerid;
}


/**
 * 根据图层样式文件分析图层字典表
 * @param mapStyle
 */
export function getLayerChnNameDicByStyleFile(mapStyle) {
  let layerDic = {
    'background': "背景"
  }
  console.log("分析字典表。。。。")
  mapStyle.layers.forEach((layer, index) => {
    if(layer.metadata){
      if(layer.metadata.type_level1_chn && layer.metadata.type_level1_eng){
        layerDic[layer.metadata.type_level1_eng] = layer.metadata.type_level1_chn
      }
      if(layer.metadata.type_level2_chn && layer.metadata.type_level2_eng){
        layerDic[layer.metadata.type_level2_eng] = layer.metadata.type_level2_chn
      }
      if(layer.metadata.type_level3_chn && layer.metadata.type_level3_eng){
        layerDic[layer.metadata.type_level3_eng] = layer.metadata.type_level3_chn
      }
    }
  })
  console.log(JSON.stringify(layerDic))
}
