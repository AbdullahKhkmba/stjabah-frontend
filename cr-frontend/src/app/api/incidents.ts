import type { Incident } from "../components/types";
import { apiConfig } from "./config";

/**
!TODO: Configure function to return the history, and assigned units
 */
export async function fetchIncidents(): Promise<{
  active: Incident | null;
}> {
  const res = await fetch(apiConfig.cr.incidents);
  const data = await res.json();

  if (!res.ok) throw new Error(data?.message ?? `Request failed`);

  if (!Array.isArray(data)) return { active: null };

  const item = data.find((i: { status: string }) => i.status === "created");
  if (!item) return { active: null };

  return {
    active: {
      id: item.id,
      x: item.x,
      y: item.y,
      status: "active",
      timestamp: item.created_at,
    }
  };
}

export async function createIncident(payload: {
  x: number;
  y: number;
}): Promise<{ id?: string; x: number; y: number }> {
  const res = await fetch(apiConfig.cr.incidents, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.message ?? "Failed to create incident");

  return { id: data.id, x: payload.x, y: payload.y };
}


/**
!TODO: Configuration of the acknowledgement of the incident from the unit
 */
