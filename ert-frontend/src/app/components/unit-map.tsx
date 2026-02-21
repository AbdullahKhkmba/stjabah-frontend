import { AlertCircle, Shield, Navigation } from "lucide-react";
import { Incident, Unit } from "./types";

interface UnitMapProps {
  unit: Unit;
  incident: Incident;
}

export function UnitMap({ unit, incident }: UnitMapProps) {
  // Calculate distance
  const distance = Math.sqrt(
    Math.pow(incident.x - unit.x, 2) + Math.pow(incident.y - unit.y, 2)
  ).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Navigation Map</h2>
        <div className="flex items-center gap-2 text-sm">
          <Navigation className="size-4 text-blue-600" />
          <span className="font-semibold">Distance: {distance} units</span>
        </div>
      </div>
      
      <div className="relative bg-gray-100 border-2 border-gray-300 rounded-lg" style={{ height: "500px" }}>
        {/* Factory Grid */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Grid lines */}
          <defs>
            <pattern id="unit-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#unit-grid)" />
          
          {/* Connection line between unit and incident */}
          <line
            x1={`${unit.x}%`}
            y1={`${unit.y}%`}
            x2={`${incident.x}%`}
            y2={`${incident.y}%`}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.5"
          />
        </svg>

        {/* Incident Marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${incident.x}%`, top: `${incident.y}%` }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" style={{ width: "40px", height: "40px", marginLeft: "-20px", marginTop: "-20px" }} />
            <AlertCircle className="size-10 text-red-600 relative z-10" fill="white" />
          </div>
          <div className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold mt-2 whitespace-nowrap">
            Incident ({incident.x}, {incident.y})
          </div>
        </div>

        {/* Unit Marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${unit.x}%`, top: `${unit.y}%` }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-50" style={{ width: "40px", height: "40px", marginLeft: "-20px", marginTop: "-20px" }} />
            <Shield className="size-10 text-blue-600 relative z-10" fill="lightblue" />
          </div>
          <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold mt-2 whitespace-nowrap">
            Your Location ({unit.x}, {unit.y})
          </div>
        </div>
      </div>
    </div>
  );
}
