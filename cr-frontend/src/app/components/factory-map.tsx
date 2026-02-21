import { AlertCircle, Shield } from "lucide-react";
import { Incident } from "./types";

interface FactoryMapProps {
  incident: Incident | null;
}

export function FactoryMap({ incident }: FactoryMapProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Factory Floor Map</h2>
      
      <div className="relative bg-gray-100 border-2 border-gray-300 rounded-lg" style={{ height: "600px" }}>
        {/* Factory Grid */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Factory zones */}
          <rect x="5%" y="5%" width="40%" height="40%" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" opacity="0.3" />
          <text x="25%" y="27%" textAnchor="middle" fill="#0284c7" fontSize="14" fontWeight="bold">Zone A</text>
          
          <rect x="55%" y="5%" width="40%" height="40%" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" opacity="0.3" />
          <text x="75%" y="27%" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="bold">Zone B</text>
          
          <rect x="5%" y="55%" width="40%" height="40%" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="2" opacity="0.3" />
          <text x="25%" y="77%" textAnchor="middle" fill="#7c3aed" fontSize="14" fontWeight="bold">Zone C</text>
          
          <rect x="55%" y="55%" width="40%" height="40%" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" opacity="0.3" />
          <text x="75%" y="77%" textAnchor="middle" fill="#16a34a" fontSize="14" fontWeight="bold">Zone D</text>
        </svg>

        {/* Incident Marker */}
        {incident && (
          <>
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${incident.x}%`, top: `${incident.y}%` }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" style={{ width: "40px", height: "40px", marginLeft: "-20px", marginTop: "-20px" }} />
                <AlertCircle className="size-10 text-red-600 relative z-10" fill="white" />
              </div>
              <div className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold mt-2 whitespace-nowrap">
                Incident: ({incident.x}, {incident.y})
              </div>
            </div>

            {/* Response Units */}
            {incident.units && incident.units.map((unit) => (
              <div
                key={unit.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${unit.x}%`, top: `${unit.y}%` }}
              >
                <div className="flex flex-col items-center">
                  <Shield className="size-8 text-blue-600" fill="lightblue" />
                  <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold mt-1 whitespace-nowrap">
                    {unit.name}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Coordinates overlay */}
        <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-3 py-2 rounded text-sm font-mono">
          Grid: 100x100
        </div>
      </div>
    </div>
  );
}
