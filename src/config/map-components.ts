import { setAssetPath } from '@arcgis/map-components';
import { defineCustomElements } from '@arcgis/map-components/loader';

setAssetPath(location.href);
defineCustomElements(window);
