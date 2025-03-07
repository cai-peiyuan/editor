import {derefLayers} from '@maplibre/maplibre-gl-style-spec'
import tokens from '../config/tokens.json'
import {getToken} from "../util/auth";

// Empty style is always used if no style could be restored or fetched
const emptyStyle = ensureStyleValidity({
  version: 8,
  sources: {},
  layers: [],
})

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function ensureHasId(style) {
  if ('id' in style) return style
  style.id = generateId()
  return style
}

function ensureHasNoInteractive(style) {
  const changedLayers = style.layers.map(layer => {
    const changedLayer = {...layer}
    delete changedLayer.interactive
    return changedLayer
  })

  return {
    ...style,
    layers: changedLayers
  }
}

function ensureHasNoRefs(style) {
  return {
    ...style,
    layers: derefLayers(style.layers)
  }
}

function ensureStyleValidity(style) {
  return ensureHasNoInteractive(ensureHasNoRefs(ensureHasId(style)))
}

function indexOfLayer(layers, layerId) {
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].id === layerId) {
      return i
    }
  }
  return null
}

function getAccessToken(sourceName, mapStyle, opts) {
  if (sourceName === "thunderforest_transport" || sourceName === "thunderforest_outdoors") {
    sourceName = "thunderforest"
  }

  const metadata = mapStyle.metadata || {}
  let accessToken = metadata[`maputnik:${sourceName}_access_token`]

  if (opts.allowFallback && !accessToken) {
    accessToken = tokens[sourceName]
  }

  return accessToken;
}

function replaceSourceAccessToken(mapStyle, sourceName, opts = {}) {
  const source = mapStyle.sources[sourceName]
  if (!source) return mapStyle
  if (!source.hasOwnProperty("url")) return mapStyle

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

function replaceAccessTokens(mapStyle, opts = {}) {
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

function stripAccessTokens(mapStyle) {
  const changedMetadata = {
    ...mapStyle.metadata
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
    spriteUrl_Http = api_config.url + "/api/mapSpriteData/" + spriteName;
  } else {
    spriteUrl_Http = api_config.url + "/api/mapSpriteData" + spriteUrl.substring(spriteUrl.lastIndexOf("/"));
  }

  return {
    ...mapStyle,
    glyphs: api_config.url + "/api/mapFont/glyphs/{fontstack}/{range}.pbf",
    sprite: spriteUrl_Http
  };
}

/**
 * 保存样式数据到msp
 * @param mspInfo
 * @param jsonStr
 */
function saveStyleJsonToMsp(mspInfo, jsonStr) {
  fetch(api_config.url + '/api/mapStyle/updateStyleContent/' + mspInfo.id, {
    method: "PUT",
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
      alert(body.msg)
    })
    .catch(function (error) {
      alert(error)
      if (error) console.error(error)
    })
}


function saveStyleThumbnailToMsp(mspInfo, result) {
  fetch(api_config.url + '/api/mapStyle/updateStyleThumbnail/' + mspInfo.id, {
    method: "PUT",
    mode: 'cors',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      'Authorization': getToken(),
    },
    body: JSON.stringify({base64: result})
  })
    .then(function (response) {
      return response.json();
    })
    .then((body) => {
      console.log(body)
      alert(body.msg)
    })
    .catch(function (error) {
      alert(error)
      if (error) console.error(error)
    })
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
