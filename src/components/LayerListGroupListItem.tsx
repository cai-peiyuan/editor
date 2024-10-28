import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import {MdContentCopy, MdVisibility, MdVisibilityOff, MdDelete} from 'react-icons/md'

import IconLayer from './IconLayer'
import {SortableElement, SortableHandle} from 'react-sortable-hoc'

import { getStyleLayerChnNameById } from '../libs/layer'
import {getLabelName} from '../libs/lang'


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
    case 'show': return <MdVisibility />
    case 'hide': return <MdVisibilityOff />
    }
  }

  getActionCnName(actionEn) {
    switch(actionEn) {
      case 'show': return getLabelName("Show This Layer")
      case 'hide': return getLabelName("Hide This Layer")
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
      aria-hidden="true"
    >
      {this.renderIcon()}
    </button>
  }
}

type LayerListGroupListItemProps = {
  id?: string
  layerIndex: number
  layerId: string
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
    onLayerGroupVisibilityToggle: () => {},
  }

  static childContextTypes = {
    reactIconBase: PropTypes.object
  }

  getChildContext() {
    return {
      reactIconBase: { size: 14 }
    }
  }

  render() {
    const visibilityAction = this.props.visibility === 'visible' ? 'show' : 'hide';
    if(this.props.layerId == 'background'){
      console.log(this.props)
    }
    return <li
      id={this.props.id}
      key={this.props.layerId}
      onClick={_e => this.props.onLayerGroupSelect(this.props.id)}
      data-wd-key={"layer-list-item:"+this.props.layerId}
      className={classnames({
        "maputnik-layer-list-group-item": true,
        "maputnik-layer-list-group-item-selected": this.props.isSelected,
        [this.props.className!]: true,
      })}>

      <div className="maputnik-layer-list-item-handle">
        <IconLayer
            className="layer-handle__icon"
            type={this.props.layerType}
        />
        <button className="maputnik-layer-list-item-id">
          { getStyleLayerChnNameById( this.props.layerId )}
        </button>
      </div>

      <span style={{flexGrow: 1}} />

      <IconAction
          wdKey={"layer-list-item:"+this.props.layerId+":toggle-visibility"}
          action={visibilityAction}
          classBlockName="visibility"
          classBlockModifier={visibilityAction}
          onClick={_e => this.props.onLayerGroupVisibilityToggle!(this.props.layerIndex)}
      />
    </li>
  }
}

const LayerListGroupListItemSortable = SortableElement<LayerListGroupListItemProps>((props: LayerListGroupListItemProps) => <LayerListGroupListItem {...props} />);

export default LayerListGroupListItemSortable;
