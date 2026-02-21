import { useEffect, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { createIncident, fetchIncidents } from "./api/incidents";
import { FactoryMap } from "./components/factory-map";
import { IncidentForm } from "./components/incident-form";
import { IncidentControl } from "./components/incident-control";
import { IncidentHistory } from "./components/incident-history";
import { Incident, Unit } from "./components/types";

export default function App() {
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [incidentHistory, setIncidentHistory] = useState<Incident[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadIncidents = async () => {
    try {
      const { active } = await fetchIncidents();
      setActiveIncident(active);
      //setIncidentHistory(history); !TODO: Integrate after implementation in config/incidents.ts.
    } catch (e) {
      console.error("Failed to load incidents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleCreateIncident = async (x: number, y: number) => {
    try {
      await createIncident({ x, y });
      await loadIncidents();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create incident";
      alert(message);
      throw e;
    }
  };

  const handleUpdateIncident = (x: number, y: number) => {
    if (activeIncident) {
      setActiveIncident({
        ...activeIncident,
        x,
        y,
      });
    }
  };

  const handleDeleteIncident = () => {
    setActiveIncident(null);
  };

  const handleDispatchIncident = () => {
    if (activeIncident) {
      // Simulate units acknowledging and responding to incident
      const units: Unit[] = [
        {
          id: "UNIT-1",
          name: "Safety Team A",
          x: Math.max(0, activeIncident.x - 15),
          y: Math.max(0, activeIncident.y - 10),
        },
        {
          id: "UNIT-2",
          name: "Fire Brigade",
          x: Math.min(100, activeIncident.x + 20),
          y: Math.max(0, activeIncident.y - 5),
        },
      ];

      setActiveIncident({
        ...activeIncident,
        status: "dispatched",
        units,
      });
    }
  };

  const handleResolveIncident = () => {
    if (activeIncident) {
      const resolvedIncident: Incident = {
        ...activeIncident,
        status: "resolved",
      };
      setIncidentHistory([resolvedIncident, ...incidentHistory]);
      setActiveIncident(null);
    }
  };

  if (loading) {
    // !TODO: Add a System initializing loading screen
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading incidents...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-10 text-yellow-400" />
              <div>
                <h1 className="text-3xl font-bold">Factory Emergency System</h1>
                <p className="text-gray-300 text-sm">Incident Management & Response Coordination</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              disabled={activeIncident !== null}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-md transition-colors ${
                activeIncident
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              <Plus className="size-5" />
              Create Incident
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Banner */}
        {activeIncident && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <p className="text-yellow-800 font-semibold">
              ⚠️ Active incident in progress - New incidents cannot be created until current incident is resolved
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map View */}
          <div className="lg:col-span-2">
            <FactoryMap incident={activeIncident} />
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {activeIncident ? (
              <IncidentControl
                incident={activeIncident}
                onUpdate={handleUpdateIncident}
                onDelete={handleDeleteIncident}
                onDispatch={handleDispatchIncident}
                onResolve={handleResolveIncident}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">No Active Incident</h2>
                <p className="text-gray-600 mb-4">
                  Click "Create Incident" to report a new emergency on the factory floor.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="size-4" />
                  Create New Incident
                </button>
              </div>
            )}

            <IncidentHistory incidents={incidentHistory} />
          </div>
        </div>
      </main>

      {/* Incident Form Modal */}
      {showForm && !activeIncident && (
        <IncidentForm
          onSubmit={handleCreateIncident}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
