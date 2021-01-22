import React from 'react'
import PropTypes from 'prop-types'
import {latest} from '@mapbox/mapbox-gl-style-spec'
import Modal from './Modal'
import InputButton from './InputButton'
import Block from './Block'
import FieldString from './FieldString'
import FieldSelect from './FieldSelect'
import ModalSourcesTypeEditor from './ModalSourcesTypeEditor'

import style from '../libs/style'
import { deleteSource, addSource, changeSource, deleteSourceMsp, addSourceMsp, changeSourceMsp } from '../libs/source'
import publicSources from '../config/tilesets.json'
import publicSourcesMsp from '../config/tilesets.json'

import {MdAddCircleOutline, MdDelete} from 'react-icons/md'
import {getToken} from "../util/auth";

class PublicSource extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
  }

  render() {
    return <div className="maputnik-public-source">
			<InputButton
        className="maputnik-public-source-select"
				onClick={() => this.props.onSelect(this.props.id)}
			>
				<div className="maputnik-public-source-info">
					<p className="maputnik-public-source-id">{this.props.id}</p>
					<p className="maputnik-public-source-name">{this.props.title}</p>
					<p className="maputnik-public-source-name">数据源类型 {this.props.type}</p>
				</div>
				<span className="maputnik-space" />
				<MdAddCircleOutline />
			</InputButton>
    </div>
  }
}

function editorMode(source) {
  if(source.type === 'raster') {
    if(source.tiles) return 'tilexyz_raster'
    return 'tilejson_raster'
  }
  if(source.type === 'raster-dem') {
    if(source.tiles) return 'tilexyz_raster-dem'
    return 'tilejson_raster-dem'
  }
  if(source.type === 'vector') {
    if(source.tiles) return 'tilexyz_vector'
    return 'tilejson_vector'
  }
  if(source.type === 'geojson') {
    if (typeof(source.data) === "string") {
      return 'geojson_url';
    }
    else {
      return 'geojson_json';
    }
  }
  if(source.type === 'image') {
    return 'image';
  }
  if(source.type === 'video') {
    return 'video';
  }
  return null
}

class ActiveModalSourcesTypeEditor extends React.Component {
  static propTypes = {
    sourceId: PropTypes.string.isRequired,
    source: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  render() {
    const inputProps = { }
    return <div className="maputnik-active-source-type-editor">
      <div className="maputnik-active-source-type-editor-header">
        <span className="maputnik-active-source-type-editor-header-id">数据源 {this.props.sourceId}</span>
        <span className="maputnik-space" />
        <InputButton
          aria-label={`从本样式中删除Id为 '${this.props.sourceId}' 的数据源`}
          className="maputnik-active-source-type-editor-header-delete"
          onClick={()=> this.props.onDelete(this.props.sourceId)}
          style={{backgroundColor: 'transparent'}}
        >
          <MdDelete />
        </InputButton>
      </div>
      <div className="maputnik-active-source-type-editor-content">
        <ModalSourcesTypeEditor
          onChange={this.props.onChange}
          mode={editorMode(this.props.source)}
          source={this.props.source}
        />
      </div>
    </div>
  }
}

class AddSource extends React.Component {
  static propTypes = {
    onAdd: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      mode: 'tilejson_vector',
      sourceId: style.generateId(),
      source: this.defaultSource('tilejson_vector'),
    }
  }

