import React from "react";
import { ShieldCheck, AlertTriangle, Activity } from "lucide-react";

export type FilterType = "all" | "critical" | "open";

interface DashboardHeaderProps {
  totalEvents: number;
  criticalEvents: number;
  openIncidents: number;
  onCardClick: (type: FilterType) => void;
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
          className="cursor-pointer flex items-center gap-4 p-5 rounded-xl bg-white border-l-4 border-tmone-blue shadow hover:shadow-lg transition"
          onClick={() => onCardClick("all")}
        >
          <span className="h-12 w-12 flex items-center justify-center rounded-full bg-tmone-blue/10 text-tmone-blue">
            <Activity size={28} />
          </span>
          <div>
            <div className="text-3xl font-bold">{totalEvents}</div>
            <div className="text-sm text-gray-600">Total Incidents</div>
          </div>
        </div>

        {/* CRITICAL */}
        <div
          className="cursor-pointer flex items-center gap-4 p-5 rounded-xl bg-white border-l-4 border-tmone-orange shadow hover:shadow-lg transition"
          onClick={() => onCardClick("critical")}
        >
          <span className="h-12 w-12 flex items-center justify-center rounded-full bg-tmone-orange/10 text-tmone-orange animate-pulse">
            <AlertTriangle size={28} />
          </span>
          <div>
            <div className="text-3xl font-bold">{criticalEvents}</div>
            <div className="text-sm text-gray-600">Critical Incidents</div>
          </div>
        </div>

        {/* OPEN */}
        <div
          className="cursor-pointer flex items-center gap-4 p-5 rounded-xl bg-white border-l-4 border-tmone-accent shadow hover:shadow-lg transition"
          onClick={() => onCardClick("open")}
        >
          <span className="h-12 w-12 flex items-center justify-center rounded-full bg-tmone-accent/10 text-tmone-accent">
            <ShieldCheck size={28} />
          </span>
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
