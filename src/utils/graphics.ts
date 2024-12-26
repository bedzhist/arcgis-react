import Graphic from "@arcgis/core/Graphic";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

export const createPointGraphic = (
  point: __esri.Point,
  color: string | number[] = 'red',
  size: number = 3
) => {
  const symbol = new SimpleMarkerSymbol({
    color,
    size
  });
  return new Graphic({
    geometry: point,
    symbol
  });
}

export const createPolylineGraphic = (
  polyline: __esri.Polyline,
  color: string | number[] = 'red'
) => {
  const symbol = new SimpleLineSymbol({
    color,
  });
  return new Graphic({
    geometry: polyline,
    symbol
  });
}

export const createPolygonGraphic = (
  polygon: __esri.Polygon,
  color: string | number[] = 'red'
) => {
  const symbol = new SimpleFillSymbol({
    color,
  });
  return new Graphic({
    geometry: polygon,
    symbol
  });
}