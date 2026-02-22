import { mapConfig } from "../api/config";

/** Convert grid coords (0-100) to [lat, lng]. y=0 is top (north), y=100 is bottom (south). */
export function gridToLatLng(x: number, y: number): [number, number] {
  const { south, north, west, east } = mapConfig.bounds;
  const lat = north - (y / 100) * (north - south);
  const lng = west + (x / 100) * (east - west);
  return [lat, lng];
}

/** Convert [lat, lng] to grid coords (0-100). */
export function latLngToGrid(lat: number, lng: number): { x: number; y: number } {
  const { south, north, west, east } = mapConfig.bounds;
  const x = Math.max(0, Math.min(100, ((lng - west) / (east - west)) * 100));
  const y = Math.max(0, Math.min(100, ((north - lat) / (north - south)) * 100));
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}
