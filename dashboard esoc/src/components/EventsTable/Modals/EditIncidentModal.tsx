import React, { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
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
      <div 
        className="bg-white p-6 rounded-lg w-[450px] shadow-2xl animate-in zoom-in duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#091E42]">Edit Incident</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Status Field */}
          <div>
            <label className="block text-sm font-bold text-[#44546F] mb-2">Status</label>
            <div className="relative">
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="w-full appearance-none border border-[#DFE1E6] bg-white p-2.5 rounded-md text-sm text-[#172B4D] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="New">New</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#44546F]">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-bold text-[#44546F] mb-2">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full border border-[#DFE1E6] p-3 rounded-md text-sm text-[#172B4D] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all min-h-[120px] resize-y"
              placeholder="Enter incident description..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={() => onSave(incident.incidentId, { status, description })} 
            className="bg-[#1D9C5D] hover:bg-[#16804B] text-white px-5 py-2 rounded-md text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Check size={18} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};