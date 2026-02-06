import React, { useState, useEffect } from "react";
import { useEventTable } from "./useEventTable";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { EventItem } from "../../types/event";
import { 
  ChevronUp, ChevronDown, Layers, Download, Eye, Edit2, Mail, 
  Check, X, ChevronRight, FileText, Clock, ChevronLeft 
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Import Modals
import { ViewIncidentModal } from "./Modals/ViewIncidentModal";
import { EditIncidentModal } from "./Modals/EditIncidentModal";
import { EmailReminderModal } from "./Modals/EmailReminderModal";

/* =====================================================
   PROPS & CONSTANTS
   ===================================================== */
interface EventsTableProps {
  events?: EventItem[];
  cardFilter?: { key: keyof EventItem; value: string };
}

const columns: { key: keyof EventItem; label: string; width: string }[] = [
  { key: "incident_id", label: "Incident ID", width: "w-[140px]" },
  { key: "timestamp", label: "Detected Time", width: "w-[180px]" },
  { key: "lastUpdated", label: "Last Updated", width: "w-[180px]" },
  { key: "customerName", label: "Customer Name", width: "w-[160px]" },
  { key: "platform", label: "Platform", width: "w-[140px]" },
  { key: "incidentName", label: "Incident Name", width: "w-[220px]" },
  { key: "severity", label: "Severity", width: "w-[120px]" },
  { key: "status", label: "Incident Status", width: "w-[120px]" },
  { key: "source", label: "Source", width: "w-[160px]" }, 
  { key: "actionStatus", label: "Action Status", width: "w-[120px]" },
];

const severityClass: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusClass: Record<string, string> = {
  Open: "bg-purple-100 text-purple-700 font-bold",
  Closed: "bg-gray-200 text-gray-600 font-bold",
  New: "bg-blue-100 text-blue-700",
  "Under Investigation": "bg-indigo-100 text-indigo-700 font-bold",
  "Resolved True Positive": "bg-green-100 text-green-700 font-bold",
  "Resolved False Positive": "bg-red-100 text-red-700 font-bold",
  "Resolved Duplicate": "bg-slate-100 text-slate-600 font-bold",
  "Resolved Known Issue": "bg-orange-100 text-orange-700 font-bold",
  "Resolved Other": "bg-gray-100 text-gray-500 font-bold",
};

const actionStatusClass: Record<string, string> = {
  New: "border border-blue-200 bg-blue-50 text-blue-600",
  "In Progress": "border border-yellow-200 bg-yellow-50 text-yellow-600",
  Resolved: "border border-green-200 bg-green-50 text-green-600",
  Closed: "border border-gray-200 bg-gray-50 text-gray-400",
};

export const EventsTable: React.FC<EventsTableProps> = ({ events = [], cardFilter }) => {
  const {
    filtered, localData, setLocalData, columnFilters, setColumnFilters,
    selectedIds, setSelectedIds, toggleRow, toggleAll, sortKey,
    setSortKey, sortAsc, setSortAsc,
  } = useEventTable(events, cardFilter);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [viewIncident, setViewIncident] = useState<EventItem | null>(null);
  const [editIncident, setEditIncident] = useState<EventItem | null>(null);
  const [emailIncident, setEmailIncident] = useState<EventItem | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  const [showBulkChoice, setShowBulkChoice] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<{status: string, ids: string[]} | null>(null);

  /* PAGINATION STATE */
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.ceil(filtered.length / rowsPerPage); 
  const currentRows = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => { setCurrentPage(1); }, [columnFilters, cardFilter, filtered.length]);

  /* ===================== FORMATTERS ===================== */
  // Unified DateTime Formatter
  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  /* ===================== EXPORT LOGIC ===================== */
  const exportToCSV = (dataToExport: EventItem[]) => {
    const headers = columns.map(col => col.label).join(",");
    const rows = dataToExport.map(e => columns.map(col => {
        const val = (col.key === 'timestamp' || col.key === 'lastUpdated') 
                    ? formatDateTime(String(e[col.key])) 
                    : String(e[col.key] ?? "");
        return `"${val.replace(/"/g, '""')}"`;
    }).join(",")).join("\n");
    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `incident-report.csv`;
    link.click();
  };

  /* ===================== BULK UPDATE LOGIC ===================== */
  const startBulkUpdate = (statusLabel: string) => {
    if (selectedIds.length === 0) return;
    setPendingBulkAction({ status: statusLabel, ids: [...selectedIds] });
    setBulkOpen(false);
    setShowBulkChoice(true); 
  };

  const executeBulkUpdate = (remark: string, analystEmail: string, isEmailSent: boolean) => {
    if (!pendingBulkAction) return;
    setLocalData((prev) => prev.map((item) => {
      if (!pendingBulkAction.ids.includes(item.incident_id)) return item;
      const newEntry = {
        actionStatus: pendingBulkAction.status,
        remark,
        actionBy: analystEmail,
        timestamp: new Date().toISOString()
      };
      return { 
        ...item, 
        actionStatus: pendingBulkAction.status, 
        lastUpdated: new Date().toISOString(),
        timeline: [newEntry, ...(item.timeline || [])] 
      };
    }));
    setReminderMessage(isEmailSent ? "Bulk Update: Notifications Dispatched" : "Bulk Update: Remarks Saved Internally");
    setSelectedIds([]); setPendingBulkAction(null); setEmailIncident(null);
  };

  const getOptions = (key: keyof EventItem) => {
    const allValues = localData.map((item) => {
        if (key === 'timestamp' || key === 'lastUpdated') return formatDateTime(String(item[key]));
        return String(item[key] || "");
    });
    return Array.from(new Set(allValues)).filter(Boolean).sort();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 flex flex-col h-full max-h-[88vh] overflow-hidden">
      
      {/* 1. Header Actions Area */}
      <div className="flex items-center justify-between mb-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setBulkOpen(!bulkOpen)} className="flex items-center gap-2 bg-[#0052CC] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 shadow-sm transition">
              <Layers className="h-4 w-4" />
              <span>Bulk Action Status</span>
              <ChevronDown size={14} className={bulkOpen ? "rotate-180" : ""} />
            </button>
            {bulkOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white border rounded-lg shadow-xl z-[100] py-1">
                <div className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border-b">Set Action Status</div>
                {["New", "In Progress", "Resolved", "Closed"].map(s => (
                  <button key={s} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => startBulkUpdate(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setIsExportOpen(!isExportOpen)} className="flex items-center gap-2 bg-[#1D9C5D] hover:bg-[#16804B] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              <Download size={16} /> Export ({selectedIds.length > 0 ? selectedIds.length : filtered.length})
              <ChevronDown size={14} />
            </button>
            {isExportOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-xl z-[100] overflow-hidden">
                <button onClick={() => { exportToCSV(selectedIds.length > 0 ? filtered.filter(e => selectedIds.includes(e.incident_id)) : filtered); setIsExportOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b font-medium">Export CSV</button>
              </div>
            )}
          </div>

          {Object.values(columnFilters).some(val => val && val.length > 0) && (
            <button onClick={() => setColumnFilters({})} className="flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold border-2 border-gray-200 hover:bg-white animate-in zoom-in transition-all">
              <X size={16} className="text-red-500" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <Clock size={12} className="text-[#0052CC]" />
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">System Sync: {formatDateTime(new Date().toISOString())}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-md">
            <span className="animate-bounce">🚩</span>
            <span className="text-[9px] font-black text-[#0052CC] uppercase tracking-widest">New Incident Detected</span>
          </div>
        </div>
      </div>

      {/* 2. Main Table Area */}
      <div className="flex-1 overflow-auto border-2 border-gray-200 rounded-t-lg">
        <table className="w-full min-w-[1750px] table-fixed text-sm border-collapse">
          <thead className="sticky top-0 z-40 bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="w-[50px] px-2 py-3 border-b-2 border-gray-300 text-center"><input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={toggleAll} /></th>
              {columns.map((col) => (
                <th key={col.key} className={`${col.width} px-3 py-2 align-top border-b-2 border-gray-300 text-left`}>
                  <div className="font-bold mb-2 text-gray-700 uppercase text-[11px] flex items-center justify-between">
                    <span>{col.label}</span>
                    <div onClick={() => { if (sortKey === col.key) setSortAsc(!sortAsc); else { setSortKey(col.key); setSortAsc(true); } }} className="cursor-pointer text-gray-300 hover:text-blue-600 transition-colors">
                        <ChevronDown size={12} className={sortKey === col.key && !sortAsc ? "text-blue-600" : ""} />
                    </div>
                  </div>
                  <MultiSelectFilter label={col.label} options={getOptions(col.key)} selected={columnFilters[col.key] || []} onChange={(vals: string[]) => setColumnFilters(prev => ({ ...prev, [col.key]: vals }))} />
                </th>
              ))}
              <th className="w-[120px] px-3 py-2 text-center uppercase text-[10px] font-black border-b-2 border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentRows.map((item) => (
              <tr key={item.incident_id} className={`hover:bg-blue-50/30 transition-colors ${selectedIds.includes(item.incident_id) ? "bg-blue-50/50" : ""}`}>
                <td className="px-2 py-4 text-center"><input type="checkbox" checked={selectedIds.includes(item.incident_id)} onChange={() => toggleRow(item.incident_id)} /></td>
                <td className="px-3 py-4 font-medium text-gray-700 truncate" title={item.incident_id}>{item.incident_id}</td>
                <td className="px-3 py-4 text-gray-500 truncate" title={formatDateTime(item.timestamp)}>{formatDateTime(item.timestamp)}</td>
                <td className="px-3 py-4 text-blue-600 font-bold truncate" title={formatDateTime(item.lastUpdated)}>{formatDateTime(item.lastUpdated)}</td>
                <td className="px-3 py-4 text-gray-700 truncate font-semibold uppercase" title={item.customerName}>{item.customerName || "--"}</td>
                <td className="px-3 py-4 text-gray-700 truncate" title={item.platform}>{item.platform}</td>
                <td className="px-3 py-4 text-gray-800 font-bold truncate uppercase" title={item.incidentName}>{item.incidentName}</td>
                <td className="px-3 py-4 text-center" title={item.severity}><span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${severityClass[item.severity]}`}>{item.severity}</span></td>
                <td className="px-3 py-4 text-center" title={item.status}><span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${statusClass[item.status] || "bg-gray-100"}`}>{item.status}</span></td>
                <td className="px-3 py-4 text-gray-400 truncate text-[11px]" title={item.source}>{item.source}</td> 
                <td className="px-3 py-4 text-center" title={item.actionStatus || "New"}><span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${actionStatusClass[item.actionStatus || 'New']}`}>{item.actionStatus || "New"}</span></td>
                <td className="px-3 py-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setViewIncident(item)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"><Eye size={16} /></button>
                    <button onClick={() => setEditIncident(item)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => setEmailIncident(item)} className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-all"><Mail size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Decision Modal */}
      {showBulkChoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-[420px] border-2 border-gray-300 p-8 animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-6 text-[#0052CC]">
              <Layers size={24} />
              <h3 className="font-black uppercase text-sm">Mandatory Remarks</h3>
            </div>
            <p className="text-xs text-gray-500 mb-6">Updating <span className="font-bold text-blue-600 uppercase">{pendingBulkAction?.ids.length}</span> tickets to <span className="font-bold uppercase">{pendingBulkAction?.status}</span>.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { 
                  setShowBulkChoice(false); 
                  const repItem = localData.find(e => selectedIds.includes(e.incident_id));
                  setEmailIncident(repItem || null); 
                }} 
                className="p-4 border-2 border-blue-100 text-blue-700 font-black text-[11px] uppercase rounded-xl hover:bg-blue-50 transition-all flex items-center justify-between group">
                <span>Add Remarks & Proceed</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => { setShowBulkChoice(false); setPendingBulkAction(null); }} className="mt-2 text-[10px] font-black text-gray-400 uppercase text-center hover:text-red-500 tracking-widest transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Choice Decision Modals */}
      {viewIncident && <ViewIncidentModal incident={viewIncident} onClose={() => setViewIncident(null)} onEdit={(inc) => { setEditIncident(inc); setViewIncident(null); }} onNotify={(inc) => { setEmailIncident(inc); setViewIncident(null); }} />}
      {editIncident && <EditIncidentModal incident={editIncident} onClose={() => setEditIncident(null)} onSave={() => {}} />}
      {emailIncident && (
        <EmailReminderModal 
          incident={emailIncident} 
          isBulkMode={!!pendingBulkAction} 
          onClose={() => { setEmailIncident(null); setPendingBulkAction(null); }} 
          onSend={(data) => executeBulkUpdate(data.message, data.cc, true)}
          onSave={(data) => executeBulkUpdate(data.message, data.cc, false)}
        />
      )}

      {/* Pagination Footer */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-gray-50 border-x-2 border-b-2 border-gray-300 rounded-b-lg">
         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Record Summary: {filtered.length} Total Incidents Ingested</div>
         <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-1 border-2 border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30 transition-all"><ChevronLeft size={16}/></button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-1 border-2 border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30 transition-all"><ChevronRight size={16}/></button>
         </div>
      </div>

      {reminderMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-medium">{reminderMessage}</span>
          <button onClick={() => setReminderMessage(null)} className="ml-2 text-gray-400 hover:text-white"><X size={16}/></button>
        </div>
      )}
    </div>
  );
};

export default EventsTable;