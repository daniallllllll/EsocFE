import React, { useState } from "react";
import { X, User, Server, Clock, Info, Mail, ChevronDown, ChevronUp, Send } from "lucide-react";
import { EventItem } from "../../../types/event";

export const ViewIncidentModal: React.FC<any> = ({ incident, onClose, onEdit, onNotify }) => {
  const [activeTab, setActiveTab] = useState<"info" | "timeline" | "emails">("info");
  const [expandedEmail, setExpandedEmail] = useState<number | null>(null);

  if (!incident) return null;

  const formatToLocalTime = (isoString: string) => {
    if (!isoString) return "--";
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).replace(/\//g, '/'); 
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60] transition-opacity" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[520px] bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 font-sans">
        
        <div className="px-6 py-5 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-none">View Incident</h2>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] font-mono text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                ID: {incident.incident_id}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b bg-white px-6 shrink-0">
          <button 
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-2 py-4 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === "info" ? "border-[#0052CC] text-[#0052CC]" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Info size={14} /> Information
          </button>
          <button 
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-2 py-4 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === "timeline" ? "border-[#0052CC] text-[#0052CC]" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Clock size={14} /> Timeline
          </button>
          <button 
            onClick={() => setActiveTab("emails")}
            className={`flex items-center gap-2 py-4 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === "emails" ? "border-[#0052CC] text-[#0052CC]" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Mail size={14} /> Email History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50/30">
          
          {activeTab === "info" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Incident Status</label>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-[10px] font-bold uppercase border border-blue-200 inline-block">
                    {incident.actionStatus || "New"}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Severity Level</label>
                  <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded text-[10px] font-bold uppercase border border-red-200 inline-block">
                    {incident.severity}
                  </span>
                </div>
              </div>

              <section className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incident Name</label>
                  <p className="text-sm font-bold text-gray-900">{incident.incidentName || "--"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform & Customer</label>
                  <p className="text-xs text-gray-700 font-medium">
                    {incident.platform} • {incident.customerName || "--"}
                  </p>
                </div>
              </section>

              <div className="space-y-4">
                <section className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Server size={14} className="text-blue-500" />
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Sources</label>
                  </div>
                  <p className="text-xs font-mono text-gray-700 truncate">{incident.source || "--"}</p>
                </section>

                <section className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-green-500" />
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Assigned To</label>
                  </div>
                  <p className="text-xs font-mono text-gray-700 truncate">{incident.assignedTo || "Unassigned"}</p>
                </section>
              </div>

              <section>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border shadow-sm">
                  {incident.description}
                </div>
              </section>

              <div className="pt-4 border-t border-dashed space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 flex items-center gap-2"><Clock size={12}/> Detection Time</span>
                  <span className="font-medium text-gray-900">{formatToLocalTime(incident.timestamp)}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="py-2">
              {incident.timeline && incident.timeline.length > 0 ? (
                <div className="relative border-l-4 border-teal-600 ml-6">
                  {incident.timeline?.map((event: any, idx: number) => (
                    <div key={idx} className="mb-10 ml-8 relative">
                      <div className="absolute -left-[42px] top-1 w-6 h-6 rounded-full bg-white border-4 border-teal-600 shadow-sm z-10" />
                      <div className="inline-block bg-[#004040] text-white text-[10px] font-bold px-3 py-1 rounded-md mb-3">
                        {formatToLocalTime(event.timestamp)}
                      </div>
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h4 className="text-teal-700 font-bold text-xs uppercase tracking-wider mb-4 border-b pb-2">
                          {event.actionStatus} 
                        </h4>
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Remark :</p>
                          <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded leading-relaxed">
                            {event.remark}
                          </p>
                          <div className="flex items-center gap-2 pt-2 text-[11px]">
                            <span className="font-bold text-gray-500">Action By :</span>
                            <span className="font-bold text-[#0052CC]">{event.actionBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Clock size={48} className="mb-4 opacity-20" />
                  <p className="text-sm italic">No timeline events available.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "emails" && (
            <div className="py-2 space-y-4">
              {incident.emailHistory && incident.emailHistory.length > 0 ? (
                incident.emailHistory.map((mail: any, idx: number) => {
                  const isExpanded = expandedEmail === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`bg-white rounded-xl border-2 transition-all duration-200 shadow-sm overflow-hidden ${
                        isExpanded ? 'border-purple-300 ring-4 ring-purple-50' : 'border-purple-50 hover:border-purple-200'
                      }`}
                    >
                      <button 
                        onClick={() => setExpandedEmail(isExpanded ? null : idx)}
                        className="w-full text-left p-4 focus:outline-none"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] font-black text-purple-700 uppercase bg-purple-50 px-2 py-1 rounded border border-purple-100">
                            Reminder
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-mono italic">{mail.sentAt}</span>
                            {isExpanded ? <ChevronUp size={14} className="text-purple-400"/> : <ChevronDown size={14} className="text-purple-400"/>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-gray-900 leading-tight">Sub: {mail.subject}</p>
                          
                          <div className="flex flex-col gap-1.5">
                            {/* Visualized Sender (From) */}
                            <div className="flex items-center gap-2">
                              <Send size={10} className="text-purple-400" />
                              <span className="text-[10px] text-gray-500 font-medium">
                                <span className="font-bold text-gray-400">From:</span> {mail.sender || "SYSTEM-COLLECTOR"}
                              </span>
                            </div>
                            
                            {/* Recipient (To) */}
                            <div className="flex items-center gap-2">
                              <User size={10} className="text-gray-300" />
                              <span className="text-[10px] text-gray-500 font-medium">
                                <span className="font-bold text-gray-400">To:</span> {mail.recipient}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!isExpanded && (
                          <div className="mt-4 p-3 bg-gray-50/50 rounded-lg border border-purple-100 shadow-inner">
                            <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 italic">
                              "{mail.message || mail.messageSnippet}"
                            </p>
                          </div>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="p-4 bg-gray-50 rounded-lg border border-purple-100 shadow-inner">
                            <p className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {mail.message || mail.messageSnippet || "No content available."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Mail size={48} className="mb-4 opacity-20" />
                  <p className="text-sm italic uppercase font-bold tracking-widest">No emails recorded</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex gap-3 shrink-0">
          <button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-xs transition-colors shadow-sm"
            onClick={() => onEdit(incident)}
          >
            UPDATE TICKET
          </button>
          <button 
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg text-xs transition-colors shadow-sm"
            onClick={() => onNotify(incident)}
          >
            NOTIFY TEAM
          </button>
        </div>
      </div>
    </>
  );
};