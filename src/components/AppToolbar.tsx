import React from 'react'
import classnames from 'classnames'
import {detect} from 'detect-browser';

import {
  MdOpenInBrowser,
  MdSettings,
  MdLayers,
  MdHelpOutline,
  MdFindInPage,
  MdLanguage,
  MdSave
} from 'react-icons/md'
import pkgJson from '../../package.json'
import {getLabelName} from '../libs/lang'

//@ts-ignore
import maputnikLogo from 'maputnik-design/logos/logo-color.svg?inline'
import { withTranslation, WithTranslation } from 'react-i18next';
import { supportedLanguages } from '../i18n';

// This is required because of <https://stackoverflow.com/a/49846426>, there isn't another way to detect support that I'm aware of.
const browser = detect();
const colorAccessibilityFiltersEnabled = ['chrome', 'firefox'].indexOf(browser!.name) > -1;


type IconTextProps = {
  children?: React.ReactNode
};


class IconText extends React.Component<IconTextProps> {
  render() {
    return <span className="maputnik-icon-text">{this.props.children}</span>
  }
}

type ToolbarLinkProps = {
  className?: string
  children?: React.ReactNode
  href?: string
  onToggleModal?(...args: unknown[]): unknown
};

class ToolbarLink extends React.Component<ToolbarLinkProps> {
  render() {
    return <a
      className={classnames('maputnik-toolbar-link', this.props.className)}
      href={this.props.href}
      rel="noopener noreferrer"
      target="_blank"
      data-wd-key="toolbar:link"
    >
      {this.props.children}
    </a>
  }
}

type ToolbarSelectProps = {
  children?: React.ReactNode
  wdKey?: string
};

class ToolbarSelect extends React.Component<ToolbarSelectProps> {
  render() {
    return <div
      className='maputnik-toolbar-select'
      data-wd-key={this.props.wdKey}
    >
      {this.props.children}
    </div>
  }
}

class ToolbarAction extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    wdKey: PropTypes.string,
    show: PropTypes.bool
  }
type ToolbarActionProps = {
  children?: React.ReactNode
  onClick?(...args: unknown[]): unknown
  wdKey?: string
};

class ToolbarAction extends React.Component<ToolbarActionProps> {
  render() {
    if(this.props.show === false){
      return null
    }
    return <button
      className='maputnik-toolbar-action'
      data-wd-key={this.props.wdKey}
      onClick={this.props.onClick}
    >
      {this.props.children}
    </button>
  }
}

export type MapState = "map" | "inspect" | "filter-achromatopsia" | "filter-deuteranopia" | "filter-protanopia" | "filter-tritanopia";

type AppToolbarInternalProps = {
  mapStyle: object
  inspectModeEnabled: boolean
  onStyleChanged(...args: unknown[]): unknown
  // A new style has been uploaded
  onStyleOpen(...args: unknown[]): unknown
  // A dict of source id's and the available source layers
  sources: object
  children?: React.ReactNode
  onToggleModal(...args: unknown[]): unknown
  onSetMapState(mapState: MapState): unknown
  mapState?: MapState
  renderer?: string
} & WithTranslation;

class AppToolbarInternal extends React.Component<AppToolbarInternalProps> {
  state = {
    isOpen: {
      settings: false,
      sources: false,
      open: false,
      add: false,
      export: false,
    }
  }

  handleSelection(val: MapState) {
    this.props.onSetMapState(val);
  }

  handleLanguageChange(val: string) {
    this.props.i18n.changeLanguage(val);
  }

  onSkip = (target: string) => {
    if (target === "map") {
      (document.querySelector(".maplibregl-canvas") as HTMLCanvasElement).focus();
    }
    else {
      const el = document.querySelector("#skip-target-"+target) as HTMLButtonElement;
      el.focus();
    }
  }

