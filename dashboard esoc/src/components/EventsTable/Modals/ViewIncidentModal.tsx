import React from "react";
import { X, ExternalLink, User, Server, ShieldAlert, Activity, Network, Clock, Database, Tag } from "lucide-react";
import { EventItem } from "../../../types/event";

export const ViewIncidentModal: React.FC<any> = ({ incident, onClose, onEdit, onNotify }) => {
  if (!incident) return null;

  // Unified formatting for dates (handles epoch or string)
  const formatTime = (val: any) => {
    if (!val) return "--";
    const date = typeof val === "number" ? new Date(val) : new Date(val);
    return date.toLocaleString();
  };

  return (
    <>
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/40 z-[60] transition-opacity" onClick={onClose} />

      {/* Side Drawer */}
      <div className="fixed top-0 right-0 h-full w-[480px] bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 font-sans">
        
        {/* 1. Header with IDs and Risk Scores */}
        <div className="px-6 py-5 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-none">Incident Details</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] font-mono text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                ID: {incident.incident_id || incident.id || incident.incidentId}
              </span>
              {(incident.predicted_score || incident.magnitude || incident.score) && (
                <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                  RISK SCORE: {incident.predicted_score || incident.magnitude || incident.score}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* 2. Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Status and Severity Badges */}
          <div className="flex gap-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-200">
              {incident.status}
            </span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-red-200">
              {incident.severity}
            </span>
          </div>

          {/* Core Identification */}
          <section className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incident Name / Model</label>
              <p className="text-sm font-bold text-gray-900">
                {incident.incident_name || incident.model_name || incident.incidentName || "--"}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform & Customer</label>
              <p className="text-xs text-gray-700 font-medium">
                {incident.platform} • {incident.cust_name || incident.customerName || "--"}
              </p>
            </div>
          </section>

          {/* 3. Unified Metrics Grid (Combines Cortex, QRadar, Trend) */}
          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="bg-gray-50 border border-gray-100 p-2 rounded-lg text-center">
              <Activity size={14} className="mx-auto text-blue-500 mb-1" />
              <p className="text-sm font-bold text-gray-900">{incident.alert_count || incident.event_count || 1}</p>
              <p className="text-[9px] text-gray-400 uppercase font-bold">Alerts/Events</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-2 rounded-lg text-center">
              <Network size={14} className="mx-auto text-green-500 mb-1" />
              <p className="text-sm font-bold text-gray-900">{incident.host_count || incident.device_count || 0}</p>
              <p className="text-[9px] text-gray-400 uppercase font-bold">Entities</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-2 rounded-lg text-center">
              <ShieldAlert size={14} className="mx-auto text-red-500 mb-1" />
              <p className="text-sm font-bold text-gray-900">{incident.high_severity_alert_count || incident.credibility || 0}</p>
              <p className="text-[9px] text-gray-400 uppercase font-bold">Crit/Cred</p>
            </div>
          </div>

          {/* 4. Involved Entities & Network */}
          <div className="space-y-4">
            <section className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Server size={14} className="text-blue-500" />
                <label className="text-[10px] font-bold text-gray-500 uppercase">Hosts / Sources</label>
              </div>
              <p className="text-xs font-mono text-gray-700 truncate">
                {incident.hosts?.join(", ") || incident.offense_source || incident.source || "--"}
              </p>
            </section>
            
            <section className="bg-green-50/50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-green-500" />
                <label className="text-[10px] font-bold text-gray-500 uppercase">Involved Users / Owner</label>
              </div>
              <p className="text-xs text-gray-700">
                {incident.users?.join(", ") || incident.assigned_user_pretty_name || "Unassigned"}
              </p>
            </section>
          </div>

          {/* 5. Description Field */}
          <section>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detailed Description</label>
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border">
              {incident.description}
            </div>
          </section>

          {/* 6. Timeline & Categories */}
          <div className="pt-4 border-t border-dashed space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 flex items-center gap-2"><Clock size={12}/> Detection Time</span>
              <span className="font-medium text-gray-900">{formatTime(incident.creation_time || incident.start_time || incident.created_at || incident.timestamp)}</span>
            </div>
            {incident.categories && (
              <div className="flex flex-wrap gap-1 pt-2">
                {incident.categories.map((cat: string, i: number) => (
                  <span key={i} className="bg-gray-100 text-gray-600 text-[9px] px-2 py-0.5 rounded border flex items-center gap-1">
                    <Tag size={8}/> {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* External Console Link */}
          {incident.xdr_url && (
            <a 
              href={incident.xdr_url} 
              target="_blank" 
              className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-lg text-[11px] font-bold hover:bg-black transition-colors"
            >
              INVESTIGATE IN CONSOLE <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* 7. Sticky Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-xs transition-colors shadow-sm"
            onClick={() => onEdit(incident)}
          >
            EDIT INCIDENT
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