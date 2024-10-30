import React, {type JSX} from 'react'
import classnames from 'classnames'
import lodash from 'lodash';

import LayerListGroupListTitle from './LayerListGroupListTitle'
import LayerListGroupListItem from './LayerListGroupListItem'

import {getLabelName} from "../../libs/lang";
import {SortEndHandler, SortableContainer} from 'react-sortable-hoc';
import type {LayerSpecification} from 'maplibre-gl';
import generateUniqueId from '../../libs/document-uid';
import { findClosestCommonPrefix, layerPrefix } from '../../libs/layer';
import { getGroupVisibilityButtonStatus } from "../../libs/config"
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
  toggleLayerGroupCollapsed(groupId: string, idx: number) {
    const lookupKey = [groupId, idx].join('-')
    //console.log("折叠分组", lookupKey)
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

  /**
   * 判断一个图层分组下的图层是否在样式中存在
   * @param childLayerGroupId
   */
  styleHashGroupLayer(childLayerGroupId: string){
    let groupLayers = groupedLayerMap.groupToLayer[childLayerGroupId];
    if(!groupLayers){
      return false;
    }
    let layerIdsArry = groupLayers.map(layer => layer.layerId)
    let groupStyleLayers = this.props.layers.filter(layer=>layerIdsArry.includes(layer.id))
    return groupStyleLayers.length>0
  }

  shouldComponentUpdate (nextProps: LayerListContainerProps, nextState: LayerListContainerState) {
    // Always update on state change
    if (this.state !== nextState) {
      return true;
    }

    // This component tree only requires id and visibility from the layers
    // objects
    function getRequiredProps(layer: LayerSpecification) {
      const out: {id: string, layout?: { visibility: any}} = {
        id: layer.id,
      };

      if (layer.layout) {
        out.layout = {
          visibility: layer.layout.visibility
        };
      }
      return out;
    }
    const layersEqual = lodash.isEqual(
        nextProps.layers.map(getRequiredProps),
        this.props.layers.map(getRequiredProps),
    );

    console.log('nextProps.layers -> ', nextProps.layers)

    console.log('this.props.layers -> ', this.props.layers)

    function withoutLayers(props: LayerListContainerProps) {
      const out = {
        ...props
      } as LayerListContainerProps & { layers?: any };
      delete out['layers'];
      return out;
    }

    // Compare the props without layers because we've already compared them
    // efficiently above.
    const propsEqual = lodash.isEqual(
        withoutLayers(this.props),
        withoutLayers(nextProps)
    );

    console.log('nextProps -> ', nextProps)

    console.log('this.props -> ', this.props)

    const propsChanged = !(layersEqual && propsEqual);
    console.log('LayerListGroupList shouldComponentUpdate layersEqual -> ', layersEqual)
    console.log('LayerListGroupList shouldComponentUpdate propsEqual -> ', propsEqual)
    return !layersEqual || !propsEqual;
  }

  componentDidUpdate (prevProps: LayerListContainerProps) {
    if (prevProps.selectedLayerGroupId !== this.props.selectedLayerGroupId) {
      const selectedItemNode = this.selectedItemRef.current;
      if (selectedItemNode && selectedItemNode.node) {
        const target = selectedItemNode.node;
        const options = {
          root: this.scrollContainerRef.current,
          threshold: 1.0
        }
        const observer = new IntersectionObserver(entries => {
          observer.unobserve(target);
          if (entries.length > 0 && entries[0].intersectionRatio < 1) {
            target.scrollIntoView();
          }
        }, options);

        observer.observe(target);
      }
    }
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
          aria-controls={groupId}
          key={`group-${groupId}-${idx}`}
          title={layerGroup.data.name}
          isActive={!this.isCollapsed(groupId, idx) || groupId === this.props.selectedLayerGroupId}
          onActiveToggle={this.toggleLayerGroupCollapsed.bind(this, groupId, idx)}
        />
        listItems.push(grp)

      if(layerGroup.children){
        layerGroup.children.forEach((childLayerGroup, idxInGroup) => {
          const childLayerGroupId = childLayerGroup.id;
            //没有对应图层的分组不显示
          if(this.styleHashGroupLayer(childLayerGroupId)){

            const additionalProps: {ref?: React.RefObject<any>} = {};
            if (childLayerGroup.id === this.props.selectedLayerGroupId) {
              additionalProps.ref = this.selectedItemRef;
            }
            const listItem = <LayerListGroupListItem
                 index={idxInGroup}
                  className={classnames({
                    'maputnik-layer-list-group-item-collapsed': this.isCollapsed(groupId, idx) //判断是否隐藏折叠起来
                  })}
                  key={childLayerGroupId}
                  id={childLayerGroupId}
                  layerGroupId={childLayerGroupId}
                  layerGroupName={childLayerGroup.data.name}
                  layerType={childLayerGroup.data.layerGroupType}
                  visibility={getGroupVisibilityButtonStatus(childLayerGroupId, this.props.layers)}  //控制隐藏显示按钮的状态 通过方法计算分组下所有的图层显示与隐藏
                  isSelected={childLayerGroupId === this.props.selectedLayerGroupId}
                  onLayerGroupSelect={this.props.onLayerGroupSelect}
                  onLayerGroupVisibilityToggle={this.props.onLayerGroupVisibilityToggle}
                  {...additionalProps}
            />
              listItems.push(listItem)
          }
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
