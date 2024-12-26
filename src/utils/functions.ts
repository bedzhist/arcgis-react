export function isLayerTypeOneOf<T extends __esri.Layer | __esri.Sublayer>(
  layer: T,
  layerTypes: T['type'][]
): boolean {
  return layerTypes.includes(layer.type);
}
