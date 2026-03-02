import React, { useEffect, useRef, useState } from 'react'

const getLoc = (obj) => {
  if (!obj) return null
  const x = obj.location?.x ?? obj.x
  const y = obj.location?.y ?? obj.y
  if (x === undefined || y === undefined) return null
  return { x, y }
}

export default function MapDisplay({
  incidents = [],
  units = [],
  selectedIncident,
  displayCoords,
  onMapClick,
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({ incidents: {}, units: {} })
  const routesRef = useRef([])
  const [routesVisible, setRoutesVisible] = useState(false)
  const clickHandlerRef = useRef(onMapClick)

  useEffect(() => { clickHandlerRef.current = onMapClick }, [onMapClick])

  const CENTER = [30.063584, 31.488994]
  const ZOOM = 15

  const normToLatLng = (norm) => {
    if (!norm || norm.x === undefined || norm.y === undefined) return null
    const latOffset = (0.5 - norm.y) * 0.1
    const lngOffset = (norm.x - 0.5) * 0.1
    return [CENTER[0] + latOffset, CENTER[1] + lngOffset]
  }

  const latLngToNorm = (lat, lng) => {
    const latOffset = lat - CENTER[0]
    const lngOffset = lng - CENTER[1]
    const x = 0.5 + (lngOffset / 0.1)
    const y = 0.5 - (latOffset / 0.1)
    return {
      x: parseFloat(Math.max(0, Math.min(1, x)).toFixed(4)),
      y: parseFloat(Math.max(0, Math.min(1, y)).toFixed(4)),
    }
  }

  const createIncidentIcon = () => {
    if (!window.L) return null
    return window.L.divIcon({
      html: `
        <div class="incident-pulse" style="display:flex;justify-content:center;align-items:center;width:32px;height:32px">
          <svg viewBox="0 0 32 32" width="28" height="28" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25))">
            <circle cx="16" cy="16" r="14" fill="#dc2626" stroke="#fff" stroke-width="2"/>
            <path fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" d="M16 9v8"/>
            <circle cx="16" cy="21" r="1.5" fill="#fff"/>
          </svg>
        </div>
      `,
      className: 'incident-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
  }

  const createUnitIcon = () => {
    if (!window.L) return null
    return window.L.divIcon({
      html: `
        <div style="position:relative;width:24px;height:24px;display:flex;justify-content:center;align-items:center">
          <div style="width:22px;height:22px;background:#3b82f6;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;justify-content:center;align-items:center">
            <span style="font-size:12px">🚗</span>
          </div>
        </div>
      `,
      className: 'vehicle-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  const drawRoute = (fromLatLng, toLatLng, color = '#3b82f6', label = '') => {
    if (!window.L || !mapInstanceRef.current) return
    const L = window.L
    const map = mapInstanceRef.current
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromLatLng[1]},${fromLatLng[0]};${toLatLng[1]},${toLatLng[0]}?overview=full&geometries=geojson`

    fetch(osrmUrl)
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 'Ok') {
          const route = data.routes[0]
          const coords = route.geometry.coordinates.map((c) => [c[1], c[0]])
          const line = L.polyline(coords, { color, weight: 4, opacity: 0.7, dashArray: '10, 10' }).addTo(map)
          const distKm = (route.distance / 1000).toFixed(2)
          const labelMarker = L.marker(fromLatLng, {
            icon: L.divIcon({
              html: `<div style="background:white;border:2px solid ${color};border-radius:4px;padding:2px 6px;font-size:11px;font-weight:bold;color:${color}">${distKm} km</div>`,
              className: 'route-label',
              iconSize: [60, 20],
              iconAnchor: [30, 10],
            }),
          }).addTo(map)
          routesRef.current.push({ route: line, label: labelMarker })
        } else {
          const line = L.polyline([fromLatLng, toLatLng], { color: '#94a3b8', weight: 2, opacity: 0.5, dashArray: '5, 5' }).addTo(map)
          routesRef.current.push({ route: line, label: null })
        }
      })
      .catch(() => {
        const line = L.polyline([fromLatLng, toLatLng], { color: '#94a3b8', weight: 2, opacity: 0.5, dashArray: '5, 5' }).addTo(map)
        routesRef.current.push({ route: line, label: null })
      })
  }

  const clearRoutes = () => {
    routesRef.current.forEach(({ route, label }) => {
      if (route?.remove) route.remove()
      if (label?.remove) label.remove()
    })
    routesRef.current = []
  }

  const drawRoutes = () => {
    if (!selectedIncident || !units.length) return
    const incLoc = getLoc(selectedIncident)
    const incLatLng = incLoc ? normToLatLng(incLoc) : null
    if (!incLatLng) return
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
    units.forEach((u, i) => {
      const loc = getLoc(u)
      const latLng = loc ? normToLatLng(loc) : null
      if (latLng) drawRoute(latLng, incLatLng, colors[i % colors.length], u.id)
    })
  }

  const resetMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(CENTER, ZOOM)
      clearRoutes()
      setRoutesVisible(false)
    }
  }

  useEffect(() => {
    if (window.L && window.L.map) {
      initMap()
    } else {
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
        script.onerror = () => console.error('Failed to load Leaflet')
        document.head.appendChild(script)
      }
    }

    function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return
      const L = window.L
      const map = L.map(mapRef.current).setView(CENTER, ZOOM)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap | OSRM',
        maxZoom: 19,
      }).addTo(map)
      map.on('click', (e) => {
        const norm = latLngToNorm(e.latlng.lat, e.latlng.lng)
        clickHandlerRef.current?.(norm)
      })
      mapInstanceRef.current = map
      setTimeout(updateMarkers, 100)
    }

    return () => {
      clearRoutes()
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return
    const L = window.L
    const map = mapInstanceRef.current
    const markers = markersRef.current

    Object.values(markers.incidents).forEach((m) => m?.remove?.())
    Object.values(markers.units).forEach((m) => m?.remove?.())
    markers.incidents = {}
    markers.units = {}

    const incidentIcon = createIncidentIcon()

    if (displayCoords) {
      const pos = normToLatLng(displayCoords)
      if (pos && incidentIcon) {
        const m = L.marker(pos, { icon: incidentIcon }).addTo(map)
        m.bindPopup(`<div style="font-weight:bold;color:#dc2626">Incident</div><div style="font-size:11px;color:#666">x: ${(displayCoords.x ?? 0).toFixed(3)} y: ${(displayCoords.y ?? 0).toFixed(3)}</div>`)
        markers.incidents['display'] = m
      }
    } else {
      // ✅ Fixed: show all non-resolved incidents regardless of specific status string
      const activeIncidents = incidents.filter((i) => i.status !== 'resolved')
      console.log('Rendering incidents:', activeIncidents) // remove once confirmed working
      activeIncidents.forEach((inc) => {
        const loc = getLoc(inc)
        const pos = loc ? normToLatLng(loc) : null
        if (pos && incidentIcon) {
          const marker = L.marker(pos, { icon: incidentIcon }).addTo(map)
          marker.bindPopup(`
            <div style="font-weight:bold;color:#dc2626">Incident</div>
            <div>Status: ${inc.status}</div>
            <div style="font-size:11px;color:#666">x: ${(loc?.x ?? 0).toFixed(3)} y: ${(loc?.y ?? 0).toFixed(3)}</div>
          `)
          markers.incidents[inc.id] = marker
        }
      })
    }

    const unitIcon = createUnitIcon()
    units.forEach((u) => {
      const loc = getLoc(u)
      const pos = loc ? normToLatLng(loc) : null
      if (pos && unitIcon) {
        const marker = L.marker(pos, { icon: unitIcon }).addTo(map)
        marker.bindPopup(`
          <div style="font-weight:bold;color:#3b82f6">🚗 ${u.id}</div>
          <div style="font-size:11px;color:#666">x: ${(loc?.x ?? 0).toFixed(3)} y: ${(loc?.y ?? 0).toFixed(3)}</div>
        `)
        markers.units[u.id] = marker
      }
    })

    clearRoutes()
    if (routesVisible && selectedIncident && units.length > 0) drawRoutes()
  }

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !displayCoords) return
    const m = markersRef.current.incidents['display']
    if (m) {
      const pos = normToLatLng(displayCoords)
      if (pos) m.setLatLng(pos)
    } else {
      updateMarkers()
    }
  }, [displayCoords])

  useEffect(() => {
    if (mapInstanceRef.current && window.L) updateMarkers()
  }, [incidents, units, selectedIncident, routesVisible])

  const activeCount = incidents.filter((i) => i.status !== 'resolved').length

  return (
    <div className="map-container panel">
      <div ref={mapRef} style={{ width: '100%', height: 520, minHeight: 520 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: 12, color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => { setRoutesVisible((v) => !v); if (routesVisible) clearRoutes() }}
            style={{ padding: '4px 12px', background: routesVisible ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {routesVisible ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3"/></svg>
            )}
            {routesVisible ? 'Hide Routes' : 'Show Routes'}
          </button>
          <button
            onClick={resetMap}
            style={{ padding: '4px 12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reset Map
          </button>
          <span style={{ fontStyle: 'italic', marginLeft: 8 }}>
            {routesVisible && selectedIncident
              ? `Routes from ${units.length} unit${units.length !== 1 ? 's' : ''} to incident`
              : 'Show routes for unit paths'}
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          OSRM | 🚗 {units.length} | 🚨 {activeCount ? 1 : 0}
        </span>
      </div>
    </div>
  )
}