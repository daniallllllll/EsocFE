import React, { useState, useEffect } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import { X, Minus, Maximize2, Minimize2, ChevronDown, MoreVertical, Trash2, Paperclip, AlertTriangle, UserCheck } from "lucide-react";

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
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Confirm Action</button>
        </div>
      </div>
    </div>
  );
};

interface EmailProps {
  incident: any;
  onClose: () => void;
  onSend: (data: { to: string; cc: string; subject: string; message: string }) => void;
  isBulkMode?: boolean; 
}

export const EmailReminderModal: React.FC<EmailProps> = ({ incident, onClose, onSend, isBulkMode }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 1. Get the logged-in user from storage
  const authUser = JSON.parse(localStorage.getItem("auth_user") || '{"email":"admin@test.com"}');

  // Unified State for Form Data
  const [formData, setFormData] = useState({
    to: incident?.customerName || "",
    // 2. Initialize CC with the logged-in user's email
    cc: authUser.email || "admin@test.com", 
    subject: isBulkMode ? "Bulk Status Update Notification" : `Incident Alert: ${incident?.incident_id || incident?.id}`,
    message: ""
  });

  // Initialize Body Content
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

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  const handleSendTrigger = () => {
    if (!formData.cc) {
      alert("Please enter the Analyst Email for the audit trail.");
      return;
    }
    setShowConfirm(true);
  };

  const handleFinalSend = () => {
    setShowConfirm(false);
    setIsSending(true);
    
    setTimeout(() => {
      onSend(formData); 
      setIsSending(false);
    }, 1000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[80]" onClick={onClose} />
      
      <div className={`fixed bg-white shadow-2xl z-[90] flex flex-col border border-gray-300 transition-all duration-300 animate-in slide-in-from-bottom-10 ${
        isMaximized 
          ? "inset-10 rounded-xl" 
          : "bottom-0 right-10 w-[650px] h-[600px] rounded-t-xl" 
      }`}>
        
        {/* Header */}
        <div className="bg-[#f2f6fc] px-4 py-2 rounded-t-xl flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#041e49]">
              {isBulkMode ? "Bulk Action Remarks & Audit" : "New Message"}
            </span>
            {isBulkMode && (
              <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                Bulk Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:bg-gray-200 rounded">
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-700"><X size={18} /></button>
          </div>
        </div>
        
        {/* Recipients Area */}
        <div className="px-4 text-sm bg-white">
          <div className="flex items-center border-b py-2">
            <span className="text-gray-500 w-24 font-bold uppercase text-[10px]">To</span>
            <input 
              className="flex-1 outline-none" 
              value={formData.to}
              onChange={(e) => setFormData({...formData, to: e.target.value})}
              placeholder="customer@example.com"
            />
          </div>

          {/* 3. AUTO-POPULATED ANALYST FIELD */}
          <div className="flex items-center border-b py-2 bg-blue-50/30">
            <span className="text-blue-600 w-24 font-bold uppercase text-[10px] flex items-center gap-1">
              <UserCheck size={12}/> Analyst
            </span>
            <input 
              type="email"
              className="flex-1 outline-none bg-transparent font-medium text-gray-700" 
              value={formData.cc}
              onChange={(e) => setFormData({...formData, cc: e.target.value})}
              placeholder="Your email (Required for audit trail)"
              required
            />
          </div>

          <div className="flex items-center border-b py-2">
            <span className="text-gray-500 w-24 font-bold uppercase text-[10px]">Subject</span>
            <input 
              className="flex-1 outline-none font-medium" 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto min-h-[250px] quill-container bg-white">
          <ReactQuill 
            theme="snow" 
            value={formData.message} 
            onChange={(content) => setFormData({...formData, message: content})} 
            modules={modules}
            className="h-full border-none"
            placeholder={isBulkMode ? "Enter the shared investigation remark for all selected tickets..." : "Type your message here..."}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSendTrigger}
              disabled={isSending}
              className={`px-8 py-2 text-white font-bold text-sm rounded-full flex items-center gap-2 transition-all shadow-md ${
                isSending ? "bg-gray-400 cursor-not-allowed" : "bg-[#0b57d0] hover:bg-[#0842a0]"
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                isBulkMode ? "Apply to Selected" : "Send Notification"
              )}
            </button>
            <button className="p-2 hover:bg-gray-200 rounded text-gray-600">
              <Paperclip size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
             <button onClick={onClose} className="p-2 hover:bg-red-50 rounded hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
          </div>
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={showConfirm}
        title={isBulkMode ? "Confirm Bulk Update" : "Confirm Email Action"}
        message={isBulkMode 
          ? "This will update the Action Status and add this remark to the timeline of ALL selected incidents. Proceed?"
          : "Are you sure you want to send this notification email? This action cannot be undone."}
        onConfirm={handleFinalSend}
        onCancel={() => setShowConfirm(false)}
      />

      <style>{`
        .quill-container .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #f1f3f4;
          background: #fff;
        }
        .quill-container .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 14px;
        }
      `}</style>
    </>
  );
};