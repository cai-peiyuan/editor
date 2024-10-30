import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import {MdContentCopy, MdVisibility, MdVisibilityOff, MdDelete} from 'react-icons/md'

import IconLayer from '../IconLayer'
import {SortableElement, SortableHandle} from 'react-sortable-hoc'

import { getStyleLayerChnNameById } from '../../libs/layer'
import {getLabelName} from '../../libs/lang'

type DraggableLabelProps = {
  layerGroupId: string
  layerType: string
};

const DraggableLabel = SortableHandle((props: DraggableLabelProps) => {
  return <div className="maputnik-layer-list-group-item-handle"
              onClick={_e => props.onLayerGroupSelect(props.layerGroupId)}
  >
    <IconLayer
        className="layer-handle__icon"
        type={props.layerType}
    />
    <button className="maputnik-layer-list-group-item-id">
      { getStyleLayerChnNameById( props.layerGroupName )}
    </button>
  </div>
});

type IconActionProps = {
  action: string
  onClick(...args: unknown[]): unknown
  wdKey?: string
  classBlockName?: string
  classBlockModifier?: string
};

class IconAction extends React.Component<IconActionProps> {
  renderIcon() {
    switch(this.props.action) {
      case 'duplicate': return <MdContentCopy />
      case 'show': return <MdVisibility />
      case 'hide': return <MdVisibilityOff />
      case 'delete': return <MdDelete />
    }
  }

  getActionCnName(actionEn) {
    switch(actionEn) {
      case 'duplicate': return getLabelName("Duplicate This Layer")
      case 'show': return getLabelName("Show This Layer")
      case 'hide': return getLabelName("Hide This Layer")
      case 'delete': return getLabelName("Delete This Layer")
    }
  }

  render() {
    const {classBlockName, classBlockModifier} = this.props;

    let classAdditions = '';
    if (classBlockName) {
      classAdditions = `maputnik-layer-list-icon-action__${classBlockName}`;

      if (classBlockModifier) {
        classAdditions += ` maputnik-layer-list-icon-action__${classBlockName}--${classBlockModifier}`;
      }
    }

    return <button
        tabIndex="-1"
        title={ this.getActionCnName(this.props.action) }
        className={`maputnik-layer-list-icon-action ${classAdditions}`}
        data-wd-key={this.props.wdKey}
        onClick={this.props.onClick}
    >
      {this.renderIcon()}
    </button>
  }
}

type LayerListGroupListItemProps = {
  id?: string
  layerGroupId: string
  layerGroupName: string
  layerType: string
  isSelected?: boolean
  visibility?: string
  className?: string
  onLayerGroupSelect(...args: unknown[]): unknown
  onLayerGroupVisibilityToggle?(...args: unknown[]): unknown
};

class LayerListGroupListItem extends React.Component<LayerListGroupListItemProps> {
  static defaultProps = {
    isSelected: false,
    visibility: 'visible',
    onLayerGroupSelect: () => {},
    onLayerGroupVisibilityToggle: () => {},
  }

  static childContextTypes = {
    reactIconBase: PropTypes.object
  }

  getChildContext() {
    return {
      reactIconBase: { size: 16 }
    }
  }

  render() {
    const visibilityAction = this.props.visibility === 'visible' ? 'show' : 'hide';
    //console.log("图层分组->", this.props.layerGroupName)
    //console.log("图层分组 this.props.visibility->", this.props.visibility)
   // console.log("图层分组 visibilityAction->", visibilityAction)
    return <li
      id={this.props.layerGroupId}
      key={this.props.layerGroupId}
      data-wd-key={"layer-list-group-item:"+this.props.layerGroupId}
      className={classnames({
        "maputnik-layer-list-group-item": true,
        "maputnik-layer-list-group-item-selected": this.props.isSelected,
        [this.props.className!]: true,
      })}>
      <DraggableLabel {...this.props} />
      <span style={{flexGrow: 1}} />
      <IconAction
          wdKey={"layer-list-group-item:"+this.props.layerId+":toggle-visibility"}
          action={visibilityAction} //开眼和闭眼
          classBlockName="visibility"
          classBlockModifier={ (this.props.isSelected||true)?'hide':'show'} //显示与隐藏按钮
          onClick={_e => this.props.onLayerGroupVisibilityToggle!(this.props.layerGroupId)}
      />
    </li>
  }
}

const LayerListGroupListItemSortable = SortableElement<LayerListGroupListItemProps>((props: LayerListGroupListItemProps) => <LayerListGroupListItem {...props} />);

export default LayerListGroupListItemSortable;
