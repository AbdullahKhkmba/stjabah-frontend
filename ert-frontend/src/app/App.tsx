import { useState } from "react";
import { UnitInterface } from "./components/unit-interface";
import { Incident, Unit } from "./components/types";

export default function App() {
  // Mock incident data for testing - in production this would come from a backend/operator system
  const [activeIncident, setActiveIncident] = useState<Incident | null>({
    id: "INC-0001",
    x: 60,
    y: 50,
    status: "dispatched",
    timestamp: new Date().toLocaleString(),
  });

  // Mock unit data - this unit's information
  const unit: Unit = {
    id: "UNIT-1",
    name: "Safety Team A",
    x: 20,
    y: 30,
  };

  const handleResolveIncident = () => {
    if (activeIncident) {
      // In production, this would send the resolution to the backend
      setActiveIncident(null);
      console.log("Incident resolved");
    }
  };

  return (
    <UnitInterface
      unit={unit}
      incident={activeIncident}
      onResolve={handleResolveIncident}
    />
  );
}
