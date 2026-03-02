import React, { useEffect, useState, useCallback, useRef } from 'react'
import MapDisplay from './components/MapDisplay'
import IncidentPanel from './components/IncidentPanel'
import api from './services/api'

export default function App() {
  const [incidents, setIncidents] = useState([])
  const [openIncident, setOpenIncident] = useState(null)
  const [units, setUnits] = useState([])
  const [assignMode, setAssignMode] = useState(false)
  const [mapClickCoords, setMapClickCoords] = useState(null)
  const [displayCoords, setDisplayCoords] = useState(null)

  const openIncidentRef = useRef(openIncident)
  useEffect(() => {
    openIncidentRef.current = openIncident
  }, [openIncident])

  const refresh = useCallback(async () => {
    try {
      const [incList, open, unitList] = await Promise.all([
        api.getIncidents(),
        api.getOpenIncident(),
        api.getUnitsOpenIncident(),
      ])
      setIncidents(incList || [])
      setOpenIncident(open)
      setUnits(unitList || [])
    } catch (err) {
      console.error('Error fetching data', err)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    const poll = async () => {
      if (!openIncidentRef.current) return
      try {
        const [incList, open, unitList] = await Promise.all([
          api.getIncidents(),
          api.getOpenIncident(),
          api.getUnitsOpenIncident(),
        ])
        setIncidents(incList || [])
        setOpenIncident(open)
        setUnits(unitList || [])
      } catch {
        setUnits([])
      }
    }
    const id = setInterval(poll, 1000)
    return () => clearInterval(id)
  }, [])

  const handleMapClick = (coords) => {
    if (assignMode) setMapClickCoords(coords)
  }

  const handleIncidentCreated = () => {
    setAssignMode(false)
    setMapClickCoords(null)
    setDisplayCoords(null)
    refresh()
  }

  return (
    <div className="app-root">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h1>CR Dashboard</h1>
          <div className="header-sub">Incident & Vehicle monitoring</div>
        </div>
        <button className="btn secondary" onClick={refresh} style={{ marginLeft: 'auto' }}>Refresh</button>
      </header>

      <div className="two-column">
        <div className="left-col">
          <MapDisplay
            incidents={incidents}
            units={units}
            selectedIncident={openIncident}
            displayCoords={displayCoords}
            onMapClick={handleMapClick}
          />
        </div>

        <div className="right-col panels">
          <IncidentPanel
            openIncident={openIncident}
            units={units}
            onRefresh={refresh}
            selectedLocation={mapClickCoords}
            onStartAssign={() => setAssignMode(true)}
            onCancelAssign={() => { setAssignMode(false); setMapClickCoords(null); setDisplayCoords(null) }}
            onCreated={handleIncidentCreated}
            onDisplayCoordsChange={setDisplayCoords}
            isAssigning={assignMode}
          />
        </div>
      </div>
    </div>
  )
}