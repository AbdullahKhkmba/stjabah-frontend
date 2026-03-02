import React, { useEffect, useState } from 'react'
import api from '../services/api'

const iconStyle = { width: 16, height: 16, flexShrink: 0 }
const Icon = ({ children }) => <span style={{ display: 'inline-flex', alignItems: 'center' }}>{children}</span>
const Clock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
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
const Send = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
    <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
  </svg>
)
const Trash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

const formatTime = (iso) => {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

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

export default function IncidentPanel({
  openIncident,
  units = [],
  onRefresh,
  selectedLocation,
  onStartAssign,
  onCancelAssign,
  onCreated,
  onDisplayCoordsChange,
  isAssigning = false,
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ x: 0, y: 0 })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ x: 0, y: 0 })

const incident = openIncident?.status === 'resolved' ? null : openIncident

  useEffect(() => {
    if (selectedLocation) setForm({ x: selectedLocation.x, y: selectedLocation.y })
  }, [selectedLocation])

  useEffect(() => {
    if (selectedLocation && editingId) setEditForm({ x: selectedLocation.x, y: selectedLocation.y })
  }, [selectedLocation, editingId])

  useEffect(() => {
    if (isCreating) onDisplayCoordsChange?.({ x: form.x, y: form.y })
    else if (editingId) onDisplayCoordsChange?.({ x: editForm.x, y: editForm.y })
    else onDisplayCoordsChange?.(null)
  }, [isCreating, editingId, form.x, form.y, editForm.x, editForm.y])

  const create = async () => {
    try {
      await api.createIncident(form)
      setIsCreating(false)
      setForm({ x: 0, y: 0 })
      onRefresh?.()
      onCreated?.()
    } catch (e) {
      console.error(e)
    }
  }

  const startEdit = () => {
    setEditingId(incident.id)
    setEditForm({
      x: incident.location?.x ?? incident.x ?? 0,
      y: incident.location?.y ?? incident.y ?? 0,
    })
  }

  const saveEdit = async () => {
    try {
      await api.updateIncident(incident.id, editForm)
      setEditingId(null)
      onRefresh?.()
    } catch (e) {
      console.error(e)
    }
  }

  const remove = async () => {
    try {
      await api.deleteIncident(incident.id)
      setEditingId(null)
      onRefresh?.()
      onCreated?.()
    } catch (e) {
      console.error(e)
    }
  }

  const dispatch = async () => {
    try {
      await api.dispatchIncident()
      onRefresh?.()
    } catch (e) {
      console.error(e)
    }
  }

  const isEditing = editingId === incident?.id

  return (
    <div className="panel">
      {!incident && !isCreating && (
        <>
          <h3 style={{ marginBottom: 12 }}>Active Incident</h3>
          <button
            className="btn primary"
            style={{ width: '100%' }}
            onClick={() => setIsCreating(true)}
          >
            + New Incident
          </button>
        </>
      )}

      {isCreating && (
        <>
          <h3 style={{ marginBottom: 12 }}>Active Incident</h3>
          <div
            style={{
              background: '#f9fafb',
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              border: '1px solid #e2e8f0',
            }}
          >
          <CoordBoxes vals={form} onChange={(axis, val) => setForm((f) => ({ ...f, [axis]: val }))} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              className={`btn ${isAssigning ? 'danger' : 'secondary'}`}
              style={{ width: '100%' }}
              onClick={() => (isAssigning ? onCancelAssign?.() : onStartAssign?.())}
            >
              {isAssigning ? 'Cancel map pick' : 'Assign from map'}
            </button>
            <button className="btn primary" style={{ width: '100%' }} onClick={create}>
              Create
            </button>
            <button
              className="btn"
              style={{ width: '100%' }}
              onClick={() => {
                setIsCreating(false)
                onCreated?.()
              }}
            >
              Cancel
            </button>
          </div>
        </div>
        </>
      )}

      {incident && !isCreating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ margin: 0 }}>Active Incident</h3>
            <span
              style={{
                background: incident.status === 'resolved' ? '#16a34a' : '#f97316',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 6,
                letterSpacing: 0.5,
              }}
            >
              {(incident.status || 'ACTIVE').toUpperCase()}
            </span>
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <CoordBoxes
                vals={editForm}
                onChange={(axis, val) => setEditForm((f) => ({ ...f, [axis]: val }))}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  className={`btn ${isAssigning ? 'danger' : 'secondary'}`}
                  style={{ width: '100%' }}
                  onClick={() => (isAssigning ? onCancelAssign?.() : onStartAssign?.())}
                >
                  {isAssigning ? 'Cancel map pick' : 'Assign from map'}
                </button>
                <button className="btn primary" style={{ width: '100%' }} onClick={saveEdit}>
                  Save
                </button>
                <button className="btn" style={{ width: '100%' }} onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                <Icon><Clock /></Icon>
                <span>{formatTime(incident.created_at)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                <Icon><MapPin /></Icon>
                <span style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>ID: {incident.id}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>X Coordinate</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{(incident.location?.x ?? incident.x ?? 0).toFixed(2)}</div>
                </div>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Y Coordinate</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{(incident.location?.y ?? incident.y ?? 0).toFixed(2)}</div>
                </div>
              </div>
              {units.length > 0 && (
                <div style={{ fontSize: 12, color: '#6b7280' }}>{units.length} assigned unit{units.length !== 1 ? 's' : ''}</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }} onClick={startEdit}>
                  <Pencil /> Update Location
                </button>
                <button className="btn primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }} onClick={dispatch}>
                  <Send /> Dispatch Units
                </button>
                <button className="btn danger" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }} onClick={remove}>
                  <Trash /> Delete Incident
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
