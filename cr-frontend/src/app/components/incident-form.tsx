import { useState } from "react";
import { X, MapPin } from "lucide-react";

interface IncidentFormProps {
  onSubmit: (x: number, y: number) => void;
  onClose: () => void;
}

export function IncidentForm({ onSubmit, onClose }: IncidentFormProps) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const xVal = parseInt(x);
    const yVal = parseInt(y);
    
    if (xVal >= 0 && xVal <= 100 && yVal >= 0 && yVal <= 100) {
      onSubmit(xVal, yVal);
      onClose();
    } else {
      alert("Coordinates must be between 0 and 100");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
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
            <p>Factory floor uses a 100x100 coordinate system</p>
            <p>X: 0 (left) to 100 (right)</p>
            <p>Y: 0 (top) to 100 (bottom)</p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Create Incident
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