  defaultSource(mode) {
    const source = (this.state || {}).source || {}
    const {protocol} = window.location;

    switch(mode) {
      case 'geojson_url': return {
        type: 'geojson',
        data: `${protocol}//localhost:3000/geojson.json`
      }
      case 'geojson_json': return {
        type: 'geojson',
        data: {}
      }
      case 'tilejson_vector': return {
        type: 'vector',
        url: source.url || `${protocol}//localhost:3000/tilejson.json`
      }
      case 'tilexyz_vector': return {
        type: 'vector',
        tiles: source.tiles || [`${protocol}//localhost:3000/{x}/{y}/{z}.pbf`],
        minZoom: source.minzoom || 0,
        maxZoom: source.maxzoom || 14
      }
      case 'tilejson_raster': return {
        type: 'raster',
        url: source.url || `${protocol}//localhost:3000/tilejson.json`
      }
      case 'tilexyz_raster': return {
        type: 'raster',
        tiles: source.tiles || [`${protocol}//localhost:3000/{x}/{y}/{z}.pbf`],
        minzoom: source.minzoom || 0,
        maxzoom: source.maxzoom || 14
      }
      case 'tilejson_raster-dem': return {
        type: 'raster-dem',
        url: source.url || `${protocol}//localhost:3000/tilejson.json`
      }
      case 'tilexyz_raster-dem': return {
        type: 'raster-dem',
        tiles: source.tiles || [`${protocol}//localhost:3000/{x}/{y}/{z}.pbf`],
        minzoom: source.minzoom || 0,
        maxzoom: source.maxzoom || 14
      }
      case 'image': return {
        type: 'image',
        url: `${protocol}//localhost:3000/image.png`,
        coordinates: [
          [0,0],
          [0,0],
          [0,0],
          [0,0],
        ],
      }
      case 'video': return {
        type: 'video',
        urls: [
          `${protocol}//localhost:3000/movie.mp4`
        ],
        coordinates: [
          [0,0],
          [0,0],
          [0,0],
          [0,0],
        ],
      }
      default: return {}
    }
  }

  onAdd = () => {
    const {source, sourceId} = this.state;
    this.props.onAdd(sourceId, source);
  }

  onChangeSource = (source) => {
    this.setState({source});
  }

  render() {
    // Kind of a hack because the type changes, however maputnik has 1..n
    // options per type, for example
    //
    //  - 'geojson' - 'GeoJSON (URL)' and 'GeoJSON (JSON)'
    //  - 'raster' - 'Raster (TileJSON URL)' and 'Raster (XYZ URL)'
    //
    // So we just ignore the values entirely as they are self explanatory
    const sourceTypeFieldSpec = {
      doc: latest.source_vector.type.doc
    };

    return <div className="maputnik-add-source">
      <FieldString
        label={"地图数据源ID"}
        fieldSpec={{doc: "标识源的唯一ID，在图层渲染中用于引用此数据源。" +
            "Unique ID that identifies the source and is used in the layer to reference the source."}}
        value={this.state.sourceId}
        onChange={v => this.setState({ sourceId: v})}
      />
      <FieldSelect
        label={"地图数据源类型"}
        fieldSpec={sourceTypeFieldSpec}
        options={[
          ['geojson_json', 'GeoJSON (JSON)'],
          ['geojson_url', 'GeoJSON (URL)'],
          ['tilejson_vector', 'Vector (TileJSON URL)'],
          ['tilexyz_vector', 'Vector (XYZ URLs)'],
          ['tilejson_raster', 'Raster (TileJSON URL)'],
          ['tilexyz_raster', 'Raster (XYZ URL)'],
          ['tilejson_raster-dem', 'Raster DEM (TileJSON URL)'],
          ['tilexyz_raster-dem', 'Raster DEM (XYZ URLs)'],
          ['image', 'Image'],
          ['video', 'Video'],
        ]}
        onChange={mode => this.setState({mode: mode, source: this.defaultSource(mode)})}
        value={this.state.mode}
      />
      <ModalSourcesTypeEditor
        onChange={this.onChangeSource}
        mode={this.state.mode}
        source={this.state.source}
      />
      <InputButton
        className="maputnik-add-source-button"
				onClick={this.onAdd}
      >
        添加数据源
      </InputButton>
    </div>
  }
}

