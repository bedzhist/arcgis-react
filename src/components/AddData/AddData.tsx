import Graphic from '@arcgis/core/Graphic';
import CSVLayer from '@arcgis/core/layers/CSVLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import Layer from '@arcgis/core/layers/Layer';
import Field from '@arcgis/core/layers/support/Field';
import esriRequest from '@arcgis/core/request';
import {
  CalciteButton,
  CalciteInput,
  CalciteLabel,
  CalciteTab,
  CalciteTabNav,
  CalciteTabs,
  CalciteTabTitle
} from '@esri/calcite-components-react';
import { useActionState, useRef } from 'react';
import esriConfig from '@arcgis/core/config';

interface FeatureCollection {
  layers: {
    featureSet: __esri.FeatureSetProperties;
    layerDefinition: {
      name: string;
      objectIdField: string;
      fields: __esri.FieldProperties[];
      drawingInfo: {
        renderer: __esri.SimpleRendererProperties & {
          symbol: __esri.SymbolProperties & { type: string; style: string };
        };
      };
    };
    popupInfo?: {
      title: string;
      description: string;
    };
  }[];
}

export interface AddDataProps {
  view?: __esri.MapView;
}

const buildLayersFromCollection = (
  featureCollection: FeatureCollection
): {
  layers: FeatureLayer[];
  allGraphics: Graphic[];
} => {
  const allGraphics: Graphic[] = [];
  const layers = featureCollection.layers.map((layer) => {
    const title = layer.layerDefinition.name;
    const objectIdField = layer.layerDefinition.objectIdField;
    const source = layer.featureSet.features?.map((feature) => {
      return Graphic.fromJSON(feature);
    });
    const fields = layer.layerDefinition.fields.map((field) => {
      return Field.fromJSON(field);
    });
    /* const renderer = layer.layerDefinition.drawingInfo.renderer;
    switch (renderer.symbol.type) {
      case 'esriSMS':
        renderer.symbol.type = 'simple-marker';
        break;
      case 'esriSLS':
        renderer.symbol.type = 'simple-line';
        break;
      case 'esriSFS':
        renderer.symbol.type = 'simple-fill';
        break;
      case 'esriPMS':
        renderer.symbol.type = 'picture-marker';
        break;
      case 'esriPFS':
        renderer.symbol.type = 'picture-fill';
        break;
      default:
        // TODO: Handle error
        break;
    }
    switch (renderer.symbol.style) {
      case 'esriSLSSolid':
        renderer.symbol.style = 'solid';
        break;
      case 'esriSLSDash':
        renderer.symbol.style = 'dash';
        break;
      case 'esriSLSDashDotDot':
        renderer.symbol.style = 'dash-dot-dot';
        break;
      case 'esriSLSDot':
        renderer.symbol.style = 'dot';
        break;
      case 'esriSFSForwardDiagonal':
        renderer.symbol.style = 'forward-diagonal';
        break;
      case 'esriSFSSolid':
        renderer.symbol.style = 'solid';
        break;
      case 'esriSFSBackwardDiagonal':
        renderer.symbol.style = 'backward-diagonal';
        break;
      default:
        // TODO: Handle error
        break;
    } */
    const popupTemplate = layer.popupInfo
      ? {
          title: layer.popupInfo.title,
          content: layer.popupInfo.description
        }
      : undefined;
    const featureLayer = new FeatureLayer({
      title,
      objectIdField,
      source,
      fields,
      // renderer,
      popupTemplate
    });
    if (source) {
      allGraphics.push(...source);
    }
    return featureLayer;
  });
  return {
    layers,
    allGraphics
  };
};
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const GENERATE_SERVICE_URL = `${esriConfig.portalUrl}/sharing/rest/content/features/generate`;

