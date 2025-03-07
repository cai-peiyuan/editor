import React from 'react'

import latest from '@maplibre/maplibre-gl-style-spec/dist/latest.json'
import Block from './Block'
import InputSelect from './InputSelect'
import InputString from './InputString'
import {getLabelName} from "../libs/lang";
import { WithTranslation, withTranslation } from 'react-i18next';

type FieldTypeInternalProps = {
  value: string
  wdKey?: string
  onChange(value: string): unknown
  error?: {message: string}
  disabled?: boolean
} & WithTranslation;

class FieldTypeInternal extends React.Component<FieldTypeInternalProps> {
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
          data-wd-key={this.props.wdKey + ".select"}
        />
      }
    </Block>
  }
}

const FieldType = withTranslation()(FieldTypeInternal);
export default FieldType;
