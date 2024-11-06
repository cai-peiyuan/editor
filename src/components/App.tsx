// @ts-ignore - this can be easily replaced with arrow functions
import autoBind from 'react-autobind';
import React from 'react'
import cloneDeep from 'lodash.clonedeep'
import clamp from 'lodash.clamp'
import buffer from 'buffer'
import get from 'lodash.get'
import {unset} from 'lodash'
import {arrayMoveMutable} from 'array-move'
import hash from "string-hash";
import {Map, LayerSpecification, StyleSpecification, ValidationError, SourceSpecification} from 'maplibre-gl'
import {latest, validateStyleMin} from '@maplibre/maplibre-gl-style-spec'

import MapMaplibreGl from './MapMaplibreGl'
import MapOpenLayers from './MapOpenLayers'
import LayerList from './LayerList'
import LayerEditor from './LayerEditor'
import LayerEditorMini from './layereditor/LayerEditorMini'
import AppToolbar, { MapState } from './AppToolbar'
import AppLayout from './AppLayout'
import MessagePanel from './AppMessagePanel'

import ModalSettings from './ModalSettings'
import ModalExport from './ModalExport'
import ModalSources from './ModalSources'
import ModalOpen from './ModalOpen'
import ModalShortcuts from './ModalShortcuts'
import ModalSurvey from './ModalSurvey'
import ModalDebug from './ModalDebug'

import {downloadGlyphsMetadata, downloadSpriteMetadata} from '../libs/metadata'
import style from '../libs/style'
import {initialStyleUrl, loadStyleUrl, removeStyleQuerystring} from '../libs/urlopen'
import {undoMessages, redoMessages} from '../libs/diffmessage'
import {StyleStore} from '../libs/stylestore'
import {ApiStyleStore} from '../libs/apistore'
import {RevisionStore} from '../libs/revisions'
import LayerWatcher from '../libs/layerwatcher'
import tokens from '../config/tokens.json'
import isEqual from 'lodash.isequal'
import Debug from '../libs/debug'
import {formatLayerId} from '../util/format';
import {getLayerChnNameDicByStyleFile} from '../libs/layer'
import { SortEnd } from 'react-sortable-hoc';
import { MapOptions } from 'maplibre-gl';

import MapboxGl from 'maplibre-gl'
import {getAppConfig, getAppConfig1} from '../libs/config'
import {getToken} from '../libs/auth.js'
import {saveLangToMsp} from "../libs/lang.ts";
import LayerListGroupList from "./layereditor/LayerListGroupList";

// Similar functionality as <https://github.com/mapbox/mapbox-gl-js/blob/7e30aadf5177486c2cfa14fe1790c60e217b5e56/src/util/mapbox.js>
function normalizeSourceURL(url, apiToken = "") {
  const matches = url.match(/^mapbox:\/\/(.*)/);
  if (matches) {
    // mapbox://mapbox.mapbox-streets-v7
    return `https://api.mapbox.com/v4/${matches[1]}.json?secure&access_token=${apiToken}`
  } else {
    return url;
  }
}
// Buffer must be defined globally for @maplibre/maplibre-gl-style-spec validate() function to succeed.
window.Buffer = buffer.Buffer;

function setFetchAccessToken(url: string, mapStyle: StyleSpecification) {
  const matchesTilehosting = url.match(/\.tilehosting\.com/);
  const matchesMaptiler = url.match(/\.maptiler\.com/);
  const matchesThunderforest = url.match(/\.thunderforest\.com/);
  if (matchesTilehosting || matchesMaptiler) {
    const accessToken = style.getAccessToken("openmaptiles", mapStyle, {allowFallback: true})
    if (accessToken) {
      return url.replace('{key}', accessToken)
    }
  } else if (matchesThunderforest) {
    const accessToken = style.getAccessToken("thunderforest", mapStyle, {allowFallback: true})
    if (accessToken) {
      return url.replace('{key}', accessToken)
    }
  } else {
    return url;
  }
}

function updateRootSpec(spec: any, fieldName: string, newValues: any) {
  return {
    ...spec,
    $root: {
      ...spec.$root,
      [fieldName]: {
        ...spec.$root[fieldName],
        values: newValues
      }
    }
  }
}

type OnStyleChangedOpts = {
  save?: boolean
  addRevision?: boolean
  initialLoad?: boolean
}

type MappedErrors = {
  message: string
  parsed?: {
    type: string
    data: {
      index: number
      key: string
      message: string
    }
  }
}

type AppState = {
  errors: MappedErrors[],
  infos: string[],
  mapStyle: StyleSpecification & {id: string},
  dirtyMapStyle?: StyleSpecification,
  selectedLayerIndex: number,
  selectedLayerOriginalId?: string,
  sources: {[key: string]: SourceSpecification},
  vectorLayers: {},
  spec: any,
  mapView: {
    zoom: number,
    center: {
      lng: number,
      lat: number,
    },
  },
  maplibreGlDebugOptions: Partial<MapOptions> & {
    showTileBoundaries: boolean,
    showCollisionBoxes: boolean,
    showOverdrawInspector: boolean,
  },
  openlayersDebugOptions: {
    debugToolbox: boolean,
  },
  mapState: MapState
  isOpen: {
    settings: boolean
    sources: boolean
    open: boolean
    shortcuts: boolean
    export: boolean
    survey: boolean
    debug: boolean
  }
}

