import React from "react";
import { ShieldCheck, AlertTriangle, Activity } from "lucide-react";

interface DashboardHeaderProps {
  totalEvents: number;
  criticalEvents: number;
  openIncidents: number;
  selectedCard?: "all" | "critical" | "open"; // new optional prop
  onCardClick: (type: "all" | "critical" | "open") => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalEvents,
  criticalEvents,
  openIncidents,
  selectedCard,
  onCardClick,
}) => {
  const getCardClasses = (type: "all" | "critical" | "open", baseColor: string) => {
    const isSelected = selectedCard === type;
    return `cursor-pointer flex items-center gap-4 p-5 rounded-xl bg-white shadow border-l-4 border-${baseColor} ${
      isSelected ? "ring-2 ring-offset-2 ring-" + baseColor : "hover:shadow-lg"
    }`;
  };

  return (
    <header className="px-8 pt-8 pb-4">
      <h1 className="text-3xl font-bold text-tmone-blue mb-6">
        Security Incidents
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* TOTAL */}
        <div
          className={getCardClasses("all", "tmone-blue")}
          onClick={() => onCardClick("all")}
        >
          <Activity size={28} className="text-tmone-blue" />
          <div>
            <div className="text-3xl font-bold">{totalEvents}</div>
            <div className="text-sm text-gray-600">Total Incidents</div>
          </div>
        </div>

        {/* CRITICAL */}
        <div
          className={getCardClasses("critical", "tmone-orange")}
          onClick={() => onCardClick("critical")}
        >
          <AlertTriangle size={28} className="text-tmone-orange animate-pulse" />
          <div>
            <div className="text-3xl font-bold">{criticalEvents}</div>
            <div className="text-sm text-gray-600">Critical Incidents</div>
          </div>
        </div>

        {/* OPEN */}
        <div
          className={getCardClasses("open", "tmone-accent")}
          onClick={() => onCardClick("open")}
        >
          <ShieldCheck size={28} className="text-tmone-accent" />
          <div>
            <div className="text-3xl font-bold">{openIncidents}</div>
            <div className="text-sm text-gray-600">Open Incidents</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
