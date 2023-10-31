import React from 'react'
import PropTypes from 'prop-types'

import {latest} from '@maplibre/maplibre-gl-style-spec'
import Block from './Block'
import InputNumber from './InputNumber'
import {getLabelName} from "../libs/lang";

export default class FieldMaxZoom extends React.Component {
  static propTypes = {
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.object,
  }

  render() {
    return <Block label={getLabelName("Max Zoom")} fieldSpec={latest.layer.maxzoom}
      error={this.props.error}
      data-wd-key="max-zoom"
    >
      <InputNumber
        allowRange={true}
        value={this.props.value}
        onChange={this.props.onChange}
        min={latest.layer.maxzoom.minimum}
        max={latest.layer.maxzoom.maximum}
        default={latest.layer.maxzoom.maximum}
      />
    </Block>
  }
}
