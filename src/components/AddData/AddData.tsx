import esriConfig from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic';
import CSVLayer from '@arcgis/core/layers/CSVLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import Layer from '@arcgis/core/layers/Layer';
import Field from '@arcgis/core/layers/support/Field';
import PortalItem from '@arcgis/core/portal/PortalItem';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import UniqueValueInfo from '@arcgis/core/renderers/support/UniqueValueInfo';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import esriRequest from '@arcgis/core/request';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import {
  CalciteInputCustomEvent,
  CalcitePaginationCustomEvent
} from '@esri/calcite-components';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useAlertContext } from '../../contexts/AlertContext';
import { useValue } from '../../hooks';
import { AddDataCard } from './AddDataCard';
import {
  COMMUNITY_GROUPS_SERVICE_URL,
  CONTENT_GROUPS_SERVICE_URL,
  GENERATE_SERVICE_URL,
  RESULTS_FILTER,
  RESULTS_PAGE_SIZE,
  RESULTS_Q,
  SEARCH_SERVICE_URL
} from './constants';
import {
  convertFillSymbolStyle,
  convertLineSymbolStyle,
  convertMarkerSymbolStyle,
  readFileAsText
} from './functions';
import {
  AddDataProps,
  EsriFeatureCollection,
  ResultItem,
  ResultsSource
} from './types';

