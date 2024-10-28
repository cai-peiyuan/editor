import React, {type JSX} from 'react'
import PropTypes from 'prop-types'
import { Wrapper, Button, Menu, MenuItem } from 'react-aria-menubutton'
import {BackgroundLayerSpecification, LayerSpecification, SourceSpecification} from 'maplibre-gl';

import FieldJson from './FieldJson'
import FilterEditor from './FilterEditor'
import PropertyGroup from './PropertyGroup'
import LayerEditorGroup from './LayerEditorGroup'
import FieldType from './FieldType'
import FieldId from './FieldId'
import FieldMinZoom from './FieldMinZoom'
import FieldMaxZoom from './FieldMaxZoom'
import FieldComment from './FieldComment'
import FieldSource from './FieldSource'
import FieldSourceLayer from './FieldSourceLayer'
import {Accordion} from 'react-accessible-accordion';
import {MdMoreVert} from 'react-icons/md'

import {changeType, changeProperty, getStyleLayerChnNameById} from '../libs/layer'
import layout from '../config/layout.json'
import {getLabelName} from '../libs/lang'

function getLayoutForType(type: LayerSpecification["type"]) {
  return layout[type] ? layout[type] : layout.invalid;
}

function layoutGroups(layerType: LayerSpecification["type"]): {title: string, type: string, fields?: string[]}[] {
  const layerGroup = {
    title: getLabelName("Layer Basic"),
    type: 'layer'
  }
  return [layerGroup]
    .concat(getLayoutForType(layerType).groups)
    .concat([])
}

type LayerEditorProps = {
  layer: LayerSpecification
  layers: LayerSpecification[]
  selectedGroupLayers: LayerSpecification[]
  selectedLayerGroupId: string
  sources: {[key: string]: SourceSpecification}
  vectorLayers: {[key: string]: any}
  spec: object
  onLayerChanged(...args: unknown[]): unknown
  onLayerGroupVisibilityToggle(...args: unknown[]): unknown
  layerIndex: number
  errors?: any[]
};

type LayerEditorState = {
  editorGroups: {[keys:string]: boolean}
};

/** Layer editor supporting multiple types of layers. */
export default class LayerEditor extends React.Component<LayerEditorProps, LayerEditorState> {
  static defaultProps = {
    onLayerChanged: () => {},
    onLayerDestroyed: () => {},
  }

  static childContextTypes = {
    reactIconBase: PropTypes.object
  }

  constructor(props: LayerEditorProps) {
    super(props)

    //TODO: Clean this up and refactor into function
    const editorGroups: {[keys:string]: boolean} = {}
    layoutGroups(this.props.layer.type).forEach(group => {
      editorGroups[group.title] = true
    })

    this.state = { editorGroups }
  }

  static getDerivedStateFromProps(props: LayerEditorProps, state: LayerEditorState) {
    const additionalGroups = { ...state.editorGroups }

    getLayoutForType(props.layer.type).groups.forEach(group => {
      if(!(group.title in additionalGroups)) {
        additionalGroups[group.title] = true
      }
    })

    return {
      editorGroups: additionalGroups
    };
  }

  getChildContext () {
    return {
      reactIconBase: {
        size: 14,
        color: '#8e8e8e',
      }
    }
  }

  changeProperty(group: keyof LayerSpecification | null, property: string, newValue: any) {
    this.props.onLayerChanged(
      this.props.layerIndex,
      changeProperty(this.props.layer, group, property, newValue)
    )
  }

  onGroupToggle(groupTitle: string, active: boolean) {
    const changedActiveGroups = {
      ...this.state.editorGroups,
      [groupTitle]: active,
    }
    this.setState({
      editorGroups: changedActiveGroups
    })
  }

