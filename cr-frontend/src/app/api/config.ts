/**
 * !TODO: Better to be gloabally configured to prevent code duplication
 * 
 */
const baseUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5001";
const crPath = "/cr";

/** Map center [lat, lng] and zoom for OSM - configurable per deployment */
export const mapConfig = {
  center: [25.0, 55.1] as [number, number],
  zoom: 18,
  /** Bounds for grid 0-100 mapping: [south, west, north, east] */
  bounds: {
    south: 24.998,
    west: 55.098,
    north: 25.002,
    east: 55.102,
  },
} as const;

export const apiConfig = {
  baseUrl,
  cr: {
    base: `${baseUrl}${crPath}`,
    openIncident: `${baseUrl}${crPath}/incidents/open`,
    createIncident: `${baseUrl}${crPath}/incidents`,
    deleteIncident: `${baseUrl}${crPath}/incidents`,
    dispatchIncident: `${baseUrl}${crPath}/incidents/dispatch`,
    updateIncident: `${baseUrl}${crPath}/incidents`,
    getUnits: `${baseUrl}${crPath}/units/open_incident`,
  },
  /** OSRM public routing API (road-aware routing) */
  osrm: "https://router.project-osrm.org",
} as const;
