import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import InputUrl from './InputUrl'
import Block from './Block'


export default class FieldUrl extends React.Component {
  static propTypes = {
    ...InputUrl.propTypes,
  }

  render () {
    const {props} = this;
    const propsHide = {
      style: {display:"none"}
    };

    if(props['data-wd-key']){
      if(props['data-wd-key'] === 'modal:settings.glyphs' && runConfig.mainLayout.toolBar.toolDataStyleSettingFontUrl === false){
        return <Block {...propsHide} label={this.props.label}>
          <InputUrl {...props} />
        </Block>
      }else if(props['data-wd-key'] === 'modal:settings.sprite' && runConfig.mainLayout.toolBar.toolDataStyleSettingSpriteUrl === false){
        return <Block {...propsHide} label={this.props.label}>
          <InputUrl {...props} />
        </Block>
      }
    }
    return (
      <Block label={this.props.label}>
        <InputUrl {...props} />
      </Block>
    );
  }
}