export function AddData(props: AddDataProps) {
  const alertContext = useAlertContext();

  const inputFileRef = useRef<HTMLInputElement>(null);

  const livingAtlasGroupId = useValue<string>('');
  const resultsSearchTimeout = useValue<NodeJS.Timeout | null>(null);

  const [, fileFormAction, isFileFormLoading] = useActionState<null, FormData>(
    async () => {
      const view = props.view;
      if (!view) {
        alertContext?.showDefaultErrorAlert();
        console.error('View is not defined.');
        return null;
      }
      const inputFileEl = inputFileRef.current;
      if (!inputFileEl) {
        alertContext?.showDefaultErrorAlert();
        console.error('Input file element is not defined.');
        return null;
      }
      const file = inputFileEl.files?.[0];
      if (!(file instanceof File) || file.size === 0) {
        alertContext?.showErrorAlert({
          title: 'Error',
          message: 'Please select a valid file.',
          icon: 'exclamation-mark-triangle'
        });
        return null;
      }
      switch (file.type) {
        case 'text/csv': {
          const layer = new CSVLayer({
            url: URL.createObjectURL(file)
          });
          view.map?.add(layer);
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
          const featureCollection: EsriFeatureCollection =
            response.data.featureCollection;
          const { layers, allGraphics } =
            buildLayersFromCollection(featureCollection);
          view.map?.addMany(layers);
          view.goTo(allGraphics);
          break;
        }
        case 'application/geo+json': {
          const layer = new GeoJSONLayer({
            url: URL.createObjectURL(file)
          });
          view.map?.add(layer);
          break;
        }
        case 'application/vnd.google-earth.kml+xml': {
          const kmlString = await readFileAsText(file);
          const query = {
            kmlString: encodeURIComponent(kmlString)
          };
          const response = await esriRequest(esriConfig.kmlServiceUrl, {
            query,
            responseType: 'json'
          });
          const featureCollection: EsriFeatureCollection =
            response.data.featureCollection;
          const { layers, allGraphics } =
            buildLayersFromCollection(featureCollection);
          view.map?.addMany(layers);
          view.goTo(allGraphics);
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
            const featureCollection: EsriFeatureCollection =
              response.data.featureCollection;
            const { layers, allGraphics } =
              buildLayersFromCollection(featureCollection);
            view.map?.addMany(layers);
            view.goTo(allGraphics);
          }
          break;
        }
        default: {
          alertContext?.showErrorAlert({
            title: 'Error',
            message: 'The file type is not supported.',
            icon: 'exclamation-mark-triangle'
          });
          return null;
        }
      }
      alertContext?.showSuccessAlert({
        title: 'Layer Added',
        message: 'The layer has been added to the map.',
        icon: 'layer',
        autoClose: true
      });
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
      const layer = await Layer.fromArcGISServerUrl({ url }).catch(() => {
        alertContext?.showErrorAlert({
          title: 'Error',
          message: 'The URL provided is invalid.',
          icon: 'exclamation-mark-triangle'
        });
      });
      if (!layer) {
        return null;
      }
      view.map?.add(layer);
      alertContext?.showSuccessAlert({
        title: 'Layer Added',
        message: 'The layer has been added to the map.',
        icon: 'layer',
        autoClose: true
      });
      await view.whenLayerView(layer);
      view.goTo(layer.fullExtent);
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

  const buildLayersFromCollection = (
    featureCollection: EsriFeatureCollection
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
      const esriRenderer = layer.layerDefinition.drawingInfo.renderer;
      let renderer:
        | __esri.SimpleRenderer
        | __esri.UniqueValueRenderer
        | undefined = undefined;
      switch (esriRenderer.type) {
        case 'simple': {
          renderer = new SimpleRenderer();
          const esriSymbol = esriRenderer.symbol;
          const { type: esriSymbolType, ...esriSymbolProps } = esriSymbol;
          switch (esriSymbolType) {
            case 'esriSMS': {
              const symbol = new SimpleMarkerSymbol({
                ...esriSymbolProps,
                style: convertMarkerSymbolStyle(esriSymbol.style)
              });
              renderer.symbol = symbol;
              break;
            }
            case 'esriPMS': {
              const symbol = new PictureMarkerSymbol({
                ...esriSymbolProps
              });
              renderer.symbol = symbol;
              break;
            }
            case 'esriSLS': {
              const symbol = new SimpleLineSymbol({
                ...esriSymbolProps,
                style: convertLineSymbolStyle(esriSymbol.style)
              });
              renderer.symbol = symbol;
              break;
            }
            case 'esriSFS': {
              const symbol = new SimpleFillSymbol({
                ...esriSymbolProps,
                style: convertFillSymbolStyle(esriSymbol.style)
              });
              renderer.symbol = symbol;
              break;
            }
            default: {
              break;
            }
          }
          break;
        }
        case 'uniqueValue': {
          renderer = new UniqueValueRenderer();
          renderer.defaultLabel = esriRenderer.defaultLabel;
          const esriDefaultSymbol = esriRenderer.defaultSymbol;
          const { type: esriDefaultSymbolType, ...esriDefaultSymbolProps } =
            esriDefaultSymbol;
          switch (esriDefaultSymbolType) {
            case 'esriSMS': {
              const symbol = new SimpleMarkerSymbol({
                ...esriDefaultSymbolProps,
                style: convertMarkerSymbolStyle(esriDefaultSymbol.style)
              });
              renderer.defaultSymbol = symbol;
              break;
            }
            case 'esriPMS': {
              const symbol = new PictureMarkerSymbol({
                ...esriDefaultSymbolProps
              });
              renderer.defaultSymbol = symbol;
              break;
            }
            case 'esriSLS': {
              const symbol = new SimpleLineSymbol({
                ...esriDefaultSymbolProps,
                style: convertLineSymbolStyle(esriDefaultSymbol.style)
              });
              renderer.defaultSymbol = symbol;
              break;
            }
            case 'esriSFS': {
              const symbol = new SimpleFillSymbol({
                ...esriDefaultSymbolProps,
                style: convertFillSymbolStyle(esriDefaultSymbol.style)
              });
              renderer.defaultSymbol = symbol;
              break;
            }
            default: {
              alertContext?.showDefaultErrorAlert();
              console.error('Invalid default symbol type.');
              break;
            }
          }
          renderer.field = esriRenderer.field1;
          renderer.uniqueValueInfos = esriRenderer.uniqueValueInfos.reduce(
            (acc: __esri.UniqueValueInfo[], uniqueValueInfo) => {
              const uniqueValueSymbol = uniqueValueInfo.symbol;
              const { type: uniqueValueSymbolType, ...uniqueValueSymbolProps } =
                uniqueValueSymbol;
              switch (uniqueValueSymbolType) {
                case 'esriSMS': {
                  const symbol = new SimpleMarkerSymbol({
                    ...uniqueValueSymbolProps,
                    style: convertMarkerSymbolStyle(uniqueValueSymbol.style)
                  });
                  acc.push(
                    new UniqueValueInfo({
                      label: uniqueValueInfo.label,
                      symbol,
                      value: uniqueValueInfo.value
                    })
                  );
                  break;
                }
                case 'esriPMS': {
                  const symbol = new PictureMarkerSymbol({
                    ...uniqueValueSymbolProps
                  });
                  acc.push(
                    new UniqueValueInfo({
                      label: uniqueValueInfo.label,
                      symbol,
                      value: uniqueValueInfo.value
                    })
                  );
                  break;
                }
                case 'esriSLS': {
                  const symbol = new SimpleLineSymbol({
                    ...uniqueValueSymbolProps,
                    style: convertLineSymbolStyle(uniqueValueSymbol.style)
                  });
                  acc.push(
                    new UniqueValueInfo({
                      label: uniqueValueInfo.label,
                      symbol,
                      value: uniqueValueInfo.value
                    })
                  );
                  break;
                }
                case 'esriSFS': {
                  const symbol = new SimpleFillSymbol({
                    ...uniqueValueSymbolProps,
                    style: convertFillSymbolStyle(uniqueValueSymbol.style)
                  });
                  acc.push(
                    new UniqueValueInfo({
                      label: uniqueValueInfo.label,
                      symbol,
                      value: uniqueValueInfo.value
                    })
                  );
                  break;
                }
                default: {
                  alertContext?.showDefaultErrorAlert();
                  console.error('Invalid unique value symbol type.');
                  break;
                }
              }
              return acc;
            },
            []
          );
          break;
        }
        default: {
          alertContext?.showDefaultErrorAlert();
          console.error('Invalid renderer type.');
          break;
        }
      }
      const popupTemplate = layer.popupInfo
        ? {
            title: layer.popupInfo.title,
            content: layer.popupInfo.description
          }
        : undefined;
      const spatialReference = layer.featureSet.spatialReference;
      let geometryType: __esri.FeatureLayer['geometryType'] | undefined =
        undefined;
      switch (layer.featureSet.geometryType) {
        case 'esriGeometryMultipoint':
          geometryType = 'multipoint';
          break;
        case 'esriGeometryPoint':
          geometryType = 'point';
          break;
        case 'esriGeometryPolygon':
          geometryType = 'polygon';
          break;
        case 'esriGeometryPolyline':
          geometryType = 'polyline';
          break;
        default: {
          alertContext?.showDefaultErrorAlert();
          console.error('Invalid geometry type.');
          break;
        }
      }
      const featureLayer = new FeatureLayer({
        title,
        objectIdField,
        source,
        fields,
        renderer,
        popupTemplate,
        spatialReference,
        geometryType
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
    view.map?.add(layer);
    await view.whenLayerView(layer);
    if (layer.type === 'group') {
      const groupLayer = layer as __esri.GroupLayer;
      const layers = groupLayer.allLayers;
      const fullExtentList = await Promise.all(
        layers.map(async (layer) => {
          await view.whenLayerView(layer);
          return layer.fullExtent;
        })
      );
      if (fullExtentList.length === 0) {
        alertContext?.showDefaultErrorAlert();
        console.error('No full extents found.');
        return;
      }
      const fullExtent = fullExtentList.reduce((acc, extent) => {
        return extent ? acc?.union(extent) : acc;
      });
      view.goTo(fullExtent);
    } else {
      view.goTo(layer.fullExtent);
    }
    target.loading = false;
    target.disabled = false;
    alertContext?.showSuccessAlert({
      title: 'Layer Added',
      message: `The layer "${item.title}" has been added to the map.`,
      icon: 'layer',
      autoClose: true
    });
  };
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
        const currLivingAtlasGroupId = livingAtlasGroupId.get();
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
        alertContext?.showDefaultErrorAlert();
        console.error('Invalid source.');
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
  const handleResultsPaginationChange = (
    event: CalcitePaginationCustomEvent<void>
  ) => {
    const currLivingAtlasGroupId = livingAtlasGroupId.get();
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
    const currLivingAtlasGroupId = livingAtlasGroupId.get();
    if (!currLivingAtlasGroupId) {
      // Handle error
      return;
    }
    setResultsStart(1);
    const currResultsSearchTimeout = resultsSearchTimeout.get();
    if (currResultsSearchTimeout) clearTimeout(currResultsSearchTimeout);
    const newResultsSearchTimeout = setTimeout(() => {
      fetchResults(resultsSource, {
        q: `${RESULTS_Q} ${searchValue}`
      });
    }, 500);
    resultsSearchTimeout.set(newResultsSearchTimeout);
  };
  const getResultsSource = (source: string) => {
    switch (source) {
      case ResultsSource.LIVING_ATLAS:
        return 'Living Atlas';
      case ResultsSource.ARCGIS_ONLINE:
        return 'ArcGIS Online';
      default:
        alertContext?.showDefaultErrorAlert();
        console.error('Invalid source.');
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
      const communityGroupsResponse = await esriRequest(
        COMMUNITY_GROUPS_SERVICE_URL,
        {
          query: communityGroupsQuery,
          signal
        }
      ).catch((error) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }
      });
      if (!communityGroupsResponse) {
        return;
      }
      const newLivingAtlasGroupId = communityGroupsResponse.data.results[0].id;
      livingAtlasGroupId.set(newLivingAtlasGroupId);
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
    <calcite-tabs
      layout="center"
      className="h-full"
    >
      <calcite-tab-nav slot="title-group">
        <calcite-tab-title>Portal</calcite-tab-title>
        <calcite-tab-title>File</calcite-tab-title>
        <calcite-tab-title>URL</calcite-tab-title>
      </calcite-tab-nav>
      <calcite-tab>
        <div className="flex h-full flex-col">
          <div className="flex justify-center py-1">
            <calcite-dropdown
              maxItems={0}
              overlayPositioning="absolute"
              placement="bottom-start"
              type="click"
              width-scale="m"
              scale="m"
            >
              <calcite-button
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
              </calcite-button>
              <calcite-dropdown-group>
                <calcite-dropdown-item
                  selected={resultsSource === ResultsSource.LIVING_ATLAS}
                  oncalciteDropdownItemSelect={() =>
                    selectResultsSource(ResultsSource.LIVING_ATLAS)
                  }
                >
                  {getResultsSource(ResultsSource.LIVING_ATLAS)}
                </calcite-dropdown-item>
                <calcite-dropdown-item
                  selected={resultsSource === ResultsSource.ARCGIS_ONLINE}
                  oncalciteDropdownItemSelect={() =>
                    selectResultsSource(ResultsSource.ARCGIS_ONLINE)
                  }
                >
                  {getResultsSource(ResultsSource.ARCGIS_ONLINE)}
                </calcite-dropdown-item>
              </calcite-dropdown-group>
            </calcite-dropdown>
          </div>
          <calcite-input
            type="search"
            placeholder="Search"
            icon="search"
            className="p-2.5"
            value={resultsSearchValue}
            oncalciteInputInput={handleSearchResultsInput}
          />
          <calcite-progress
            type="indeterminate"
            hidden={!isResultsQueryLoading}
          />
          <calcite-card-group
            label="Content Items"
            className="mb-3 h-full overflow-auto px-3 pb-2"
          >
            {resultItems?.map((resultItem) => (
              <AddDataCard
                key={resultItem.id}
                item={resultItem}
                onAdd={addLayerFromPortalClick}
              />
            ))}
          </calcite-card-group>
          <calcite-pagination
            pageSize={RESULTS_PAGE_SIZE}
            startItem={resultsStart}
            totalItems={resultsTotal}
            className="justify-center border-t border-color-1 py-2"
            oncalcitePaginationChange={handleResultsPaginationChange}
          />
        </div>
      </calcite-tab>
      <calcite-tab>
        <form
          className="p-3"
          action={fileFormAction}
        >
          <calcite-label>
            Select File
            {/*
              // TODO: Replace this with CalciteInput when the bug has been fixed
              // TODO: (https://github.com/Esri/calcite-design-system/issues/9319) 
            */}
            <input
              ref={inputFileRef}
              type="file"
              accept=".csv,.zip,.geojson,.kml,.gpx"
              className="box-border flex h-8 w-full cursor-pointer border border-dashed bg-foreground-1 px-3 py-1 focus:focus-normal"
            />
          </calcite-label>
          <calcite-button
            type="submit"
            width="full"
            disabled={isFileFormLoading}
            loading={isFileFormLoading}
          >
            Add Layer
          </calcite-button>
        </form>
      </calcite-tab>
      <calcite-tab>
        <form
          className="p-3"
          action={urlFormAction}
        >
          <calcite-label>
            Enter URL
            <calcite-input
              type="url"
              required
              name="url"
            />
          </calcite-label>
          <calcite-button
            type="submit"
            disabled={isUrlFormLoading}
            width="full"
            loading={isUrlFormLoading}
          >
            Add Layer
          </calcite-button>
        </form>
      </calcite-tab>
    </calcite-tabs>
  );
}

export default AddData;
