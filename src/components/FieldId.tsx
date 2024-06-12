import React from 'react'

import latest from '@maplibre/maplibre-gl-style-spec/dist/latest.json'
import Block from './Block'
import InputString from './InputString'
import {getLabelName} from "../libs/lang";

type FieldIdProps = {
  value: string
  wdKey: string
  onChange(value: string | undefined): unknown
  error?: {message: string}
};

export default class FieldId extends React.Component<FieldIdProps> {
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
        data-wd-key={this.props.wdKey + ".input"}
      />
    </Block>
  }
}
