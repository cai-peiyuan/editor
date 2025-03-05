import React, {type JSX} from 'react'
import ReactDOM from 'react-dom'
import MapLibreGl, {LayerSpecification, LngLat, Map, MapOptions, SourceSpecification, StyleSpecification} from 'maplibre-gl'
import MaplibreInspect from '@maplibre/maplibre-gl-inspect'
import colors from '@maplibre/maplibre-gl-inspect/lib/colors'
import MapMaplibreGlLayerPopup from './MapMaplibreGlLayerPopup'
import MapMaplibreGlFeaturePropertyPopup, { InspectFeature } from './MapMaplibreGlFeaturePropertyPopup'
import Color from 'color'
import ZoomControl from '../libs/zoomcontrol'
import { HighlightedLayer, colorHighlightedLayer } from '../libs/highlight'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../maplibregl.css'
import '../libs/maplibre-rtl'
//@ts-ignore
import MaplibreGeocoder, { MaplibreGeocoderApi, MaplibreGeocoderApiConfig } from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import { createRoot } from 'react-dom/client';

import style from '../libs/style'
import {format} from '@maplibre/maplibre-gl-style-spec'
import Slugify from 'slugify'
import {getToken} from '../libs/auth'

import ExportControl from '../libs/exportcontrol/index'
import PropTypes from 'prop-types'
import { Protocol } from "pmtiles";


function renderPopup(popup: JSX.Element, mountNode: ReactDOM.Container): HTMLElement {
  //ReactDOM.render(popup, mountNode);
  const root = createRoot(mountNode!); // createRoot(container!) if you use TypeScript
  root.render(popup);
  return mountNode as HTMLElement;
}

function buildInspectStyle(originalMapStyle: StyleSpecification, coloredLayers: HighlightedLayer[], highlightedLayer?: HighlightedLayer) {
  const backgroundLayer = {
    "id": "background",
    "type": "background",
    "paint": {
      "background-color": '#1c1f24',
    }
  } as LayerSpecification

  const layer = colorHighlightedLayer(highlightedLayer)
  if(layer) {
    coloredLayers.push(layer)
  }

  const sources: {[key:string]: SourceSpecification} = {}

  Object.keys(originalMapStyle.sources).forEach(sourceId => {
    const source = originalMapStyle.sources[sourceId]
    if(source.type !== 'raster' && source.type !== 'raster-dem') {
      sources[sourceId] = source
    }
  })

  const inspectStyle = {
    ...originalMapStyle,
    sources: sources,
    layers: [backgroundLayer].concat(coloredLayers as LayerSpecification[])
  }
  return inspectStyle
}

type MapMaplibreGlProps = {
  onDataChange?(event: {map: Map | null}): unknown
  onLayerSelect(...args: unknown[]): unknown
  mapStyle: StyleSpecification
  inspectModeEnabled: boolean
  highlightedLayer?: HighlightedLayer
  options?: Partial<MapOptions> & {
    showTileBoundaries?: boolean
    showCollisionBoxes?: boolean
    showOverdrawInspector?: boolean
  }
  replaceAccessTokens(mapStyle: StyleSpecification): StyleSpecification
  onChange(value: {center: LngLat, zoom: number}): unknown
  onStyleOpen(value: {center: LngLat, zoom: number}): unknown
  onOpenToggle(value: {center: LngLat, zoom: number}): unknown

};

type MapMaplibreGlState = {
  map: Map | null
  inspect: MaplibreInspect | null
  zoom?: number
};

export default class MapMaplibreGl extends React.Component<MapMaplibreGlProps, MapMaplibreGlState> {
  static defaultProps = {
    onMapLoaded: () => {},
    onDataChange: () => {},
    onLayerSelect: () => {},
    onChange: () => {},
    options: {} as MapOptions,
  }
  container: HTMLDivElement | null = null

  constructor(props: MapMaplibreGlProps) {
    super(props)
    this.state = {
      map: null,
      inspect: null,
    }
  }
  tokenizedStyle(){
    return format(style.stripAccessTokens(style.replaceAccessTokens(this.props.mapStyle)));
  }

  shouldComponentUpdate(nextProps: MapMaplibreGlProps, nextState: MapMaplibreGlState) {
    let should = false;
    try {
      should = JSON.stringify(this.props) !== JSON.stringify(nextProps) || JSON.stringify(this.state) !== JSON.stringify(nextState);
    } catch(_e) {
      // no biggie, carry on
    }
    return should;
  }

  componentDidUpdate() {
    const map = this.state.map;

    const styleWithTokens = this.props.replaceAccessTokens(this.props.mapStyle);
    if (map) {
      // Maplibre GL now does diffing natively so we don't need to calculate
      // the necessary operations ourselves!
      // We also need to update the style for inspect to work properly
      map.setStyle(styleWithTokens, {diff: true});
      map.showTileBoundaries = this.props.options?.showTileBoundaries!;
      map.showCollisionBoxes = this.props.options?.showCollisionBoxes!;
      map.showOverdrawInspector = this.props.options?.showOverdrawInspector!;
    }

    if(this.state.inspect && this.props.inspectModeEnabled !== this.state.inspect._showInspectMap) {
      this.state.inspect.toggleInspector()
    }
    if (this.state.inspect && this.props.inspectModeEnabled) {
      this.state.inspect.setOriginalStyle(styleWithTokens);
      // In case the sources are the same, there's a need to refresh the style
      setTimeout(() => {
        this.state.inspect!.render();
      }, 500);
    }
  }

