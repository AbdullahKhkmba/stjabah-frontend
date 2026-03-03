import axios from 'axios'

const CR_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:5001/cr'
const ERT_BASE = process.env.REACT_APP_ERT_API_BASE || 'http://127.0.0.1:5002/ert'

// Adapters: backends use flat {lat, lng}; frontend expects {location: {lat, lng}}
export const toIncident = (inc) =>
  inc ? { ...inc, location: { lat: inc.lat ?? 0, lng: inc.lng ?? 0 } } : null

export const toUnit = (u) =>
  u ? { ...u, location: { lat: u.lat ?? 0, lng: u.lng ?? 0 } } : null

export const toIncidentList = (data) =>
  (Array.isArray(data) ? data : []).map(toIncident)

export const toUnitList = (data) =>
  (Array.isArray(data) ? data : []).map(toUnit)

const raw = {
  // CR endpoints (incidents list for map display)
  getIncidents: () => axios.get(`${CR_BASE}/incidents`),

  // ERT endpoints (unit-specific)
  getIncidentLocation: () => axios.get(`${ERT_BASE}/incident/location`),
  getUnit: () => axios.get(`${ERT_BASE}/unit`),
  getUnitLocation: () => axios.get(`${ERT_BASE}/unit/location`),
  updateUnitLocation: (body) => axios.put(`${ERT_BASE}/unit/location`, body),
  resolveUnit: () => axios.put(`${ERT_BASE}/incident/resolve`),
}

export default {
  async getIncidents() {
    try {
      const res = await raw.getIncidents()
      const data = res.data
      const list = Array.isArray(data) ? data : data?.incidents ?? []
      return toIncidentList(list)
    } catch {
      return []
    }
  },

  // The incident this unit is assigned to (location only)
  async getIncidentLocation() {
    try {
      const res = await raw.getIncidentLocation()
      const data = res.data
      if (!data) return null
      return toIncident(data)
    } catch {
      return null
    }
  },

  // Full unit info (id, status, lat, lng, ...)
  async getUnit() {
    try {
      const res = await raw.getUnit()
      const data = res.data
      if (!data) return null
      return toUnit(data)
    } catch {
      return null
    }
  },

  async getUnitLocation() {
    try {
      const res = await raw.getUnitLocation()
      return toUnit(res.data)
    } catch {
      return null
    }
  },

  // Called by UnitPanel — sends lat/lng directly to backend
  async updateUnit(_id, { lat, lng }) {
    const res = await raw.updateUnitLocation({ lat, lng })
    return toUnit(res.data)
  },

  async resolveUnit(_id) {
    await raw.resolveUnit()
  },
}