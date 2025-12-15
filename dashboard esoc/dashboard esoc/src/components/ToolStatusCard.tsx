import React from "react";
import { Activity, AlertTriangle } from "lucide-react";

interface ToolStatusCardProps {
  name: string;
  status: string;
  eventCount: number;
  criticalCount: number;
}

export const ToolStatusCard: React.FC<ToolStatusCardProps> = ({ name, status, eventCount, criticalCount }) => {
  return (
    <div className="p-4 rounded-xl shadow bg-white flex flex-col gap-2 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-gray-800">{name}</span>
        <span className={`text-xs px-2 py-1 rounded ${status === "operational" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{status}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Activity className="text-blue-500" size={18} />
          <span className="text-sm text-gray-600">Events:</span>
          <span className="font-bold text-gray-900">{eventCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="text-red-500" size={18} />
          <span className="text-sm text-gray-600">Critical:</span>
          <span className="font-bold text-red-600">{criticalCount}</span>
        </div>
      </div>
    </div>
  );
};
