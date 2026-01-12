import React from "react";
import { X } from "lucide-react";
import { EventItem } from "../../../types/event";

interface ViewProps {
  incident: EventItem | null;
  onClose: () => void;
  onEdit: (incident: EventItem) => void;
  onNotify: (incident: EventItem) => void;
}

export const ViewIncidentModal: React.FC<ViewProps> = ({ incident, onClose, onEdit, onNotify }) => {
  if (!incident) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white z-[70] shadow-2xl flex flex-col animate-slide-in">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Incident Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm">
          <div><p className="text-xs text-gray-500">Incident Name</p><p className="font-semibold">{incident.incidentName}</p></div>
          <div><p className="text-xs text-gray-500">Description</p><p className="whitespace-pre-line">{incident.description}</p></div>
        </div>
        <div className="border-t px-5 py-3 flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded" onClick={() => onEdit(incident)}>Edit</button>
          <button className="flex-1 bg-purple-600 text-white py-2 rounded" onClick={() => onNotify(incident)}>Notify</button>
        </div>
      </div>
    </>
  );
};