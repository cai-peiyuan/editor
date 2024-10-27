import type {StyleSpecification, SourceSpecification} from "maplibre-gl";

export function deleteSource(mapStyle: StyleSpecification, sourceId: string) {
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
export function addSource(mapStyle: StyleSpecification, sourceId: string, source: SourceSpecification) {
  return changeSource(mapStyle, sourceId, source)
}

export function changeSource(mapStyle: StyleSpecification, sourceId: string, source: SourceSpecification) {
  const changedSources = {
    ...mapStyle.sources,
    [sourceId]: source
  }
  return {
    ...mapStyle,
    sources: changedSources
  }
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

