import React from 'react'

import Block from './Block'
import InputString from './InputString'
import {getLabelName} from "../libs/lang";

type FieldCommentProps = {
  value?: string
  onChange(value: string | undefined): unknown
  error: {message: string}
};

export default class FieldComment extends React.Component<FieldCommentProps> {
  render() {
    const fieldSpec = {
      doc: "当前图层的注释。仅用于注释和备注内容，非样式标准，不在规范中。"
    };

    if( runConfig.mainLayout.layerEditor.layer.sourceLayer === false ){
      return null
    }

    return <Block
      label={getLabelName("Comments")}
      fieldSpec={fieldSpec}
      data-wd-key="layer-comment"
      error={this.props.error}
    >
      <InputString
        multi={true}
        value={this.props.value}
        onChange={this.props.onChange}
        default={getLabelName("Comments")+"..."}
        data-wd-key="layer-comment.input"
      />
    </Block>
  }
}
