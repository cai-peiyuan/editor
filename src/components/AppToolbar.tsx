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

type AppToolbarProps = {
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
};

export default class AppToolbar extends React.Component<AppToolbarProps> {
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
    const views = [
      {
        id: "map",
        group: "general",
        title: "Map",
      },
      {
        id: "inspect",
        group: "general",
        title: "Inspect",
        disabled: this.props.renderer === 'ol',
      },
      {
        id: "filter-deuteranopia",
        group: "color-accessibility",
        title: "Deuteranopia filter",
        disabled: !colorAccessibilityFiltersEnabled,
      },
      {
        id: "filter-protanopia",
        group: "color-accessibility",
        title: "Protanopia filter",
        disabled: !colorAccessibilityFiltersEnabled,
      },
      {
        id: "filter-tritanopia",
        group: "color-accessibility",
        title: "Tritanopia filter",
        disabled: !colorAccessibilityFiltersEnabled,
      },
      {
        id: "filter-achromatopsia",
        group: "color-accessibility",
        title: "Achromatopsia filter",
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
            Layers list
          </button>
          <button
            data-wd-key="root:skip:layer-editor"
            className="maputnik-toolbar-skip"
            onClick={_e => this.onSkip("layer-editor")}
          >
            Layer editor
          </button>
          <button
            data-wd-key="root:skip:map-view"
            className="maputnik-toolbar-skip"
            onClick={_e => this.onSkip("map")}
          >
            Map view
          </button>
          
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
            <MdSave />
            {/*<IconText>{getLabelName("Export")}</IconText>*/}
            <IconText>{'修改'}</IconText>
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
                <optgroup label="Color accessibility">
                  {views.filter(v => v.group === "color-accessibility").map((item) => {
                    return (
                      <option key={item.id} value={item.id} disabled={item.disabled}>
                        {item.title}
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </label>
          </ToolbarSelect>

          <ToolbarLink href={"https://www.mapabc.com/mapabc-gl-js/editor/wiki"}>
            <MdHelpOutline />
            <IconText>使用帮助</IconText>
          </ToolbarLink>
          <ToolbarLinkHighlighted href={"https://gregorywolanski.typeform.com/to/cPgaSY"}>
            <MdAssignmentTurnedIn />
            <IconText>Take the Maputnik Survey</IconText>
          </ToolbarLinkHighlighted>*/}
        </div>
      </div>
    </nav>
  }
}
