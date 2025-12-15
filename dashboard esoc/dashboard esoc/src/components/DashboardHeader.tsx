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

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

        {/* Total Events */}
        <div
          className="cursor-pointer flex items-center gap-4 p-5 rounded-xl shadow-card bg-white border-l-4 border-tmone-blue hover:shadow-card-hover transition-all duration-300"
          onClick={() => onCardClick("all")}
        >
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-tmone-blue/10 text-tmone-blue shadow-md">
            <Activity size={30} />
          </span>
          <div>
            <div className="text-3xl font-bold text-tmone-blue">
              {totalEvents}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Total Incidents
            </div>
          </div>
        </div>

        {/* Critical Events */}
        <div
          className="cursor-pointer flex items-center gap-4 p-5 rounded-xl shadow-card bg-white border-l-4 border-tmone-orange hover:shadow-card-hover transition-all duration-300"
          onClick={() => onCardClick("critical")}
        >
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-tmone-orange/10 text-tmone-orange shadow-md animate-pulse">
            <AlertTriangle size={30} />
          </span>
          <div>
            <div className="text-3xl font-bold text-tmone-orange">
              {criticalEvents}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Critical Incidents
            </div>
          </div>
        </div>

        {/* Open Incidents */}
        <div
          className="cursor-pointer flex items-center gap-4 p-5 rounded-xl shadow-card bg-white border-l-4 border-tmone-accent hover:shadow-card-hover transition-all duration-300"
          onClick={() => onCardClick("open")}
        >
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-tmone-accent/10 text-tmone-accent shadow-md">
            <ShieldCheck size={30} />
          </span>
          <div>
            <div className="text-3xl font-bold text-tmone-accent">
              {openIncidents}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Open Incidents
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default DashboardHeader;
