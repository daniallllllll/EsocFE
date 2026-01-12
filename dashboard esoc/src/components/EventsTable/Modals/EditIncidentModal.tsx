import React, { useState } from "react";
import { Check } from "lucide-react";
import { EventItem } from "../../../types/event";

interface EditProps {
  incident: EventItem | null;
  onClose: () => void;
  onSave: (id: string, updates: { status: string; description: string }) => void;
}

export const EditIncidentModal: React.FC<EditProps> = ({ incident, onClose, onSave }) => {
  const [status, setStatus] = useState(incident?.status || "");
  const [description, setDescription] = useState(incident?.description || "");

  if (!incident) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[80]" onClick={onClose}>
      <div className="bg-white p-6 rounded-xl w-96" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">Edit Incident</h2>
        <div className="space-y-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border p-2 rounded">
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" rows={3} />
        </div>
        <button onClick={() => onSave(incident.incidentId, { status, description })} className="mt-4 w-full bg-green-600 text-white py-2 rounded flex justify-center gap-2">
          <Check size={18} /> Save Changes
        </button>
      </div>
    </div>
  );
};