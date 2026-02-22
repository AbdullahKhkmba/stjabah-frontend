import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Incident } from "./types";
import { apiConfig, mapConfig } from "../api/config";
import { fetchUnits, type OpenIncidentUnit } from "../api/incidents";
import { gridToLatLng, latLngToGrid } from "../utils/map-coords";

/** Fetch road route from OSRM between two [lat, lng] points. Returns polyline coords for Leaflet. */
async function fetchRoute(
  from: [number, number],
  to: [number, number]
): Promise<[number, number][] | null> {
  const [fromLat, fromLng] = from;
  const [toLat, toLng] = to;
  const url = `${apiConfig.osrm}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]?.geometry?.coordinates?.length) return null;
    // GeoJSON uses [lng, lat], Leaflet needs [lat, lng]
    return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
  } catch {
    return null;
  }
}

// Fix default Leaflet marker icons (broken in webpack/vite)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const incidentIcon = L.divIcon({
  className: "incident-marker",
  html: `<div style="
    width: 32px; height: 32px;
    background: #dc2626; border: 3px solid white;
    border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
  ">
    <div style="
      width: 8px; height: 8px; background: white; border-radius: 50%;
    "></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const unitIcon = L.divIcon({
  className: "unit-marker",
  html: `<div style="
    width: 28px; height: 28px;
    background: #2563eb; border: 2px solid white;
    border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/** Icon for live ERT units from API (x=lng, y=lat) */
const liveUnitIcon = L.divIcon({
  className: "live-unit-marker",
  html: `<div style="
    width: 24px; height: 24px;
    background: #059669; border: 2px solid white;
    border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface FactoryMapProps {
  incident: Incident | null;
  incidentHistory?: Incident[];
  onMapClick?: (x: number, y: number) => void;
}

export function FactoryMap({ incident, incidentHistory = [], onMapClick }: FactoryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const routeRunIdRef = useRef(0);
  const onMapClickRef = useRef(onMapClick);
  const [liveUnits, setLiveUnits] = useState<OpenIncidentUnit[]>([]);
  onMapClickRef.current = onMapClick;

  // Poll units every second when there's an active incident
  useEffect(() => {
    if (!incident) {
      setLiveUnits([]);
      return;
    }
    const load = async () => {
      try {
        const units = await fetchUnits();
        setLiveUnits(units);
      } catch (e) {
        console.error("Failed to fetch units:", e);
      }
    };
    load();
    const interval = setInterval(load, 1000);
    return () => clearInterval(interval);
  }, [incident?.id]);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(mapConfig.center, mapConfig.zoom);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Click handler
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handler = (e: L.LeafletMouseEvent) => {
      const cb = onMapClickRef.current;
      if (!cb) return;
      const { lat, lng } = e.latlng;
      const { x, y } = latLngToGrid(lat, lng);
      cb(x, y);
    };

    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, []);

  // Update markers and routes when incident/history/units changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers and polylines
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];

    const thisRunId = ++routeRunIdRef.current;

    const addMarker = (pos: [number, number], icon: L.DivIcon | L.Icon, content: string) => {
      const marker = L.marker(pos, { icon }).addTo(map);
      marker.bindPopup(content);
      markersRef.current.push(marker);
    };

    // Active incident
    if (incident) {
      const pos = gridToLatLng(incident.x, incident.y);
      const popup = `
        <div class="font-semibold text-red-700">Active Incident</div>
        <div class="text-sm">ID: ${incident.id}</div>
        <div class="text-sm text-gray-600">Grid: (${incident.x}, ${incident.y})</div>
        ${incident.units?.length ? `<div class="mt-2 text-xs">Units: ${incident.units.map((u) => u.name).join(", ")}</div>` : ""}
      `;
      addMarker(pos, incidentIcon, popup);

      // Response units
      incident.units?.forEach((unit) => {
        const unitPos = gridToLatLng(unit.x, unit.y);
        const unitPopup = `
          <div class="font-semibold text-blue-700">${unit.name}</div>
          <div class="text-sm">Grid: (${unit.x}, ${unit.y})</div>
        `;
        addMarker(unitPos, unitIcon, unitPopup);
      });
    }

    // Resolved incidents (history)
    incidentHistory
      .filter((i) => i.status === "resolved")
      .forEach((inc) => {
        const pos = gridToLatLng(inc.x, inc.y);
        const popup = `
          <div class="font-semibold text-green-700">Resolved Incident</div>
          <div class="text-sm">ID: ${inc.id}</div>
          <div class="text-sm text-gray-600">Grid: (${inc.x}, ${inc.y})</div>
        `;
        addMarker(pos, defaultIcon, popup);
      });
    // Live ERT units from API (x=lng, y=lat → Leaflet [lat, lng])
    liveUnits.forEach((unit) => {
      const pos: [number, number] = [unit.y, unit.x];
      const popup = `
        <div class="font-semibold text-emerald-700">${unit.id}</div>
        <div class="text-sm">Status: ${unit.status}</div>
        <div class="text-sm text-gray-600">Position: (${unit.x.toFixed(4)}, ${unit.y.toFixed(4)})</div>
      `;
      addMarker(pos, liveUnitIcon, popup);
    });

    // Draw OSRM road routes: incident → each unit (liveUnits preferred, else incident.units)
    const incidentPos = incident ? gridToLatLng(incident.x, incident.y) : null;
    const unitsToRoute = liveUnits.length
      ? liveUnits.map((u) => ({ pos: [u.y, u.x] as [number, number], id: u.id }))
      : incident?.units?.map((u) => ({ pos: gridToLatLng(u.x, u.y), id: u.id ?? u.name })) ?? [];

    if (incidentPos && unitsToRoute.length > 0) {
      unitsToRoute.forEach(({ pos, id }) => {
        fetchRoute(incidentPos, pos).then((coords) => {
          if (thisRunId !== routeRunIdRef.current) return; // stale - newer effect run in progress
          const m = mapInstanceRef.current;
          if (!m || !coords?.length) return;
          const polyline = L.polyline(coords, {
            color: "#2563eb",
            weight: 4,
            opacity: 0.7,
            dashArray: "8, 8",
          }).addTo(m);
          polyline.bindPopup(`Route to ${id}`);
          polylinesRef.current.push(polyline);
        });
      });
    }
  }, [incident, incidentHistory, liveUnits]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Factory Map (OSM)</h2>

      <div className="rounded-lg overflow-hidden border-2 border-gray-200" style={{ height: "600px" }}>
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <div className="mt-2 text-sm text-gray-600">
        Zoomed to configured location. Click map to place incident (when creating).
      </div>
    </div>
  );
}
