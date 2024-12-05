import {derefLayers} from '@maplibre/maplibre-gl-style-spec'
import type {StyleSpecification, LayerSpecification} from 'maplibre-gl'
import tokens from '../config/tokens.json'
import {getToken} from "../libs/auth";

// Empty style is always used if no style could be restored or fetched
const emptyStyle = ensureStyleValidity({
  version: 8,
  sources: {},
  layers: [],
})

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}


function ensureHasId(style: StyleSpecification & { id?: string }): StyleSpecification & { id: string } {
  if(!('id' in style) || !style.id) {
    style.id = generateId();
    return style as StyleSpecification & { id: string };
  }
  return style as StyleSpecification & { id: string };
}

function ensureHasNoInteractive(style: StyleSpecification & {id: string}) {
  const changedLayers = style.layers.map(layer => {
    const changedLayer: LayerSpecification & { interactive?: any } = { ...layer }
    delete changedLayer.interactive
    return changedLayer
  })

  return {
    ...style,
    layers: changedLayers
  }
}

function ensureHasNoRefs(style: StyleSpecification & {id: string}) {
  return {
    ...style,
    layers: derefLayers(style.layers)
  }
}

function ensureStyleValidity(style: StyleSpecification): StyleSpecification & { id: string } {
  return ensureHasNoInteractive(ensureHasNoRefs(ensureHasId(style)))
}

function indexOfLayer(layers: LayerSpecification[], layerId: string) {
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].id === layerId) {
      return i
    }
  }
  return null
}

function getAccessToken(sourceName: string, mapStyle: StyleSpecification, opts: {allowFallback?: boolean}) {
  if(sourceName === "thunderforest_transport" || sourceName === "thunderforest_outdoors") {
    sourceName = "thunderforest"
  }

  const metadata = mapStyle.metadata || {} as any;
  let accessToken = metadata[`maputnik:${sourceName}_access_token`]

  if(opts.allowFallback && !accessToken) {
    accessToken = tokens[sourceName as keyof typeof tokens]
  }

  return accessToken;
}

function replaceSourceAccessToken(mapStyle: StyleSpecification, sourceName: string, opts={}) {
  const source = mapStyle.sources[sourceName]
  if(!source) return mapStyle
  if(!("url" in source) || !source.url) return mapStyle

  const accessToken = getAccessToken(sourceName, mapStyle, opts)

  if (!accessToken) {
    // Early exit.
    return mapStyle;
  }

  const changedSources = {
    ...mapStyle.sources,
    [sourceName]: {
      ...source,
      url: source.url.replace('{key}', accessToken)
    }
  }
  const changedStyle = {
    ...mapStyle,
    sources: changedSources
  }
  return changedStyle
}

function replaceAccessTokens(mapStyle: StyleSpecification, opts={}) {
  let changedStyle = mapStyle

  Object.keys(mapStyle.sources).forEach((sourceName) => {
    changedStyle = replaceSourceAccessToken(changedStyle, sourceName, opts);
  })

  if (mapStyle.glyphs && (mapStyle.glyphs.match(/\.tilehosting\.com/) || mapStyle.glyphs.match(/\.maptiler\.com/))) {
    const newAccessToken = getAccessToken("openmaptiles", mapStyle, opts);
    if (newAccessToken) {
      changedStyle = {
        ...changedStyle,
        glyphs: mapStyle.glyphs.replace('{key}', newAccessToken)
      }
    }
  }

  return changedStyle
}

function stripAccessTokens(mapStyle: StyleSpecification) {
  const changedMetadata = {
    ...mapStyle.metadata as any
  };
  delete changedMetadata['maputnik:openmaptiles_access_token'];
  return {
    ...mapStyle,
    metadata: changedMetadata
  };
}

/**
 * 将mapabc的地图url转换成http直接指向的url
 */