export default class ModalSources extends React.Component {
  static propTypes = {
    mapStyle: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpenToggle: PropTypes.func.isRequired,
    onStyleChanged: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      styleUrl: "",
      isOpen: false,
      publicSourcesMsp: {}
    };
  }

  /**
   * 获取msp公共数据源
   */
  publicSourcesMsp() {
    console.log("publicSourcesMsp")
    let url = api_config.url + "/api/mapSource/getPublicSources?page=0&size=100&sort=id%2Cdesc";
    fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getToken(),
      },
      cache: "no-cache"
    }).then((response) => {
      return response.json();
    }).then((json) => {
      let isOpen_ = this.props.isOpen
      this.setState({
        isOpen: this.props.isOpen,
        publicSourcesMsp: json
      });
    });
  }

  /**
   * 转换msp得数据源type和mapbox数据源type
   * @param dictValue
   * @returns {*}
   */
  getSourceType(dictValue) {
      let dataSourceTypeMap = {
        'geojson_json': 'geojson',
        'geojson_url': 'geojson',
        'tilejson_vector': 'vector',
        'tilexyz_vector': 'vector',
        'tilejson_raster': 'raster',
        'tilexyz_raster': 'raster',
        'tilejson_raster-dem': 'raster-dem',
        'tilexyz_raster-dem': 'raster-dem',
        'image': 'image',
        'video': 'video'
        }
      console.log("")
    return dataSourceTypeMap[dictValue] ? dataSourceTypeMap[dictValue] : '';
  }

  stripTitle(source) {
    const strippedSource = {...source}
    delete strippedSource['title']
    return strippedSource
  }

  stripTitleMsp(source) {
    const strippedSource = {
      type: this.getSourceType(source.sourceType),
      url : source.sourceUrl
    }
    return strippedSource
  }

  render() {

    if (this.props.isOpen && !this.state.isOpen) {
      this.publicSourcesMsp();

    }

    if (!this.state.publicSourcesMsp) {
      return <div />
    }

    const mapStyle = this.props.mapStyle
    const activeSources = Object.keys(mapStyle.sources).map(sourceId => {
      const source = mapStyle.sources[sourceId]
      return <ActiveModalSourcesTypeEditor
        key={sourceId}
        sourceId={sourceId}
        source={source}
        onChange={src => this.props.onStyleChanged(changeSource(mapStyle, sourceId, src))}
        onDelete={() => this.props.onStyleChanged(deleteSource(mapStyle, sourceId))}
      />
    })

    const tilesetOptions = Object.keys(publicSources).filter(sourceId => !(sourceId in mapStyle.sources)).map(sourceId => {
      const source = publicSources[sourceId]
      return <PublicSource
        key={sourceId}
        id={sourceId}
        type={source.type}
        title={source.title}
        onSelect={() => this.props.onStyleChanged(addSource(mapStyle, sourceId, this.stripTitle(source)))}
      />
    })

    console.log(this.state.publicSourcesMsp)
    const tilesetOptionsMsp = Object.keys(this.state.publicSourcesMsp).filter(sourceId => !(sourceId in mapStyle.sources)).map(sourceId => {
      const source = this.state.publicSourcesMsp[sourceId]
      console.log(sourceId)
      return <PublicSource
        key={sourceId}
        id={sourceId}
        type={ this.getSourceType(source.sourceType)}
        title={source.sourceRemark}
        onSelect={() => this.props.onStyleChanged(addSourceMsp(mapStyle, sourceId, this.stripTitleMsp(source)))}
      />
    })

    const inputProps = { }
    return <Modal
      data-wd-key="modal:sources"
      isOpen={this.props.isOpen}
      onOpenToggle={this.props.onOpenToggle}
      title={'Sources'}
    >
      <section className="maputnik-modal-section">
        <h1>MSP公共数据源</h1>
        <p>
          点击添加一个公共的数据源到此样式中
        </p>
        <div className="maputnik-public-sources" style={{maxwidth: 500}}>
          {tilesetOptionsMsp}
        </div>
      </section>

      <section className="maputnik-modal-section">
        <h1>互联网公共数据源</h1>
        <p>
          点击添加一个公共的数据源到此样式中
        </p>
        <div className="maputnik-public-sources" style={{maxwidth: 500}}>
          {tilesetOptions}
        </div>
      </section>

      <section className="maputnik-modal-section">
        <h1>已选数据源</h1>
        {activeSources}
      </section>

      <section className="maputnik-modal-section" style={{display: "block"}}>
				<h1>添加新数据源</h1>
				<p>添加一个新的地图数据源用于样式渲染</p>
				<AddSource
					onAdd={(sourceId, source) => this.props.onStyleChanged(addSource(mapStyle, sourceId, source))}
				/>
      </section>
    </Modal>
  }
}

