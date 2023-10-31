import React from 'react'
import PropTypes from 'prop-types'

import {latest} from '@maplibre/maplibre-gl-style-spec'
import Block from './Block'
import FieldArray from './FieldArray'
import FieldNumber from './FieldNumber'
import FieldString from './FieldString'
import FieldUrl from './FieldUrl'
import FieldSelect from './FieldSelect'
import FieldEnum from './FieldEnum'
import FieldColor from './FieldColor'
import Modal from './Modal'
import fieldSpecAdditional from '../libs/field-spec-additional'
import {getLabelName} from "../libs/lang";
import style from "../libs/style";

export default class ModalSettings extends React.Component {
  static propTypes = {
    mapStyle: PropTypes.object.isRequired,
    onStyleChanged: PropTypes.func.isRequired,
    onChangeMetadataProperty: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpenToggle: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props)
    const spriteUrl = this.props.mapStyle.sprite;
    const spriteName = spriteUrl?(spriteUrl.substring(spriteUrl.lastIndexOf("/")+1)):"";
    this.state = {
      spriteName: spriteName
    }
  }

  changeTransitionProperty(property, value) {
    const transition = {
      ...this.props.mapStyle.transition,
    }

    if (value === undefined) {
      delete transition[property];
    }
    else {
      transition[property] = value;
    }

    this.props.onStyleChanged({
      ...this.props.mapStyle,
      transition,
    });
  }

  changeLightProperty(property, value) {
    const light = {
      ...this.props.mapStyle.light,
    }

    if (value === undefined) {
      delete light[property];
    }
    else {
      light[property] = value;
    }

    this.props.onStyleChanged({
      ...this.props.mapStyle,
      light,
    });
  }

  changeStyleSpriteName(property, value){
    console.log(property)
    console.log(value)
    this.setState({
      spriteName: value
    })
    const changedStyle = {
      ...this.props.mapStyle,
    };
    // const oldSprite = changedStyle["sprite"]
    changedStyle["sprite"] = api_config.url + "/api/mapSpriteData/" + value;
    this.props.onStyleChanged(changedStyle);
  }

  changeStyleProperty(property, value) {
    const changedStyle = {
      ...this.props.mapStyle,
    };

    if (value === undefined) {
      delete changedStyle[property];
    }
    else {
      changedStyle[property] = value;
    }
    this.props.onStyleChanged(changedStyle);
  }

  render() {
    const metadata = this.props.mapStyle.metadata || {}
    const spriteUrl = this.props.mapStyle.sprite;
    const spriteName = spriteUrl?(spriteUrl.substring(spriteUrl.lastIndexOf("/")+1)):"";

    const {onChangeMetadataProperty, mapStyle} = this.props;
    const inputProps = { }
    const inputPropsGlyphs = {
    }

    const light = this.props.mapStyle.light || {};
    const transition = this.props.mapStyle.transition || {};

    return <Modal
      data-wd-key="modal:settings"
      isOpen={this.props.isOpen}
      onOpenToggle={this.props.onOpenToggle}
      title={'样式设置'}
    >
      <div className="modal:settings">
        <FieldString {...inputProps}
          label={"样式名称"}
          fieldSpec={latest.$root.name}
          data-wd-key="modal:settings.name"
          value={this.props.mapStyle.name}
          onChange={this.changeStyleProperty.bind(this, "name")}
        />
        <FieldString {...inputProps}
          label={"所属用户"}
          fieldSpec={{doc: "Owner ID of the style. Used by Mapbox or future style APIs."}}
          data-wd-key="modal:settings.owner"
          value={this.props.mapStyle.owner}
          onChange={this.changeStyleProperty.bind(this, "owner")}
        />

        <FieldSelect {...inputProps}
                     label={getLabelName("Sprite Name")}
                     fieldSpec={getLabelName("Sprite Name")}
                     data-wd-key="modal:settings.spriteName"
                     value={this.state.spriteName}
                     options={spriteDic}
                     onChange={this.changeStyleSpriteName.bind(this, 'spriteName')}
        />

        <FieldUrl {...inputProps}
          fieldSpec={latest.$root.sprite}
          label={getLabelName("Sprite URL")}
          data-wd-key="modal:settings.sprite"
          value={this.props.mapStyle.sprite}
          onChange={this.changeStyleProperty.bind(this, "sprite")}
        />

        <FieldUrl {
          ...inputPropsGlyphs
          }
          label={getLabelName("Glyphs URL")}
          fieldSpec={latest.$root.glyphs}
          data-wd-key="modal:settings.glyphs"
          value={this.props.mapStyle.glyphs}
          onChange={this.changeStyleProperty.bind(this, "glyphs")}
        />

        {/*<FieldString {...inputProps}
          label={fieldSpecAdditional.maputnik.mapbox_access_token.label}
          fieldSpec={fieldSpecAdditional.maputnik.mapbox_access_token}
          data-wd-key="modal:settings.maputnik:mapbox_access_token"
          value={metadata['maputnik:mapbox_access_token']}
          onChange={onChangeMetadataProperty.bind(this, "maputnik:mapbox_access_token")}
        />

        <FieldString {...inputProps}
          label={fieldSpecAdditional.maputnik.maptiler_access_token.label}
          fieldSpec={fieldSpecAdditional.maputnik.maptiler_access_token}
          data-wd-key="modal:settings.maputnik:openmaptiles_access_token"
          value={metadata['maputnik:openmaptiles_access_token']}
          onChange={onChangeMetadataProperty.bind(this, "maputnik:openmaptiles_access_token")}
        />

        <FieldString {...inputProps}
          label={fieldSpecAdditional.maputnik.thunderforest_access_token.label}
          fieldSpec={fieldSpecAdditional.maputnik.thunderforest_access_token}
          data-wd-key="modal:settings.maputnik:thunderforest_access_token"
          value={metadata['maputnik:thunderforest_access_token']}
          onChange={onChangeMetadataProperty.bind(this, "maputnik:thunderforest_access_token")}
        />*/}

        <FieldArray
          label={"中心点Center"}
          fieldSpec={latest.$root.center}
          length={2}
          type="number"
          value={mapStyle.center}
          default={latest.$root.center.default || [0, 0]}
          onChange={this.changeStyleProperty.bind(this, "center")}
        />

        <FieldNumber
          {...inputProps}
          label={"级别Zoom"}
          fieldSpec={latest.$root.zoom}
          value={mapStyle.zoom}
          default={latest.$root.zoom.default || 0}
          onChange={this.changeStyleProperty.bind(this, "zoom")}
        />

        <FieldNumber
          {...inputProps}
          label={"水平角度Bearing"}
          fieldSpec={latest.$root.bearing}
          value={mapStyle.bearing}
          default={latest.$root.bearing.default}
          onChange={this.changeStyleProperty.bind(this, "bearing")}
        />

        <FieldNumber
          {...inputProps}
          label={"俯视角度Pitch"}
          fieldSpec={latest.$root.pitch}
          value={mapStyle.pitch}
          default={latest.$root.pitch.default}
          onChange={this.changeStyleProperty.bind(this, "pitch")}
        />

        {/*<FieldEnum
          {...inputProps}
          label={"Light anchor"}
          fieldSpec={latest.light.anchor}
          name="light-anchor"
          value={light.anchor}
          options={Object.keys(latest.light.anchor.values)}
          default={latest.light.anchor.default}
          onChange={this.changeLightProperty.bind(this, "anchor")}
        />

        <FieldColor
          {...inputProps}
          label={"Light color"}
          fieldSpec={latest.light.color}
          value={light.color}
          default={latest.light.color.default}
          onChange={this.changeLightProperty.bind(this, "color")}
        />

        <FieldNumber
          {...inputProps}
          label={"Light intensity"}
          fieldSpec={latest.light.intensity}
          value={light.intensity}
          default={latest.light.intensity.default}
          onChange={this.changeLightProperty.bind(this, "intensity")}
        />

        <FieldArray
          {...inputProps}
          label={"Light position"}
          fieldSpec={latest.light.position}
          type="number"
          length={latest.light.position.length}
          value={light.position}
          default={latest.light.position.default}
          onChange={this.changeLightProperty.bind(this, "position")}
        />

        <FieldNumber
          {...inputProps}
          label={"Transition delay"}
          fieldSpec={latest.transition.delay}
          value={transition.delay}
          default={latest.transition.delay.default}
          onChange={this.changeTransitionProperty.bind(this, "delay")}
        />

        <FieldNumber
          {...inputProps}
          label={"Transition duration"}
          fieldSpec={latest.transition.duration}
          value={transition.duration}
          default={latest.transition.duration.default}
          onChange={this.changeTransitionProperty.bind(this, "duration")}
        />*/}

        {/*<FieldSelect {...inputProps}
          label={fieldSpecAdditional.maputnik.style_renderer.label}
          fieldSpec={fieldSpecAdditional.maputnik.style_renderer}
          data-wd-key="modal:settings.maputnik:renderer"
          options={[
            ['mlgljs', 'MapLibreGL JS'],
            ['ol', 'Open Layers (experimental)'],
          ]}
          value={metadata['maputnik:renderer'] || 'mlgljs'}
          onChange={onChangeMetadataProperty.bind(this, 'maputnik:renderer')}
        />*/}
      </div>
    </Modal>
  }
}

