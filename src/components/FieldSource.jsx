import React from 'react'
import PropTypes from 'prop-types'

import {latest} from '@maplibre/maplibre-gl-style-spec'
import Block from './Block'
import InputAutocomplete from './InputAutocomplete'
import {getLabelName} from '../libs/lang'

export default class FieldSource extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    wdKey: PropTypes.string,
    onChange: PropTypes.func,
    sourceIds: PropTypes.array,
    error: PropTypes.object,
  }

  static defaultProps = {
    onChange: () => {},
    sourceIds: [],
  }

  render() {
    if( runConfig.mainLayout.layerEditor.layer.source === false ){
      return null
    }
    return <Block
      label={getLabelName("Source")}
      fieldSpec={latest.layer.source}
      error={this.props.error}
      data-wd-key={this.props.wdKey}
    >
      <InputAutocomplete
        value={this.props.value}
        onChange={this.props.onChange}
        options={this.props.sourceIds.map(src => [src, src])}
      />
    </Block>
  }
}
