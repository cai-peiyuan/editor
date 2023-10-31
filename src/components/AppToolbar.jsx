import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {detect} from 'detect-browser';

import {MdFileDownload, MdOpenInBrowser, MdSettings, MdLayers, MdHelpOutline, MdFindInPage, MdAssignmentTurnedIn} from 'react-icons/md'


import logoImage from 'maputnik-design/logos/logo-color.svg'
import pkgJson from '../../package.json'
import {getLabelName} from '../libs/lang'


// This is required because of <https://stackoverflow.com/a/49846426>, there isn't another way to detect support that I'm aware of.
const browser = detect();
const colorAccessibilityFiltersEnabled = ['chrome', 'firefox'].indexOf(browser.name) > -1;


class IconText extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  render() {
    return <span className="maputnik-icon-text">{this.props.children}</span>
  }
}

class ToolbarLink extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    href: PropTypes.string,
    onToggleModal: PropTypes.func,
  }

  render() {
    return <a
      className={classnames('maputnik-toolbar-link', this.props.className)}
      href={this.props.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {this.props.children}
    </a>
  }
}

class ToolbarLinkHighlighted extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    href: PropTypes.string,
    onToggleModal: PropTypes.func
  }

  render() {
    return <a
      className={classnames('maputnik-toolbar-link', "maputnik-toolbar-link--highlighted", this.props.className)}
      href={this.props.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="maputnik-toolbar-link-wrapper">
        {this.props.children}
      </span>
    </a>
  }
}

class ToolbarSelect extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    wdKey: PropTypes.string
  }

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

export default class AppToolbar extends React.Component {
  static propTypes = {
    mapStyle: PropTypes.object.isRequired,
    inspectModeEnabled: PropTypes.bool.isRequired,
    onStyleChanged: PropTypes.func.isRequired,
    // A new style has been uploaded
    onStyleOpen: PropTypes.func.isRequired,
    // A dict of source id's and the available source layers
    sources: PropTypes.object.isRequired,
    children: PropTypes.node,
    onToggleModal: PropTypes.func,
    onSetMapState: PropTypes.func,
    mapState: PropTypes.string,
    renderer: PropTypes.string,
  }

  state = {
    isOpen: {
      settings: false,
      sources: false,
      open: false,
      add: false,
      export: false,
    }
  }

  handleSelection(val) {
    this.props.onSetMapState(val);
  }

  onSkip = (target) => {
    if (target === "map") {
      document.querySelector(".maplibregl-canvas").focus();
    }
    else {
      const el = document.querySelector("#skip-target-"+target);
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
            onClick={e => this.onSkip("layer-list")}
          >
            Layers list
          </button>
          <button
            data-wd-key="root:skip:layer-editor"
            className="maputnik-toolbar-skip"
            onClick={e => this.onSkip("layer-editor")}
          >
            Layer editor
          </button>
          <button
            data-wd-key="root:skip:map-view"
            className="maputnik-toolbar-skip"
            onClick={e => this.onSkip("map")}
          >
            Map view
          </button>
          <a
            className="maputnik-toolbar-logo"
            target="blank"
            rel="noreferrer noopener"
            href="https://www.mapabc.com"
            style={{display: runConfig.mainLayout.toolBar.toolBarLogo === false? "none" : "block"}}
          >
            <span dangerouslySetInnerHTML={{__html: logoImage}} />
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
              <select
                className="maputnik-select"
                onChange={(e) => this.handleSelection(e.target.value)}
                value={currentView.id}
              >
                {views.filter(v => v.group === "general").map((item) => {
                  return (
                    <option key={item.id} value={item.id} disabled={item.disabled}>
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
