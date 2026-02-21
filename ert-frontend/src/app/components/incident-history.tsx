import { History, MapPin, Clock } from "lucide-react";
import { Incident } from "./types";

interface IncidentHistoryProps {
  incidents: Incident[];
}

export function IncidentHistory({ incidents }: IncidentHistoryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="size-5 text-gray-700" />
        <h2 className="text-xl font-semibold">Incident History</h2>
      </div>

      {incidents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No resolved incidents</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {incidents.map((incident) => (
            <div key={incident.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-semibold">{incident.id}</span>
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  RESOLVED
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  <span className="font-mono">({incident.x}, {incident.y})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  <span>{incident.timestamp}</span>
                </div>
              </div>
              {incident.units && incident.units.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Units responded: {incident.units.map(u => u.name).join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
