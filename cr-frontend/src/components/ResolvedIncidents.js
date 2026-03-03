import React, { useState } from 'react'

const getLoc = (obj) => {
  if (!obj) return null
  const x = obj.location?.x ?? obj.x
  const y = obj.location?.y ?? obj.y
  if (x === undefined || y === undefined) return null
  return { x, y }
}

const formatDate = (val) => {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleString()
}

export default function ResolvedIncidents({ incidents = [], onViewOnMap, onDelete }) {
  const [search, setSearch] = useState('')

  const resolved = incidents
    .filter((i) => i.status === 'resolved')
    .filter((i) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        String(i.id).toLowerCase().includes(q) ||
        String(i.title ?? '').toLowerCase().includes(q)
      )
    })

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Resolved Incidents</span>
          <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 99, padding: '1px 10px', fontSize: 12, fontWeight: 600 }}>
            {resolved.length}
          </span>
        </div>
        <input
          type="text"
          placeholder="Search by ID or title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, width: 200, outline: 'none' }}
        />
      </div>

      {resolved.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
          No resolved incidents found.
        </div>
      ) : (
        <div style={{ overflowY: 'auto', maxHeight: 420 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['ID / Title', 'Location', 'Created', 'Resolved', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resolved.map((inc, idx) => {
                const loc = getLoc(inc)
                return (
                  <tr
                    key={inc.id}
                    style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                  >
                    <td style={{ padding: '9px 12px', fontWeight: 600, color: '#1e293b' }}>
                      <div>{inc.title ?? `Incident`}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>#{inc.id}</div>
                    </td>
                    <td style={{ padding: '9px 12px', color: '#475569', fontFamily: 'monospace', fontSize: 12 }}>
                      {loc
                        ? <><div>x: {loc.x.toFixed(3)}</div><div>y: {loc.y.toFixed(3)}</div></>
                        : <span style={{ color: '#cbd5e1' }}>—</span>
                      }
                    </td>
                    <td style={{ padding: '9px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {formatDate(inc.created_at ?? inc.createdAt ?? inc.created)}
                    </td>
                    <td style={{ padding: '9px 12px', color: '#16a34a', whiteSpace: 'nowrap' }}>
                      {formatDate(inc.resolved_at ?? inc.resolvedAt ?? inc.resolved)}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => onViewOnMap?.(inc)}
                          title="View on map"
                          style={{ padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                            <line x1="9" y1="3" x2="9" y2="18"/>
                            <line x1="15" y1="6" x2="15" y2="21"/>
                          </svg>
                          Map
                        </button>
                        <button
                          onClick={() => onDelete?.(inc)}
                          title="Delete"
                          style={{ padding: '4px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}