import { setAssetPath } from '@esri/calcite-components/dist/components';
import { defineCustomElements } from '@esri/calcite-components/dist/loader';

setAssetPath(location.href);
defineCustomElements(window);