function transMapAbcSpriteAndFontUrl(mapStyle) {
  const glyphsUrl = mapStyle.glyphs;
  const spriteUrl = mapStyle.sprite;
  let spriteUrl_Http = "";
  if (spriteUrl.startsWith("http://")) {
    if (spriteUrl.startsWith(api_config.url)) {
      spriteUrl_Http = spriteUrl;
    } else {
      spriteUrl_Http = api_config.url + "/api/mapSpriteData" + spriteUrl.substring(spriteUrl.lastIndexOf("/"));
    }
  } else if (spriteUrl.startsWith("mapabc://")) {
    const spriteName = spriteUrl.replace("mapabc://sprites/", "");
    spriteUrl_Http = api_config.url + "/msp-api/sprite/v2/" + spriteName;
  }  else if (spriteUrl.startsWith("amap://")) {
    const spriteName = spriteUrl.replace("amap://sprites/", "");
    spriteUrl_Http = api_config.url + "/msp-api/sprite/v2/" + spriteName;
  } else {
    spriteUrl_Http = api_config.url + "/api/mapSpriteData" + spriteUrl.substring(spriteUrl.lastIndexOf("/"));
  }

  return {
    ...mapStyle,
    glyphs: api_config.url + "/msp-api/glyphs/{fontstack}/{range}.pbf",
    sprite: spriteUrl_Http
  };
  
  // const glyphsUrl = mapStyle.glyphs || "";
  // const spriteUrl = mapStyle.sprite || "";
  // let spriteUrl_Http = "";
  // if (spriteUrl.startsWith("http://")) {
  //   if (spriteUrl.startsWith(api_config.url)) {
  //   	if(spriteUrl.indexOf("msp-api/sprite/v2/") > -1){
  //   		spriteUrl_Http=	spriteUrl.replace("msp-api/sprite/v2/", "tMapStyle");
  //   	}else{
  //   		spriteUrl_Http = spriteUrl
  //   	}
  //     spriteUrl_Http = spriteUrl_Http;
  //   } else {
  //     spriteUrl_Http = api_config.url + "/tMapStyle" + spriteUrl.substring(spriteUrl.lastIndexOf("/"));
  //   }
  // } else if (spriteUrl.startsWith("amap://")) {
  //   const spriteName = spriteUrl.replace("amap://sprites/", "");
  //   spriteUrl_Http = api_config.url + "/tMapStyle" + spriteName;
  // } else {
  //   spriteUrl_Http = api_config.url + "/tMapStyle" + spriteUrl.substring(spriteUrl.lastIndexOf("/"));
  // }
  // return {
  //   ...mapStyle,
  //   glyphs: api_config.url + "/tMapStyle/glyphs/{fontstack}/{range}.pbf",
  //   sprite: spriteUrl_Http
  // };
}

/**
 * 保存样式数据到msp
 * @param mspInfo
 * @param jsonStr
 */
function saveStyleJsonToMsp(mspInfo, jsonStr) {
  fetch(api_config.url + '/open/editor/mapStyle/updateStyleContent/' + (mspInfo.id||mspInfo.styleId), {
    method: 'PUT',
    mode: 'cors',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      'Authorization': getToken(),
    },
    body: jsonStr
  })
    .then(function (response) {
      return response.json();
    })
    .then((body) => {
      console.log(body)
      alert('保存样式内容成功' + body.message)
    })
    .catch(function (error) {
      alert('保存样式内容失败' + error)
      if (error) console.error(error)
    })
}


async function saveStyleThumbnailToMsp(mspInfo, result) {
  const res = await fetch(api_config.url + '/open/editor/updateThumbnail/' + (mspInfo.id||mspInfo.styleId), {
    method: "POST",
    mode: 'cors',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      'Authorization': getToken(),
    },
    body: JSON.stringify({base64: result})
  });
  const result11 = await res.json();
  alert('保存样式预览图成功' + result11.message)
  return result11;
  // const res = await fetch(api_config.url + '/tMapStyle/updateThumbnail/' + mspInfo.styleId, {
  //   method: "POST",
  //   mode: 'cors',
  //   headers: {
  //     "Content-Type": "application/json; charset=utf-8",
  //     'token': getToken(),
  //   },
  //   body: JSON.stringify({base64: result})
  // });
  // const result11 = await res.json();
  // alert('保存样式预览图成功' + result11.message)
  // return result11;
//
//
// .then(function (response) {
//     return response.json();
//   })
//     .then((body) => {
//       console.log(body)
//       alert('保存样式预览图成功' + body.message)
//     })
//     .catch(function (error) {
//       alert('保存样式预览图失败' + error)
//       if (error) console.error(error)
//     })
}

export default {
  ensureStyleValidity,
  emptyStyle,
  indexOfLayer,
  generateId,
  getAccessToken,
  replaceAccessTokens,
  stripAccessTokens,
  transMapAbcSpriteAndFontUrl,
  saveStyleJsonToMsp,
  saveStyleThumbnailToMsp
}
