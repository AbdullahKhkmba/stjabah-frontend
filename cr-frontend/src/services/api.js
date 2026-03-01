import axios from 'axios'

const BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:5001/cr'

// Adapters: control_room uses flat {x, y}; frontend expects {location: {x, y}}
export const toIncident = (inc) =>
  inc ? { ...inc, location: { x: inc.x ?? 0, y: inc.y ?? 0 } } : null

export const toUnit = (u) =>
  u ? { ...u, location: { x: u.x ?? 0, y: u.y ?? 0 } } : null

export const toIncidentList = (data) =>
  (Array.isArray(data) ? data : []).map(toIncident)

export const toUnitList = (data) =>
  (Array.isArray(data) ? data : []).map(toUnit)

const raw = {
  getIncidents: () => axios.get(`${BASE}/incidents`),
  getIncident: (id) => axios.get(`${BASE}/incidents/${id}`),
  getOpenIncident: () => axios.get(`${BASE}/incidents/open`),
  createIncident: (body) => axios.post(`${BASE}/incidents`, body),
  updateIncident: (id, body) => axios.put(`${BASE}/incidents/${id}`, body),
  deleteIncident: (id) => axios.delete(`${BASE}/incidents/${id}`),
  dispatchIncident: () => axios.post(`${BASE}/incidents/dispatch`),
  getUnitsOpenIncident: () => axios.get(`${BASE}/units/open_incident`),
}

export default {
  async getIncidents() {
    const res = await raw.getIncidents()
    const data = res.data
    const list = Array.isArray(data) ? data : data?.incidents ?? []
    return toIncidentList(list)
  },
  async getIncident(id) {
    const res = await raw.getIncident(id)
    return toIncident(res.data)
  },
  async getOpenIncident() {
    try {
      const res = await raw.getOpenIncident()
      const data = res.data
      if (!data || !data.id) return null
      return toIncident(data)
    } catch {
      return null
    }
  },
  async createIncident({ x, y }) {
    const res = await raw.createIncident({ x, y })
    return toIncident(res.data)
  },
  async updateIncident(id, { x, y }) {
    const res = await raw.updateIncident(id, { x, y })
    return toIncident(res.data)
  },
  deleteIncident: raw.deleteIncident,
  
  async dispatchIncident() {
    await raw.dispatchIncident()
  },
  async getUnitsOpenIncident() {
    try {
      const res = await raw.getUnitsOpenIncident()
      const data = res.data
      const list = Array.isArray(data) ? data : data?.units ?? []
      return toUnitList(list)
    } catch {
      return []
    }
  },
}