  componentDidMount() {
    const mapOpts = {
      ...this.props.options,
      container: this.container!,
      style: this.props.mapStyle,
      hash: true,
      maxZoom: 24,
      // setting to always load glyphs of CJK fonts from server
      // https://maplibre.org/maplibre-gl-js/docs/examples/local-ideographs/
      localIdeographFontFamily: '"Apple LiSung", serif'
    } satisfies MapOptions;

    const protocol = new Protocol({metadata: true});
    MapLibreGl.addProtocol("pmtiles",protocol.tile);

    const map = new MapLibreGl.Map(mapOpts);
    window.mapboxgl = MapLibreGl;
    document.mapboxgl = MapLibreGl;
    mapboxgl = MapLibreGl;
    window.map = map;
    document.map = map;

    const mapViewChange = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      this.props.onChange({center, zoom});
    }
    mapViewChange();

    map.showTileBoundaries = mapOpts.showTileBoundaries!;
    map.showCollisionBoxes = mapOpts.showCollisionBoxes!;
    map.showOverdrawInspector = mapOpts.showOverdrawInspector!;

    /// this.initGeocoder(map);
    const geocoder = this.initGeocoder(map);

    const zoomControl = new ZoomControl;
    map.addControl(zoomControl, 'top-right');

    const nav = new MapLibreGl.NavigationControl({visualizePitch:true});
    map.addControl(nav, 'top-right');

    var _this = this;
    window.exportControl = new ExportControl({
      dpi: 300,
      attribution: "© ",
      textFont: [],
      callBackFunc: this.downLoadMapSnapCallBackFunc,
      downloadStyle:()=>{
      	_this.downloadStyle();
      },
      callRecovery:()=>{
      	_this.recoveryStyle()
      },
      resetStyle:()=>{
      	_this.resetStyle()
      },
      publishStyle:()=>{
      	_this.publishStyle();
      }
    });
    console.log("添加地图组件",window.exportControl)
    // 导出地图截图控件
    map.addControl(window.exportControl);


    const tmpNode = document.createElement('div');
   // const tmpNodeRoot = createRoot(tmpNode!);
    const inspect = new MaplibreInspect({
      popup: new MapLibreGl.Popup({
        closeOnClick: false
      }),
      showMapPopup: true,
      showMapPopupOnHover: false,
      showInspectMapPopupOnHover: true,
      showInspectButton: false,
      blockHoverPopupOnClick: true,
      assignLayerColor: (layerId: string, alpha: number) => {
        return Color(colors.brightColor(layerId, alpha)).desaturate(0.5).string()
      },
      buildInspectStyle: (originalMapStyle: StyleSpecification, coloredLayers: HighlightedLayer[]) => buildInspectStyle(originalMapStyle, coloredLayers, this.props.highlightedLayer),
      renderPopup: (features: InspectFeature[]) => {
        if(runConfig.layerEditMode == 'mini'){
          return null
        }
        if(this.props.inspectModeEnabled) {
          return renderPopup(<MapMaplibreGlFeaturePropertyPopup features={features} />, tmpNode);
        } else {
          return renderPopup(<MapMaplibreGlLayerPopup features={features} onLayerSelect={this.onLayerSelectById} zoom={this.state.zoom} />, tmpNode);
        }
      }
    })
    map.addControl(inspect)

    map.on("style.load", () => {
      this.setState({
        map,
        inspect,
        zoom: map.getZoom()
      });
    })

    map.on("data", e => {
      if(e.dataType !== 'tile') return
      this.props.onDataChange!({
        map: this.state.map
      })
    })

    map.on("error", e => {
      console.log("ERROR", e);
    })

    map.on("zoom", _e => {
      this.setState({
        zoom: map.getZoom()
      });
    });