export default class App extends React.Component<any, AppState> {
  revisionStore: RevisionStore;
  styleStore: StyleStore | ApiStyleStore;
  layerWatcher: LayerWatcher;
  shortcutEl: ModalShortcuts | null = null;

  constructor(props: any) {
    super(props)

    // this.getEditorConfig();

    autoBind(this);

    this.revisionStore = new RevisionStore()
    const params = new URLSearchParams(window.location.search.substring(1))
    let port = params.get("localport")
    if (port == null && (window.location.port !== "80" && window.location.port !== "443")) {
      port = window.location.port
    }
    this.styleStore = new ApiStyleStore({
      onLocalStyleChange: mapStyle => this.onStyleChanged(mapStyle, {save: false}),
      port: port,
      host: params.get("localhost")
    })


    const shortcuts = [
      {
        key: "?",
        handler: () => {
          this.toggleModal("shortcuts");
        }
      },
      {
        key: "o",
        handler: () => {
          this.toggleModal("open");
        }
      },
      {
        key: "e",
        handler: () => {
          this.toggleModal("export");
        }
      },
      {
        key: "d",
        handler: () => {
          this.toggleModal("sources");
        }
      },
      {
        key: "s",
        handler: () => {
          this.toggleModal("settings");
        }
      },
      {
        key: "i",
        handler: () => {
          this.setMapState(
            this.state.mapState === "map" ? "inspect" : "map"
          );
        }
      },
      {
        key: "m",
        handler: () => {
          (document.querySelector(".maplibregl-canvas") as HTMLCanvasElement).focus();
        }
      },
      {
        key: "!",
        handler: () => {
          this.toggleModal("debug");
        }
      },
    ]

    document.body.addEventListener("keyup", (e) => {
      if(e.key === "Escape") {
        (e.target as HTMLElement).blur();
        document.body.focus();
      } else if (this.state.isOpen.shortcuts || document.activeElement === document.body) {
        const shortcut = shortcuts.find((shortcut) => {
          return (shortcut.key === e.key)
        })

        if (shortcut) {
          this.setModal("shortcuts", false);
          shortcut.handler();
        }
      }
    })

    const styleUrl = initialStyleUrl()
    if (styleUrl && window.confirm("Load style from URL: " + styleUrl + " and discard current changes?")) {
      this.styleStore = new StyleStore()
      loadStyleUrl(styleUrl, mapStyle => this.onStyleChanged(mapStyle))
      removeStyleQuerystring()
    } else {
      if (styleUrl) {
        removeStyleQuerystring()
      }
      this.styleStore.init(err => {
        if (err) {
          console.log('Falling back to local storage for storing styles')
          this.styleStore = new StyleStore()
        }
        this.styleStore.latestStyle(mapStyle => this.onStyleChanged(mapStyle, {initialLoad: true}))

        if (Debug.enabled()) {
          Debug.set("maputnik", "styleStore", this.styleStore);
          Debug.set("maputnik", "revisionStore", this.revisionStore);
        }
      })
    }

    if (Debug.enabled()) {
      Debug.set("maputnik", "revisionStore", this.revisionStore);
      Debug.set("maputnik", "styleStore", this.styleStore);
    }

    this.state = {
      runConfigLoaded: false,
      errors: [],
      infos: [],
      mapStyle: style.emptyStyle,
      spriteName: 'mapabcjt',
      selectedLayerIndex: 0,
      selectedLayerGroupId: '',
      sources: {},
      vectorLayers: {},
      mapState: "map",
      spec: latest,
      mapView: {
        zoom: 0,
        center: {
          lng: 0,
          lat: 0,
        },
      },
      isOpen: {
        settings: false,
        sources: false,
        open: false,
        shortcuts: false,
        export: false,
        // TODO: Disabled for now, this should be opened on the Nth visit to the editor
        survey: false,
        debug: false,
      },
      maplibreGlDebugOptions: {
        showTileBoundaries: false,
        showCollisionBoxes: false,
        showOverdrawInspector: false,
      },
      openlayersDebugOptions: {
        debugToolbox: false,
      },
    }

    this.layerWatcher = new LayerWatcher({
      onVectorLayersChange: v => this.setState({vectorLayers: v})
    })
  }

  // 获取菜单信息，并放入state中
  getEditorConfig() {
    const data = getAppConfig();
  }

