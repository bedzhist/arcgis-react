import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
import * as geodesicUtils from '@arcgis/core/geometry/support/geodesicUtils';

type AxisUnit = 'meters' | 'kilometers';

interface EllipseProperties {
  center: Point;
  semiXAxis: number;
  semiYAxis: number;
  orientation?: number;
  axisUnit?: AxisUnit;
  numberOfPoints?: number;
  geodesic?: boolean;
}

/**
 * Represents an Ellipse geometry.
 */
export class Ellipse extends Polygon {
  private static readonly K = 8.946573850543412 / 1000000;

  private readonly _center: Point;
  private readonly _semiXAxis: number;
  private readonly _semiYAxis: number;
  private readonly _orientation: number;
  private readonly _axisUnit: AxisUnit;
  private readonly _numberOfPoints: number;
  private readonly _geodesic: boolean;

  /**
   * Creates a new Ellipse instance.
   * @param center - The center point of the ellipse.
   * @param semiXAxis - The semi-major axis length of the ellipse.
   * @param semiYAxis - The semi-minor axis length of the ellipse.
   * @param orientation - The orientation angle of the ellipse in degrees.
   * @param axisUnit - The unit of measurement for the axis lengths.
   * @param numberOfPoints - The number of points used to approximate the ellipse.
   * @param geodesic - Indicates whether the ellipse should be geodesic or not.
   * @throws Error if the spatial reference of the center point is invalid.
   * @throws Error if the axis unit is invalid.
   */
  constructor({
    center,
    semiXAxis,
    semiYAxis,
    orientation = 0,
    axisUnit = 'meters',
    numberOfPoints = 60,
    geodesic = false
  }: EllipseProperties) {
    if (!center.spatialReference.isWGS84 && !center.spatialReference.isWebMercator) {
      throw new Error('Invalid spatial reference');
    }
    super();
    this._center = center;
    this._semiXAxis = semiXAxis;
    this._semiYAxis = semiYAxis;
    this._orientation = orientation;
    this._axisUnit = axisUnit;
    this._numberOfPoints = numberOfPoints;
    this._geodesic = geodesic;
    this.spatialReference = center.spatialReference;

    let metersSemiXAxis: number = semiXAxis;
    let metersSemiYAxis: number = semiYAxis;
    switch (axisUnit) {
      case 'meters':
        break;
      case 'kilometers':
        metersSemiXAxis = semiXAxis * 1000;
        metersSemiYAxis = semiYAxis * 1000;
        break;
      default:
        throw new Error('Invalid axis unit');
    }
    const radOrientation = (orientation * Math.PI) / 180;

    if (geodesic) {
      const angleStep = 360 / numberOfPoints;
      const ring = [];
      const geographicCenter = this.spatialReference.isWGS84 ? center : webMercatorUtils.webMercatorToGeographic(center) as Point;
      for (let angle = 0; angle <= 360; angle += angleStep) {
        const radAngle = (angle * Math.PI) / 180;
        const x =
          metersSemiXAxis * Math.cos(radAngle) * Math.cos(radOrientation) -
          metersSemiYAxis * Math.sin(radAngle) * Math.sin(radOrientation);
        const y =
          metersSemiXAxis * Math.cos(radAngle) * Math.sin(radOrientation) +
          metersSemiYAxis * Math.sin(radAngle) * Math.cos(radOrientation);
        const radius = Math.sqrt(x * x + y * y);
        const point = [0, 0];
        const centerCoordinates = [geographicCenter.x, geographicCenter.y];
        const newAngle = Math.atan2(y, x) * 180 / Math.PI;
        const geodesicAngle = ((90 - newAngle) % 360);
        // @ts-expect-error - TS doesn't know about directGeodeticSolver yet
        geodesicUtils.directGeodeticSolver(point, centerCoordinates, geodesicAngle, radius, SpatialReference.WGS84);
        ring.push(point);
      }

      let parsedRing = ring;
      if (this.spatialReference.isWebMercator) {
        parsedRing = ring.map((point) => {
          const p1 = webMercatorUtils.lngLatToXY(point[0], point[1]);
          return [p1[0], p1[1]];
        });
      }
      this.addRing(parsedRing);
    }
    else {
      const angleStep = 360 / numberOfPoints;
      const ring = [];
      const parsedSemiXAxis = this.spatialReference.isWGS84 ? metersSemiXAxis * Ellipse.K : metersSemiXAxis;
      const parsedSemiYAxis = this.spatialReference.isWGS84 ? metersSemiYAxis * Ellipse.K : metersSemiYAxis;
      for (let angle = 0; angle <= 360; angle += angleStep) {
        const radAngle = (angle * Math.PI) / 180;
        const x =
          center.x +
          parsedSemiXAxis * Math.cos(radAngle) * Math.cos(radOrientation) -
          parsedSemiYAxis * Math.sin(radAngle) * Math.sin(radOrientation);
        const y =
          center.y +
          parsedSemiXAxis * Math.cos(radAngle) * Math.sin(radOrientation) +
          parsedSemiYAxis * Math.sin(radAngle) * Math.cos(radOrientation);
        ring.push([x, y]);
      }
      ring.push(ring[0]);
      this.addRing(ring);
    }
  }

