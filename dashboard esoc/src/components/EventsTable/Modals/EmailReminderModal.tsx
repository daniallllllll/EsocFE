import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { EventItem } from "../../../types/event";

interface EmailProps {
  incident: EventItem | null;
  onClose: () => void;
  onSend: (emailData: { to: string; subject: string; body: string }) => void;
}

export const EmailReminderModal: React.FC<EmailProps> = ({ incident, onClose, onSend }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Auto-populate when incident changes
  useEffect(() => {
    if (incident) {
      // Logic to extract email from source if available, otherwise blank
      const emailMatch = incident.source.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
      setTo(emailMatch ? emailMatch[0] : "");
      
      setSubject(`Notification: ${incident.incidentId} - ${incident.incidentName || "--"}`);
      
      setBody(
        `Dear User,\n\n` +
        `This is a notification regarding the incident:\n\n` +
        `Incident ID: ${incident.incidentId}\n` +
        `Incident Name: ${incident.incidentName || "--"}\n\n` +
        `Please take necessary actions.\n\nThank you.`
      );
    }
  }, [incident]);

  if (!incident) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[80]" onClick={onClose}>
      <div 
        className="bg-white p-6 rounded-lg w-[450px] shadow-2xl animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#091E42]">Send Notification Email</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* To Field */}
          <div>
            <label className="block text-sm font-bold text-[#44546F] mb-1">To</label>
            <input 
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border border-[#DFE1E6] p-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#8777D9]"
              placeholder="recipient@example.com"
            />
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-bold text-[#44546F] mb-1">Subject</label>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-[#DFE1E6] p-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#8777D9]"
            />
          </div>

          {/* Body Field */}
          <div>
            <label className="block text-sm font-bold text-[#44546F] mb-1">Body</label>
            <textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border border-[#DFE1E6] p-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#8777D9] min-h-[150px] resize-y"
            />
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => onSend({ to, subject, body })}
            className="bg-[#8777D9] hover:bg-[#735DD1] text-white px-6 py-2 rounded-md text-sm font-bold transition-colors shadow-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};