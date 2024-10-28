import React, {type JSX} from 'react'
import classnames from 'classnames'
import lodash from 'lodash';

import LayerListGroupListTitle from './LayerListGroupListTitle'
import LayerListGroupListItem from './LayerListGroupListItem'

import {getLabelName} from "../libs/lang";
import {SortEndHandler, SortableContainer} from 'react-sortable-hoc';
import type {LayerSpecification} from 'maplibre-gl';
import generateUniqueId from '../libs/document-uid';
import { findClosestCommonPrefix, layerPrefix } from '../libs/layer';

/*图层分组*/
type LayerListContainerProps = {
  layers: LayerSpecification[]
  selectedLayerGroupId: string
  onLayersGroupChange(layers: LayerSpecification[]): unknown
  onLayerGroupSelect(...args: unknown[]): unknown
  onLayerGroupVisibilityToggle(...args: unknown[]): unknown
  sources: object
  errors: any[]
};

type LayerListContainerState = {
  collapsedGroups: {[ket: string]: boolean}
  areAllGroupsExpanded: boolean
  keys: {[key: string]: number}
  isOpen: {[key: string]: boolean}
};

// List of collapsible layer editors
class LayerListContainer extends React.Component<LayerListContainerProps, LayerListContainerState> {
  static defaultProps = {
    onLayerGroupSelect: () => {},
  }
  selectedItemRef: React.RefObject<any>;
  scrollContainerRef: React.RefObject<HTMLElement>;

  constructor(props: LayerListContainerProps) {
    super(props);
    this.selectedItemRef = React.createRef();
    this.scrollContainerRef = React.createRef();
    this.state = {
      collapsedGroups: {},
      areAllGroupsExpanded: false,
      keys: {
        add: +generateUniqueId(),
      },
      isOpen: {
        add: false,
      }
    }
  }

  /**
   * 打开或者关闭某个分类下的子分类
   * @param groupId
   * @param idx
   */
  toggleLayerGroup(groupId: string, idx: number) {
    const lookupKey = [groupId, idx].join('-')
    console.log("折叠分组", lookupKey)
    const newGroups = { ...this.state.collapsedGroups }
    if(lookupKey in this.state.collapsedGroups) {
      newGroups[lookupKey] = !this.state.collapsedGroups[lookupKey]
    } else {
      newGroups[lookupKey] = false
    }
    this.setState({
      collapsedGroups: newGroups
    })
  }

  /**
   * 判断一个分组是否为打开状态
   * @param groupId
   * @param idx
   */
  isCollapsed(groupId: string, idx: number) {
    const collapsed = this.state.collapsedGroups[[groupId, idx].join('-')]
    return collapsed === undefined ? true : collapsed
  }


  render() {

    const listItems: JSX.Element[] = []
    let idx = 0
    const layersByGroup = layerGroupTree;
    layersByGroup.forEach( (layerGroup) => {
      const groupId = layerGroup.id

      /*前缀相同的图层分组显示*/
        const grp = <LayerListGroupListTitle
          data-wd-key={[groupId, idx].join('-')}
          aria-controls={layerGroup.id}
          key={`group-${groupId}-${idx}`}
          title={layerGroup.data.name}
          isActive={!this.isCollapsed(groupId, idx) || groupId === this.props.selectedLayerGroupId}
          onActiveToggle={this.toggleLayerGroup.bind(this, groupId, idx)}
        />
        listItems.push(grp)

      if(layerGroup.children){
        layerGroup.children.forEach((childLayerGroup, idxInGroup) => {

          const listItem = <LayerListGroupListItem
              className={classnames({
                'maputnik-layer-list-group-item-collapsed': this.isCollapsed(groupId, idx) //判断是否隐藏折叠起来
              })}
              index={idxInGroup}
              key={childLayerGroup.id}
              id={childLayerGroup.id}
              layerId={childLayerGroup.data.name}
              layerIndex={idxInGroup}
              layerType={childLayerGroup.data.layerGroupType}
              visibility={true}
              isSelected={childLayerGroup.id === this.props.selectedLayerGroupId}
              onLayerGroupSelect={this.props.onLayerGroupSelect}
              onLayerGroupVisibilityToggle={this.props.onLayerGroupVisibilityToggle.bind(this)}
          />
          listItems.push(listItem)
          //idxInGroup += 1
        })
      }
      idx += 1
    })

    return <section
      className="maputnik-layer-list"
      role="complementary"
      aria-label="Layers list"
      ref={this.scrollContainerRef}
    >

      <header className="maputnik-layer-list-header">
        {/*组件标题*/}
        <span className="maputnik-layer-list-header-title">{ getLabelName("Layers Group") } </span>
        <span className="maputnik-space" />
      </header>
      <div
        role="navigation"
        aria-label="Layers list"
      >
        <ul className="maputnik-layer-list-container">
          {listItems}
        </ul>
      </div>
    </section>
  }
}

// eslint-disable-next-line react-refresh/only-export-components
const LayerListContainerSortable = SortableContainer((props: LayerListContainerProps) => <LayerListContainer {...props} />)


export default class LayerListGroupList extends React.Component<LayerListContainerProps> {
  render() {
    return <LayerListContainerSortable
      {...this.props}
      helperClass='sortableHelper'
      useDragHandle={false}
      shouldCancelStart={() => true}
    />
  }
}
