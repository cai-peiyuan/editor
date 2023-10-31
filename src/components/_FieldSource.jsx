import React from 'react'
import PropTypes from 'prop-types'

import {latest} from '@maplibre/maplibre-gl-style-spec'
import Block from './Block'
import FieldAutocomplete from './FieldAutocomplete'
import {getLabelName} from '../libs/lang'

export default class BlockSource extends React.Component {
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
    return <Block
      label={getLabelName("Source")}
      fieldSpec={latest.layer.source}
      error={this.props.error}
      data-wd-key={this.props.wdKey}
    >
      <FieldAutocomplete
        value={this.props.value}
        onChange={this.props.onChange}
        options={this.props.sourceIds.map(src => [src, src])}
      />
    </Block>
  }
}

