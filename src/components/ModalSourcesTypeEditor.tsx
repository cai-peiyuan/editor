import React from 'react'
import {latest} from '@maplibre/maplibre-gl-style-spec'
import Block from './Block'
import FieldUrl from './FieldUrl'
import FieldNumber from './FieldNumber'
import FieldSelect from './FieldSelect'
import FieldDynamicArray from './FieldDynamicArray'
import FieldArray from './FieldArray'
import FieldJson from './FieldJson'
import {getLabelName} from '../libs/lang.ts'
import FieldCheckbox from './FieldCheckbox'

export type EditorMode = "video" | "image" | "tilejson_vector" | "tile_raster" | "tilejson_raster" | "tilexyz_raster-dem" | "tilejson_raster-dem" | "pmtiles_vector" | "tile_vector" | "geojson_url" | "geojson_json" | null;

type TileJSONSourceEditorProps = {
  source: {
    url: string
  }
  onChange(...args: unknown[]): unknown
  children?: React.ReactNode
};


class TileJSONSourceEditor extends React.Component<TileJSONSourceEditorProps> {
  render() {
    return <div>
      <FieldUrl
        label={"TileJSON URL"}
        fieldSpec={latest.source_vector.url}
        value={this.props.source.url}
        onChange={url => this.props.onChange({
          ...this.props.source,
          url: url
        })}
      />
      {this.props.children}
    </div>
  }
}

type TileURLSourceEditorProps = {
  source: {
    tiles: string[]
    minzoom: number
    maxzoom: number
  }
  onChange(...args: unknown[]): unknown
  children?: React.ReactNode
};

class TileURLSourceEditor extends React.Component<TileURLSourceEditorProps> {
  changeTileUrls(tiles: string[]) {
    this.props.onChange({
      ...this.props.source,
      tiles,
    })
  }

  renderTileUrls() {
    const tiles = this.props.source.tiles || [];

    if(runConfig.mainLayout.toolBar.toolDataSourceSelectedSourceUrl === false){
      return null
    }
    return <FieldDynamicArray
      label={getLabelName("1st Tile URL")}
      fieldSpec={latest.source_vector.tiles}
      type="url"
      value={tiles}
      onChange={this.changeTileUrls.bind(this)}
    />
  }

  render() {
    return <div>
      {this.renderTileUrls()}
      <FieldNumber
        label={getLabelName("Min Zoom")}
        fieldSpec={latest.source_vector.minzoom}
        value={this.props.source.minzoom || 0}
        onChange={minzoom => this.props.onChange({
          ...this.props.source,
          minzoom: minzoom
        })}
      />
      <FieldNumber
        label={getLabelName("Max Zoom")}
        fieldSpec={latest.source_vector.maxzoom}
        value={this.props.source.maxzoom || 22}
        onChange={maxzoom => this.props.onChange({
          ...this.props.source,
          maxzoom: maxzoom
        })}
      />
      {this.props.children}
    </div>

  }
}

type ImageSourceEditorProps = {
  source: {
    coordinates: [number, number][]
    url: string
  }
  onChange(...args: unknown[]): unknown
};

class ImageSourceEditor extends React.Component<ImageSourceEditorProps> {
  render() {
    const changeCoord = (idx: number, val: [number, number]) => {
      const coordinates = this.props.source.coordinates.slice(0);
      coordinates[idx] = val;

      this.props.onChange({
        ...this.props.source,
        coordinates,
      });
    }

    return <div>
      <FieldUrl
        label={"图片 URL"}
        fieldSpec={latest.source_image.url}
        value={this.props.source.url}
        onChange={url => this.props.onChange({
          ...this.props.source,
          url,
        })}
      />
      {["top left", "top right", "bottom right", "bottom left"].map((label, idx) => {
        return (
          <FieldArray
            label={`Coord ${label}`}
            key={label}
            length={2}
            type="number"
            value={this.props.source.coordinates[idx]}
            default={[0, 0]}
            onChange={(val: [number, number]) => changeCoord(idx, val)}
          />
        );
      })}
    </div>
  }
}

type VideoSourceEditorProps = {
  source: {
    coordinates: [number, number][]
    urls: string[]
  }
  onChange(...args: unknown[]): unknown
};

class VideoSourceEditor extends React.Component<VideoSourceEditorProps> {
  render() {
    const changeCoord = (idx: number, val: [number, number]) => {
      const coordinates = this.props.source.coordinates.slice(0);
      coordinates[idx] = val;

      this.props.onChange({
        ...this.props.source,
        coordinates,
      });
    }

    const changeUrls = (urls: string[]) => {
      this.props.onChange({
        ...this.props.source,
        urls,
      });
    }

    return <div>
      <FieldDynamicArray
        label={"Video URL"}
        fieldSpec={latest.source_video.urls}
        type="string"
        value={this.props.source.urls}
        default={[]}
        onChange={changeUrls}
      />
      {["top left", "top right", "bottom right", "bottom left"].map((label, idx) => {
        return (
          <FieldArray
            label={`Coord ${label}`}
            key={label}
            length={2}
            type="number"
            value={this.props.source.coordinates[idx]}
            default={[0, 0]}
            onChange={(val: [number, number]) => changeCoord(idx, val)}
          />
        );
      })}
    </div>
  }
}

