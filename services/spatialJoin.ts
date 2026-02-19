import type { GeoPoint } from "../types";
import type { GeoJsonGeometry, GeoJsonPolygon } from "./parcelResolution";

export type BoundingBox = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

export type SpatialJoinResult = {
  matched: boolean;
  reason?: "bbox_miss" | "geometry_miss";
};

export const pointInRing = (point: GeoPoint, ring: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = ((yi > point.lat) !== (yj > point.lat))
      && (point.lon < (xj - xi) * (point.lat - yi) / (yj - yi + Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

export const pointInPolygon = (point: GeoPoint, polygon: GeoJsonPolygon) => {
  if (polygon.coordinates.length === 0) return false;
  const outer = polygon.coordinates[0];
  if (!pointInRing(point, outer)) return false;
  for (let i = 1; i < polygon.coordinates.length; i += 1) {
    if (pointInRing(point, polygon.coordinates[i])) return false;
  }
  return true;
};

export const pointInGeometry = (point: GeoPoint, geometry?: GeoJsonGeometry) => {
  if (!geometry) return false;
  if (geometry.type === "Polygon") return pointInPolygon(point, geometry);
  return geometry.coordinates.some((poly) => pointInPolygon(point, { type: "Polygon", coordinates: poly }));
};

export const bboxFromGeometry = (geometry: GeoJsonGeometry): BoundingBox | null => {
  const coords: [number, number][] = [];
  const pushRing = (ring: [number, number][]) => ring.forEach((coord) => coords.push(coord));

  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach(pushRing);
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((poly) => poly.forEach(pushRing));
  }

  if (coords.length === 0) return null;
  const lons = coords.map((coord) => coord[0]);
  const lats = coords.map((coord) => coord[1]);
  return {
    minLon: Math.min(...lons),
    minLat: Math.min(...lats),
    maxLon: Math.max(...lons),
    maxLat: Math.max(...lats)
  };
};

export const pointWithinBBox = (point: GeoPoint, bbox: BoundingBox) => {
  return point.lon >= bbox.minLon && point.lon <= bbox.maxLon && point.lat >= bbox.minLat && point.lat <= bbox.maxLat;
};

export const spatialJoin = (point: GeoPoint, geometry?: GeoJsonGeometry): SpatialJoinResult => {
  if (!geometry) return { matched: false, reason: "geometry_miss" };
  const bbox = bboxFromGeometry(geometry);
  if (bbox && !pointWithinBBox(point, bbox)) return { matched: false, reason: "bbox_miss" };
  const matched = pointInGeometry(point, geometry);
  return { matched, reason: matched ? undefined : "geometry_miss" };
};

export const MAX_LOCAL_SPATIAL_JOIN_FEATURES = 500;
