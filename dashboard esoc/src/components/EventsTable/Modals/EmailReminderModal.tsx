import React, { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles
import { X, Minus, Maximize2, Minimize2 , Send, ChevronDown, MoreVertical, Trash2, Paperclip, AlertTriangle } from "lucide-react";

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
  onSend: (data: any) => void;
}

export const EmailReminderModal: React.FC<EmailProps> = ({ incident, onClose, onSend }) => {
  const [showCC, setShowCC] = useState(false);
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState(`Incident Alert: ${incident.incident_id || incident.id} - ${incident.model_name || incident.incidentName || "Manual Review"}`);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Initial HTML content for the editor
  const [body, setBody] = useState(`
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
  `);

  // Quill Toolbar Configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  const handleSend = () => {
    setShowConfirm(true);
  };

  const handleFinalSend = () => {
    setShowConfirm(false);
    setIsSending(true);
    setTimeout(() => {
      onSend({ to, cc, subject, body });
      setIsSending(false);
    }, 1000);
    
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[80]" onClick={onClose} />
      
      <div className={`fixed bg-white shadow-2xl z-[90] flex flex-col border border-gray-300 transition-all duration-300 animate-in slide-in-from-bottom-10 ${
        isMaximized 
          ? "inset-10 rounded-xl" // Full screen mode
          : "bottom-0 right-10 w-[600px] h-[550px] rounded-t-xl" // Gmail mode
      }`}>
        
        {/* Gmail Header */}
        <div className="bg-[#f2f6fc] px-4 py-2 rounded-t-xl flex items-center justify-between border-b">
          <span className="text-sm font-medium text-[#041e49]">New Message</span>
          <div className="flex items-center gap-2 text-gray-500">
            <button className="p-1 hover:bg-gray-200 rounded"><Minus size={16} /></button>
            <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:bg-gray-200 rounded">{isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-700"><X size={18} /></button>
          </div>
        </div>
        
        {/* Recipients Area */}
        <div className="px-4 text-sm">
          <div className="flex items-center border-b py-2 relative">
            <span className="text-gray-500 w-12">To</span>
            <input 
              className="flex-1 outline-none" 
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipients@example.com"
            />
            {!showCC && (
              <button onClick={() => setShowCC(true)} className="text-gray-400 hover:text-blue-600 text-xs px-2">Cc</button>
            )}
          </div>

          {showCC && (
            <div className="flex items-center border-b py-2 animate-in fade-in">
              <span className="text-gray-500 w-12">Cc</span>
              <input 
                className="flex-1 outline-none" 
                value={cc}
                onChange={(e) => setCc(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center border-b py-2">
            <input 
              className="w-full outline-none font-medium placeholder-gray-400" 
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>

        {/* RICH TEXT EDITOR AREA */}
        <div className="flex-1 overflow-y-auto min-h-[300px] quill-container">
          <ReactQuill 
            theme="snow" 
            value={body} 
            onChange={setBody} 
            modules={modules}
            className="h-full border-none"
          />
        </div>

        {/* Gmail Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#0b57d0] hover:bg-[#0842a0] rounded-full overflow-hidden transition-colors shadow-md">
              <button 
                onClick={handleSend}
                disabled={isSending}
                className={`pl-6 pr-4 py-2 text-white font-medium text-sm border-r border-white/20 flex items-center gap-2 transition-all ${
                  isSending ? "bg-[#0842a0] cursor-not-allowed" : "bg-[#0b57d0] hover:bg-[#0842a0]"
                }`}
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </button>
              <button className="px-2 py-2 text-white hover:bg-white/10 transition-colors">
                <ChevronDown size={16} />
              </button>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-600">
              <Paperclip size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1 text-gray-500">
             <button className="p-2 hover:bg-gray-100 rounded"><MoreVertical size={18} /></button>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded hover:text-red-500"><Trash2 size={18} /></button>
          </div>
        </div>
      </div>
      {/* 4. CONFIRMATION ALERT MODAL */}
      <ConfirmDialog 
        isOpen={showConfirm}
        title="Confirm Email Action"
        message="Are you sure you want to send this notification email to the recipients? This action cannot be undone."
        onConfirm={handleFinalSend}
        onCancel={() => setShowConfirm(false)}
      />
      {/* Custom CSS to hide the default Quill border for a Gmail look */}
      <style>{`
        .quill-container .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #f1f3f4;
          background: #fff;
        }
        .quill-container .ql-container.ql-snow {
          border: none;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 14px;
        }
      `}</style>
    </>
  );
};