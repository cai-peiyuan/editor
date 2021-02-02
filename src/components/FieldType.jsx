import React from 'react'
import PropTypes from 'prop-types'

import {latest} from '@mapbox/mapbox-gl-style-spec'
import Block from './Block'
import InputSelect from './InputSelect'
import InputString from './InputString'
import {getLabelName} from "../libs/lang";

export default class FieldType extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    wdKey: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.object,
    disabled: PropTypes.bool,
  }

  static defaultProps = {
    disabled: false,
  }

  render() {
    if( runConfig.mainLayout.layerEditor.layer.layerType === false ){
      return null
    }
    return <Block label={getLabelName("Layer Type")} fieldSpec={latest.layer.type}
      data-wd-key={this.props.wdKey}
      error={this.props.error}
    >
      {this.props.disabled &&
        <InputString
          value={this.props.value}
          disabled={true}
        />
      }
      {!this.props.disabled &&
        <InputSelect
          options={[
            ['background', 'Background'],
            ['fill', 'Fill'],
            ['line', 'Line'],
            ['symbol', 'Symbol'],
            ['raster', 'Raster'],
            ['circle', 'Circle'],
            ['fill-extrusion', 'Fill Extrusion'],
            ['hillshade', 'Hillshade'],
            ['heatmap', 'Heatmap'],
          ]}
          onChange={this.props.onChange}
          value={this.props.value}
        />
      }
    </Block>
  }
}
