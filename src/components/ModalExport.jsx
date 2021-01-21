import React from 'react'
import PropTypes from 'prop-types'
import Slugify from 'slugify'
import { saveAs } from 'file-saver'
import pkgLockJson from '../../package-lock.json'

import {format} from '@mapbox/mapbox-gl-style-spec'
import FieldString from './FieldString'
import FieldCheckbox from './FieldCheckbox'
import InputButton from './InputButton'
import Modal from './Modal'
import { MdFileDownload, MdSave, MdThumbDown} from 'react-icons/md'
import style from '../libs/style'
import fieldSpecAdditional from '../libs/field-spec-additional'
import { getToken } from '../util/auth.js'
import canvas2image from '../libs/canvas2image'
import FileSaver from 'file-saver'

const MAPBOX_GL_VERSION = pkgLockJson.dependencies["mapbox-gl"].version;


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
  }

  tokenizedStyle () {
    return format(
      style.stripAccessTokens(
        style.replaceAccessTokens(this.props.mapStyle)
      )
    );
  }

  exportName () {
    if(this.props.mapStyle.name) {
      return Slugify(this.props.mapStyle.name, {
        replacement: '_',
        remove: /[*\-+~.()'"!:]/g,
        lower: true
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

  base64ToBlob(code) {
    let parts = code.split(";base64,");
    let contentType = parts[0].split(":")[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;
    let uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; i++) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], {type: contentType});
  }
  // Converts canvas to an image
  convertCanvasToImage(canvas) {
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    return image;
  }

  //  保存缩略图
  saveThumbnail() {

    const actualPixelRatio = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', {
      get: () => this.options.dpi / 96
    });
    window.map.getCanvas().toBlob((blob) => {
      FileSaver.saveAs(blob, `${window.map.getCenter().toArray().join('-')}.png`)
      Object.defineProperty(window, 'devicePixelRatio', {
        get: () => actualPixelRatio
      });
    })

  }

  saveThumbnail1() {

    const c = document.getElementsByClassName("mapboxgl-canvas")[0];
    const w = 300;
    const h = 200;
    const img_data = canvas2image.Canvas2Image.saveAsPNG(c, true , w, h).getAttribute('src');
    console.log(c);
    console.log(canvas2image);
    console.log(img_data);
    console.log(this);

    const base64Img = document.getElementsByClassName("mapboxgl-canvas")[0].toDataURL("image/png");
    console.log(base64Img);

    const image = this.convertCanvasToImage(c);
    console.log(image)



    const blob = this.base64ToBlob(base64Img);

    saveAs(blob, "stylePreview.png");
    document.getElementsByClassName("mapboxgl-canvas")[0].toBlob(function(blobObj) {
      //saveAs(blob, "stylePreview.png");
    });
  }

  // 保存到在线服务

  saveToMsp() {
    const tokenStyle = this.tokenizedStyle();
    const blob = new Blob([tokenStyle], {type: "application/json;charset=utf-8"});
    const exportName = this.exportName();
    console.log(tokenStyle)
    console.log(exportName)
    console.log(this.props.mapStyle)
    console.log(blob)

    const metadata = this.props.mapStyle.metadata;
    const mspInfo = metadata.mspInfo
    fetch(api_config.url + '/api/mapStyle/updateStyleContent/' + mspInfo.id, {
      method: "PUT",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        'Authorization': getToken(),
      },
      body: tokenStyle
    })
      .then(function(response) {
        return response.json();
      })
      .then((body) => {
        console.log(body)
        alert(body.msg)
      })
      .catch(function(error) {
        if(error) console.error(error)
      })
    // saveAs(blob, exportName + ".json");
  }

  changeMetadataProperty(property, value) {
    const changedStyle = {
      ...this.props.mapStyle,
      metadata: {
        ...this.props.mapStyle.metadata,
        [property]: value
      }
    }
    this.props.onStyleChanged(changedStyle)
  }


  render() {
    return <Modal
      data-wd-key="modal:export"
      isOpen={this.props.isOpen}
      onOpenToggle={this.props.onOpenToggle}
      title={'保存样式'}
      className="maputnik-export-modal"
    >
      <section className="maputnik-modal-section">
        <h1>样式缩略图</h1>
        <p>

        </p>
        <div className="maputnik-modal-export-buttons">
          <InputButton
            onClick={this.saveThumbnail.bind(this)}
          >
            <MdThumbDown />
            获取缩略图
          </InputButton>
        </div>
      </section>


      <section className="maputnik-modal-section">
        <h1>保存样式</h1>
        <p>
          保存到在线服务
        </p>
        <div className="maputnik-modal-export-buttons">
          <InputButton
            onClick={this.saveToMsp.bind(this)}
            title={this.saveToMspTitle}
          >
            <MdSave />
            保存到服务
          </InputButton>
        </div>
      </section>

      <section className="maputnik-modal-section">
        <h1>下载样式文件</h1>
        <p>
          下载一个.json样式描述文件到本地
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

        <div className="maputnik-modal-export-buttons">

          <InputButton
            onClick={this.downloadStyle.bind(this)}
          >
            <MdFileDownload />
            下载JSON文件
          </InputButton>

          <InputButton
            onClick={this.downloadHtml.bind(this)}
          >
            <MdFileDownload />
            下载Html文件
          </InputButton>
        </div>
      </section>

    </Modal>
  }
}

