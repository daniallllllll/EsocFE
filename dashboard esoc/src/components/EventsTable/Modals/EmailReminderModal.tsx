import React, { useState } from "react";
import { EventItem } from "../../../types/event";

interface EmailProps {
  incident: EventItem | null;
  onClose: () => void;
  onSend: (emailData: any) => void;
}

export const EmailReminderModal: React.FC<EmailProps> = ({ incident, onClose, onSend }) => {
  const [emailTo, setEmailTo] = useState(incident?.source.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || "");
  const [subject, setSubject] = useState(`Notification: ${incident?.incidentId}`);
  const [body, setBody] = useState(`Details for ${incident?.incidentName}...`);

  if (!incident) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[80]" onClick={onClose}>
      <div className="bg-white p-6 rounded-xl w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4 text-purple-700">Send Notification</h2>
        <div className="space-y-3 text-sm">
          <input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="To" className="w-full border p-2 rounded" />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full border p-2 rounded" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full border p-2 rounded" rows={5} />
        </div>
        <button onClick={() => onSend({ emailTo, subject, body })} className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
          Send Email
        </button>
      </div>
    </div>
  );
};