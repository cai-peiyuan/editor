import React from 'react'
import PropTypes from 'prop-types'

import {latest} from '@maplibre/maplibre-gl-style-spec'
import Block from './Block'
import InputString from './InputString'
import {getLabelName} from "../libs/lang";

export default class FieldId extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    wdKey: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.object,
  }

  render() {
    if( runConfig.mainLayout.layerEditor.layer.layerId === false ){
      return null
    }
    return <Block label={getLabelName("Layer ID")} fieldSpec={latest.layer.id}
      data-wd-key={this.props.wdKey}
      error={this.props.error}
    >
      <InputString
        value={this.props.value}
        onInput={this.props.onChange}
      />
    </Block>
  }
}
