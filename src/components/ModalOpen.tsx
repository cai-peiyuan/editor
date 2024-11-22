import React, { FormEvent } from 'react'
import {MdFileUpload} from 'react-icons/md'
import {MdAddCircleOutline} from 'react-icons/md'
import FileReaderInput, { Result } from 'react-file-reader-input'

import ModalLoading from './ModalLoading'
import Modal from './Modal'
import InputButton from './InputButton'
import InputUrl from './InputUrl'

import {getToken} from '../libs/auth'
import style from '../libs/style'
import publicStyles from '../config/styles.json'
import {getLabelName} from "../libs/lang";


type PublicStyleProps = {
  url: string
  thumbnailUrl: string
  title: string
  onSelect(...args: unknown[]): unknown
};

class PublicStyle extends React.Component<PublicStyleProps> {
  render() {
    return <div className="maputnik-public-style">
      <InputButton
        className="maputnik-public-style-button"
        aria-label={this.props.title}
        onClick={() => this.props.onSelect(this.props.url)}
      >
        <div className="maputnik-public-style-header">
          <div>{this.props.title}</div>
          <span className="maputnik-space"/>
          <MdAddCircleOutline/>
        </div>
        <div
          className="maputnik-public-style-thumbnail"
          style={{
            backgroundImage: `url(${this.props.thumbnailUrl})`
          }}
        ></div>
      </InputButton>
    </div>
  }
}

type ModalOpenProps = {
  isOpen: boolean
  onOpenToggle(...args: unknown[]): unknown
  onStyleOpen(...args: unknown[]): unknown
};

type ModalOpenState = {
  styleUrl: string
  error?: string | null
  activeRequest?: any
  activeRequestUrl?: string | null
};

export default class ModalOpen extends React.Component<ModalOpenProps, ModalOpenState> {
  constructor(props: ModalOpenProps) {
    super(props);
    this.state = {
      styleUrl: "", isOpen: false
    };
  }

  clearError() {
    this.setState({
      error: null
    })
  }

  onCancelActiveRequest(e: Event) {
    // Else the click propagates to the underlying modal
    if (e) e.stopPropagation();

    if (this.state.activeRequest) {
      this.state.activeRequest.abort();
      this.setState({
        activeRequest: null, activeRequestUrl: null
      });
    }
  }

