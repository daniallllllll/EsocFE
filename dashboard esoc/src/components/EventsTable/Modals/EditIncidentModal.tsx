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
            className="px-4 py-2 text-sm font-semibold text-white bg-[#0052CC] hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
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
  onSave: (id: string, updates: { status: string; actionStatus: string; remarks: string }) => void;
}

export const EditIncidentModal: React.FC<EditProps> = ({ incident, onClose, onSave }) => {
  // Action Status is the primary lifecycle driver that we update
  const [actionStatus, setActionStatus] = useState(incident?.actionStatus || "New");
  const [remarks, setRemarks] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  if (!incident) return null;

  // Unified Lifecycle Options
  const actionStatusOptions = ["New", "In Progress", "Resolved", "Closed"];

  const handleSaveTrigger = () => {
    setShowConfirm(true);
  };

  const handleFinalSave = () => {
    // FIXED: Passes the current technical finding (status) back UNCHANGED
    onSave(incident.incident_id, { 
        status: incident.status, 
        actionStatus, 
        remarks 
    });
    setRemarks("");
    setShowConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[80]" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg w-[450px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-bold text-[#091E42]">Unified Ticket Update</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-6">
          {/* PRIMARY: Action Status (Ticket Lifecycle) */}
          <div>
            <label className="block text-sm font-bold text-[#44546F] mb-2 underline decoration-[#0052CC] decoration-2 underline-offset-4">
              Action Status (Ticket Lifecycle)
            </label>
            <div className="relative">
              <select 
                value={actionStatus} 
                onChange={(e) => setActionStatus(e.target.value)} 
                className="w-full appearance-none border-2 border-[#0052CC]/20 bg-white p-3 rounded-md text-sm font-bold text-[#0052CC] outline-none cursor-pointer"
              >
                {actionStatusOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#0052CC]">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* READ-ONLY: Incident Status (Technical Finding) */}
          <div>
            <label className="block text-sm font-bold text-[#44546F] mb-2">Incident Status (Technical Finding)</label>
            <div className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-md text-sm text-gray-500 font-medium">
              {incident.status}
            </div>
          </div>

          {/* REQUIRED: Investigation Remarks */}
          <div>
            <div className="flex items-center gap-2 mb-2">
               <label className="block text-sm font-bold text-[#44546F]">Investigation Remarks</label>
               <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Required</span>
            </div>
            <textarea 
              placeholder="Enter analysis, findings, or justification for status change..."
              value={remarks} 
              onChange={(e) => setRemarks(e.target.value)} 
              className="w-full border border-[#DFE1E6] p-3 rounded-md text-sm min-h-[120px] resize-y"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={() => setShowConfirm(true)}
            disabled={!remarks.trim()}
            className="bg-[#0052CC] text-white px-6 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Check size={18} /> Update Unified Ticket
          </button>
        </div>
      </div>

      {/* Warning Alert */}
      <ConfirmDialog 
        isOpen={showConfirm}
        title="Submit Ticket Update"
        message={`Move ticket history to "${actionStatus}"? Your remarks will be appended to the audit trail.`}
        onConfirm={handleFinalSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};