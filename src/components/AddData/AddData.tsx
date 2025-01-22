import esriConfig from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic';
import CSVLayer from '@arcgis/core/layers/CSVLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import Layer from '@arcgis/core/layers/Layer';
import Field from '@arcgis/core/layers/support/Field';
import PortalItem from '@arcgis/core/portal/PortalItem';
import {
  default as esriRequest,
  default as request
} from '@arcgis/core/request';
import {
  CalciteInputCustomEvent,
  CalcitePaginationCustomEvent
} from '@esri/calcite-components';
import {
  CalciteButton,
  CalciteCardGroup,
  CalciteDropdown,
  CalciteDropdownGroup,
  CalciteDropdownItem,
  CalciteInput,
  CalciteLabel,
  CalcitePagination,
  CalciteProgress,
  CalciteTab,
  CalciteTabNav,
  CalciteTabs,
  CalciteTabTitle
} from '@esri/calcite-components-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useValue } from '../../hooks';
import AddDataCard, { ResultItem } from '../AddDataCard';
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

enum ResultsSource {
  LIVING_ATLAS = 'living-atlas',
  ARCGIS_ONLINE = 'arcgis-online'
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
    // TODO: Handle renderer
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
const COMMUNITY_GROUPS_SERVICE_URL = `${esriConfig.portalUrl}/sharing/rest/community/groups`;
const CONTENT_GROUPS_SERVICE_URL = `${esriConfig.portalUrl}/sharing/rest/content/groups`;
const SEARCH_SERVICE_URL = `${esriConfig.portalUrl}/sharing/rest/search`;
const RESULTS_PAGE_SIZE = 10;
const RESULTS_FILTER =
  '(type:"Map Service" OR type:"Image Service" OR type:"Feature Service" OR type:"Vector Tile Service" OR type:"OGCFeatureServer" OR type:"WMS" OR type:"WFS" OR type:"WMTS" OR type:"KML" OR type: "Stream Service" OR type: "Feed" OR type:"Media Layer" OR type:"Group Layer" OR type:"GeoJson" OR type:"Knowledge Graph Service" OR type:"Knowledge Graph Layer" OR (type: "Feature Service" AND typekeywords: "OrientedImageryLayer") OR (type: "Feature Service" AND typekeywords: "CatalogLayer") OR (type:"Feature Collection" AND typekeywords:"Route Layer") OR (type:"Feature collection" AND typekeywords:"Markup")) -typekeywords: "Table"';
const RESULTS_Q =
  '(-typekeywords:"Elevation 3D Layer" AND -typekeywords:"IndoorPositioningDataService" AND -typekeywords:"Requires Subscription" AND -typekeywords:"Requires Credits") -typekeywords:("MapAreaPackage") -type:("Map Area" OR "Indoors Map Configuration" OR "Code Attachment")';

export function AddData(props: AddDataProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const livingAtlasGroupId = useValue<string>('');
  const resultsSearchTimeout = useValue<number | null>(null);

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
          const { layers } = buildLayersFromCollection(featureCollection);
          view.map.addMany(layers);
          break;
        }
        case 'application/geo+json': {
          const layer = new GeoJSONLayer({
            url: URL.createObjectURL(file)
          });
          view.map.add(layer);
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
          const { layers } = buildLayersFromCollection(featureCollection);
          view.map.addMany(layers);
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
            const { layers } = buildLayersFromCollection(featureCollection);
            view.map.addMany(layers);
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
      return null;
    },
    null
  );
  const [resultItems, setResultItems] = useState<ResultItem[]>();
  const [resultsTotal, setResultsTotal] = useState<number>();
  const [resultsStart, setResultsStart] = useState<number>(1);
  const [isResultsQueryLoading, setIsResultsQueryLoading] =
    useState<boolean>(false);
  const [resultsSource, setResultsSource] = useState<ResultsSource>(
    ResultsSource.LIVING_ATLAS
  );
  const [resultsSearchValue, setResultsSearchValue] = useState<string>('');

  /* const fetchLivingAtlasResults = async (
    livingAtlasGroupId: string,
    options?: {
      start?: number;
      q?: string;
    },
    signal?: AbortSignal
  ) => {
    const query = {
      num: RESULTS_PAGE_SIZE,
      start: options?.start || resultsStart,
      sortField: 'modified',
      sortOrder: 'desc',
      filter: RESULTS_FILTER,
      enriched: true,
      q: options?.q || RESULTS_Q,
      displaySublayers: true,
      displayHighlights: true,
      displayServiceProperties: true,
      f: 'json'
    };
    const contentGroupsSearchUrl = `${CONTENT_GROUPS_SERVICE_URL}/${livingAtlasGroupId}/search`;
    setIsResultsQueryLoading(true);
    const response = await esriRequest(contentGroupsSearchUrl, {
      query,
      signal
    });
    setIsResultsQueryLoading(false);
    const data = response.data;
    const results = data.results;
    setResultItems(results);
    setResultsTotal(data.total);
  }; */
  const fetchResults = async (
    source: ResultsSource,
    options?: {
      start?: number;
      q?: string;
    },
    signal?: AbortSignal
  ) => {
    const query = {
      num: RESULTS_PAGE_SIZE,
      start: options?.start || resultsStart,
      sortField: 'modified',
      sortOrder: 'desc',
      filter: RESULTS_FILTER,
      q: options?.q || RESULTS_Q,
      displaySublayers: true,
      displayHighlights: true,
      displayServiceProperties: true,
      f: 'json'
    };
    let url = '';
    switch (source) {
      case ResultsSource.LIVING_ATLAS: {
        const currLivingAtlasGroupId = livingAtlasGroupId.current;
        if (!currLivingAtlasGroupId) {
          // Handle error
          return;
        }
        url = `${CONTENT_GROUPS_SERVICE_URL}/${currLivingAtlasGroupId}/search`;
        break;
      }
      case ResultsSource.ARCGIS_ONLINE:
        url = SEARCH_SERVICE_URL;
        break;
      default:
        // TODO: Handle error
        return;
    }
    setIsResultsQueryLoading(true);
    const response = await esriRequest(url, {
      query,
      signal
    });
    setIsResultsQueryLoading(false);
    const data = response.data;
    const results = data.results;
    setResultItems(results);
    setResultsTotal(data.total);
  };
  const addLayerFromPortalClick = async (
    event: React.MouseEvent<HTMLCalciteButtonElement, MouseEvent>,
    item: ResultItem
  ) => {
    const view = props.view;
    if (!view) {
      // Handle error
      return;
    }
    const target = event.currentTarget;
    const portalItem = new PortalItem({
      id: item.id
    });
    target.loading = true;
    target.disabled = true;
    const layer = await Layer.fromPortalItem({
      portalItem
    });
    target.loading = false;
    target.disabled = false;
    view.map.add(layer);
  };
  const handleResultsPaginationChange = (
    event: CalcitePaginationCustomEvent<void>
  ) => {
    const currLivingAtlasGroupId = livingAtlasGroupId.current;
    if (!currLivingAtlasGroupId) {
      // Handle error
      return;
    }
    const newStartItem = event.target.startItem;
    setResultsStart(newStartItem);
    fetchResults(resultsSource, {
      start: newStartItem,
      q: `${RESULTS_Q} ${resultsSearchValue}`
    });
  };
  const handleSearchResultsInput = (event: CalciteInputCustomEvent<void>) => {
    const searchValue = event.target.value;
    setResultsSearchValue(searchValue);
    const currLivingAtlasGroupId = livingAtlasGroupId.current;
    if (!currLivingAtlasGroupId) {
      // Handle error
      return;
    }
    setResultsStart(1);
    const currResultsSearchTimeout = resultsSearchTimeout.current;
    if (currResultsSearchTimeout) clearTimeout(currResultsSearchTimeout);
    resultsSearchTimeout.current = setTimeout(() => {
      fetchResults(resultsSource, {
        q: `${RESULTS_Q} ${searchValue}`
      });
    }, 500);
  };
  const getResultsSource = (source: string) => {
    switch (source) {
      case ResultsSource.LIVING_ATLAS:
        return 'Living Atlas';
      case ResultsSource.ARCGIS_ONLINE:
        return 'ArcGIS Online';
      default:
        // TODO: Handle error
        return '';
    }
  };
  const selectResultsSource = (source: ResultsSource) => {
    setResultsSource(source);
    fetchResults(source, {
      q: `${RESULTS_Q} ${resultsSearchValue}`
    });
  };

  useEffect(() => {
    const init = async (signal: AbortSignal) => {
      const communityGroupsQuery = {
        q: 'title:"LAW Search" AND owner:Esri_LivingAtlas',
        num: 1,
        sortField: 'title',
        sortOrder: 'asc',
        f: 'json'
      };
      const communityGroupsResponse = await request(
        COMMUNITY_GROUPS_SERVICE_URL,
        {
          query: communityGroupsQuery,
          signal
        }
      );
      const newLivingAtlasGroupId = communityGroupsResponse.data.results[0].id;
      livingAtlasGroupId.current = newLivingAtlasGroupId;
      fetchResults(
        resultsSource,
        {
          start: resultsStart,
          q: `${RESULTS_Q} ${resultsSearchValue}`
        },
        signal
      );
    };
    const abortController = new AbortController();
    init(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <CalciteTabs
      layout="center"
      className="h-100"
    >
      <CalciteTabNav slot="title-group">
        <CalciteTabTitle>Portal</CalciteTabTitle>
        <CalciteTabTitle>File</CalciteTabTitle>
        <CalciteTabTitle>URL</CalciteTabTitle>
      </CalciteTabNav>
      <CalciteTab>
        <div className="d-flex flex-column h-100">
          <div className="d-flex justify-center py-4">
            <CalciteDropdown
              maxItems={0}
              overlayPositioning="absolute"
              placement="bottom-start"
              type="click"
              width-scale="m"
              scale="m"
            >
              <CalciteButton
                iconEnd="chevron-down"
                slot="trigger"
                alignment="center"
                appearance="transparent"
                kind="neutral"
                scale="m"
                type="button"
                width="auto"
              >
                {getResultsSource(resultsSource)}
              </CalciteButton>
              <CalciteDropdownGroup>
                <CalciteDropdownItem
                  selected={resultsSource === ResultsSource.LIVING_ATLAS}
                  onCalciteDropdownItemSelect={() =>
                    selectResultsSource(ResultsSource.LIVING_ATLAS)
                  }
                >
                  {getResultsSource(ResultsSource.LIVING_ATLAS)}
                </CalciteDropdownItem>
                <CalciteDropdownItem
                  selected={resultsSource === ResultsSource.ARCGIS_ONLINE}
                  onCalciteDropdownItemSelect={() =>
                    selectResultsSource(ResultsSource.ARCGIS_ONLINE)
                  }
                >
                  {getResultsSource(ResultsSource.ARCGIS_ONLINE)}
                </CalciteDropdownItem>
              </CalciteDropdownGroup>
            </CalciteDropdown>
          </div>
          <CalciteInput
            type="search"
            placeholder="Search"
            icon="search"
            className="p-3"
            value={resultsSearchValue}
            onCalciteInputInput={handleSearchResultsInput}
          />
          <CalciteProgress
            type="indeterminate"
            hidden={!isResultsQueryLoading}
          />
          <CalciteCardGroup
            label="Content Items"
            className="overflow-auto h-100"
          >
            {resultItems?.map((resultItem) => (
              <AddDataCard
                key={resultItem.id}
                item={resultItem}
                onAdd={addLayerFromPortalClick}
              />
            ))}
          </CalciteCardGroup>
          <CalcitePagination
            pageSize={RESULTS_PAGE_SIZE}
            startItem={resultsStart}
            totalItems={resultsTotal}
            className="justify-center py-3 border-t-1 border-color-1"
            onCalcitePaginationChange={handleResultsPaginationChange}
          />
        </div>
      </CalciteTab>
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