  onStyleSelect = (styleUrl: string) => {
    this.clearError();
    let canceled;
    const activeRequest = fetch(styleUrl, {
      mode: 'cors', credentials: "same-origin", method: "GET", headers: {
        'Content-Type': 'application/json', 'Authorization': getToken(),
      }, cache: "no-cache"
    })
      .then(function (response) {
        return response.json();
      })
      .then((body) => {
        if (canceled) {
          return;
        }
        this.setState({
          activeRequest: null, activeRequestUrl: null
        });
        /**
         * 打开指定的style后 在浏览器url中设置styleId为对应样式的styleId
         */
        const mapStyle = style.ensureStyleValidity(style.transMapAbcSpriteAndFontUrl(body.data))
        const url = new URL(location.href);
        url.searchParams.set("styleId", mapStyle.metadata.mspInfo.id||mapStyle.metadata.mspInfo.styleId);
        history.replaceState({}, "Maputnik", url.href);
        console.log('Loaded style ', mapStyle.id)
        console.log('Loaded style ', mapStyle)
        this.props.onStyleOpen(mapStyle)
        this.onOpenToggle()
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

  onStyleSelect_MapBox = (styleUrl) => {
    this.clearError();

    let canceled: boolean = false;

    const activeRequest =
        fetch(styleUrl, {
            mode: 'cors',
            credentials: "same-origin"
    })
      .then(function (response) {
        return response.json();
      })
      .then((body) => {
        if (canceled) {
          return;
        }

        this.setState({
          activeRequest: null,
          activeRequestUrl: null
        });

        const mapStyle = style.ensureStyleValidity(body)
        console.log('Loaded style ', mapStyle.id)
        this.props.onStyleOpen(mapStyle)
        this.onOpenToggle()
      })
      .catch((err) => {
        this.setState({
          error: `Failed to load: '${styleUrl}'`,
          activeRequest: null,
          activeRequestUrl: null
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

  onSubmitUrl = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.onStyleSelect(this.state.styleUrl);
  }

  onUpload = (_: any, files: Result[]) => {
    const [, file] = files[0];
    const reader = new FileReader();

    this.clearError();

    reader.readAsText(file, "UTF-8");
    reader.onload = e => {
      let mapStyle;
      try {
        mapStyle = JSON.parse(e.target.result)
      } catch (err) {
        this.setState({
          error: (err as Error).toString()
        });
        return;
      }
      mapStyle = style.ensureStyleValidity(mapStyle)
      this.props.onStyleOpen(mapStyle);
      this.onOpenToggle();
    }
    reader.onerror = e => console.log(e.target);
  }

  onOpenToggle() {
    this.setState({
      styleUrl: ""
    });
    this.clearError();
    this.props.onOpenToggle();
  }

  onChangeUrl = (url: string) => {
    this.setState({
      styleUrl: url,
    });
  }

  /**
   * 获取样式编辑器有权限读取的样式
   */
  getPublicStyles = () => {
    let url = api_config.url + "/open/editor/mapStyleList?page=0&size=100";
    fetch(url, {
      method: "GET", mode: "cors", headers: {
        'Content-Type': 'application/json', 'Authorization': getToken(),
      }, cache: "no-cache"
    }).then((response) => {
      return response.json();
    }).then((json) => {
      console.log('mapStyleList json data -> ', json)
      let isOpen = this.props.isOpen
      this.setState({
        publicStyles: json.data,
        isStyleLoaded: true
      });
    });
  }


  render() {
    if (this.props.isOpen
      && !this.state.isStyleLoaded
    ) {
      this.getPublicStyles();
    }

    if (!this.state.publicStyles) {
      return <div/>
    }

    const styleOptions_MapBox = publicStyles.map(style => {
      return <PublicStyle
        key={style.id}
        url={style.url}
        title={style.title}
        thumbnailUrl={style.thumbnail}
        onSelect={this.onStyleSelect_MapBox}
      />
    })
    const styleOptions = this.state.publicStyles.map(style => {
      let styleThumbnailUrl = style.styleThumbnailUrl.replace(/[\r\n]/g, "");
      let thumbnailUrl = styleThumbnailUrl.startsWith("http")?styleThumbnailUrl:(api_config.url + '/erupt-attachment' + styleThumbnailUrl)
      return <PublicStyle
        key={style.styleId}
        name={style.styleRemark}
        url={api_config.url + "/open/editor/mapStyleById/" + style.styleId}
        title={style.styleName}
        thumbnailUrl_bak={style.styleTemplateImgBase64}
        thumbnailUrl={thumbnailUrl}
        onSelect={this.onStyleSelect}
      />
    });

    // console.log(getToken())
    let errorElement;
    if (this.state.error) {
      errorElement = (<div className="maputnik-modal-error">
        {this.state.error}
        <a href="#" onClick={() => this.clearError()} className="maputnik-modal-error-close">×</a>
      </div>);
    }


    return  (
      <div>
        <Modal
          data-wd-key="modal:open"
          isOpen={this.props.isOpen}
          onOpenToggle={() => this.onOpenToggle()}
          title={'Open Style'}
        >
          {errorElement}
          <section className="maputnik-modal-section">
            <h1>Upload Style</h1>
            <p>Upload a JSON style from your computer.</p>
            <FileReaderInput onChange={this.onUpload} tabIndex={-1} aria-label="Style file">
              <InputButton className="maputnik-upload-button"><MdFileUpload /> Upload</InputButton>
            </FileReaderInput>
          </section>
        <section className="maputnik-modal-section maputnik-modal-section--shrink">
          <h1>我的所有可用样式</h1>
          <p>
            打开一个样式来设计
          </p>
          <div className="maputnik-style-gallery-container">
            {/*{styleOptions_MapBox}*/}

            {styleOptions}
          </div>
        </section>

        <section className="maputnik-modal-section">
          <h1>上传样式</h1>
          <p>从本地上传一个json格式的样式文件.</p>
          <FileReaderInput onChange={this.onUpload} tabIndex="-1" aria-label="Style file">
            <InputButton className="maputnik-upload-button"><MdFileUpload/> 上传</InputButton>
          </FileReaderInput>
        </section>

        <section className="maputnik-modal-section">
          <form onSubmit={this.onSubmitUrl}>
            <h1>网络资源</h1>
            <p>
              从一个URL加载网络样式资源，资源需要支持<a href="https://enable-cors.org" target="_blank"
                                                       rel="noopener noreferrer">CORS</a>请求。
            </p>
            <InputUrl
              aria-label="样式 URL"
              data-wd-key="modal:open.url.input"
              type="text"
              className="maputnik-input"
              default="输入资源 URL..."
              value={this.state.styleUrl}
              onInput={this.onChangeUrl}
              onChange={this.onChangeUrl}
            />
            <div>
              <InputButton
                data-wd-key="modal:open.url.button"
                type="submit"
                className="maputnik-big-button"
                disabled={this.state.styleUrl.length < 1}
              >加载资源</InputButton>
            </div>
          </form>
        </section>

      </Modal>

      <ModalLoading
        isOpen={!!this.state.activeRequest}
        title={getLabelName("Loading")}
        onCancel={(e) => this.onCancelActiveRequest(e)}
        message={getLabelName("Loading") + " : " + this.state.activeRequestUrl}
      />
    </div>)
  }
}

