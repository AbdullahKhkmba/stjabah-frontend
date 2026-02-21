export interface Incident {
  id: string;
  x: number;
  y: number;
  status: "active" | "dispatched" | "resolved";
  timestamp: string;
  units?: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  x: number;
  y: number;
}
