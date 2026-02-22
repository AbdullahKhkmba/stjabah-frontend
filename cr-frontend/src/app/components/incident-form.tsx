import { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";

interface IncidentFormProps {
  onSubmit: (x: number, y: number) => void | Promise<void>;
  onClose: () => void;
  mapPick?: { x: number; y: number } | null;
}

export function IncidentForm({ onSubmit, onClose, mapPick }: IncidentFormProps) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mapPick) {
      setX(String(mapPick.x));
      setY(String(mapPick.y));
    }
  }, [mapPick]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const xVal = parseFloat(x);
    const yVal = parseFloat(y);

    if (isNaN(xVal) || isNaN(yVal) || xVal < 0 || xVal > 100 || yVal < 0 || yVal > 100) {
      alert("Coordinates must be between 0 and 100");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(xVal, yVal);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* Form panel - map (left side) stays clickable for place-picking */}
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col max-h-screen overflow-auto pointer-events-auto border-l">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <MapPin className="size-6 text-red-600" />
            <h2 className="text-2xl font-semibold">Create Incident</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">X Coordinate (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={x}
              onChange={(e) => setX(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter X position"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Y Coordinate (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={y}
              onChange={(e) => setY(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter Y position"
              required
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-semibold mb-1">Grid Information:</p>
            <p>Click on the map to pick a location, or enter coordinates manually.</p>
            <p>X: 0 (left) to 100 (right) · Y: 0 (top) to 100 (bottom)</p>
            {mapPick && (
              <p className="mt-2 text-green-700 font-medium">✓ Picked from map</p>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Incident"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
