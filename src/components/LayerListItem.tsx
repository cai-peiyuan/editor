import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import {MdContentCopy, MdVisibility, MdVisibilityOff, MdDelete} from 'react-icons/md'

import IconLayer from './IconLayer'
import {SortableElement, SortableHandle} from 'react-sortable-hoc'

import { getStyleLayerChnNameById } from '../libs/layer'
import {getLabelName} from '../libs/lang'

type DraggableLabelProps = {
  layerId: string
  layerType: string
};

const DraggableLabel = SortableHandle((props: DraggableLabelProps) => {
  return <div className="maputnik-layer-list-item-handle">
    <IconLayer
      className="layer-handle__icon"
      type={props.layerType}
    />
    <button className="maputnik-layer-list-item-id">
      { getStyleLayerChnNameById( props.layerId )}
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

    // console.log(this.props.action)
    if(this.props.action === 'delete' && (runConfig.mainLayout.layerList.deleteLayer === false ) ){
      return null
    }else if(this.props.action === 'duplicate' && (runConfig.mainLayout.layerList.duplicateLayer === false ) ){
      return null
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

class LayerListItem extends React.Component {
  static propTypes = {
    layerIndex: PropTypes.number.isRequired,
    layerId: PropTypes.string.isRequired,
    layerType: PropTypes.string.isRequired,
    isSelected: PropTypes.bool,
    visibility: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,

    onLayerSelect: PropTypes.func.isRequired,
    onLayerCopy: PropTypes.func,
    onLayerDestroy: PropTypes.func,
    onLayerVisibilityToggle: PropTypes.func,
  }
}
type LayerListItemProps = {
  id?: string
  layerIndex: number
  layerId: string
  layerType: string
  isSelected?: boolean
  visibility?: string
  className?: string
  onLayerSelect(...args: unknown[]): unknown
  onLayerCopy?(...args: unknown[]): unknown
  onLayerDestroy?(...args: unknown[]): unknown
  onLayerVisibilityToggle?(...args: unknown[]): unknown
};

class LayerListItem extends React.Component<LayerListItemProps> {
  static defaultProps = {
    isSelected: false,
    visibility: 'visible',
    onLayerCopy: () => {},
    onLayerDestroy: () => {},
    onLayerVisibilityToggle: () => {},
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
      onClick={_e => this.props.onLayerSelect(this.props.layerIndex)}
      data-wd-key={"layer-list-item:"+this.props.layerId}
      className={classnames({
        "maputnik-layer-list-item": true,
        "maputnik-layer-list-item-selected": this.props.isSelected,
        [this.props.className!]: true,
      })}>
      <DraggableLabel {...this.props} />
      <span style={{flexGrow: 1}} />
      <IconAction
        wdKey={"layer-list-item:"+this.props.layerId+":delete"}
        action={'delete'}
        classBlockName="delete"
        onClick={_e => this.props.onLayerDestroy!(this.props.layerIndex)}
      />
      <IconAction
        wdKey={"layer-list-item:"+this.props.layerId+":copy"}
        action={'duplicate'}
        classBlockName="duplicate"
        onClick={_e => this.props.onLayerCopy!(this.props.layerIndex)}
      />
      <IconAction
        wdKey={"layer-list-item:"+this.props.layerId+":toggle-visibility"}
        action={visibilityAction}
        classBlockName="visibility"
        classBlockModifier={visibilityAction}
        onClick={_e => this.props.onLayerVisibilityToggle!(this.props.layerIndex)}
      />
    </li>
  }
}

const LayerListItemSortable = SortableElement<LayerListItemProps>((props: LayerListItemProps) => <LayerListItem {...props} />);

export default LayerListItemSortable;
