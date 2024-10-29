import React, {type JSX} from 'react'
import PropTypes from 'prop-types'
import { Wrapper, Button, Menu, MenuItem } from 'react-aria-menubutton'
import {BackgroundLayerSpecification, LayerSpecification, SourceSpecification} from 'maplibre-gl';

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

import layoutMini from '../config/layout-mini.json' //编辑器的界面配置项，定义了哪些属性在那个分类下配置
import {getLabelName} from '../libs/lang'
import { getGroupVisibilityButtonStatus } from "../libs/config"

/**
 * 通过json配置文件获取指定类型的图层编辑器界面
 * @param type
 */
function getLayoutForType(type: LayerSpecification["type"]) {
  return layoutMini[type] ? layoutMini[type] : layoutMini.invalid;
}

function layoutGroups(layerType: LayerSpecification["type"]): {title: string, type: string, fields?: string[]}[] {
  return []
    .concat(getLayoutForType(layerType).groups)
    .concat([])
}

type LayerEditorProps = {
  layer: LayerSpecification //分组中得第一个图层
  layers: LayerSpecification[] //样式中的所有图层
  selectedGroupLayers: LayerSpecification[] //分组中的所有图层  样式图层
  selectedLayerGroupId: string //分组id
  sources: {[key: string]: SourceSpecification} //数据源列表
  vectorLayers: {[key: string]: any} //矢量图层
  spec: object //样式规范
  onLayerGroupChanged(...args: unknown[]): unknown //样式发生变化
  onLayerGroupVisibilityToggle(...args: unknown[]): unknown //显示隐藏状态发生变化
  errors?: any[]
};

type LayerEditorState = {
  editorGroups: {[keys:string]: boolean}
};

/** Layer editor supporting multiple types of layers. */
export default class LayerEditor extends React.Component<LayerEditorProps, LayerEditorState> {
  static defaultProps = {
    onLayerGroupChanged: () => {},
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
    this.props.onLayerGroupChanged(
      this.props.selectedLayerGroupId,
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
    const thisGroupVisibility = getGroupVisibilityButtonStatus(this.props.selectedLayerGroupId, this.props.layers)
    const items: {[key: string]: {text: string, handler: () => void, disabled?: boolean}} = {
      hide: {
        text: (thisGroupVisibility === "none") ?  getLabelName("Show"): getLabelName("Hide"),
        handler: () => this.props.onLayerGroupVisibilityToggle(this.props.selectedLayerGroupId)
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
            {/*显示图层分组名称*/}
            { getLabelName("Layer Group") } : { groupedLayerMap.groupLayer[this.props.selectedLayerGroupId].name } {'('+ this.props.selectedGroupLayers.length + ')'}
          </h2>
          {/*更多按钮*/}
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
