import axios from 'axios'

const BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:5001/cr'

// Adapters: control_room uses flat {lat, lng}; frontend expects {location: {lat, lng}}
export const toIncident = (inc) =>
  inc ? { ...inc, location: { lat: inc.lat ?? 0, lng: inc.lng ?? 0 } } : null

export const toUnit = (u) =>
  u ? { ...u, location: { lat: u.lat ?? 0, lng: u.lng ?? 0 } } : null

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
  async createIncident({ lat, lng }) {
    const res = await raw.createIncident({ lat, lng })
    return toIncident(res.data)
  },
  async updateIncident(id, { lat, lng }) {
    const res = await raw.updateIncident(id, { lat, lng })
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