    map.on("dragend", mapViewChange);
    map.on("zoomend", mapViewChange);
  }

  onLayerSelectById = (id: string) => {
    const index = this.props.mapStyle.layers.findIndex(layer => layer.id === id);
    this.props.onLayerSelect(index);
  }

  initGeocoder(map: Map) {
    const geocoderConfig = {
      forwardGeocode: async (config: MaplibreGeocoderApiConfig) => {
        const features = [];
        try {
          const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
          const response = await fetch(request);
          const geojson = await response.json();
          for (const feature of geojson.features) {
            const center = [
              feature.bbox[0] +
                  (feature.bbox[2] - feature.bbox[0]) / 2,
              feature.bbox[1] +
                  (feature.bbox[3] - feature.bbox[1]) / 2
            ];
            const point = {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: center
              },
              place_name: feature.properties.display_name,
              properties: feature.properties,
              text: feature.properties.display_name,
              place_type: ['place'],
              center
            };
            features.push(point);
          }
        } catch (e) {
          console.error(`Failed to forwardGeocode with error: ${e}`);
        }
        return {
          features
        };
      },
    } as unknown as MaplibreGeocoderApi;
    const geocoder = new MaplibreGeocoder(geocoderConfig, {maplibregl: MapLibreGl});
    map.addControl(geocoder, 'top-left');
  }
  exportName() {
    if (this.props.mapStyle.name) {
      return Slugify(this.props.mapStyle.name, {
        replacement: '_', remove: /[*\-+~.()'"!:]/g, lower: true
      });
    } else {
      return this.props.mapStyle.id
    }
  }
  /**
   * 下载地图截图回调函数
   * @param blobData
   */
  downLoadMapSnapCallBackFunc(blobData) {
    let thumbnailSrc = window.URL.createObjectURL(blobData);
    let thumbnailBlob = blobData;
    console.log(this)
    console.log("custom call back function " + blobData)
  }
	downloadStyle(){
		console.log("下载样式文件",this)
		 const tokenStyle = this.tokenizedStyle();
    const blob = new Blob([tokenStyle], {type: "application/json;charset=utf-8"});
    const exportName = this.exportName();
    saveAs(blob, exportName + ".json");

	}

	//恢复至已发布样式
	recoveryStyle(){
		 const metadata = this.props.mapStyle.metadata;
		var mspInfo = metadata.mspInfo;
		var url = api_config.url + "/msp-api/styleId/" + mspInfo.styleId;
		this.styleSelect(url);
	}
	//发布样式
	publishStyle(){
		this.props.onOpenToggle();
	}
  styleSelect = (styleUrl,status) => {
		console.log(status,"status")
   // this.clearError();
    let canceled;
    const activeRequest = fetch(styleUrl, {
      mode: 'cors', credentials: "same-origin", method: "GET", headers: {
        'Content-Type': 'application/json', 'token': getToken(),
      }, cache: "no-cache"
    })
      .then(function (response) {
        return response.json();
      })
      .then((body) => {
      	//console.log(body,"---------在浏览器url中设置styleId为对应样式的styleId-------")
        if (canceled) {
          return;
        }
        this.setState({
          activeRequest: null, activeRequestUrl: null
        });
        /**
         * 打开指定的style后 在浏览器url中设置styleId为对应样式的styleId
         */

        const mapStyle = style.ensureStyleValidity(style.transMapAbcSpriteAndFontUrl(body))
        const url = new URL(location.href);
        console.log(status,"传值的")
        if(status == "recoveryStyle"){

        }else{
        	url.searchParams.set("styleId", mapStyle.metadata.mspInfo.styleId);
        	console.log("修改i了url")
        }

        history.replaceState({}, "Maputnik", url.href);
        console.log('Loaded style ', mapStyle.id)
        console.log('Loaded style ', mapStyle)
        this.props.onStyleOpen(mapStyle)
        //this.props.onStyleOpen(mapStyle);

        //this.props.onStyleOpen(mapStyle)
       // this.onOpenToggle()
      })
      .catch((err) => {
        this.setState({
          error: `Failed to load: '${styleUrl}'`, activeRequest: null, activeRequestUrl: null
        });
        console.error(err);
        console.warn('Could not open the style URL', styleUrl)
      })

    this.setState({
      activeRequest: {
        abort: function () {
          canceled = true;
        }
      }, activeRequestUrl: styleUrl
    })
  }
  resetStyle(){

		/*var id=  "2695883491";
		var url = api_config.url + "/msp/resource/mapStyle/styleId/" + id;

		this.styleSelect(url);*/
		/*var mapStyle = {

		}
		 this.props.onStyleOpen(mapStyle)*/


		var url  =  api_config.url+"/msp-api/queryAll";
		var param = {
				//type:'0'
        styleType:'public'
		}
		fetch(url,{
			  method: 'POST',
			  mode: 'cors',
			  body:JSON.stringify(param),
			  headers:{
			  	'Content-Type': 'application/json',
			  	'token': getToken(),
			  }
		}) .then(function (response) {
        return response.json();
      })
      .then((body) => {
      	console.log(body)
      	var list = body.data || [];
      	var styleId = "";
      	if(list.length > 0){
      			var styleId = list[0].styleId;
      			if(styleId){
      				var url = api_config.url + "/tMapStyle/styleId/" + styleId;
							this.styleSelect(url,"recoveryStyle");
      			}
      	}
      }).catch((err) => {
        this.setState({
          error: `Failed to load: '${url}'`, activeRequest: null, activeRequestUrl: null
        });
        console.error(err);
        console.warn('Could not open the style URL', url)
      })

	}

  render() {
    return <div
      className="maputnik-map__map"
      role="region"
      aria-label="Map view"
      ref={x => this.container = x}
      data-wd-key="maplibre:map"
    ></div>
  }
}

