import React, { useEffect, useState, useCallback } from 'react'
import MapDisplay from './components/MapDisplay'
import UnitPanel from './components/UnitPanel'
import api from './services/api'

export default function App() {
  const [unit, setUnit] = useState(null)
  const [assignMode, setAssignMode] = useState(false)
  const [mapClickCoords, setMapClickCoords] = useState(null)
  const [unitPreviewCoords, setUnitPreviewCoords] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const unitData = await api.getUnit()
      setUnit(unitData)
    } catch (err) {
      console.error('Error fetching unit data', err)
      setError(err?.message || 'Failed to load unit data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [])

  const handleMapClick = (coords) => {
    if (assignMode) {
      setMapClickCoords(coords)
      setUnitPreviewCoords(coords)
    }
  }

  const handleCancelAssign = () => {
    setAssignMode(false)
    setMapClickCoords(null)
    setUnitPreviewCoords(null)
  }

  return (
    <div className="app-root">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', }}>
        <div>
          <h1>Unit Dashboard</h1>
          <div className="header-sub">Unit status & location</div>
        </div>
        <button className="btn secondary" onClick={refresh} style={{ marginLeft: 'auto' }}>Refresh</button>
      </header>

      <div className="two-column">
        <div className="left-col">
          <MapDisplay
            units={unit ? [unit] : []}
            unitPreviewCoords={unitPreviewCoords}
            onMapClick={handleMapClick}
          />
        </div>

        <div className="right-col panels">
          {loading && (
            <div className="panel" style={{ color: '#64748b', fontSize: 14 }}>Loading unit data…</div>
          )}
          {!loading && error && (
            <div className="panel" style={{ color: '#dc2626', fontSize: 14 }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          {!loading && !error && (
            <UnitPanel
              unit={unit}
              onRefresh={refresh}
              selectedLocation={mapClickCoords}
              onStartAssign={() => setAssignMode(true)}
              onCancelAssign={handleCancelAssign}
              onDisplayCoordsChange={setUnitPreviewCoords}
              isAssigning={assignMode}
            />
          )}
        </div>
      </div>
    </div>
  )
}