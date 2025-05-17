import { EventName } from '@lit/react';

export type ArcGISLayer =
  | __esri.Layer
  | __esri.Sublayer
  | __esri.SubtypeSublayer
  | __esri.SubtypeGroupLayer;

export type AllArcGISLayer =
  | __esri.Sublayer
  | __esri.FeatureLayer
  | __esri.MapImageLayer
  | __esri.CSVLayer
  | __esri.TileLayer
  | __esri.WMSLayer
  | __esri.WebTileLayer
  | __esri.VectorTileLayer
  | __esri.ImageryLayer
  | __esri.SceneLayer
  | __esri.GroupLayer
  | __esri.GraphicsLayer
  | __esri.StreamLayer
  | __esri.GeoJSONLayer
  | __esri.KMLLayer;

export type EventNames = Record<string, EventName | string>;
export type ElementProps<I> = Partial<Omit<I, keyof HTMLElement>>;
export type EventListeners<R extends EventNames> = {
  [K in keyof R]?: R[K] extends EventName
    ? (e: R[K]['__eventType']) => void
    : (e: Event) => void;
};
export type ComponentProps<
  I,
  E extends EventNames = Record<string, EventName | string>
> = Omit<React.HTMLAttributes<I>, keyof E | keyof ElementProps<I>> &
  EventListeners<E> &
  ElementProps<I>;
