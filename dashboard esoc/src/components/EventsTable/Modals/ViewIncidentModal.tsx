import React from "react";
import { X } from "lucide-react";
import { EventItem } from "../../../types/event";

interface ViewProps {
  incident: EventItem | null;
  onClose: () => void;
  onEdit: (incident: EventItem) => void;
  onNotify: (incident: EventItem) => void;
}

// Helper for Severity/Status badge colors to match the UI
const getBadgeClass = (value: string) => {
  const map: Record<string, string> = {
    New: "bg-green-100 text-green-700",
    Open: "bg-blue-100 text-blue-700",
    High: "bg-orange-100 text-orange-700",
    Critical: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-gray-100 text-gray-700",
  };
  return map[value] || "bg-gray-100 text-gray-700";
};

export const ViewIncidentModal: React.FC<ViewProps> = ({ incident, onClose, onEdit, onNotify }) => {
  if (!incident) return null;

  return (
    <>
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/40 z-[60] transition-opacity" onClick={onClose} />

      {/* Side Drawer */}
      <div className="fixed top-0 right-0 h-full w-[400px] bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Incident Details</h2>
            <p className="text-xs text-gray-400 mt-1">ID: {incident.incidentId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Status Badges */}
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-md text-xs font-bold ${getBadgeClass(incident.status)}`}>
              {incident.status}
            </span>
            <span className={`px-3 py-1 rounded-md text-xs font-bold ${getBadgeClass(incident.severity)}`}>
              {incident.severity}
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="space-y-4 text-sm">
            <section>
              <label className="block text-xs font-medium text-gray-400 mb-1">Incident Name</label>
              <p className="text-gray-900 font-medium">{incident.incidentName || "--"}</p>
            </section>

            <section>
              <label className="block text-xs font-medium text-gray-400 mb-1">Platform</label>
              <p className="text-gray-900">{incident.platform}</p>
            </section>

            <section>
              <label className="block text-xs font-medium text-gray-400 mb-1">Customer</label>
              <p className="text-gray-900">{incident.customerName || "--"}</p>
            </section>

            <section>
              <label className="block text-xs font-medium text-gray-400 mb-1">Detected Time</label>
              <p className="text-gray-900">
                {new Date(incident.timestamp).toLocaleString()}
              </p>
            </section>

            <section>
              <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
              <p className="text-gray-800 leading-relaxed">
                {incident.description}
              </p>
            </section>

            <section>
              <label className="block text-xs font-medium text-gray-400 mb-1">Source</label>
              <p className="text-gray-700 font-mono text-xs">{incident.source}</p>
            </section>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
            onClick={() => onEdit(incident)}
          >
            Edit Incident
          </button>
          <button 
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
            onClick={() => onNotify(incident)}
          >
            Notify
          </button>
        </div>
      </div>
    </>
  );
};