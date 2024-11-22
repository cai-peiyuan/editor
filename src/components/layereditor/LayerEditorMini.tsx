import React, {type JSX} from 'react'
import PropTypes from 'prop-types'
import {BackgroundLayerSpecification, LayerSpecification, SourceSpecification} from 'maplibre-gl';

import PropertyGroupMini from './PropertyGroupMini'
import LayerEditorGroup from '../LayerEditorGroup'
import {Accordion} from 'react-accessible-accordion';

import {changeProperty, getStyleLayerChnNameByIdAndLang} from '../../libs/layer'

import layoutMini from '../../config/layout-mini.json' //编辑器的界面配置项，定义了哪些属性在那个分类下配置
import {getLabelName, getLabelNameByLang} from '../../libs/lang'

/**
 * 通过json配置文件获取指定类型的图层编辑器界面
 * @param type
 */
function getLayoutForType(type: LayerSpecification["type"]) {
  return layoutMini[type] ? layoutMini[type] : layoutMini.invalid;
}

function layoutGroups(layerType: LayerSpecification["type"]): {title: string, type: string, fields?: string[]}[] {
  return []
    .concat(getLayoutForType(layerType).groups) //通过配置文件的设置 获取指定类型图层可编辑的样式属性
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
export default class LayerEditorMini extends React.Component<LayerEditorProps, LayerEditorState> {
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
    //配置文件中的各个编辑分组 默认都展开
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
        size: 18,
        color: '#8e8e8e',
      }
    }
  }

  /**
   * 更新样式渲染的属性方法
   * @param group
   * @param property
   * @param newValue
   */
  changeProperty(group: keyof LayerSpecification | null, property: string, newValue: any) {

    console.log("图层属性发生变化 ->", group, property, newValue)
    for (let i=0; i < this.props.selectedGroupLayers.length; i++) {
      this.props.selectedGroupLayers[i] = changeProperty(this.props.selectedGroupLayers[i], group, property, newValue)
    }

    this.props.onLayerGroupChanged(
      this.props.selectedLayerGroupId,
      changeProperty(this.props.layer, group, property, newValue), this.props.selectedGroupLayers, this.props.layers
    )
  }

  /**
   * 切换分组的展开和闭合状态
   * @param groupTitle
   * @param active
   */
  onGroupToggle(groupTitle: string, active: boolean) {
    const changedActiveGroups = {
      ...this.state.editorGroups,
      [groupTitle]: active,
    }
    this.setState({
      editorGroups: changedActiveGroups
    })
  }

  getGroupLayerHeaders(selectedGroupLayers: LayerSpecification[]){
      return selectedGroupLayers.map(layer =>{
         return <header data-wd-key={layer.id}
                        id={layer.id}
                        key={layer.id}>
          <div className="layer-header">
            <h5 className="layer-header__title">
              {/*显示图层分组名称*/}
              { getStyleLayerChnNameByIdAndLang(layer.id) }
            </h5>
          </div>
        </header>
      })

  }
  /**
   * 渲染指定分组的属性编辑
   * @param type
   * @param fields
   */
  renderGroupType(type: string, fields?: string[]): JSX.Element {
    let comment = ""
    if(this.props.layer.metadata) {
      comment = (this.props.layer.metadata as any)['maputnik:comment']
    }
    const {errors} = this.props;

    const errorData: {[key in LayerSpecification as string]: {message: string}} = {};
    errors!.forEach(error => {
      if (
        error.parsed &&
        error.parsed.type === "layer"
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
      return <PropertyGroupMini
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
    //图层类型 决定这个编辑器渲染哪些可编辑的属性
    const layerType = this.props.layer.type

    const groups = layoutGroups(layerType).filter(group => {
      return !(layerType === 'background' && group.type === 'source')
    }).map(group => {
      const groupId = group.title.replace(/ /g, "_"); //使用group title 作为groupId
      groupIds.push(groupId);

      return <LayerEditorGroup
        data-wd-key={group.title}
        id={groupId}
        key={group.title}
        title={getLabelName(group.title)}
        isActive={this.state.editorGroups[group.title]}
        onActiveToggle={this.onGroupToggle.bind(this, group.title)}
      >
        {/*渲染某个图层类型下的编辑属性*/}
        {this.renderGroupType(group.type, group.fields)}
      </LayerEditorGroup>
    })

    return <section className="maputnik-layer-group-editor"
      role="main"
      aria-label="图层编辑"
    >
      {/*标题*/}
      <header>
        <div className="layer-header">
          <h2 className="layer-header__title">
            {/*显示图层分组名称*/}
            { getLabelName("") } { groupedLayerMap.groupLayer[this.props.selectedLayerGroupId].name } {' 关联 '+ this.props.selectedGroupLayers.length + '个可配置图层'}
          </h2>
        </div>
      </header>

     {/* {this.getGroupLayerHeaders(this.props.selectedGroupLayers)}*/}
      {/*风琴组件*/}
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
