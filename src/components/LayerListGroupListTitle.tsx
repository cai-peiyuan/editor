import React from 'react'
import Collapser from './Collapser'
import { getStyleLayerChnNameById } from '../libs/layer'

type LayerListGroupProps = {
  title: string
  "data-wd-key"?: string
  isActive: boolean
  onActiveToggle(...args: unknown[]): unknown
  'aria-controls'?: string
};

export default class LayerListGroupListTitle extends React.Component<LayerListGroupProps> {
  render() {
    return <li className="maputnik-layer-list-group">
      <div className="maputnik-layer-list-group-group-header"
        data-wd-key={"layer-list-group:"+this.props["data-wd-key"]}
        onClick={_e => this.props.onActiveToggle(!this.props.isActive)}
      >
        <button
          className="maputnik-layer-list-group-group-title "
          aria-controls={this.props['aria-controls']}
          aria-expanded={this.props.isActive}
        >
          {getStyleLayerChnNameById(this.props.title)}
        </button>
        <span className="maputnik-space" />
        <Collapser
          style={{ height: 20, width: 20 }}
          isCollapsed={this.props.isActive}
        />
      </div>
    </li>
  }
}
