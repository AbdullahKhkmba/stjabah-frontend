import { useEffect, useState } from "react";
import { Shield, MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { UnitMap } from "./unit-map";
import { Incident, Unit } from "./types";

interface UnitInterfaceProps {
  unit: Unit;
  incident: Incident | null;
  onResolve: () => void;
}

export function UnitInterface({ unit: initialUnit, incident, onResolve }: UnitInterfaceProps) {
  const [unit, setUnit] = useState(initialUnit);

  // Simulate unit movement towards incident
  useEffect(() => {
    if (!incident) return;

    const interval = setInterval(() => {
      setUnit((currentUnit) => {
        // Move unit slightly towards incident
        const dx = incident.x - currentUnit.x;
        const dy = incident.y - currentUnit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) {
          // Close enough, don't move
          return currentUnit;
        }

        // Move 2 units per update towards incident
        const moveDistance = 2;
        const newX = currentUnit.x + (dx / distance) * moveDistance;
        const newY = currentUnit.y + (dy / distance) * moveDistance;

        return {
          ...currentUnit,
          x: Math.round(newX * 10) / 10, // Round to 1 decimal
          y: Math.round(newY * 10) / 10,
        };
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [incident]);

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 max-w-md text-center">
          <Shield className="size-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Active Incidents</h2>
          <p className="text-gray-600">Waiting for emergency dispatch...</p>
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">{unit.name}</p>
            <p className="text-sm text-green-700">Status: Standby</p>
          </div>
        </div>
      </div>
    );
  }

  const distance = Math.sqrt(
    Math.pow(incident.x - unit.x, 2) + Math.pow(incident.y - unit.y, 2)
  );
  const isAtLocation = distance < 5;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="size-10" />
              <div>
                <h1 className="text-3xl font-bold">{unit.name}</h1>
                <p className="text-blue-100 text-sm">Emergency Response Unit</p>
              </div>
            </div>
            <div className="bg-blue-700 px-4 py-2 rounded-lg">
              <p className="text-sm text-blue-200">Unit ID</p>
              <p className="font-mono font-bold">{unit.id}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map View */}
          <div className="lg:col-span-2">
            <UnitMap unit={unit} incident={incident} />
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Incident Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="size-6 text-red-600" />
                <h2 className="text-xl font-semibold">Incident Details</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="font-mono font-bold text-lg mb-2">{incident.id}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="size-4" />
                    <span>{incident.timestamp}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Target X</p>
                    <p className="text-2xl font-bold">{incident.x}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Target Y</p>
                    <p className="text-2xl font-bold">{incident.y}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-semibold mb-2">Current Position</p>
                  <p className="font-mono text-blue-900">
                    X: {unit.x.toFixed(1)} | Y: {unit.y.toFixed(1)}
                  </p>
                  <div className="mt-2 bg-blue-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-500"
                      style={{ width: `${Math.max(0, 100 - distance)}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Distance: {distance.toFixed(1)} units
                  </p>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              
              {!isAtLocation ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Moving to incident location...
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Unit must be within 5 units to resolve
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 text-sm font-semibold">
                    ✓ Arrived at incident location
                  </p>
                </div>
              )}

              <button
                onClick={onResolve}
                disabled={!isAtLocation}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-colors ${
                  isAtLocation
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <CheckCircle className="size-5" />
                Resolve Incident
              </button>
            </div>

            {/* Status Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3">Status Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Unit Status</span>
                  <span className="font-semibold text-blue-600">En Route</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Incident Status</span>
                  <span className="font-semibold text-orange-600">Active</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Auto-Update</span>
                  <span className="font-semibold text-green-600">Every 2s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