type GeoJSONSourceUrlEditorProps = {
  source: {
    data: string
  }
  onChange(...args: unknown[]): unknown
};

class GeoJSONSourceUrlEditor extends React.Component<GeoJSONSourceUrlEditorProps> {
  render() {
    return <FieldUrl
      label={"GeoJSON URL"}
      fieldSpec={latest.source_geojson.data}
      value={this.props.source.data}
      onChange={data => this.props.onChange({
        ...this.props.source,
        data: data
      })}
    />
  }
}

type GeoJSONSourceFieldJsonEditorProps = {
  source: {
    data: any,
    cluster: boolean
  }
  onChange(...args: unknown[]): unknown
};

class GeoJSONSourceFieldJsonEditor extends React.Component<GeoJSONSourceFieldJsonEditorProps> {
  render() {
    return <div>
      <Block label={"GeoJSON"} fieldSpec={latest.source_geojson.data}>
        <FieldJson
          layer={this.props.source.data}
          maxHeight={200}
          mode={{
            name: "javascript",
            json: true
          }}
          lint={true}
          onChange={data => {
            this.props.onChange({
              ...this.props.source,
              data,
            })
          }}
        />
      </Block>
      <FieldCheckbox
        label={'Cluster'}
        value={this.props.source.cluster}
        onChange={cluster => {
          this.props.onChange({
            ...this.props.source,
            cluster: cluster,
          })
        }}
      />
    </div>
  }
}

type PMTilesSourceEditorProps = {
  source: {
    url: string
  }
  onChange(...args: unknown[]): unknown
  children?: React.ReactNode
} & WithTranslation;

class PMTilesSourceEditor extends React.Component<PMTilesSourceEditorProps> {
  render() {
    const t = this.props.t;
    return <div>
      <FieldUrl
          label={t("PMTiles URL")}
          fieldSpec={latest.source_vector.url}
          value={this.props.source.url}
          data-wd-key="modal:sources.add.source_url"
          onChange={(url: string) => this.props.onChange({
            ...this.props.source,
            url: url.startsWith("pmtiles://") ? url : `pmtiles://${url}`
          })}
      />
      {this.props.children}
    </div>
  }
}

type ModalSourcesTypeEditorProps = {
  mode: EditorMode
  source: any
  onChange(...args: unknown[]): unknown
};

export default class ModalSourcesTypeEditor extends React.Component<ModalSourcesTypeEditorProps> {
  render() {
    const commonProps = {
      source: this.props.source,
      onChange: this.props.onChange,
    }
    switch(this.props.mode) {
    case 'geojson_url': return <GeoJSONSourceUrlEditor {...commonProps} />
    case 'geojson_json': return <GeoJSONSourceFieldJsonEditor {...commonProps} />
    case 'tilejson_vector': return <TileJSONSourceEditor {...commonProps} />
    case 'tilexyz_vector': return <TileURLSourceEditor {...commonProps} />
    case 'tilejson_raster': return <TileJSONSourceEditor {...commonProps} />
      case 'tile_raster': return <TileURLSourceEditor {...commonProps}>
        <FieldNumber
            label={("Tile Size")}
            fieldSpec={latest.source_raster.tileSize}
            onChange={tileSize => this.props.onChange({
              ...this.props.source,
              tileSize: tileSize
            })}
            value={this.props.source.tileSize || latest.source_raster.tileSize.default}
            data-wd-key="modal:sources.add.tile_size"
        />
      </TileURLSourceEditor>
    case 'tilejson_raster-dem': return <TileJSONSourceEditor {...commonProps} />
    case 'tilexyz_raster-dem': return <TileURLSourceEditor {...commonProps}>
      <FieldNumber
          label={t("Tile Size")}
          fieldSpec={latest.source_raster_dem.tileSize}
          onChange={tileSize => this.props.onChange({
            ...this.props.source,
            tileSize: tileSize
          })}
          value={this.props.source.tileSize || latest.source_raster_dem.tileSize.default}
          data-wd-key="modal:sources.add.tile_size"
      />
      <FieldSelect
        label={"Encoding"}
        fieldSpec={latest.source_raster_dem.encoding}
        options={Object.keys(latest.source_raster_dem.encoding.values)}
        onChange={encoding => this.props.onChange({
          ...this.props.source,
          encoding: encoding
        })}
        value={this.props.source.encoding || latest.source_raster_dem.encoding.default}
      />
    </TileURLSourceEditor>
    case 'pmtiles_vector': return <PMTilesSourceEditor {...commonProps} />
    case 'image': return <ImageSourceEditor {...commonProps} />
    case 'video': return <VideoSourceEditor {...commonProps} />
    default: return null
    }
  }
}

