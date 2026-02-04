import React, { useState, useEffect } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import { X, Maximize2, Minimize2, Trash2, Paperclip, AlertTriangle, UserCheck, Send, Save } from "lucide-react";

/* --- Reusable Confirmation Component --- */
const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Confirm Action</button>
        </div>
      </div>
    </div>
  );
};

interface EmailProps {
  incident: any;
  onClose: () => void;
  // Fulfills both timeline update and email log
  onSend: (data: { to: string; cc: string; subject: string; message: string; sentAt: string; sender: string }) => void;
  // Fulfills timeline update without email dispatch
  onSave: (data: { message: string; cc: string }) => void; 
  isBulkMode?: boolean; 
}

export const EmailReminderModal: React.FC<EmailProps> = ({ incident, onClose, onSend, onSave, isBulkMode }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState({ title: "", sub: "" });

  const authUser = JSON.parse(localStorage.getItem("auth_user") || '{"email":"admin@test.com"}');

  const [formData, setFormData] = useState({
    to: incident?.customerName || "",
    cc: authUser.email || "admin@test.com", 
    subject: isBulkMode ? "Bulk Status Update Notification" : `Incident Alert: ${incident?.incident_id || incident?.id}`,
    message: ""
  });

  useEffect(() => {
    if (!isBulkMode && incident) {
      const initialBody = `
        <p>Dear Team,</p>
        <p>This is a notification regarding the following incident:</p>
        <ul>
          <li><strong>ID:</strong> ${incident.incident_id || incident.id}</li>
          <li><strong>Platform:</strong> ${incident.platform}</li>
          <li><strong>Severity:</strong> <span style="color: red;">${incident.severity}</span></li>
        </ul>
        <p><em>Description:</em> ${incident.description}</p>
        <br/>
        <p>Best Regards,<br/><strong>SOC Team</strong></p>
      `;
      setFormData(prev => ({ ...prev, message: initialBody }));
    }
  }, [incident, isBulkMode]);

  const handleActionComplete = (title: string, sub: string) => {
    setToastContent({ title, sub });
    setShowToast(true);
    setIsSending(false);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1500);
  };

  const handleFinalSend = () => {
    setShowConfirm(false);
    setIsSending(true);
    
    const finalEmailData = {
      ...formData,
      sentAt: new Date().toLocaleString('en-GB', { hour12: true }),
      sender: formData.cc, 
    };

    setTimeout(() => {
      onSend(finalEmailData); 
      handleActionComplete("Notification Sent", "Added to chronology and customer notified.");
    }, 1000);
  };

  const handleInternalSave = () => {
    if (!formData.cc) return alert("Analyst attribution required.");
    setIsSending(true);
    
    setTimeout(() => {
      onSave({ message: formData.message, cc: formData.cc });
      handleActionComplete("Internal Save", "Remark added to timeline only.");
    }, 800);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[80] backdrop-blur-[1px]" onClick={onClose} />
      
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <UserCheck size={18} />
          <div>
            <p className="text-xs font-black uppercase tracking-widest leading-none">{toastContent.title}</p>
            <p className="text-[10px] opacity-90 mt-1">{toastContent.sub}</p>
          </div>
        </div>
      )}

      <div className={`fixed bg-white shadow-2xl z-[90] flex flex-col border border-gray-300 transition-all duration-300 ${
        isMaximized ? "inset-10 rounded-xl" : "bottom-0 right-10 w-[720px] h-[650px] rounded-t-xl" 
      }`}>
        
        {/* Header */}
        <div className="bg-[#f2f6fc] px-4 py-3 rounded-t-xl flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#041e49]">
              {isBulkMode ? "Bulk Reminders & Audit" : "Incident Investigation"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:bg-gray-200 rounded transition-colors">
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-700 transition-colors"><X size={18} /></button>
          </div>
        </div>
        
        {/* Form Fields */}
        <div className="px-4 text-sm bg-white space-y-px">
          <div className="flex items-center border-b py-2">
            <span className="text-gray-400 w-24 font-bold uppercase text-[9px] tracking-widest">Customer</span>
            <input className="flex-1 outline-none text-xs font-semibold" value={formData.to} onChange={(e) => setFormData({...formData, to: e.target.value})} />
          </div>
          <div className="flex items-center border-b py-2 bg-blue-50/20 px-2 -mx-2">
            <span className="text-blue-500 w-24 font-bold uppercase text-[9px] tracking-widest flex items-center gap-1">
              <UserCheck size={10}/> Analyst
            </span>
            <input className="flex-1 outline-none bg-transparent text-xs font-bold text-blue-700" value={formData.cc} onChange={(e) => setFormData({...formData, cc: e.target.value})} />
          </div>
          <div className="flex items-center border-b py-2">
            <span className="text-gray-400 w-24 font-bold uppercase text-[9px] tracking-widest">Subject</span>
            <input className="flex-1 outline-none text-xs font-medium" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto quill-container bg-white">
          <ReactQuill 
            theme="snow" 
            value={formData.message} 
            onChange={(content) => setFormData({...formData, message: content})} 
            className="h-full border-none"
            placeholder="Investigation remarks are mandatory before saving status changes..."
          />
        </div>

        {/* Action Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-between bg-gray-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowConfirm(true)}
              disabled={isSending || !formData.message || formData.message === '<p><br></p>'}
              className="px-6 py-2.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white font-black text-[10px] uppercase tracking-widest rounded-full flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
            >
              <Send size={14} /> Send & Notify
            </button>

            <button 
              onClick={handleInternalSave}
              disabled={isSending || !formData.message || formData.message === '<p><br></p>'}
              className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-black text-[10px] uppercase tracking-widest rounded-full flex items-center gap-2 hover:bg-gray-100 hover:border-gray-300 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save size={14} /> Save Internally
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-all group">
            <Trash2 size={18} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={showConfirm}
        title="Confirm External Dispatch"
        message="This will update the ticket status and send an automated email alert to the customer contact. Proceed?"
        onConfirm={handleFinalSend}
        onCancel={() => setShowConfirm(false)}
      />

      <style>{`
        .quill-container .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid #f1f3f4; background: #fff; padding: 8px 12px; }
        .quill-container .ql-container.ql-snow { border: none; font-size: 13px; font-family: 'Inter', sans-serif; }
        .quill-container .ql-editor.ql-blank::before { font-style: normal; color: #94a3b8; font-size: 12px; }
      `}</style>
    </>
  );
};