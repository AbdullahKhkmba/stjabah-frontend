import React, { useEffect, useRef, useState } from 'react'
import api from '../services/api'

const getLoc = (obj) => {
  if (!obj) return null
  const x = obj.location?.x ?? obj.x
  const y = obj.location?.y ?? obj.y
  if (x === undefined || y === undefined) return null
  return { x, y }
}

export default function MapDisplay({ units = [], unitPreviewCoords, onMapClick }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({ incident: null, unit: null })
  const routesRef = useRef([])
  const [routesVisible, setRoutesVisible] = useState(false)
  const [incidentLocation, setIncidentLocation] = useState(null)
  const clickHandlerRef = useRef(onMapClick)
  const unitPreviewCoordsRef = useRef(unitPreviewCoords)
  const unitsRef = useRef(units)

  useEffect(() => { clickHandlerRef.current = onMapClick }, [onMapClick])
  useEffect(() => { unitPreviewCoordsRef.current = unitPreviewCoords }, [unitPreviewCoords])
  useEffect(() => { unitsRef.current = units }, [units])

  const CENTER = [30.063584, 31.488994]
  const ZOOM = 15

  const normToLatLng = (norm) => {
    if (!norm || norm.x === undefined || norm.y === undefined) return null
    return [CENTER[0] + (0.5 - norm.y) * 0.1, CENTER[1] + (norm.x - 0.5) * 0.1]
  }

  const latLngToNorm = (lat, lng) => ({
    x: parseFloat(Math.max(0, Math.min(1, 0.5 + (lng - CENTER[1]) / 0.1)).toFixed(4)),
    y: parseFloat(Math.max(0, Math.min(1, 0.5 - (lat - CENTER[0]) / 0.1)).toFixed(4)),
  })

  const createIncidentIcon = () => {
    if (!window.L) return null
    return window.L.divIcon({
      html: `<div style="display:flex;justify-content:center;align-items:center;width:32px;height:32px">
        <svg viewBox="0 0 32 32" width="28" height="28" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25))">
          <circle cx="16" cy="16" r="14" fill="#dc2626" stroke="#fff" stroke-width="2"/>
          <path fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" d="M16 9v8"/>
          <circle cx="16" cy="21" r="1.5" fill="#fff"/>
        </svg>
      </div>`,
      className: 'incident-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
  }

  const createUnitIcon = () => {
    if (!window.L) return null
    return window.L.divIcon({
      html: `<div style="width:24px;height:24px;display:flex;justify-content:center;align-items:center">
        <div style="width:22px;height:22px;background:#16a34a;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;justify-content:center;align-items:center">
          <span style="font-size:12px">🚗</span>
        </div>
      </div>`,
      className: 'vehicle-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  const clearRoutes = () => {
    routesRef.current.forEach(({ route, label }) => { route?.remove?.(); label?.remove?.() })
    routesRef.current = []
  }

  const drawRoute = (fromLatLng, toLatLng) => {
    if (!window.L || !mapInstanceRef.current) return
    const L = window.L
    const map = mapInstanceRef.current
    const color = '#16a34a'
    fetch(`https://router.project-osrm.org/route/v1/driving/${fromLatLng[1]},${fromLatLng[0]};${toLatLng[1]},${toLatLng[0]}?overview=full&geometries=geojson`)
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 'Ok') {
          const route = data.routes[0]
          const line = L.polyline(route.geometry.coordinates.map((c) => [c[1], c[0]]), { color, weight: 4, opacity: 0.7, dashArray: '10, 10' }).addTo(map)
          const distKm = (route.distance / 1000).toFixed(2)
          const label = L.marker(fromLatLng, {
            icon: L.divIcon({ html: `<div style="background:white;border:2px solid ${color};border-radius:4px;padding:2px 6px;font-size:11px;font-weight:bold;color:${color}">${distKm} km</div>`, className: 'route-label', iconSize: [60, 20], iconAnchor: [30, 10] })
          }).addTo(map)
          routesRef.current.push({ route: line, label })
        } else {
          const line = L.polyline([fromLatLng, toLatLng], { color: '#94a3b8', weight: 2, opacity: 0.5, dashArray: '5, 5' }).addTo(map)
          routesRef.current.push({ route: line, label: null })
        }
      })
      .catch(() => {
        const line = window.L.polyline([fromLatLng, toLatLng], { color: '#94a3b8', weight: 2, opacity: 0.5, dashArray: '5, 5' }).addTo(mapInstanceRef.current)
        routesRef.current.push({ route: line, label: null })
      })
  }

  const resetMap = () => {
    mapInstanceRef.current?.setView(CENTER, ZOOM)
    clearRoutes()
    setRoutesVisible(false)
  }

  // Poll incident location every 3s
  useEffect(() => {
    const fetch = async () => setIncidentLocation(await api.getIncidentLocation())
    fetch()
    const id = setInterval(fetch, 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (window.L?.map) { initMap(); return }
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if (!window.L) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      document.head.appendChild(script)
    }

    function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return
      const L = window.L
      const map = L.map(mapRef.current).setView(CENTER, ZOOM)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap | OSRM', maxZoom: 19 }).addTo(map)
      map.on('click', (e) => clickHandlerRef.current?.(latLngToNorm(e.latlng.lat, e.latlng.lng)))
      mapInstanceRef.current = map
      setTimeout(updateMarkers, 100)
    }

    return () => {
      clearRoutes()
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
    }
  }, [])

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return
    const L = window.L
    const map = mapInstanceRef.current
    const markers = markersRef.current

    markers.incident?.remove?.()
    markers.unit?.remove?.()
    markers.incident = null
    markers.unit = null

    // Incident marker — always from fetched incidentLocation
    const incLoc = getLoc(incidentLocation)
    const incPos = incLoc ? normToLatLng(incLoc) : null
    if (incPos) {
      const m = L.marker(incPos, { icon: createIncidentIcon() }).addTo(map)
      m.bindPopup(`<div style="font-weight:bold;color:#dc2626">Incident</div><div style="font-size:11px;color:#666">x: ${incLoc.x.toFixed(3)} y: ${incLoc.y.toFixed(3)}</div>`)
      markers.incident = m
    }

    // Unit marker — use preview coords when editing, otherwise real unit location
    const currentUnits = unitsRef.current
    const unitSource = unitPreviewCoordsRef.current ?? (currentUnits[0] ? getLoc(currentUnits[0]) : null)
    const unitPos = unitSource ? normToLatLng(unitSource) : null
    if (unitPos) {
      const m = L.marker(unitPos, { icon: createUnitIcon() }).addTo(map)
      m.bindPopup(`<div style="font-weight:bold;color:#16a34a">🚗 ${currentUnits[0]?.id ?? 'Unit'}</div><div style="font-size:11px;color:#666">x: ${unitSource.x.toFixed(3)} y: ${unitSource.y.toFixed(3)}</div>`)
      markers.unit = m
    }

    clearRoutes()
    if (routesVisible && incPos && unitPos) drawRoute(unitPos, incPos)
  }

  // Live-move unit marker when preview coords change (map pick)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return
    const preview = unitPreviewCoordsRef.current
    if (preview) {
      const pos = normToLatLng(preview)
      if (markersRef.current.unit) {
        markersRef.current.unit.setLatLng(pos)
      } else {
        // Create unit marker for the first time without touching incident marker
        const m = window.L.marker(pos, { icon: createUnitIcon() }).addTo(mapInstanceRef.current)
        m.bindPopup(`<div style="font-weight:bold;color:#16a34a">🚗 ${unitsRef.current[0]?.id ?? 'Unit'}</div>`)
        markersRef.current.unit = m
      }
    }
  }, [unitPreviewCoords])

  useEffect(() => {
    if (mapInstanceRef.current && window.L) updateMarkers()
  }, [units, incidentLocation, routesVisible])

  return (
    <div className="map-container panel">
      <div ref={mapRef} style={{ width: '100%', height: 520, minHeight: 520 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: 12, color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => { setRoutesVisible((v) => !v); if (routesVisible) clearRoutes() }}
            style={{ padding: '4px 12px', background: routesVisible ? '#ef4444' : '#16a34a', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
            {routesVisible ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3"/></svg>
            )}
            {routesVisible ? 'Hide Route' : 'Show Route'}
          </button>
          <button onClick={resetMap}
            style={{ padding: '4px 12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reset Map
          </button>
          <span style={{ fontStyle: 'italic', marginLeft: 8 }}>
            {routesVisible && selectedIncident
              ? `Routes from ${units.length} unit${units.length !== 1 ? 's' : ''} to incident`
              : 'Show routes to incident location'}
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          OSRM | 🚗 {units.length} | 🚨 {incidentLocation ? 1 : 0}
        </span>
      </div>
    </div>
  )
}