  renderGroupType(type: string, fields?: string[]): JSX.Element {
    let comment = ""
    if(this.props.layer.metadata) {
      comment = (this.props.layer.metadata as any)['maputnik:comment']
    }
    const {errors, layerIndex} = this.props;

    const errorData: {[key in LayerSpecification as string]: {message: string}} = {};
    errors!.forEach(error => {
      if (
        error.parsed &&
        error.parsed.type === "layer" &&
        error.parsed.data.index == layerIndex
      ) {
        errorData[error.parsed.data.key] = {
          message: error.parsed.data.message
        };
      }
    })

    let sourceLayerIds;
    const layer = this.props.layer as Exclude<LayerSpecification, BackgroundLayerSpecification>;
    if(Object.prototype.hasOwnProperty.call(this.props.sources, layer.source)) {
      sourceLayerIds = (this.props.sources[layer.source] as any).layers;
    }

    switch(type) {
    case 'layer': return <div>
      <FieldId
        value={this.props.layer.id}
        wdKey="layer-editor.layer-id"
        error={errorData.id}
      />
      <FieldType
        disabled={true}
        error={errorData.type}
        value={this.props.layer.type}
      />
      {this.props.layer.type !== 'background' && <FieldSource
        error={errorData.source}
        sourceIds={Object.keys(this.props.sources!)}
        value={this.props.layer.source}
        onChange={v => this.changeProperty(null, 'source', v)}
      />
      }
      {['background', 'raster', 'hillshade', 'heatmap'].indexOf(this.props.layer.type) < 0 &&
        <FieldSourceLayer
          error={errorData['source-layer']}
          sourceLayerIds={sourceLayerIds}
          value={(this.props.layer as any)['source-layer']}
          onChange={v => this.changeProperty(null, 'source-layer', v)}
        />
      }
      <FieldMinZoom
        error={errorData.minzoom}
        value={this.props.layer.minzoom}
        onChange={v => this.changeProperty(null, 'minzoom', v)}
      />
      <FieldMaxZoom
        error={errorData.maxzoom}
        value={this.props.layer.maxzoom}
        onChange={v => this.changeProperty(null, 'maxzoom', v)}
      />
      <FieldComment
        error={errorData.comment}
        value={comment}
        onChange={v => this.changeProperty('metadata', 'maputnik:comment', v == ""  ? undefined : v)}
      />
    </div>
    case 'properties':
      return <PropertyGroup
        errors={errorData}
        layer={this.props.layer}
        groupFields={fields!}
        spec={this.props.spec}
        onChange={this.changeProperty.bind(this)}
      />
    default: return <></>
    }
  }


  render() {
    const groupIds: string[] = [];
    const layerType = this.props.layer.type
    const groups = layoutGroups(layerType).filter(group => {
      return !(layerType === 'background' && group.type === 'source')
    }).map(group => {
      const groupId = group.title.replace(/ /g, "_");
      groupIds.push(groupId);
      // console.log(group.title)
      if(group.type === 'layer' && (runConfig.mainLayout.layerEditor.layer.show === false ) ){
        return null
      }
      return <LayerEditorGroup
        data-wd-key={group.title}
        id={groupId}
        key={group.title}
        title={getLabelName(group.title)}
        isActive={this.state.editorGroups[group.title]}
        onActiveToggle={this.onGroupToggle.bind(this, group.title)}
      >
        {this.renderGroupType(group.type, group.fields)}
      </LayerEditorGroup>
    })

    const layout = this.props.layer.layout || {}

    const items: {[key: string]: {text: string, handler: () => void, disabled?: boolean}} = {
      hide: {
        text: (layout.visibility === "none") ?  getLabelName("Show"): getLabelName("Hide"),
        handler: () => this.props.onLayerGroupVisibilityToggle(this.props.layerIndex)
      }
    }

    function handleSelection(id: string, event: React.SyntheticEvent) {
      event.stopPropagation();
      items[id].handler();
    }
    const visibilityAction = (this.props.visibility === 'visible' || true) ? 'show' : 'hide';

    return <section className="maputnik-layer-editor"
      role="main"
      aria-label="图层编辑"
    >
      <header>
        <div className="layer-header">
          <h2 className="layer-header__title">
            { getLabelName("Layer") } : { getStyleLayerChnNameById(this.props.layer.id) }
          </h2>
          <div className="layer-header__info">
            <Wrapper
              className='more-menu'
              onSelection={handleSelection}
              closeOnSelection={false}
            >
              <Button id="skip-target-layer-editor" data-wd-key="skip-target-layer-editor" className='more-menu__button' title="Layer options">
                <MdMoreVert className="more-menu__button__svg" />
              </Button>
              <Menu>
                <ul className="more-menu__menu">
                  {Object.keys(items).map((id) => {
                    const item = items[id];
                    if (id === 'hide') {
                      // return null
                    }
                    return <li key={id}>
                      <MenuItem value={id} className='more-menu__menu__item'>
                        {item.text}
                      </MenuItem>
                    </li>
                  })}
                </ul>
              </Menu>
            </Wrapper>
          </div>
        </div>

      </header>
      <Accordion
        allowMultipleExpanded={true}
        allowZeroExpanded={true}
        preExpanded={groupIds}
      >
        {groups}
      </Accordion>
    </section>
  }
}
