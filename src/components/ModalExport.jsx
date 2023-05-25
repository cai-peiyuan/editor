import React from 'react'
import PropTypes from 'prop-types'
import Slugify from 'slugify'
import {saveAs} from 'file-saver'
import pkgLockJson from '../../package-lock.json'
import pkgJson from '../../package.json'

import {format} from '@mapbox/mapbox-gl-style-spec'
import FieldString from './FieldString'
import FieldCheckbox from './FieldCheckbox'
import InputButton from './InputButton'
import Modal from './Modal'
import {MdFileDownload, MdSave, MdThumbDown, MdCloudUpload, MdPhotoLibrary} from 'react-icons/md'
import style from '../libs/style'
import fieldSpecAdditional from '../libs/field-spec-additional'
import {getToken} from '../util/auth.js'
import 'canvas-toBlob'
import FileSaver from 'file-saver'
import icons from "../libs/exportcontrol/icons";
import FieldUrl from "./FieldUrl";
import FieldArray from "./FieldArray";
import {getLabelName} from "../libs/lang";

var {v1: uuid} = require('uuid');

console.log('------------', pkgJson);
console.log('------------', pkgLockJson);
const MAPBOX_GL_VERSION = pkgLockJson.packages["node_modules/mapbox-gl"].version;


class Image extends React.Component {
  static propTypes = {
    srcImg: PropTypes.string.isRequired
  }

  render() {
    return <img src={this.props.srcImg} width="200"/>
  }
}

export default class ModalExport extends React.Component {
  static propTypes = {
    mapStyle: PropTypes.object.isRequired,
    onStyleChanged: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpenToggle: PropTypes.func.isRequired,
  }

  saveToMspTitle = "";

  constructor(props) {
    super(props);
    this.state = {
      thumbnailSrc: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCACWAPIBAREA/8QAGwABAAMBAQEBAAAAAAAAAAAAAAIDBQQGAQf/xAA0EAACAgIBAgMGAwcFAAAAAAAAAQIDBBEFEiETMUEUMlFhcZEGM6EjQkNScoGxFRbh8PH/2gAIAQEAAD8A/fwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZWbyVmPlOuCg1FLeyEebkvfpT+ki6PNUP3oTj+pdHk8SX8VL6povjk0z922D+kkWgAAAAAAAAAAAA8vmT8Xk7F8bOnt9jblxWJJfluP8AS2UT4Sl+5bZH66ZTLg7F7l8X9Y6ODLw7cNx8Rxal5OLNfhU/YXJtvc3o0gAAAAAAAAAAARckt7a7LZ5TCftHK1+vVY5P/J63yBC22umDnZOMYr1bPPc7fGeRT0vcfD6vubHFw6ONoWtNx39zsAAAAAAAAAABCyTjXKSW2k2jInl32ec2l8I9hVNwxsq5+can3Zk8NZGvMlfPfTTVKb1/35kc/mL82XTt11b7QT/yzsq/Ec68KMJV9d67dTfZ/NmXfmX5tyd1jk29Jei+h08zLXJTrX8OEYL7HrMeHh49cP5YpfoWgAAAAAAAAAAGFdX4d04fB9ivMmquBypes2oox+NyMaEMqvItdXjQUFJR3ruT/wBPxpvVPK40vlPcT4+GzH+VKi5fGFqJ4XF5sORx/FxbIwVibk120Uzn7XzrS7qzI0vv/wAHugAAAAAAAAAAAZfI19N8Z+kl+pl89J18HRH0nbtv7nl+r5jq+YUtPaen8i+vPyqteHk3R18Js7OAi7+co296bm3/AGPegAAAAAAAAAAA5OQh1Y/V6xezihlzjUq5QhOC9JIrlVg3v9px1Um/Nxj3H+3eNyFv2W2n6TaOaz8H4734eVbH4dSTOSz8H5K/Ky6pf1RaOvgeCyuOz535Hh9Kg4x6Zb3v/wAPSgAAAAAAAAAAAjOKnBxfk1pnNDj6Y92nJ/NnTGuMFqEUl8kSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKq8iq6yyFdkZSrfTNL91n2q2u6tTrkpRba2iwrpuryKo21S6oS8nrzLAAAAAAAAAAAAADBpjKnIzM2tNyryZRsiv3oaW/7rzK8K1zxsGrx5V0Wytk5wfT1NS7Lfp5tmlxls7IXwdjtrrucK7G9uUdL19dPaM3j7b8x4VdmVd0zx5yl0z05NT15k8e29Y2DkyyrZznkeDJSl2cdtd18ey7kJ5dmoZNd1upXpJ2W62urTSguyX1PmRkzWHk3yzbYZSucFUp60urSSX09SV+RkzszZuyVc6bHGH7dQjFJdm4+u/M3q25VQctdTSb0TAAAAAAAAAABBQjHeopdT29LzZGWPTKrwnVW6/wCTpWvsThCNcVGEVGK8klpIjGquGnGuMWlpaSWkFVWkkoR1F7S15P4kVi0KUpKmtSl7z6FtnLdxjvsl4mRY6pS6nDpW/PeurW9dvI6549NlisnTXKa8pSim0WgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//2Q==",
      thumbnailBlob: null
    }
  }

