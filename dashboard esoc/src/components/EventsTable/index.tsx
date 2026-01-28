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
  { key: "timestamp", label: "Time", width: "w-[180px]" },
  { key: "customerName", label: "Customer Name", width: "w-[160px]" },
  { key: "platform", label: "Platform", width: "w-[140px]" },
  { key: "incidentName", label: "Incident Name", width: "w-[220px]" },
  { key: "description", label: "Incident Description", width: "w-[180px]" },
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
    filtered,
    localData,
    setLocalData,
    columnFilters,
    setColumnFilters,
    selectedIds,
    setSelectedIds,
    toggleRow,
    toggleAll,
    sortKey,
    setSortKey,
    sortAsc,
    setSortAsc,
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
  const [jumpPage, setJumpPage] = useState("");

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filtered.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, cardFilter, filtered.length]);

  /* ===================== RESTORED: START BULK UPDATE ===================== */
  const startBulkUpdate = (statusLabel: string) => {
    if (selectedIds.length === 0) return;
    setPendingBulkAction({ status: statusLabel, ids: [...selectedIds] });
    setBulkOpen(false);
    setShowBulkChoice(true); 
  };

  const handleQuickUpdate = () => {
    if (!pendingBulkAction) return;
    const authUser = JSON.parse(localStorage.getItem("auth_user") || '{"email":"SYSTEM"}');
    const now = new Date().toLocaleString();

    setLocalData((prev) => prev.map((item) => {
      if (!pendingBulkAction.ids.includes(item.incident_id)) return item;
      const newEntry = {
        actionStatus: pendingBulkAction.status,
        status: item.status,
        remark: `Quick status update to ${pendingBulkAction.status}.`,
        actionBy: authUser.email,
        timestamp: now
      };
      return { ...item, actionStatus: pendingBulkAction.status, timeline: [newEntry, ...(item.timeline || [])] };
    }));

    setReminderMessage(`Quick update applied to ${pendingBulkAction.ids.length} items.`);
    setSelectedIds([]);
    setPendingBulkAction(null);
    setShowBulkChoice(false);
  };

  const executeBulkUpdate = (remark: string, analystEmail: string) => {
    if (!pendingBulkAction) return;
    const now = new Date().toLocaleString();

    setLocalData((prev) => prev.map((item) => {
      if (!pendingBulkAction.ids.includes(item.incident_id)) return item;
      const newEntry = {
        actionStatus: pendingBulkAction.status,
        status: item.status,
        remark: remark,
        actionBy: analystEmail, 
        timestamp: now
      };
      return { ...item, actionStatus: pendingBulkAction.status, timeline: [newEntry, ...(item.timeline || [])] };
    }));
    
    setReminderMessage(`Bulk status updated.`);
    setSelectedIds([]);
    setPendingBulkAction(null);
    setEmailIncident(null);
  };

  /* ===================== EXPORT & HELPERS ===================== */
  const exportToCSV = (dataToExport: EventItem[]) => {
    const headers = columns.map(col => col.label).join(",");
    const rows = dataToExport.map(e => columns.map(col => `"${String(e[col.key] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `incident-report.csv`;
    link.click();
  };

  const getOptions = (key: keyof EventItem) => {
    const allValues = localData.map((item) => key === "timestamp" ? new Date(String(item[key])).toLocaleString() : String(item[key] || ""));
    return Array.from(new Set(allValues)).filter(Boolean).sort();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 flex flex-col h-full max-h-[88vh] overflow-hidden">
      
      {/* 1. Header Actions Area */}
      <div className="flex items-center justify-between mb-6 shrink-0 z-50 overflow-visible">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setBulkOpen(!bulkOpen)} className="flex items-center gap-2 bg-[#0052CC] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition">
              <Layers className="h-4 w-4" />
              <span>Bulk Action Status</span>
              <ChevronDown size={14} className={bulkOpen ? "rotate-180" : ""} />
            </button>
            {bulkOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white border rounded-lg shadow-xl z-[100] py-1 animate-in zoom-in duration-100">
                <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Set Action Status</div>
                {["New", "In Progress", "Resolved", "Closed"].map(s => (
                  <button key={s} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => startBulkUpdate(s)}>{s}</button>
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
                <button onClick={() => { exportToCSV(selectedIds.length > 0 ? filtered.filter(e => selectedIds.includes(e.incident_id)) : filtered); setIsExportOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b">Export CSV</button>
              </div>
            )}
          </div>

          {Object.values(columnFilters).some(val => val && val.length > 0) && (
            <button onClick={() => { setColumnFilters({}); }} className="flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold border-2 border-gray-200 animate-in zoom-in">
              <X size={16} className="text-red-500" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <Clock size={12} className="text-[#0052CC]" />
            <span className="text-[10px] uppercase font-bold text-gray-400">Last System Collection: 15/06/2025, 04:45:12 pm</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-md">
            <span className="animate-bounce">🚩</span>
            <span className="text-[9px] font-black text-[#0052CC] uppercase tracking-widest text-nowrap">New Ticket Collected</span>
          </div>
        </div>
      </div>

      {/* 2. Main Table Area - Pinned scrollable area */}
      <div className="flex-1 overflow-auto bg-white relative border-2 border-gray-300 rounded-t-lg shadow-md">
        <table className="w-full min-w-[1600px] table-fixed text-sm border-collapse">
          <thead className="sticky top-0 z-40 bg-white shadow-sm">
            <tr className="bg-white">
              <th className="w-[50px] px-2 py-3 border-b-2 border-gray-300 text-center"><input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={toggleAll} /></th>
              {columns.map((col) => (
                <th key={col.key} className={`${col.width} px-3 py-2 align-top border-b-2 border-gray-300 text-left`}>
                  <div className="flex items-center justify-between font-bold mb-2 cursor-pointer text-gray-700 uppercase text-[11px]" onClick={() => { if (sortKey === col.key) setSortAsc(!sortAsc); else { setSortKey(col.key); setSortAsc(true); } }}>
                    <span className="truncate">{col.label}</span>
                    <div className="flex flex-col leading-none text-gray-300">
                      <ChevronUp size={10} className={sortKey === col.key && sortAsc ? "text-gray-700" : ""} />
                      <ChevronDown size={10} className={sortKey === col.key && !sortAsc ? "text-gray-700" : ""} />
                    </div>
                  </div>
                  <MultiSelectFilter label={col.label} options={getOptions(col.key)} selected={columnFilters[col.key] || []} onChange={(vals: string[]) => { setColumnFilters((prev) => { const newFilters = { ...prev, [col.key]: vals }; if (vals.length === 0) delete newFilters[col.key]; return newFilters; }); }} />
                </th>
              ))}
              <th className="w-[120px] px-3 py-2 text-gray-600 border-b-2 border-gray-300 text-center uppercase text-[10px] font-black">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentRows.map((item) => {
              const isNewTicket = (new Date().getTime() - new Date(item.timestamp).getTime()) < (24 * 60 * 60 * 1000);
              return (
                <tr key={item.incident_id} className={`hover:bg-blue-50/30 transition-colors ${selectedIds.includes(item.incident_id) ? "bg-blue-50/50" : ""}`}>
                  <td className="px-2 py-4 text-center"><input type="checkbox" checked={selectedIds.includes(item.incident_id)} onChange={() => toggleRow(item.incident_id)} /></td>
                  
                  {/* FULL TEXT HOVER POP-UP (title attribute) */}
                  <td className="px-3 py-4 font-medium text-gray-700 truncate" title={item.incident_id}>
                    {item.incident_id} {isNewTicket && <span className="animate-pulse ml-1">🚩</span>}
                  </td>
                  <td className="px-3 py-4 text-gray-500 truncate" title={new Date(item.timestamp).toLocaleString()}>
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-gray-700 truncate font-semibold uppercase" title={item.customerName}>
                    {item.customerName || "--"}
                  </td>
                  <td className="px-3 py-4 text-gray-700 truncate" title={item.platform}>
                    {item.platform}
                  </td>
                  <td className="px-3 py-4 text-gray-800 font-bold truncate uppercase" title={item.incidentName}>
                    {item.incidentName}
                  </td>
                  <td className="px-3 py-4 text-gray-500 text-xs truncate italic" title={item.description}>
                    {item.description}
                  </td>
                  
                  <td className="px-3 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${severityClass[item.severity]}`}>{item.severity}</span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${statusClass[item.status] || "bg-gray-100"}`}>{item.status}</span>
                  </td>
                  <td className="px-3 py-4 text-gray-400 truncate text-[11px]" title={item.source}>
                    {item.source}
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${actionStatusClass[item.actionStatus || 'New']}`}>{item.actionStatus || "New"}</span>
                  </td>
                  
                  <td className="px-3 py-4">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => setViewIncident(item)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"><Eye size={16} /></button>
                      <button onClick={() => setEditIncident(item)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => setEmailIncident(item)} className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-all"><Mail size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. Pinned Pagination Area - Fixed to bottom */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-gray-50 border-x-2 border-b-2 border-gray-300 rounded-b-lg z-50">
        <div className="flex items-center gap-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} className="bg-white border-2 border-gray-300 rounded px-1 outline-none">
              {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>Jump:</span>
            <input 
              type="text" 
              placeholder="#"
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt(jumpPage);
                  if (val > 0 && val <= totalPages) setCurrentPage(val);
                  setJumpPage("");
                }
              }}
              className="bg-white border-2 border-gray-300 rounded w-12 text-center outline-none focus:border-blue-500"
            />
          </div>
          <span>Showing {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filtered.length)} of {filtered.length}</span>
        </div>

        <div className="flex items-center gap-1">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-1 border-2 border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30 transition-all">
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1">
            {(() => {
              const pages = [];
              for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                  pages.push(
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i)} 
                      className={`w-7 h-7 rounded text-[10px] font-black border-2 transition-all ${
                        currentPage === i ? "bg-[#0052CC] text-white border-[#0052CC] shadow-md scale-110" : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {i}
                    </button>
                  );
                } else if (i === currentPage - 2 || i === currentPage + 2) {
                  pages.push(<span key={i} className="text-gray-400 px-1 font-bold">...</span>);
                }
              }
              return pages;
            })()}
          </div>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-1 border-2 border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Choice Modal */}
      {showBulkChoice && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] border-2 border-gray-300 p-6 animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4 text-[#0052CC]">
              <Layers size={24} />
              <h3 className="font-black uppercase text-sm">Bulk Action Request</h3>
            </div>
            <p className="text-xs text-gray-500 mb-6">You are updating <span className="font-bold">{pendingBulkAction?.ids.length}</span> tickets to <span className="text-blue-600 font-bold">{pendingBulkAction?.status}</span>.</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setShowBulkChoice(false); setEmailIncident(localData.find(e => selectedIds.includes(e.incident_id)) || null); }} className="p-3 border-2 border-blue-200 text-blue-700 font-black text-[10px] uppercase rounded-lg hover:bg-blue-50 transition-all flex items-center justify-between">
                <span>Add Remarks & Send Email</span>
                <ChevronRight size={14} />
              </button>
              <button onClick={handleQuickUpdate} className="p-3 border-2 border-gray-200 text-gray-700 font-black text-[10px] uppercase rounded-lg hover:bg-gray-50 transition-all flex items-center justify-between">
                <span>Quick Status Update Only</span>
                <ChevronRight size={14} />
              </button>
              <button onClick={() => { setShowBulkChoice(false); setPendingBulkAction(null); }} className="mt-2 text-[10px] font-black text-gray-400 uppercase hover:text-red-500 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals and Toasts */}
      {viewIncident && <ViewIncidentModal incident={viewIncident} onClose={() => setViewIncident(null)} onEdit={(inc) => { setEditIncident(inc); setViewIncident(null); }} onNotify={(inc) => { setEmailIncident(inc); setViewIncident(null); }} />}
      {editIncident && <EditIncidentModal incident={editIncident} onClose={() => setEditIncident(null)} onSave={() => {}} />}
      {emailIncident && <EmailReminderModal incident={emailIncident} isBulkMode={!!pendingBulkAction} onClose={() => { setEmailIncident(null); setPendingBulkAction(null); }} onSend={(data) => { if (pendingBulkAction) executeBulkUpdate(data.message, data.cc); else { setReminderMessage(`Email sent to ${data.to}.`); setEmailIncident(null); } }} />}
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