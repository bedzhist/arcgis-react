import { EsriSMSStyle, EsriSLSStyle, EsriSFSStyle } from './types';

export const convertMarkerSymbolStyle = (symbolStyle: EsriSMSStyle) => {
  let style: __esri.SimpleMarkerSymbol['style'] | null = null;
  switch (symbolStyle) {
    case 'esriSMSCircle':
      style = 'circle';
      break;
    case 'esriSMSCross':
      style = 'cross';
      break;
    case 'esriSMSDiamond':
      style = 'diamond';
      break;
    case 'esriSMSSquare':
      style = 'square';
      break;
    case 'esriSMSTriangle':
      style = 'triangle';
      break;
    case 'esriSMSX':
      style = 'x';
      break;
  }
  return style;
};
export const convertLineSymbolStyle = (symbolStyle: EsriSLSStyle) => {
  let style: __esri.SimpleLineSymbol['style'] | null = null;
  switch (symbolStyle) {
    case 'esriSLSSolid':
      style = 'solid';
      break;
    case 'esriSLSDash':
      style = 'dash';
      break;
    case 'esriSLSDashDot':
      style = 'dash-dot';
      break;
    case 'esriSLSDashDotDot':
      style = 'dash-dot';
      break;
    case 'esriSLSDot':
      style = 'dot';
      break;
    case 'esriSLSLongDash':
      style = 'long-dash';
      break;
    case 'esriSLSLongDashDot':
      style = 'long-dash-dot';
      break;
    case 'esriSLSNull':
      style = 'none';
      break;
    case 'esriSLSShortDash':
      style = 'short-dash';
      break;
    case 'esriSLSShortDashDot':
      style = 'short-dash-dot';
      break;
    case 'esriSLSShortDashDotDot':
      style = 'short-dash-dot-dot';
      break;
    case 'esriSLSShortDot':
      style = 'short-dot';
      break;
  }
  return style;
};
export const convertFillSymbolStyle = (symbolStyle: EsriSFSStyle) => {
  let style: __esri.SimpleFillSymbol['style'] | null = null;
  switch (symbolStyle) {
    case 'esriSFSSolid':
      style = 'solid';
      break;
    case 'esriSFSForwardDiagonal':
      style = 'forward-diagonal';
      break;
    case 'esriSFSBackwardDiagonal':
      style = 'backward-diagonal';
      break;
    case 'esriSFSCross':
      style = 'cross';
      break;
    case 'esriSFSDiagonalCross':
      style = 'diagonal-cross';
      break;
    case 'esriSFSHorizontal':
      style = 'horizontal';
      break;
    case 'esriSFSVertical':
      style = 'vertical';
      break;
  }
  return style;
};
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
