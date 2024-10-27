import React, {type JSX} from 'react'
import classnames from 'classnames'
import lodash from 'lodash';

import LayerListGroup from './LayerListGroup'
import LayerListItem from './LayerListItem'

import {getLabelName} from "../libs/lang";
import {SortEndHandler, SortableContainer} from 'react-sortable-hoc';
import type {LayerSpecification} from 'maplibre-gl';
import generateUniqueId from '../libs/document-uid';
import { findClosestCommonPrefix, layerPrefix } from '../libs/layer';

/*图层分组*/
type LayerListContainerProps = {
  layers: LayerSpecification[]
  selectedLayerIndex: number
  onLayersChange(layers: LayerSpecification[]): unknown
  onLayerSelect(...args: unknown[]): unknown
  onLayerDestroy?(...args: unknown[]): unknown
  onLayerCopy(...args: unknown[]): unknown
  onLayerVisibilityToggle(...args: unknown[]): unknown
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
    onLayerSelect: () => {},
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

  toggleModal(modalName: string) {
    this.setState({
      keys: {
        ...this.state.keys,
        [modalName]: +generateUniqueId(),
      },
      isOpen: {
        ...this.state.isOpen,
        [modalName]: !this.state.isOpen[modalName]
      }
    })
  }

  toggleLayers = () => {
    let idx = 0

    const newGroups: {[key:string]: boolean} = {}

    this.groupedLayers().forEach(layers => {
      const groupPrefix = layerPrefix(layers[0].id)
      const lookupKey = [groupPrefix, idx].join('-')


      if (layers.length > 1) {
        newGroups[lookupKey] = this.state.areAllGroupsExpanded
      }

      layers.forEach((_layer) => {
        idx += 1
      })
    });

    this.setState({
      collapsedGroups: newGroups,
      areAllGroupsExpanded: !this.state.areAllGroupsExpanded
    })
  }


  toggleLayerGroup(groupPrefix: string, idx: number) {
    const lookupKey = [groupPrefix, idx].join('-')
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

  isCollapsed(groupPrefix: string, idx: number) {
    const collapsed = this.state.collapsedGroups[[groupPrefix, idx].join('-')]
    return collapsed === undefined ? true : collapsed
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

    const propsChanged = !(layersEqual && propsEqual);
    return propsChanged;
  }

  componentDidUpdate (prevProps: LayerListContainerProps) {
    if (prevProps.selectedLayerIndex !== this.props.selectedLayerIndex) {
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
    layersByGroup.forEach(layerGroup => {
      const groupPrefix = layerGroup.id

      /*前缀相同的图层分组显示*/
        const grp = <LayerListGroup
          data-wd-key={[groupPrefix, idx].join('-')}
          aria-controls={layerGroup.id}
          key={`group-${groupPrefix}-${idx}`}
          title={layerGroup.data.name}
          isActive={!this.isCollapsed(groupPrefix, idx) || idx === this.props.selectedLayerIndex}
          onActiveToggle={this.toggleLayerGroup.bind(this, groupPrefix, idx)}
        />
        listItems.push(grp)

      if(layerGroup.children){
        layerGroup.children.forEach((layer, idxInGroup) => {

          const listItem = <LayerListItem
              className={classnames({
              })}
              index={idx}
              key={layer.id}
              id={layer.id}
              layerId={layer.data.name}
              layerIndex={idx}
              layerType={'line'}
              visibility={true}
              isSelected={idx === this.props.selectedLayerIndex}
              onLayerSelect={this.props.onLayerSelect}
              onLayerDestroy={this.props.onLayerDestroy?.bind(this)}
              onLayerCopy={this.props.onLayerCopy.bind(this)}
              onLayerVisibilityToggle={this.props.onLayerVisibilityToggle.bind(this)}
          />
          listItems.push(listItem)
          idx += 1
        })
      }
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

type LayerListProps = LayerListContainerProps & {
  onMoveLayer: SortEndHandler
};

export default class LayerListGroupList extends React.Component<LayerListProps> {
  render() {
    return <LayerListContainerSortable
      {...this.props}
      helperClass='sortableHelper'
      onSortEnd={this.props.onMoveLayer.bind(this)}
      useDragHandle={true}
      shouldCancelStart={() => false}
    />
  }
}
