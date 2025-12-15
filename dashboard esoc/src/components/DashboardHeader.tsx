import React from "react";
import { ShieldCheck, AlertTriangle, Activity } from "lucide-react";

interface DashboardHeaderProps {
  totalEvents: number;
  criticalEvents: number;
  openIncidents: number;
  onCardClick: (type: "all" | "critical" | "open") => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalEvents,
  criticalEvents,
  openIncidents,
  onCardClick,
}) => {
  return (
    <header className="px-8 pt-8 pb-4">
      <h1 className="text-3xl font-bold text-tmone-blue mb-6">
        Security Incidents
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* TOTAL */}
        <div
          className="cursor-pointer flex items-center gap-4 p-5 rounded-xl bg-white shadow border-l-4 border-tmone-blue hover:shadow-lg"
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
          className="cursor-pointer flex items-center gap-4 p-5 rounded-xl bg-white shadow border-l-4 border-tmone-orange hover:shadow-lg"
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
          className="cursor-pointer flex items-center gap-4 p-5 rounded-xl bg-white shadow border-l-4 border-tmone-accent hover:shadow-lg"
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
