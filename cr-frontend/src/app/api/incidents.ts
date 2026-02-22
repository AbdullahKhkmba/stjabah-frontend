import type { Incident } from "../components/types";
import { apiConfig } from "./config";

/**
!TODO: Configure function to return the history, and assigned units
 */
export async function fetchIncidents(): Promise<{
  active: Incident | null;
}> {
  const res = await fetch(apiConfig.cr.openIncident);
  const data = await res.json();

  if (!res.ok) throw new Error(data?.message ?? `Request failed`);

  if (!data?.id) return { active: null };

  return {
    active: {
      id: data.id,
      x: data.x,
      y: data.y,
      status: "active",
      timestamp: data.created_at,
    }
  };
}

export async function createIncident(payload: {
  x: number;
  y: number;
}): Promise<{ id?: string; x: number; y: number }> {
  const res = await fetch(apiConfig.cr.createIncident, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.message ?? "Failed to create incident");

  return { id: data.id, x: payload.x, y: payload.y };
}

export interface OpenIncidentUnit {
  id: string;
  status: string;
  x: number; // lng
  y: number; // lat
}

export async function fetchUnits(): Promise<OpenIncidentUnit[]> {
  const res = await fetch(apiConfig.cr.getUnits);
  const data = await res.json();

  if (!res.ok) throw new Error(data?.message ?? "Failed to fetch units");

  return Array.isArray(data)
    ? data.map((u: { id: string; status: string; x: number; y: number }) => ({
        id: u.id,
        status: u.status,
        x: u.x,
        y: u.y,
      }))
    : [];
}

export async function deleteIncident(id: string): Promise<void> {
  const res = await fetch(`${apiConfig.cr.deleteIncident}/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.message ?? "Failed to delete incident");
}

export async function dispatchIncident(): Promise<void> {
  const res = await fetch(`${apiConfig.cr.dispatchIncident}`, {
    method: "POST",
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.message ?? "Failed to dispatch incident");
  
}

export async function updateIncident(
  id: string,
  payload: { x: number; y: number }
): Promise<Incident> {
  const res = await fetch(`${apiConfig.cr.updateIncident}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.message ?? "Failed to update incident");

  return {
    id: data.id,
    x: data.x,
    y: data.y,
    status: data.status ?? "active",
    timestamp: data.created_at,
    units: data.units,
  };
}

/**
!TODO: Configuration of the acknowledgement of the incident from the unit
 */
