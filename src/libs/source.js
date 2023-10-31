export function deleteSource(mapStyle, sourceId) {
  const remainingSources = { ...mapStyle.sources}
  delete remainingSources[sourceId]
  return {
    ...mapStyle,
    sources: remainingSources
  }
}


/**
 * 添加公共数据源
 * @param mapStyle
 * @param sourceId
 * @param source
 * @returns {{sources}}
 */
export function addSource(mapStyle, sourceId, source) {
  return changeSource(mapStyle, sourceId, source)
}

/**
 * 添加msp数据源
 * @param mapStyle
 * @param sourceId
 * @param source
 * @returns {{sources}}
 */
export function addSourceMsp(mapStyle, sourceId, source) {
  return changeSourceMsp(mapStyle, sourceId, source)
}

export function changeSource(mapStyle, sourceId, source) {
  const changedSources = {
    ...mapStyle.sources,
    [sourceId]: source
  }
  return {
    ...mapStyle,
    sources: changedSources
  }
}

export function changeSourceMsp(mapStyle, sourceId, source) {
  const changedSources = {
    ...mapStyle.sources,
    [sourceId]: source
  }
  const changedStyle = {
    ...mapStyle,
    sources: changedSources
  }
  return changedStyle
}