  tokenizedStyle() {
    return format(style.stripAccessTokens(style.replaceAccessTokens(this.props.mapStyle)));
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

  downloadHtml() {
    const tokenStyle = this.tokenizedStyle();
    const htmlTitle = this.props.mapStyle.name || "Map";
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${htmlTitle}</title>
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
  <script src="https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.js"></script>
  <link href="https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.css" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 0; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
      mapboxgl.accessToken = 'access_token';
      const map = new mapboxgl.Map({
         container: 'map',
         style: ${tokenStyle},
      });
      map.addControl(new mapboxgl.NavigationControl());
  </script>
</body>
</html>
`;

    const blob = new Blob([html], {type: "text/html;charset=utf-8"});
    const exportName = this.exportName();
    saveAs(blob, exportName + ".html");
  }

  downloadStyle() {
    const tokenStyle = this.tokenizedStyle();
    const blob = new Blob([tokenStyle], {type: "application/json;charset=utf-8"});
    const exportName = this.exportName();
    saveAs(blob, exportName + ".json");
  }

  /**
   * 生成缩略图相关的方法
   */

  onRemove() {
    this.container.parentNode.removeChild(this.container)
  }

  loading() {
    const container = document.createElement('div')
    document.body.appendChild(container)

    this.setStyles(container, {
      position: "absolute", top: 0, bottom: 0, width: "100%", backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 9999,
    })

    const icon = document.createElement('div')
    icon.innerHTML = icons.loading

    this.setStyles(icon, {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      margin: "auto",
      width: "120px",
      height: "120px",
    })

    container.appendChild(icon)

    return container;
  }

  setStyles(element, styles) {
    for (const style in styles) {
      element.style[style] = styles[style]
    }
  }

  //  生成地图截图
  getThumbnail() {
    window.exportControl.downloadMap(false, (blob) => {
      this.setState({
        thumbnailSrc: window.URL.createObjectURL(blob), thumbnailBlob: blob
      })
    })
  }

  // 上传地图截图
  uploadThumbnail() {
    const metadata = this.props.mapStyle.metadata;
    const mspInfo = metadata.mspInfo || {
      id: uuid().replaceAll('-', ''), styleType: 'public'
    }
    if (this.state.thumbnailBlob) {
      this.blobToDataURL(this.state.thumbnailBlob, (result) => {
        let saveStyleThumbnailToMspResult = style.saveStyleThumbnailToMsp(mspInfo, result);
        if (saveStyleThumbnailToMspResult.message == 'success') {
          this.setState({
            isStyleLoaded: false
          });
        }
      })
    } else {

    }
  }

  // 保存到在线服务

  saveToMsp() {

    // 保存样式json
    const tokenStyle = this.tokenizedStyle();
    const blob = new Blob([tokenStyle], {type: "application/json;charset=utf-8"});
    const exportName = this.exportName();
    console.log(tokenStyle)
    console.log(exportName)
    console.log(this.props.mapStyle)
    console.log(blob)

    const metadata = this.props.mapStyle.metadata;
    const mspInfo = metadata.mspInfo || {
      id: uuid().replaceAll('-', ''), styleCode: exportName, styleName: exportName, styleType: 'public'
    }
    style.saveStyleJsonToMsp(mspInfo, tokenStyle);
    if (this.state.thumbnailBlob) {
      this.blobToDataURL(this.state.thumbnailBlob, (result) => {
        let saveStyleThumbnailToMspResult = style.saveStyleThumbnailToMsp(mspInfo, result);
        if (saveStyleThumbnailToMspResult.message == 'success') {
          this.setState({
            isStyleLoaded: false
          });
        }
      })
    }
    // saveAs(blob, exportName + ".json");
  }

  //**blob to dataURL**
  blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function (e) {
      callback(e.target.result);
    }
    a.readAsDataURL(blob);
  }

  changeMetadataProperty(property, value) {
    const changedStyle = {
      ...this.props.mapStyle, metadata: {
        ...this.props.mapStyle.metadata, [property]: value
      }
    }
    this.props.onStyleChanged(changedStyle)
  }


  render() {
    return <Modal
      data-wd-key="modal:export"
      isOpen={this.props.isOpen}
      onOpenToggle={this.props.onOpenToggle}
      title={getLabelName('Save Style')}
      className="maputnik-export-modal"
    >
      <section className="maputnik-modal-section">
        <h1>{getLabelName("Style Thumbnail")}</h1>

        <div style={{"textAlign": "center"}}>
          <Image srcImg={this.state.thumbnailSrc}/>
          {/*<img src={this.state.thumbnailSrc} alt="" width="200" height="200"/>*/}
        </div>

        <div style={{"textAlign": "center"}}>
          <InputButton
            onClick={this.getThumbnail.bind(this)}>
            <MdPhotoLibrary/>
            {getLabelName("Get Style Thumbnail")}
          </InputButton>
        </div>

        <div style={{"textAlign": "center"}}>
          <InputButton
            onClick={this.uploadThumbnail.bind(this)}>
            <MdPhotoLibrary/>
            {getLabelName("Upload Style Thumbnail")}
          </InputButton>
        </div>
      </section>

      <section className="maputnik-modal-section">
        <h1>{getLabelName("Save Style")}</h1>
        <p>
          {getLabelName("Save Style To Msp")}
        </p>
        <div className="maputnik-modal-export-buttons">
          <InputButton
            onClick={this.saveToMsp.bind(this)}
            title={this.saveToMspTitle}>
            <MdCloudUpload/>
            {getLabelName("Save")}
          </InputButton>
        </div>
      </section>

      <section className="maputnik-modal-section"
               style={{display: runConfig.mainLayout.toolBar.toolBarExportSaveToFile === false ? "none" : "block"}}
      >
        <h1>{getLabelName("Download Style Json")}</h1>
        <p>
          {getLabelName("Download a JSON style to your computer.")}
        </p>

        {/*<div>
          <FieldString
            label={fieldSpecAdditional.maputnik.mapbox_access_token.label}
            fieldSpec={fieldSpecAdditional.maputnik.mapbox_access_token}
            value={(this.props.mapStyle.metadata || {})['maputnik:mapbox_access_token']}
            onChange={this.changeMetadataProperty.bind(this, "maputnik:mapbox_access_token")}
          />
          <FieldString
            label={fieldSpecAdditional.maputnik.maptiler_access_token.label}
            fieldSpec={fieldSpecAdditional.maputnik.maptiler_access_token}
            value={(this.props.mapStyle.metadata || {})['maputnik:openmaptiles_access_token']}
            onChange={this.changeMetadataProperty.bind(this, "maputnik:openmaptiles_access_token")}
          />
          <FieldString
            label={fieldSpecAdditional.maputnik.thunderforest_access_token.label}
            fieldSpec={fieldSpecAdditional.maputnik.thunderforest_access_token}
            value={(this.props.mapStyle.metadata || {})['maputnik:thunderforest_access_token']}
            onChange={this.changeMetadataProperty.bind(this, "maputnik:thunderforest_access_token")}
          />
        </div>*/}

        <div className="maputnik-modal-export-buttons"
             style={{"textAlign": "center"}}>
          <InputButton
            onClick={this.downloadStyle.bind(this)}
          >
            <MdFileDownload/>
            {getLabelName("Download Json File")}
          </InputButton>

          <InputButton
            onClick={this.downloadHtml.bind(this)}
          >
            <MdFileDownload/>
            {getLabelName("Download Html File")}
          </InputButton>
        </div>
      </section>

    </Modal>
  }
}

