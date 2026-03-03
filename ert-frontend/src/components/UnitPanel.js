import React, { useEffect, useState } from 'react'
import api from '../services/api'

const iconStyle = { width: 16, height: 16, flexShrink: 0 }
const Icon = ({ children }) => <span style={{ display: 'inline-flex', alignItems: 'center' }}>{children}</span>

const MapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const Pencil = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
)
const CheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const CoordBoxes = ({ vals, onChange }) => (
  <div style={{ display: 'flex', gap: 12 }}>
    {['lat', 'lng'].map((axis) => (
      <div key={axis} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <label style={{ fontSize: 12, marginBottom: 4, fontWeight: 600 }}>{axis === 'lat' ? 'Latitude' : 'Longitude'}</label>
        <input
          type="number"
          step="0.00001"
          className="form-input"
          style={{ width: '100%', height: 80, textAlign: 'center', fontSize: 16, fontWeight: 700 }}
          value={vals[axis]}
          onChange={(e) => onChange(axis, parseFloat(e.target.value) || 0)}
        />
      </div>
    ))}
  </div>
)

// Haversine formula — accurate real-world distance in meters between two lat/lng points
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000 // Earth radius in metres
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const RESOLVE_MIN_DISTANCE_M = 50

export default function UnitPanel({ unit, onRefresh, selectedLocation, onStartAssign, onCancelAssign, onDisplayCoordsChange, isAssigning = false }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ lat: 0, lng: 0 })
  const [incidentLocation, setIncidentLocation] = useState(null)

  // Poll incident location every 3s
  useEffect(() => {
    const fetchInc = async () => {
      try {
        const loc = await api.getIncidentLocation()
        setIncidentLocation(loc)
      } catch (e) { console.error(e) }
    }
    fetchInc()
    const id = setInterval(fetchInc, 3000)
    return () => clearInterval(id)
  }, [])

  // Sync map-picked coords into edit form
  useEffect(() => {
    if (selectedLocation && isEditing)
      setEditForm({ lat: selectedLocation.lat, lng: selectedLocation.lng })
  }, [selectedLocation, isEditing])

  // Tell parent what to preview on map while editing
  useEffect(() => {
    if (isEditing) onDisplayCoordsChange?.({ lat: editForm.lat, lng: editForm.lng })
    else onDisplayCoordsChange?.(null)
  }, [isEditing, editForm.lat, editForm.lng])

  const startEdit = () => {
    setEditForm({
      lat: unit.location?.lat ?? unit.lat ?? 0,
      lng: unit.location?.lng ?? unit.lng ?? 0,
    })
    setIsEditing(true)
  }

  const saveEdit = async () => {
    try {
      await api.updateUnit(unit.id, { lat: editForm.lat, lng: editForm.lng })
      setIsEditing(false)
      onRefresh?.()
    } catch (e) { console.error(e) }
  }

  const resolve = async () => {
    try {
      await api.resolveUnit(unit.id)
      onRefresh?.()
    } catch (e) { console.error(e) }
  }

  if (!unit) return null

  const unitLat = unit.location?.lat ?? unit.lat ?? 0
  const unitLng = unit.location?.lng ?? unit.lng ?? 0
  const incLat = incidentLocation?.location?.lat ?? incidentLocation?.lat
  const incLng = incidentLocation?.location?.lng ?? incidentLocation?.lng

  const distanceM = (incLat !== undefined && incLng !== undefined)
    ? Math.round(haversineMeters(unitLat, unitLng, incLat, incLng))
    : null

  const isFarEnough = distanceM !== null && distanceM >= RESOLVE_MIN_DISTANCE_M

  return (
    <div className="panel">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ margin: 0 }}>Unit</h3>
          <span style={{ background: '#16a34a', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, letterSpacing: 0.5 }}>
            {(unit.status || 'ACTIVE').toUpperCase()}
          </span>
        </div>

        {isEditing ? (
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid #e2e8f0' }}>
            <CoordBoxes vals={editForm} onChange={(axis, val) => setEditForm((f) => ({ ...f, [axis]: val }))} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className={`btn ${isAssigning ? 'danger' : 'secondary'}`} style={{ width: '100%' }} onClick={() => isAssigning ? onCancelAssign?.() : onStartAssign?.()}>
                {isAssigning ? 'Cancel map pick' : 'Assign from map'}
              </button>
              <button className="btn primary" style={{ width: '100%' }} onClick={saveEdit}>Save</button>
              <button className="btn" style={{ width: '100%' }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
              <Icon><MapPin /></Icon>
              <span style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>ID: {unit.id}</span>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Latitude</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{unitLat.toFixed(5)}</div>
              </div>
              <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Longitude</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{unitLng.toFixed(5)}</div>
              </div>
            </div>

            {/* Distance badge — only shown when incident location is known */}
            {distanceM !== null && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: isFarEnough ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${isFarEnough ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: 8, padding: '8px 12px', fontSize: 12,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={isFarEnough ? '#16a34a' : '#dc2626'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ color: isFarEnough ? '#15803d' : '#dc2626', fontWeight: 600 }}>
                  {isFarEnough
                    ? `${distanceM}m from incident — ready to resolve`
                    : `${distanceM}m from incident — move ${RESOLVE_MIN_DISTANCE_M}m+ away to resolve`}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="btn secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                onClick={startEdit}
              >
                <Pencil /> Update Location
              </button>
              <button
                className="btn primary"
                disabled={!isFarEnough}
                onClick={isFarEnough ? resolve : undefined}
                title={!isFarEnough
                  ? `Unit must be at least ${RESOLVE_MIN_DISTANCE_M}m from the incident (currently ${distanceM ?? '?'}m)`
                  : 'Resolve incident'}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                  opacity: isFarEnough ? 1 : 0.45,
                  cursor: isFarEnough ? 'pointer' : 'not-allowed',
                }}
              >
                <CheckCircle /> Resolve
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}