export function AddData(props: AddDataProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [, fileFormAction, isFileFormLoading] = useActionState<null, FormData>(
    async () => {
      const view = props.view;
      if (!view) {
        // TODO: Handle error
        return null;
      }
      const inputFileEl = inputFileRef.current;
      if (!inputFileEl) {
        // TODO: Handle error
        return null;
      }
      const file = inputFileEl.files?.[0];
      if (!(file instanceof File) || file.size === 0) {
        // TODO: Handle error
        return null;
      }
      switch (file.type) {
        case 'text/csv': {
          const layer = new CSVLayer({
            url: URL.createObjectURL(file)
          });
          view.map.add(layer);
          await view.whenLayerView(layer);
          view.goTo(layer.fullExtent);
          break;
        }
        case 'application/zip': {
          const params = {
            name: file.name,
            targetSR: view.spatialReference,
            maxRecordCount: 1000,
            enforceInputFileSizeLimit: true,
            enforceOutputJsonSizeLimit: true,
            generalize: true,
            maxAllowableOffset: 10,
            reducePrecision: true,
            numberOfDigitsAfterDecimal: 0
          };
          const query = {
            filetype: 'shapefile',
            publishParameters: JSON.stringify(params),
            f: 'json'
          };
          const body = new FormData();
          body.append('file', file);
          const response = await esriRequest(GENERATE_SERVICE_URL, {
            query,
            body: body,
            responseType: 'json'
          });
          const featureCollection: FeatureCollection =
            response.data.featureCollection;
          const { layers, allGraphics } =
            buildLayersFromCollection(featureCollection);
          view.map.addMany(layers);
          view.goTo(allGraphics);
          break;
        }
        case 'application/geo+json': {
          const layer = new GeoJSONLayer({
            url: URL.createObjectURL(file)
          });
          view.map.add(layer);
          await view.whenLayerView(layer);
          view.goTo(layer.fullExtent);
          break;
        }
        case 'application/vnd.google-earth.kml+xml': {
          // TODO: fix this because it's not working as expected
          const kmlString = await readFileAsText(file);
          const query = {
            kmlString: encodeURIComponent(kmlString)
          };
          const response = await esriRequest(esriConfig.kmlServiceUrl, {
            query,
            responseType: 'json'
          });
          const featureCollection: FeatureCollection =
            response.data.featureCollection;
          const { layers, allGraphics } =
            buildLayersFromCollection(featureCollection);
          view.map.addMany(layers);
          view.goTo(allGraphics);
          break;
        }
        case 'application/vnd.google-earth.kmz': {
          // TODO: implement this
          break;
        }
        case '': {
          if (file.name.endsWith('.gpx')) {
            const params = {
              name: file.name,
              targetSR: view.spatialReference,
              maxRecordCount: 1000,
              enforceInputFileSizeLimit: true,
              enforceOutputJsonSizeLimit: true,
              generalize: true,
              maxAllowableOffset: 10,
              reducePrecision: true,
              numberOfDigitsAfterDecimal: 0
            };
            const query = {
              filetype: 'gpx',
              publishParameters: JSON.stringify(params),
              f: 'json'
            };
            const body = new FormData();
            body.append('file', file);
            const response = await esriRequest(GENERATE_SERVICE_URL, {
              query,
              body: body,
              responseType: 'json'
            });
            const featureCollection: FeatureCollection =
              response.data.featureCollection;
            const { layers, allGraphics } =
              buildLayersFromCollection(featureCollection);
            view.map.addMany(layers);
            view.goTo(allGraphics);
          }
          break;
        }
        default: {
          //TODO: Handle error
          return null;
        }
      }
      return null;
    },
    null
  );
  const [, urlFormAction, isUrlFormLoading] = useActionState<null, FormData>(
    async (_, formData) => {
      const view = props.view;
      if (!view) {
        // Handle error
        return null;
      }
      const url = formData.get('url');
      if (typeof url !== 'string') {
        // Handle error
        return null;
      }
      const layer = await Layer.fromArcGISServerUrl({ url });
      view.map.add(layer);
      await view.whenLayerView(layer);
      view.goTo(layer.fullExtent);
      return null;
    },
    null
  );

  return (
    <CalciteTabs
      layout="center"
      className="p-3"
    >
      <CalciteTabNav slot="title-group">
        <CalciteTabTitle>File</CalciteTabTitle>
        <CalciteTabTitle>URL</CalciteTabTitle>
      </CalciteTabNav>
      <CalciteTab>
        <form
          className="p-7"
          action={fileFormAction}
        >
          <CalciteLabel>
            Select File
            {/*
              // TODO: Replace this with CalciteInput when the bug has been fixed
              // TODO: (https://github.com/Esri/calcite-design-system/issues/9319) 
            */}
            <input
              ref={inputFileRef}
              type="file"
              accept=".csv,.zip,.geojson,.kml,.kmz,.gpx"
              className="d-flex border-1 border-dashed border-color-input bg-1 cursor-pointer inline-size-100 box-border text-3 font-default focus:outline-2 focus:outline-color-brand"
              style={{
                outlineOffset: '-2px',
                paddingInline: '0.75rem',
                paddingBlock: '.25rem',
                blockSize: '2rem'
              }}
            />
          </CalciteLabel>
          <CalciteButton
            type="submit"
            disabled={isFileFormLoading}
            width="full"
            loading={isFileFormLoading}
          >
            Add Layer
          </CalciteButton>
        </form>
      </CalciteTab>
      <CalciteTab>
        <form
          className="p-7"
          action={urlFormAction}
        >
          <CalciteLabel>
            Enter URL
            <CalciteInput
              type="url"
              required
              name="url"
            />
          </CalciteLabel>
          <CalciteButton
            type="submit"
            disabled={isUrlFormLoading}
            width="full"
            loading={isUrlFormLoading}
          >
            Add Layer
          </CalciteButton>
        </form>
      </CalciteTab>
    </CalciteTabs>
  );
}

export default AddData;
