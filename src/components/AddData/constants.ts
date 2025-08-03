import esriConfig from '@arcgis/core/config';

export const GENERATE_SERVICE_URL = `${esriConfig.portalUrl}/sharing/rest/content/features/generate`;
export const COMMUNITY_GROUPS_SERVICE_URL = `${esriConfig.portalUrl}/sharing/rest/community/groups`;
export const CONTENT_GROUPS_SERVICE_URL = `${esriConfig.portalUrl}/sharing/rest/content/groups`;
export const SEARCH_SERVICE_URL = `${esriConfig.portalUrl}/sharing/rest/search`;
export const RESULTS_PAGE_SIZE = 10;
export const RESULTS_FILTER =
  '(type:"Map Service" OR type:"Image Service" OR type:"Feature Service" OR type:"Vector Tile Service" OR type:"OGCFeatureServer" OR type:"WMS" OR type:"WFS" OR type:"WMTS" OR type:"KML" OR type: "Stream Service" OR type: "Feed" OR type:"Media Layer" OR type:"Group Layer" OR type:"GeoJson" OR type:"Knowledge Graph Service" OR type:"Knowledge Graph Layer" OR (type: "Feature Service" AND typekeywords: "OrientedImageryLayer") OR (type: "Feature Service" AND typekeywords: "CatalogLayer") OR (type:"Feature Collection" AND typekeywords:"Route Layer") OR (type:"Feature collection" AND typekeywords:"Markup")) -typekeywords: "Table"';
export const RESULTS_Q =
  '(-typekeywords:"Elevation 3D Layer" AND -typekeywords:"IndoorPositioningDataService" AND -typekeywords:"Requires Subscription" AND -typekeywords:"Requires Credits") -typekeywords:("MapAreaPackage") -type:("Map Area" OR "Indoors Map Configuration" OR "Code Attachment")';
export const ARCGIS_ITEM_TYPE_LOGO_BASE_URL =
  'https://www.arcgis.com/apps/mapviewer/arcgis-app-assets/assets/arcgis-item-type/';
export const ARCGIS_ITEM_TYPE_SVG = {
  FEATURE: 'featureshosted16.svg',
  MAP_IMAGE: 'mapimages16.svg',
  GROUP: 'layergroup2d16.svg',
  TILE: 'vectortile16.svg',
  IMAGERY: 'imagery16.svg',
  GEOJSON: 'data16.svg',
  MEDIA: 'medialayer16.svg',
  KML: 'features16.svg'
};
export const USER_SERVICE_URL = `${esriConfig.portalUrl}/sharing/rest/community/users`;
export const DEFAULT_RESULTS_THUMBNAIL_URL =
  'https://www.arcgis.com/apps/mapviewer/node_modules/@arcgis/app-components/dist/arcgis-app/assets/arcgis-item-thumbnail/default_thumb.png';
