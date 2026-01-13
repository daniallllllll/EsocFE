import React, { useState } from "react";
import { Check, X, ChevronDown, AlertTriangle } from "lucide-react";
import { EventItem } from "../../../types/event";

/* --- Reusable Confirmation Component --- */
const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            Confirm Update
          </button>
        </div>
      </div>
    </div>
  );
};

interface EditProps {
  incident: EventItem | null;
  onClose: () => void;
  // Note: Updated to match the save logic in your index.tsx
  onSave: (id: string, updates: { status: string; description: string }) => void;
}

export const EditIncidentModal: React.FC<EditProps> = ({ incident, onClose, onSave }) => {
  const [status, setStatus] = useState(incident?.status || "");
  const [description, setDescription] = useState(incident?.description || "");
  const [showConfirm, setShowConfirm] = useState(false);

  if (!incident) return null;

  // 1. Define the platform-specific status lists
  const platformStatuses: Record<string, string[]> = {
    cortex: [
      "New", 
      "Resolved Duplicate", 
      "Resolved False Positive", 
      "Resolved Other", 
      "Resolved True Positive", 
      "Under Investigation", 
      "Resolved Known Issue"
    ],
    "trend micro": ["Open", "Closed"],
    qradar: ["Open", "Closed"]
  };

  // 2. Determine options based on current platform
  const currentPlatform = incident.platform?.toLowerCase() || "";
  const statusOptions = platformStatuses[currentPlatform] || ["Open", "Closed"];

  // Step 1: Trigger the warning
  const handleSaveTrigger = () => {
    setShowConfirm(true);
  };

  // Step 2: Finalize the save after confirmation
  const handleFinalSave = () => {
    onSave(incident.incidentId, { status, description });
    setShowConfirm(false);
  };

  return (
    /* FIXED: Added onClick={onClose} to the overlay to allow closing when clicking outside */
    <div 
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-[80] animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg w-[450px] shadow-2xl animate-in zoom-in duration-200" 
        /* IMPORTANT: stopPropagation prevents the modal from closing when you click INSIDE the form */
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-bold text-[#091E42]">Edit Incident</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
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
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSaveTrigger}
            className="bg-[#1D9C5D] hover:bg-[#16804B] text-white px-5 py-2 rounded-md text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Check size={18} /> Save
          </button>
        </div>
      </div>

      {/* Warning Alert */}
      <ConfirmDialog 
        isOpen={showConfirm}
        title="Update Incident Status?"
        message={`Are you sure you want to update this incident to "${status}"? This will be reflected across the dashboard immediately.`}
        onConfirm={handleFinalSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};