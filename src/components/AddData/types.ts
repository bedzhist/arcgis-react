export type EsriGeometryType =
  | 'esriGeometryEnvelope'
  | 'esriGeometryMultipoint'
  | 'esriGeometryPoint'
  | 'esriGeometryPolygon'
  | 'esriGeometryPolyline';
export type EsriFieldType =
  | 'esriFieldTypeBigInteger'
  | 'esriFieldTypeBlob'
  | 'esriFieldTypeDate'
  | 'esriFieldTypeDateOnly'
  | 'esriFieldTypeDouble'
  | 'esriFieldTypeGeometry'
  | 'esriFieldTypeGlobalID'
  | 'esriFieldTypeGUID'
  | 'esriFieldTypeInteger'
  | 'esriFieldTypeOID'
  | 'esriFieldTypeRaster'
  | 'esriFieldTypeSingle'
  | 'esriFieldTypeSmallInteger'
  | 'esriFieldTypeString'
  | 'esriFieldTypeTimeOnly'
  | 'esriFieldTypeTimestampOffset'
  | 'esriFieldTypeXML';
export type EsriSMSStyle =
  | 'esriSMSCircle'
  | 'esriSMSCross'
  | 'esriSMSDiamond'
  | 'esriSMSSquare'
  | 'esriSMSTriangle'
  | 'esriSMSX';
export type EsriSLSStyle =
  | 'esriSLSSolid'
  | 'esriSLSDash'
  | 'esriSLSDashDot'
  | 'esriSLSDashDotDot'
  | 'esriSLSDot'
  | 'esriSLSLongDash'
  | 'esriSLSLongDashDot'
  | 'esriSLSNull'
  | 'esriSLSShortDash'
  | 'esriSLSShortDashDot'
  | 'esriSLSShortDashDotDot'
  | 'esriSLSShortDot';
export type EsriSFSStyle =
  | 'esriSFSSolid'
  | 'esriSFSForwardDiagonal'
  | 'esriSFSBackwardDiagonal'
  | 'esriSFSCross'
  | 'esriSFSDiagonalCross'
  | 'esriSFSHorizontal'
  | 'esriSFSVertical';

export interface EsriSMSymbol {
  angle: number;
  color: number[];
  outline: {
    color: number[];
    width: number;
  };
  size: number;
  style: EsriSMSStyle;
  type: 'esriSMS';
}
export interface EsriPMSymbol {
  angle: number;
  contentType: string;
  height: number;
  imageData: string;
  type: 'esriPMS';
  url: string;
  width: number;
  xoffset: number;
  style: EsriSMSStyle;
  yoffset: number;
}
export interface EsriSLSSymbol {
  color: number[];
  style: EsriSLSStyle;
  type: 'esriSLS';
  width: number;
}
export interface EsriSFSymbol {
  color: number[];
  style: EsriSFSStyle;
  type: 'esriSFS';
}
export interface EsriSimpleRenderer {
  symbol: EsriSMSymbol | EsriPMSymbol | EsriSLSSymbol | EsriSFSymbol;
  type: 'simple';
}
export interface EsriUniqueValueRenderer {
  defaultLabel: string;
  defaultSymbol: EsriSMSymbol | EsriPMSymbol | EsriSLSSymbol | EsriSFSymbol;
  field1: string;
  field2: string;
  field3: string;
  fieldDelimiter: string;
  type: 'uniqueValue';
  uniqueValueInfos: {
    label: string;
    symbol: EsriSMSymbol | EsriPMSymbol | EsriSLSSymbol | EsriSFSymbol;
    value: string;
  }[];
}
export interface EsriFeatureCollection {
  layers: {
    featureSet: {
      features: {
        attributes: Record<string, unknown>;
        // TODO: Add geometry, popupInfo, and symbol
        // TODO: (https://developers.arcgis.com/web-map-specification/objects/feature/)
      }[];
      geometryType: EsriGeometryType;
      spatialReference: {
        wkid: number;
      };
    };
    layerDefinition: {
      name: string;
      objectIdField: string;
      fields: {
        name: string;
        alias: string;
        type: EsriFieldType;
      }[];
      drawingInfo: {
        renderer: EsriSimpleRenderer | EsriUniqueValueRenderer;
      };
    };
    popupInfo?: {
      title: string;
      description: string;
    };
  }[];
}

export enum ResultsSource {
  LIVING_ATLAS = 'living-atlas',
  ARCGIS_ONLINE = 'arcgis-online'
}

export interface ResultItem {
  id: string;
  title: string;
  description: string;
  type: string;
  thumbnail: string;
  owner: string;
}

export interface AddDataCardProps {
  item: ResultItem;
  onAdd: (
    event: React.MouseEvent<HTMLCalciteButtonElement, MouseEvent>,
    item: ResultItem
  ) => void;
}

export interface AddDataProps {
  view?: __esri.MapView | __esri.SceneView;
}