  handleKeyPress = (e: KeyboardEvent) => {
    if(navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
      if(e.metaKey && e.shiftKey && e.keyCode === 90) {
        e.preventDefault();
        this.onRedo();
      }
      else if(e.metaKey && e.keyCode === 90) {
        e.preventDefault();
        this.onUndo();
      }
    } else {
      if (e.ctrlKey && e.keyCode === 90) {
        e.preventDefault();
        this.onUndo();
      }
      else if(e.ctrlKey && e.keyCode === 89) {
        e.preventDefault();
        this.onRedo();
      }
    }
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyPress);
    const initialUrl = new URL(window.location.href);
    const editorConfig = initialUrl.searchParams.get('editorConfig') || 'editor_dev';
    const styleId = initialUrl.searchParams.get('styleId') || '';
    /**
     * 获取网络资源配置参数
     */
    // 设置标记在加载参数之前不渲染界面
    this.setState({
      runConfigLoaded: false
    })
    /**
     * 加载网络配置参数
     * 返回数据为json格式
     * json包含 runConfig属性为系统界面参数
     * mapStyle为样式json数据
     * layerDic为图层字典表
     */
    // fetch(api_config.url + '/api/mapStyleEditorConfig/runConfig/' + editorConfig + '?styleId=' + styleId, {
    fetch(api_config.url + '/open/editor/mapStyleEditorConfig/initData?editorKey=' + editorConfig + '&styleId=' + styleId, {
      method: "GET",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        'Authorization': getToken(),
      }
    }).then(function (response) {
      if (response.status === 401) {
        if (window.parent) {
          window.parent.alert("会话超时请重新登录系统")
        } else {
          alert("请重新登录")
        }
      } else if (response.status === 200) {
        return response.json();
      }
      console.log(response);
    }).then((body) => {
      let data = body.data;
      /***
       * 设置全局配置参数 合并网络参数到默认参数
       */
      if (data.runConfig) {
        runConfig = Object.assign(runConfig, JSON.parse(data.runConfig.configValue))
      }
      /***
       * 加载url参数中的样式内容
       */
      if (data.mapStyle) {
        this.setState({
          mapStyle: style.ensureStyleValidity(style.transMapAbcSpriteAndFontUrl(data.mapStyle))
        })
      }
      /***
       * 加载图层分组字典
       */
      if (data.layerGroupTree) {
        layerGroupTree = Object.assign(layerGroupTree, (data.layerGroupTree));
      }
      /**
       * 图层分组对应的具体图层
       */
      if (data.groupedLayerMap) {
        groupedLayerMap = Object.assign(groupedLayerMap, (data.groupedLayerMap));
      }
      /***
       * 加载图层字典
       */
      if (data.layerDic) {
        layerDic = Object.assign(layerDic, (data.layerDic));
      }
      /***
       * 加载翻译字典
       */
      if (data.langDic) {
        langDic = Object.assign(langDic, (data.langDic));
        // 服务中没有的数据 在本地有的 保存到msp服务中
        saveLangToMsp();
      }
      /***
       * 加载图标字典
       */
      if (data.spriteDic) {
        spriteDic = Object.assign(spriteDic, (data.spriteDic));
      }
      /***
       * 加载字体字典
       */
      if (data.fontDic) {
        // fontDic = Object.assign(fontDic, (data.fontDic));
      }
      this.setState({
        runConfigLoaded: true
      })
    }).catch(function (error) {
      console.log(error)
    })
  }

  getInitialState() {
    return {
      runConfigLoaded: false
    }
  }

  UNSAFE_componentWillMount() {

    // runConfig.mainLayout.toolBar.show = true
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyPress);
    /*
     runConfig.mainLayout.toolBar.show = false*/
  }

  saveStyle(snapshotStyle: StyleSpecification & {id: string}) {
    this.styleStore.save(snapshotStyle)
  }

  updateFonts(urlTemplate: string) {
    const metadata: {[key: string]: string} = this.state.mapStyle.metadata || {} as any
    const accessToken = metadata['maputnik:openmaptiles_access_token'] || tokens.openmaptiles

    const glyphUrl = (typeof urlTemplate === 'string')? urlTemplate.replace('{key}', accessToken): urlTemplate;
    downloadGlyphsMetadata(glyphUrl, fonts => {
      this.setState({spec: updateRootSpec(this.state.spec, 'glyphs', fonts)})
    })
  }

  updateIcons(baseUrl: string) {
    downloadSpriteMetadata(baseUrl, icons => {
      this.setState({spec: updateRootSpec(this.state.spec, 'sprite', icons)})
    })
  }

  onChangeMetadataProperty = (property: string, value: any) => {
    // If we're changing renderer reset the map state.
    if (
      property === 'maputnik:renderer' &&
      value !== get(this.state.mapStyle, ['metadata', 'maputnik:renderer'], 'mlgljs')
    ) {
      this.setState({
        mapState: 'map'
      });
    }

    const changedStyle = {
      ...this.state.mapStyle,
      metadata: {
        ...(this.state.mapStyle as any).metadata,
        [property]: value
      }
    }
    this.onStyleChanged(changedStyle)
  }

  onStyleChanged = (newStyle: StyleSpecification & {id: string}, opts: OnStyleChangedOpts={}) => {
    //console.log("样式更新 新样式文件 ->", newStyle)
    //console.log("样式更新 原样式文件 ->", this.state.mapStyle)
    opts = {
      save: true,
      addRevision: true,
      initialLoad: false,
      ...opts,
    };

    if (opts.initialLoad) {
      this.getInitialStateFromUrl(newStyle);
    }

    const errors: ValidationError[] = validateStyleMin(newStyle) || [];

    // The validate function doesn't give us errors for duplicate error with
    // empty string for layer.id, manually deal with that here.
    const layerErrors: (Error | ValidationError)[] = [];
    if (newStyle && newStyle.layers) {
      const foundLayers = new global.Map();
      newStyle.layers.forEach((layer, index) => {
        if (layer.id === "" && foundLayers.has(layer.id)) {
          const error = new Error(
            `layers[${index}]: duplicate layer id [empty_string], previously used`
          );
          layerErrors.push(error);
        }
        foundLayers.set(layer.id, true);
      });
    }

    const mappedErrors = layerErrors.concat(errors).map(error => {
      // Special case: Duplicate layer id
      const dupMatch = error.message.match(/layers\[(\d+)\]: (duplicate layer id "?(.*)"?, previously used)/);
      if (dupMatch) {
        const [, index, message] = dupMatch;
        return {
          message: error.message,
          parsed: {
            type: "layer",
            data: {
              index: parseInt(index, 10),
              key: "id",
              message,
            }
          }
        }
      }

      // Special case: Invalid source
      const invalidSourceMatch = error.message.match(/layers\[(\d+)\]: (source "(?:.*)" not found)/);
      if (invalidSourceMatch) {
        const [, index, message] = invalidSourceMatch;
        return {
          message: error.message,
          parsed: {
            type: "layer",
            data: {
              index: parseInt(index, 10),
              key: "source",
              message,
            }
          }
        }
      }

      const layerMatch = error.message.match(/layers\[(\d+)\]\.(?:(\S+)\.)?(\S+): (.*)/);
      if (layerMatch) {
        const [, index, group, property, message] = layerMatch;
        const key = (group && property) ? [group, property].join(".") : property;
        return {
          message: error.message,
          parsed: {
            type: "layer",
            data: {
              index: parseInt(index, 10),
              key,
              message
            }
          }
        }
      } else {
        return {
          message: error.message,
        };
      }
    });

    let dirtyMapStyle: StyleSpecification | undefined = undefined;
    if (errors.length > 0) {
      dirtyMapStyle = cloneDeep(newStyle);

      errors.forEach(error => {
        const {message} = error;
        if (message) {
          try {
            const objPath = message.split(":")[0];
            // Errors can be deply nested for example 'layers[0].filter[1][1][0]' we only care upto the property 'layers[0].filter'
            const unsetPath = objPath.match(/^\S+?\[\d+\]\.[^[]+/)![0];
            unset(dirtyMapStyle, unsetPath);
          }
          catch (err) {
            console.warn(err);
          }
        }
      });
    }

    if(newStyle.glyphs !== this.state.mapStyle.glyphs) {
      this.updateFonts(newStyle.glyphs as string)
    }
    if(newStyle.sprite !== this.state.mapStyle.sprite) {
      this.updateIcons(newStyle.sprite as string)
    }

    if (opts.addRevision) {
      this.revisionStore.addRevision(newStyle);
    }
    if (opts.save) {
      this.saveStyle(newStyle as StyleSpecification & {id: string});
    }

    this.setState({
      mapStyle: newStyle,
      dirtyMapStyle: dirtyMapStyle,
      errors: mappedErrors,
    }, () => {
      this.fetchSources();
      this.setStateInUrl();
    })

  }

  onUndo = () => {
    const activeStyle = this.revisionStore.undo()

    const messages = undoMessages(this.state.mapStyle, activeStyle)
    this.onStyleChanged(activeStyle, {addRevision: false});
    this.setState({
      infos: messages,
    })
  }

  onRedo = () => {
    const activeStyle = this.revisionStore.redo()
    const messages = redoMessages(this.state.mapStyle, activeStyle)
    this.onStyleChanged(activeStyle, {addRevision: false});
    this.setState({
      infos: messages,
    })
  }


  onMoveLayer = (move: SortEnd) => {
    let { oldIndex, newIndex } = move;
    let layers = this.state.mapStyle.layers;
    oldIndex = clamp(oldIndex, 0, layers.length - 1);
    newIndex = clamp(newIndex, 0, layers.length - 1);
    if (oldIndex === newIndex) return;

    if (oldIndex === this.state.selectedLayerIndex) {
      this.setState({
        selectedLayerIndex: newIndex
      });
    }

    layers = layers.slice(0);
    arrayMoveMutable(layers, oldIndex, newIndex);
    this.onLayersChange(layers);
  }

  /**
   * 一部分图层发生变化
   * @param changedLayers
   */
  onLayersChange = (changedLayers: LayerSpecification[]) => {
    const changedStyle = {
      ...this.state.mapStyle,
      layers: changedLayers
    }
    this.onStyleChanged(changedStyle)
  }

  onLayerDestroy = (index: number) => {
    const layers = this.state.mapStyle.layers;
    const remainingLayers = layers.slice(0);
    remainingLayers.splice(index, 1);
    this.onLayersChange(remainingLayers);
  }

  onLayerCopy = (index: number) => {
    const layers = this.state.mapStyle.layers;
    const changedLayers = layers.slice(0)

    const clonedLayer = cloneDeep(changedLayers[index])
    clonedLayer.id = clonedLayer.id + "-copy"
    changedLayers.splice(index, 0, clonedLayer)
    this.onLayersChange(changedLayers)
  }

  /**
   * 图层隐藏和显示切换方法
   * @param index
   */
  onLayerVisibilityToggle = (index: number) => {
    const layers = this.state.mapStyle.layers;
    const changedLayers = layers.slice(0)

    const layer = { ...changedLayers[index] }
    const changedLayout = 'layout' in layer ? {...layer.layout} : {}
    changedLayout.visibility = changedLayout.visibility === 'none' ? 'visible' : 'none'

    layer.layout = changedLayout
    changedLayers[index] = layer
    this.onLayersChange(changedLayers)
  }

  /**
   * 隐藏显示某个分组
   * @param index
   */
  onLayerGroupVisibilityToggle = (groupId: string) => {
    // console.log('隐藏或者显示某个分组下所有的图层 ->', groupId)
    //console.log("onLayerGroupVisibilityToggle 样式更新 原样式文件1 ->", this.state.mapStyle)
    const copyLayers = this.state.mapStyle.layers.slice(0);
    //console.log("onLayerGroupVisibilityToggle 样式更新 复制的图层1 ->", copyLayers)

    let groupLayers = groupedLayerMap.groupToLayer[groupId];
    //图层分组中配置的对应的样式图层id
    let layerIdsArry = groupLayers.map(layer => layer.layerId)
    //console.log("onLayerGroupVisibilityToggle 待切换状态的图层 ->", layerIdsArry)

    for (let i = 0; i < copyLayers.length; i++) {
      const changedLayer = {...copyLayers[i]}
      if(layerIdsArry.includes(changedLayer.id)){
        const changedLayout = 'layout' in changedLayer ? {...changedLayer.layout} : {}
        changedLayout.visibility = (changedLayout.visibility === 'none' ? 'visible' : 'none');
        changedLayer.layout = changedLayout
        copyLayers[i] = changedLayer;
       //console.log("需要更新的图层 -> ", changedLayer.id)
       //console.log("更新后的图层 -> ", changedLayer)
      }
    }
    //console.log("onLayerGroupVisibilityToggle 样式更新 原样式文件2 ->", this.state.mapStyle)
    //console.log("onLayerGroupVisibilityToggle 样式更新 复制的图层2 ->", copyLayers)
    this.onLayersChange(copyLayers);
  }

  onLayerIdChange = (index: number, _oldId: string, newId: string) => {
    const changedLayers = this.state.mapStyle.layers.slice(0)
    changedLayers[index] = {
      ...changedLayers[index],
      id: newId
    }

    this.onLayersChange(changedLayers)
  }

  onLayerChanged = (index: number, layer: LayerSpecification) => {
    const changedLayers = this.state.mapStyle.layers.slice(0)
    changedLayers[index] = layer
    this.onLayersChange(changedLayers)
  }
  /**
   * 更新一个分组的图层的属性
   * @param groupId
   * @param layer
   */
  onLayerGroupChanged = (groupId: string, layer: LayerSpecification, selectedGroupLayers: LayerSpecification[], layers: LayerSpecification[]) => {
    console.log("onLayerGroupChanged . groupId ->", groupId)
    console.log("onLayerGroupChanged . layer ->", layer)
    console.log("onLayerGroupChanged . selectedGroupLayers ->", selectedGroupLayers)
    console.log("onLayerGroupChanged . layers ->", layers)
    const copyLayers = this.state.mapStyle.layers.slice(0);
    //图层分组中配置的对应的样式图层id
    let layerIdsArry = selectedGroupLayers.map(layer => layer.id)
    for (let j = 0; j < selectedGroupLayers.length; j++) {
      for (let i = 0; i < copyLayers.length; i++) {
        const changedLayer = {...copyLayers[i]}
        if(selectedGroupLayers[j].id === (changedLayer.id)){
          copyLayers[i] = selectedGroupLayers[j];
        }
      }
    }
    this.onLayersChange(copyLayers);
  }

  setMapState = (newState: MapState) => {
    this.setState({
      mapState: newState
    }, this.setStateInUrl);
  }


  setDefaultValues = (styleObj: StyleSpecification & {id: string}) => {
    const metadata: {[key: string]: string} = styleObj.metadata || {} as any
    if(metadata['maputnik:renderer'] === undefined) {
      const changedStyle = {
        ...styleObj,
        metadata: {
          ...styleObj.metadata as any,
          'maputnik:renderer': 'mlgljs'
        }
      }
      return changedStyle
    } else {
      return styleObj
    }
  }

  /**
   * 打开一个style样式文件回调函数
   * @param styleObj
   */
  openStyle = (styleObj: StyleSpecification & {id: string}) => {
    styleObj = this.setDefaultValues(styleObj)
    getLayerChnNameDicByStyleFile(styleObj)
    this.onStyleChanged(styleObj)
  }

  fetchSources() {
    const sourceList: {[key: string]: any} = {};
    for(const [key, val] of Object.entries(this.state.mapStyle.sources)) {
      if(
        !Object.prototype.hasOwnProperty.call(this.state.sources, key) &&
        val.type === "vector" &&
        Object.prototype.hasOwnProperty.call(val, "url")
      ) {
        sourceList[key] = {
          type: val.type,
          layers: []
        };

        let url = val.url;
        try {
          url = normalizeSourceURL(url, MapboxGl.accessToken);
        } catch (err) {
          console.warn("Failed to normalizeSourceURL: ", err);
        }

        try {
          url = setFetchAccessToken(url!, this.state.mapStyle)
        } catch(err) {
          console.warn("Failed to setFetchAccessToken: ", err);
        }

        fetch(url!, {
          mode: 'cors',
        })
          .then(response => response.json())
          .then(json => {
            if(!Object.prototype.hasOwnProperty.call(json, "vector_layers")) {
              return;
            }

            // Create new objects before setState
            const sources = Object.assign({}, {
              [key]: this.state.sources[key],
            });


            for(const layer of json.vector_layers) {
              (sources[key] as any).layers.push(layer.id)
            }

            console.debug("Updating source: "+key);
            this.setState({
              sources: sources
            });
          })
          .catch(err => {
            console.error("Failed to process sources for '%s'", url, err);
          });

      }
      else {
        sourceList[key] = this.state.sources[key] || this.state.mapStyle.sources[key];
      }
    }

    if (!isEqual(this.state.sources, sourceList)) {
      console.debug("Setting sources");
      this.setState({
        sources: sourceList
      })
    }
  }


  _getRenderer () {
    const metadata: {[key:string]: string} = this.state.mapStyle.metadata || {} as any;
    return metadata['maputnik:renderer'] || 'mlgljs';
  }

  onMapChange = (mapView: {
    zoom: number,
    center: {
      lng: number,
      lat: number,
    },
  }) => {
    this.setState({
      mapView,
    });
  }

  mapRenderer() {
    const {mapStyle, dirtyMapStyle} = this.state;

    const mapProps = {
      mapStyle: (dirtyMapStyle || mapStyle),
      replaceAccessTokens: (mapStyle: StyleSpecification) => {
        return style.replaceAccessTokens(mapStyle, {
          allowFallback: true
        });
      },
      onDataChange: (e: {map: Map}) => {
        this.layerWatcher.analyzeMap(e.map)
        this.fetchSources();
      },
    }

    const renderer = this._getRenderer();

    let mapElement;

    // Check if OL code has been loaded?
    if (renderer === 'ol') {
      mapElement = <MapOpenLayers
        {...mapProps}
        onChange={this.onMapChange}
        debugToolbox={this.state.openlayersDebugOptions.debugToolbox}
        onLayerSelect={this.onLayerSelect}
      />
    } else {
      mapElement = <MapMaplibreGl {...mapProps}
        onChange={this.onMapChange}
        options={this.state.maplibreGlDebugOptions}
        inspectModeEnabled={this.state.mapState === "inspect"}
        highlightedLayer={this.state.mapStyle.layers[this.state.selectedLayerIndex]}
        onLayerSelect={this.onLayerSelect} />
    }

    let filterName;
    if (this.state.mapState.match(/^filter-/)) {
      filterName = this.state.mapState.replace(/^filter-/, "");
    }
    const elementStyle: {filter?: string} = runConfig.mainLayout.toolBar.show === false ? {
      top: "0px", height: "calc(100% - 0px)"
    } : {};
    if (filterName) {
      elementStyle.filter = `url('#${filterName}')`;
    }

    return <div style={elementStyle} className="maputnik-map__container" data-wd-key="maplibre:container">
      {mapElement}
    </div>
  }

  setStateInUrl = () => {
    const {mapState, mapStyle, isOpen} = this.state;
    const {selectedLayerIndex, selectedLayerGroupId} = this.state;
    const url = new URL(location.href);
    const hashVal = hash(JSON.stringify(mapStyle));
    url.searchParams.set("layer", `${hashVal}~${selectedLayerIndex}`);

    url.searchParams.set("layerGroup", `${hashVal}~${selectedLayerGroupId}`);

    const openModals = Object.entries(isOpen)
      .map(([key, val]) => (val === true ? key : null))
      .filter(val => val !== null);

    if (openModals.length > 0) {
      url.searchParams.set("modal", openModals.join(","));
    } else {
      url.searchParams.delete("modal");
    }

    if (mapState === "map") {
      url.searchParams.delete("view");
    } else if (mapState === "inspect") {
      url.searchParams.set("view", "inspect");
    }

    history.replaceState({selectedLayerIndex}, "Maputnik", url.href);
  }

  getInitialStateFromUrl = (mapStyle: StyleSpecification) => {
    const url = new URL(location.href);
    const modalParam = url.searchParams.get("modal");
    if (modalParam && modalParam !== "") {
      const modals = modalParam.split(",");
      const modalObj: {[key: string]: boolean} = {};
      modals.forEach(modalName => {
        modalObj[modalName] = true;
      });

      this.setState({
        isOpen: {
          ...this.state.isOpen,
          ...modalObj,
        }
      });
    }

    const view = url.searchParams.get("view");
    if (view && view !== "") {
      this.setMapState(view as MapState);
    }

    const path = url.searchParams.get("layer");
    if (path) {
      try {
        const parts = path.split("~");
        const [hashVal, selectedLayerIndex] = [
          parts[0],
          parseInt(parts[1], 10),
        ];

        let valid = true;
        if (hashVal !== "-") {
          const currentHashVal = hash(JSON.stringify(mapStyle));
          if (currentHashVal !== parseInt(hashVal, 10)) {
            valid = false;
          }
        }
        if (valid) {
          this.setState({
            selectedLayerIndex,
            selectedLayerOriginalId: this.state.mapStyle.layers[selectedLayerIndex] ? this.state.mapStyle.layers[selectedLayerIndex].id : "",
            // selectedLayerOriginalId: mapStyle.layers[selectedLayerIndex].id,
          });
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }

  /**
   * 图层被选择
   * @param index
   */
  onLayerSelect = (index: number) => {
    this.setState({
      selectedLayerIndex: index,
      selectedLayerOriginalId: this.state.mapStyle.layers[index].id,
    }, this.setStateInUrl);
  }

  /**
   * 图层分组选择
   * 打开图层编辑窗口
   *
   * @param layerGroupId
   */
  onLayerGroupSelect = (layerGroupId: string) => {
    //console.log("本次选择图层分组 ->", layerGroupId)
    //console.log("上次选择图层分组 ->", this.state.selectedLayerGroupId)
    //console.log("上次选择图层分组 ->", this.state.selectedLayerOriginalId)
    //console.log("分组下的图层配置 ->", groupedLayerMap.groupToLayer[layerGroupId])
    //console.log("选择某个图层分组 ->", groupedLayerMap.groupLayer[layerGroupId])
    let styleLayers = this.getSelectedGroupLayers(layerGroupId, this.state.mapStyle.layers)
    console.log("选择的图层分组中样式图层 ->",styleLayers);
    this.setState({
      selectedLayerOriginalId: this.state.selectedLayerGroupId,
      selectedLayerGroupId: layerGroupId,
    }, this.setStateInUrl);
  }

  setModal(modalName: keyof AppState["isOpen"], value: boolean) {
    if(modalName === 'survey' && value === false) {
      localStorage.setItem('survey', '');
    }

    this.setState({
      isOpen: {
        ...this.state.isOpen,
        [modalName]: value
      }
    }, this.setStateInUrl)
  }

  toggleModal(modalName: keyof AppState["isOpen"]) {
    this.setModal(modalName, !this.state.isOpen[modalName]);
  }

  onChangeOpenlayersDebug = (key: keyof AppState["openlayersDebugOptions"], value: boolean) => {
    this.setState({
      openlayersDebugOptions: {
        ...this.state.openlayersDebugOptions,
        [key]: value,
      }
    });
  }

  onChangeMaplibreGlDebug = (key: keyof AppState["maplibreGlDebugOptions"], value: any) => {
    this.setState({
      maplibreGlDebugOptions: {
        ...this.state.maplibreGlDebugOptions,
        [key]: value,
      }
    });
  }

  /**
   * 计算某个分组下的图层对象
   * @param selectedLayerGroupId
   */
  getSelectedGroupLayers = (selectedLayerGroupId: string, layers: LayerSpecification[]) =>{
      if(selectedLayerGroupId ==''){
        return []
      }
      let groupLayers = groupedLayerMap.groupToLayer[selectedLayerGroupId];
      let layerIdsArry = groupLayers.map(layer => layer.layerId)
      let groupStyleLayers = layers.filter(layer=>layerIdsArry.includes(layer.id))
     // console.log("计算某个分组下的图层对象 -> ", selectedLayerGroupId, groupLayers, layerIdsArry, layers, groupStyleLayers)
      return groupStyleLayers.slice(0);
  }
  //数据 变化后会重新执行render方法
  render() {

    const layers = this.state.mapStyle.layers || []
    const selectedLayer = layers.length > 0 ? layers[this.state.selectedLayerIndex] : undefined
    //已经选择了一个分组
    const selectedLayerGroup = this.state.selectedLayerGroupId === '' ? undefined: this.state.selectedLayerGroupId
    //选择的一个分组下的图层
    const selectedGroupLayers = this.getSelectedGroupLayers(this.state.selectedLayerGroupId, layers)
    //分组下的图层应该都是同一类型  所以取第一个layer
    const selectedGroupLayer = selectedGroupLayers.slice(0,1)[0];
    const layersForGroup = this.state.mapStyle.layers || []

    /*简化版的图层分组*/
    const layerListGroupList = <LayerListGroupList
        onLayersGroupChange={this.onLayersChange}
        onLayerGroupSelect={this.onLayerGroupSelect}
        selectedLayerGroupId={this.state.selectedLayerGroupId}
        onLayerGroupVisibilityToggle={this.onLayerGroupVisibilityToggle}
        layers={layersForGroup}
        sources={this.state.sources}
        errors={this.state.errors}
    />

    const toolbar = <AppToolbar
      renderer={this._getRenderer()}
      mapState={this.state.mapState}
      mapStyle={this.state.mapStyle}
      inspectModeEnabled={this.state.mapState === "inspect"}
      sources={this.state.sources}
      onStyleChanged={this.onStyleChanged}
      onStyleOpen={this.onStyleChanged}
      onSetMapState={this.setMapState}
      onToggleModal={this.toggleModal.bind(this)}
    />

    const layerList = <LayerList
      onMoveLayer={this.onMoveLayer}
      onLayerDestroy={this.onLayerDestroy}
      onLayerCopy={this.onLayerCopy}
      onLayerVisibilityToggle={this.onLayerVisibilityToggle}
      onLayersChange={this.onLayersChange}
      onLayerSelect={this.onLayerSelect}
      selectedLayerIndex={this.state.selectedLayerIndex}
      layers={layers}
      sources={this.state.sources}
      errors={this.state.errors}
    />

    const layerEditor = selectedLayer ? <LayerEditor
      key={this.state.selectedLayerOriginalId}
      layer={selectedLayer}
      layerIndex={this.state.selectedLayerIndex}
      isFirstLayer={this.state.selectedLayerIndex < 1}
      isLastLayer={this.state.selectedLayerIndex === this.state.mapStyle.layers.length - 1}
      sources={this.state.sources}
      vectorLayers={this.state.vectorLayers}
      spec={this.state.spec}
      onMoveLayer={this.onMoveLayer}
      onLayerChanged={this.onLayerChanged}
      onLayerDestroy={this.onLayerDestroy}
      onLayerCopy={this.onLayerCopy}
      onLayerVisibilityToggle={this.onLayerVisibilityToggle}
      onLayerIdChange={this.onLayerIdChange}
      errors={this.state.errors}
    /> : undefined
    /**
     * 简化版编辑器
     */
    const layerEditorMini = selectedLayerGroup ? <LayerEditorMini
        key={selectedGroupLayer.id} //选中的分组id
        layer={selectedGroupLayer}
        layers={layersForGroup}  //所有的图层
        selectedGroupLayers={selectedGroupLayers} //选中的分组里面的图层layer  样式文件中查找到的图层
        selectedLayerGroupId={this.state.selectedLayerGroupId} //选中的分组id、
        sources={this.state.sources} //数据源
        vectorLayers={this.state.vectorLayers}
        spec={this.state.spec}  //图层规范
        onLayerGroupChanged={this.onLayerGroupChanged}
        errors={this.state.errors}
    /> : undefined


    /* 主页下部分错误提示信息组件 */
    const bottomPanel = (this.state.errors.length + this.state.infos.length) > 0 ? <MessagePanel
      currentLayer={selectedLayer}
      selectedLayerIndex={this.state.selectedLayerIndex}
      onLayerSelect={this.onLayerSelect}
      mapStyle={this.state.mapStyle}
      errors={this.state.errors}
      infos={this.state.infos}
    /> : undefined

    /*一些窗口和对话框*/
    const modals = <div>
      <ModalDebug
        renderer={this._getRenderer()}
        maplibreGlDebugOptions={this.state.maplibreGlDebugOptions}
        openlayersDebugOptions={this.state.openlayersDebugOptions}
        onChangeMaplibreGlDebug={this.onChangeMaplibreGlDebug}
        onChangeOpenlayersDebug={this.onChangeOpenlayersDebug}
        isOpen={this.state.isOpen.debug}
        onOpenToggle={this.toggleModal.bind(this, 'debug')}
        mapView={this.state.mapView}
      />
      <ModalShortcuts
        ref={(el) => this.shortcutEl = el}
        isOpen={this.state.isOpen.shortcuts}
        onOpenToggle={this.toggleModal.bind(this, 'shortcuts')}
      />
      <ModalSettings
        mapStyle={this.state.mapStyle}
        onStyleChanged={this.onStyleChanged}
        onChangeMetadataProperty={this.onChangeMetadataProperty}
        isOpen={this.state.isOpen.settings}
        onOpenToggle={this.toggleModal.bind(this, 'settings')}
      />
      <ModalExport
        mapStyle={this.state.mapStyle}
        onStyleChanged={this.onStyleChanged}
        isOpen={this.state.isOpen.export}
        onOpenToggle={this.toggleModal.bind(this, 'export')}
      />
      <ModalOpen
        isOpen={this.state.isOpen.open}
        onStyleOpen={this.openStyle}
        onOpenToggle={this.toggleModal.bind(this, 'open')}
      />
      <ModalSources
        mapStyle={this.state.mapStyle}
        onStyleChanged={this.onStyleChanged}
        isOpen={this.state.isOpen.sources}
        onOpenToggle={this.toggleModal.bind(this, 'sources')}
      />
      <ModalSurvey
        isOpen={this.state.isOpen.survey}
        onOpenToggle={this.toggleModal.bind(this, 'survey')}
      />
    </div>

    /*如果配置没有加载完成 不渲染界面*/
    let {runConfigLoaded} = this.state;
    if (!runConfigLoaded) {
      return null
    }

    return <AppLayout
      toolbar={toolbar}
      layerList={layerList}
      layerEditor={layerEditor}
      LayerListGroupList={layerListGroupList}
      layerEditorMini={layerEditorMini}
      map={this.mapRenderer()}
      bottom={bottomPanel}
      modals={modals}
    />
  }
}
