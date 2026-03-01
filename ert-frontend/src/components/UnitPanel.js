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
    {['x', 'y'].map((axis) => (
      <div key={axis} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <label style={{ fontSize: 12, marginBottom: 4, fontWeight: 600 }}>{axis.toUpperCase()}</label>
        <input
          type="number"
          className="form-input"
          style={{ width: '100%', height: 80, textAlign: 'center', fontSize: 20, fontWeight: 700 }}
          value={vals[axis]}
          onChange={(e) => onChange(axis, parseFloat(e.target.value) || 0)}
        />
      </div>
    ))}
  </div>
)

export default function UnitPanel({ unit, onRefresh, selectedLocation, onStartAssign, onCancelAssign, onDisplayCoordsChange, isAssigning = false }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (selectedLocation && isEditing)
      setEditForm({ x: selectedLocation.x, y: selectedLocation.y })
  }, [selectedLocation, isEditing])

  useEffect(() => {
    if (isEditing) onDisplayCoordsChange?.({ x: editForm.x, y: editForm.y })
    else onDisplayCoordsChange?.(null)
  }, [isEditing, editForm.x, editForm.y])

  const startEdit = () => {
    setEditForm({ x: unit.location?.x ?? unit.x ?? 0, y: unit.location?.y ?? unit.y ?? 0 })
    setIsEditing(true)
  }

  const saveEdit = async () => {
    try {
      await api.updateUnit(unit.id, editForm)
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>X Coordinate</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{(unit.location?.x ?? unit.x ?? 0).toFixed(2)}</div>
              </div>
              <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Y Coordinate</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{(unit.location?.y ?? unit.y ?? 0).toFixed(2)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }} onClick={startEdit}>
                <Pencil /> Update Location
              </button>
              <button className="btn primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }} onClick={resolve}>
                <CheckCircle /> Resolve
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}