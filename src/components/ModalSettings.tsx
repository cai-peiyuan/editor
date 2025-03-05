import React from 'react'
import latest from '@maplibre/maplibre-gl-style-spec/dist/latest.json'
import type {LightSpecification, StyleSpecification, TerrainSpecification, TransitionSpecification} from 'maplibre-gl'
import { WithTranslation, withTranslation } from 'react-i18next';

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
        const spriteName = spriteUrl ? (spriteUrl.substring(spriteUrl.lastIndexOf("/") + 1)) : "";
        this.state = {
            spriteName: spriteName
        }
    }
}
type ModalSettingsInternalProps = {
  mapStyle: StyleSpecification
  onStyleChanged(...args: unknown[]): unknown
  onChangeMetadataProperty(...args: unknown[]): unknown
  isOpen: boolean
  onOpenToggle(...args: unknown[]): unknown
} & WithTranslation;

class ModalSettingsInternal extends React.Component<ModalSettingsInternalProps> {
  changeTransitionProperty(property: keyof TransitionSpecification, value: number | undefined) {
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

  changeLightProperty(property: keyof LightSpecification, value: any) {
    const light = {
      ...this.props.mapStyle.light,
    }

    if (value === undefined) {
      delete light[property];
    }
    else {
      // @ts-ignore
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

  changeTerrainProperty(property: keyof TerrainSpecification, value: any) {
    const terrain = {
      ...this.props.mapStyle.terrain,
    }

    if (value === undefined) {
      delete terrain[property];
    }
    else {
      // @ts-ignore
      terrain[property] = value;
    }

    this.props.onStyleChanged({
      ...this.props.mapStyle,
      terrain,
    });
  }

  changeStyleProperty(property: keyof StyleSpecification | "owner", value: any) {
    const changedStyle = {
      ...this.props.mapStyle,
    };

    if (value === undefined) {
      // @ts-ignore
      delete changedStyle[property];
    }
    else {
      // @ts-ignore
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
    const metadata = this.props.mapStyle.metadata || {} as any;
    const {t, onChangeMetadataProperty, mapStyle} = this.props;
    const fsa = fieldSpecAdditional(t);

    const light = this.props.mapStyle.light || {};
    const transition = this.props.mapStyle.transition || {};
    const terrain = this.props.mapStyle.terrain || {} as TerrainSpecification;

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
          value={(this.props.mapStyle as any).owner}
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
          value={this.props.mapStyle.sprite as string}
          onChange={this.changeStyleProperty.bind(this, "sprite")}
        />

        <FieldUrl {
          ...inputPropsGlyphs
          }
          label={getLabelName("Glyphs URL")}

          fieldSpec={latest.$root.glyphs}
          data-wd-key="modal:settings.glyphs"
          value={this.props.mapStyle.glyphs as string}
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

        <FieldString
          label={fsa.maputnik.thunderforest_access_token.label}
          fieldSpec={fsa.maputnik.thunderforest_access_token}
          data-wd-key="modal:settings.maputnik:thunderforest_access_token"
          value={metadata['maputnik:thunderforest_access_token']}
          onChange={onChangeMetadataProperty.bind(this, "maputnik:thunderforest_access_token")}
        />*/}

        <FieldString
          label={fsa.maputnik.stadia_access_token.label}
          fieldSpec={fsa.maputnik.stadia_access_token}
          data-wd-key="modal:settings.maputnik:stadia_access_token"
          value={metadata['maputnik:stadia_access_token']}
          onChange={onChangeMetadataProperty.bind(this, "maputnik:stadia_access_token")}
        />

        <FieldArray
          label={"中心点Center"}
          fieldSpec={latest.$root.center}
          length={2}
          type="number"
          value={mapStyle.center || []}
          default={[0, 0]}
          onChange={this.changeStyleProperty.bind(this, "center")}
        />

        <FieldNumber
          {...inputProps}
          label={"级别Zoom"}
          fieldSpec={latest.$root.zoom}
          value={mapStyle.zoom}
          default={0}
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
          value={light.anchor as string}
          options={Object.keys(latest.light.anchor.values)}
          default={latest.light.anchor.default}
          onChange={this.changeLightProperty.bind(this, "anchor")}
        />

        <FieldColor
          label={t("Light color")}
          fieldSpec={latest.light.color}
          value={light.color as string}
          default={latest.light.color.default}
          onChange={this.changeLightProperty.bind(this, "color")}
        />

        <FieldNumber
          label={t("Light intensity")}
          fieldSpec={latest.light.intensity}
          value={light.intensity as number}
          default={latest.light.intensity.default}
          onChange={this.changeLightProperty.bind(this, "intensity")}
        />

        <FieldArray
          label={t("Light position")}
          fieldSpec={latest.light.position}
          type="number"
          length={latest.light.position.length}
          value={light.position as number[]}
          default={latest.light.position.default}
          onChange={this.changeLightProperty.bind(this, "position")}
        />

        <FieldString
          label={t("Terrain source")}
          fieldSpec={latest.terrain.source}
          data-wd-key="modal:settings.maputnik:terrain_source"
          value={terrain.source}
          onChange={this.changeTerrainProperty.bind(this, "source")}
        />

        <FieldNumber
          label={t("Terrain exaggeration")}
          fieldSpec={latest.terrain.exaggeration}
          value={terrain.exaggeration}
          default={latest.terrain.exaggeration.default}
          onChange={this.changeTerrainProperty.bind(this, "exaggeration")}
        />

        <FieldNumber
          label={t("Transition delay")}
          fieldSpec={latest.transition.delay}
          value={transition.delay}
          default={latest.transition.delay.default}
          onChange={this.changeTransitionProperty.bind(this, "delay")}
        />

        <FieldNumber
          label={t("Transition duration")}
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
            ['ol', t('Open Layers (experimental)')],
          ]}
          value={metadata['maputnik:renderer'] || 'mlgljs'}
          onChange={onChangeMetadataProperty.bind(this, 'maputnik:renderer')}
        />*/}
      </div>
    </Modal>
  }
}

const ModalSettings = withTranslation()(ModalSettingsInternal)
export default ModalSettings;