  render() {
    const t = this.props.t;
    const views = [
      {
        id: "map",
        group: "general",
        title: t("Map"),
      },
      {
        id: "inspect",
        group: "general",
        title: t("Inspect"),
        disabled: this.props.renderer === 'ol',
      },
      {
        id: "filter-deuteranopia",
        group: "color-accessibility",
        title: t("Deuteranopia filter"),
        disabled: !colorAccessibilityFiltersEnabled,
      },
      {
        id: "filter-protanopia",
        group: "color-accessibility",
        title: t("Protanopia filter"),
        disabled: !colorAccessibilityFiltersEnabled,
      },
      {
        id: "filter-tritanopia",
        group: "color-accessibility",
        title: t("Tritanopia filter"),
        disabled: !colorAccessibilityFiltersEnabled,
      },
      {
        id: "filter-achromatopsia",
        group: "color-accessibility",
        title: t("Achromatopsia filter"),
        disabled: !colorAccessibilityFiltersEnabled,
      },
    ];

    const currentView = views.find((view) => {
      return view.id === this.props.mapState;
    });

    return <nav
      className='maputnik-toolbar'
      style={{display:runConfig.mainLayout.toolBar.show ? "block" : "none"}}
    >
      <div className="maputnik-toolbar__inner">
        <div
          className="maputnik-toolbar-logo-container"
        >
          {/* Keyboard accessible quick links */}
          <button
            data-wd-key="root:skip:layer-list"
            className="maputnik-toolbar-skip"
            onClick={_e => this.onSkip("layer-list")}
          >
            {t("Layers list")}
          </button>
          <button
            data-wd-key="root:skip:layer-editor"
            className="maputnik-toolbar-skip"
            onClick={_e => this.onSkip("layer-editor")}
          >
            {t("Layer editor")}
          </button>
          <button
            data-wd-key="root:skip:map-view"
            className="maputnik-toolbar-skip"
            onClick={_e => this.onSkip("map")}
          >
            {t("Map view")}
          </button>
          <a
            className="maputnik-toolbar-logo"
            target="blank"
            rel="noreferrer noopener"
            href="https://www.mapabc.com"
            style={{display: runConfig.mainLayout.toolBar.toolBarLogo === false? "none" : "block"}}
          >
            <img src={maputnikLogo} alt={t("Maputnik on GitHub")} />
            <h1>
              <span className="maputnik-toolbar-name">{ runConfig.mainLayout.toolBar.toolBarTitle ? runConfig.mainLayout.toolBar.toolBarTitle : pkgJson.name}</span>
              <span className="maputnik-toolbar-version">{ runConfig.mainLayout.toolBar.toolBarVersion ? runConfig.mainLayout.toolBar.toolBarVersion : pkgJson.version}</span>
            </h1>
          </a>
        </div>
        <div
          className="maputnik-toolbar__actions"
          role="navigation"
          aria-label="Toolbar"
        >
          <ToolbarAction
            show={runConfig.mainLayout.toolBar.toolBarOpen}
            wdKey="nav:open"
            onClick={this.props.onToggleModal.bind(this, 'open')}
          >
            <MdOpenInBrowser />
            <IconText>{getLabelName("Open")}</IconText>
          </ToolbarAction>
          <ToolbarAction
            show={runConfig.mainLayout.toolBar.toolBarExport}
            wdKey="nav:export"
            onClick={this.props.onToggleModal.bind(this, 'export')}>
            <MdFileDownload />
            <IconText>{getLabelName("Export")}</IconText>

          </ToolbarAction>
          <ToolbarAction
            show={runConfig.mainLayout.toolBar.toolDataSource}
            wdKey="nav:sources"
            onClick={this.props.onToggleModal.bind(this, 'sources')}>
            <MdLayers />
            <IconText>{getLabelName("Data Sources")}</IconText>
          </ToolbarAction>
          <ToolbarAction
            show={runConfig.mainLayout.toolBar.toolDataStyleSetting}
            wdKey="nav:settings"
            onClick={this.props.onToggleModal.bind(this, 'settings')}>
            <MdSettings />
            <IconText>{getLabelName("Style Setting")}</IconText>
          </ToolbarAction>
          {/*
          <ToolbarSelect wdKey="nav:inspect">
            <MdFindInPage />
            <label>查看模式
            <IconText>{t("View")}
              <select
                className="maputnik-select"
                data-wd-key="maputnik-select"
                onChange={(e) => this.handleSelection(e.target.value as MapState)}
                value={currentView?.id}
              >
                {views.filter(v => v.group === "general").map((item) => {
                  return (
                    <option key={item.id} value={item.id} disabled={item.disabled} data-wd-key={item.id}>
                      {item.title}
                    </option>
                  );
                })}
                <optgroup label={t("Color accessibility")}>
                  {views.filter(v => v.group === "color-accessibility").map((item) => {
                    return (
                      <option key={item.id} value={item.id} disabled={item.disabled}>
                        {item.title}
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </IconText>
          </ToolbarSelect>

          <ToolbarLink href={"https://www.mapabc.com/mapabc-gl-js/editor/wiki"}>
            <MdHelpOutline />
            <IconText>使用帮助</IconText>
          </ToolbarLink>
          <ToolbarLinkHighlighted href={"https://gregorywolanski.typeform.com/to/cPgaSY"}>
            <MdAssignmentTurnedIn />
            <IconText>Take the Maputnik Survey</IconText>
          </ToolbarLinkHighlighted>*/}
          <ToolbarSelect wdKey="nav:language">
            <MdLanguage />
            <IconText>Language
              <select
                className="maputnik-select"
                data-wd-key="maputnik-lang-select"
                onChange={(e) => this.handleLanguageChange(e.target.value)}
                value={this.props.i18n.language}
              >
                {Object.entries(supportedLanguages).map(([code, name]) => {
                  return (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </IconText>
          </ToolbarSelect>

          <ToolbarLink href={"https://github.com/maplibre/maputnik/wiki"}>
            <MdHelpOutline />
            <IconText>{t("Help")}</IconText>
          </ToolbarLink>

        </div>
      </div>
    </nav>
  }
}

const AppToolbar = withTranslation()(AppToolbarInternal);
export default AppToolbar;
