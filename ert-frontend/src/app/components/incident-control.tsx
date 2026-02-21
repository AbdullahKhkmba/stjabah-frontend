import { Edit, Trash2, Send, CheckCircle, MapPin, Clock } from "lucide-react";
import { Incident } from "./types";
import { useState } from "react";

interface IncidentControlProps {
  incident: Incident;
  onUpdate: (x: number, y: number) => void;
  onDelete: () => void;
  onDispatch: () => void;
  onResolve: () => void;
}

export function IncidentControl({ incident, onUpdate, onDelete, onDispatch, onResolve }: IncidentControlProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [x, setX] = useState(String(incident.x));
  const [y, setY] = useState(String(incident.y));

  const handleUpdate = () => {
    const xVal = parseInt(x);
    const yVal = parseInt(y);
    
    if (xVal >= 0 && xVal <= 100 && yVal >= 0 && yVal <= 100) {
      onUpdate(xVal, yVal);
      setIsEditing(false);
    } else {
      alert("Coordinates must be between 0 and 100");
    }
  };

  const statusColors = {
    active: "bg-orange-500",
    dispatched: "bg-blue-500",
    resolved: "bg-green-500",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Active Incident</h2>
        <span className={`${statusColors[incident.status]} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
          {incident.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Clock className="size-4" />
            <span>{incident.timestamp}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="size-5 text-red-600" />
            <span className="font-mono text-lg font-semibold">
              ID: {incident.id}
            </span>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">X Coordinate</p>
                <p className="text-2xl font-bold">{incident.x}</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Y Coordinate</p>
                <p className="text-2xl font-bold">{incident.y}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">X Coordinate</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Y Coordinate</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={y}
                  onChange={(e) => setY(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Response Units */}
        {incident.units && incident.units.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Acknowledged Units</h3>
            <div className="space-y-2">
              {incident.units.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between bg-white p-2 rounded">
                  <span className="font-medium">{unit.name}</span>
                  <span className="text-sm text-gray-600 font-mono">
                    ({unit.x}, {unit.y})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {!isEditing ? (
            <>
              {incident.status === "active" && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="size-4" />
                    Update Location
                  </button>
                  <button
                    onClick={onDispatch}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="size-4" />
                    Dispatch Units
                  </button>
                </>
              )}
              
              {incident.status === "dispatched" && (
                <button
                  onClick={onResolve}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="size-4" />
                  Mark as Resolved
                </button>
              )}
              
              {incident.status !== "resolved" && (
                <button
                  onClick={onDelete}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="size-4" />
                  Delete Incident
                </button>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setX(String(incident.x));
                  setY(String(incident.y));
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
