import React from 'react'
import PropTypes from 'prop-types'

import {latest} from '@maplibre/maplibre-gl-style-spec'
import Block from './Block'
import InputNumber from './InputNumber'
import {getLabelName} from "../libs/lang";

export default class FieldMinZoom extends React.Component {
  static propTypes = {
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.object,
  }

  render() {
    return <Block label={ getLabelName("Min Zoom")} fieldSpec={latest.layer.minzoom}
      error={this.props.error}
      data-wd-key="min-zoom"
    >
      <InputNumber
        allowRange={true}
        value={this.props.value}
        onChange={this.props.onChange}
        min={latest.layer.minzoom.minimum}
        max={latest.layer.minzoom.maximum}
        default={latest.layer.minzoom.minimum}
      />
    </Block>
  }
}
