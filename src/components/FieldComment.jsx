import React from 'react'
import PropTypes from 'prop-types'

import Block from './Block'
import InputString from './InputString'

export default class FieldComment extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }

  render() {
    const fieldSpec = {
      doc: "当前图层的注释。仅用于注释和备注内容，非样式标准，不在规范中。"
    };

    return <Block
      label={"备注信息"}
      fieldSpec={fieldSpec}
      data-wd-key="layer-comment"
    >
      <InputString
        multi={true}
        value={this.props.value}
        onChange={this.props.onChange}
        default="Comment..."
      />
    </Block>
  }
}