  /**
   * Gets the center point of the ellipse.
   */
  get center() {
    return this._center;
  }

  /**
   * Gets the semi-major axis length of the ellipse.
   */
  get semiXAxis() {
    return this._semiXAxis;
  }

  /**
   * Gets the semi-minor axis length of the ellipse.
   */
  get semiYAxis() {
    return this._semiYAxis;
  }

  /**
   * Gets the orientation angle of the ellipse in degrees.
   */
  get orientation() {
    return this._orientation;
  }

  /**
   * Gets the unit of measurement for the axis lengths.
   */
  get axisUnit() {
    return this._axisUnit;
  }

  /**
   * Gets the number of points used to approximate the ellipse.
   */
  get numberOfPoints() {
    return this._numberOfPoints;
  }

  /**
   * Indicates whether the ellipse is geodesic or not.
   */
  get geodesic() {
    return this._geodesic;
  }
}

/**
 * Converts degrees to radians.
 * @param degrees - The angle in degrees.
 * @returns The angle in radians.
 */
export function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 * @param radians - The angle in radians.
 * @returns The angle in degrees.
 */
export function radToDeg(radians: number) {
  return (radians * 180) / Math.PI;
}

// TODO: Remove this and replace with a new Rectangle class
/**
 * Creates a geodesic rectangle polygon based on the provided parameters.
 * @param center - The center point of the rectangle.
 * @param width - The width of the rectangle.
 * @param height - The height of the rectangle.
 * @param orientation - The orientation angle of the rectangle in degrees.
 * @param maxSegmentLength - The maximum segment length for densifying the resulting polygon. Defaults to 1000 * 10.
 * @returns The geodesic rectangle polygon.
 */
export const createGeodedicRectangle = (
  center: Point,
  width: number,
  height: number,
  orientation: number,
  maxSegmentLength: number = 1000 * 10
) => {
  const v1 = [0, 0];
  const v2 = [0, 0];
  const v3 = [0, 0];
  const v4 = [0, 0];
  const a1 = radToDeg(Math.atan2(width, height)) - orientation;
  const a2 = radToDeg(Math.atan2(width, -height)) - orientation;
  const a3 = radToDeg(Math.atan2(-width, -height)) - orientation;
  const a4 = radToDeg(Math.atan2(-width, height)) - orientation;
  const r = Math.sqrt(width * width + height * height);
  // @ts-expect-error - TS doesn't know about directGeodeticSolver yet
  geodesicUtils.directGeodeticSolver(
    v1,
    [center.x, center.y],
    a1,
    r,
    SpatialReference.WGS84
  );
  // @ts-expect-error - TS doesn't know about directGeodeticSolver yet
  geodesicUtils.directGeodeticSolver(
    v2,
    [center.x, center.y],
    a2,
    r,
    SpatialReference.WGS84
  );
  // @ts-expect-error - TS doesn't know about directGeodeticSolver yet
  geodesicUtils.directGeodeticSolver(
    v3,
    [center.x, center.y],
    a3,
    r,
    SpatialReference.WGS84
  );
  // @ts-expect-error - TS doesn't know about directGeodeticSolver yet
  geodesicUtils.directGeodeticSolver(
    v4,
    [center.x, center.y],
    a4,
    r,
    SpatialReference.WGS84
  );
  const polygon = new Polygon({
    rings: [
      [
        [v1[0], v1[1]],
        [v2[0], v2[1]],
        [v3[0], v3[1]],
        [v4[0], v4[1]],
        [v1[0], v1[1]]
      ]
    ]
  });
  const rectangle = geodesicUtils.geodesicDensify(
    polygon,
    maxSegmentLength
  ) as Polygon;
  return rectangle;
};