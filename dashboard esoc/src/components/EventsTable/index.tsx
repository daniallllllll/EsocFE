import React, { useState } from "react";
import { useEventTable } from "./useEventTable";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { EventItem } from "../../types/event";
import { ChevronUp, ChevronDown, Layers, Download, Eye, Edit2, Mail, Check, X, ChevronRight, AlertTriangle, FileText } from "lucide-react";
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
  { key: "description", label: "Description Of Incident", width: "w-[160px]" },
  { key: "severity", label: "Severity", width: "w-[120px]" },
  { key: "status", label: "Incident Status", width: "w-[120px]" },
  { key: "source", label: "Source", width: "w-[140px]" },
  { key: "actionStatus", label: "Action Status", width: "w-[100px]" },
];

const severityClass: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusClass: Record<string, string> = {
  // Standard (Trend Micro / QRadar)
  Open: "bg-purple-100 text-purple-700 font-bold",
  Closed: "bg-gray-200 text-gray-600 font-bold",
  
  // Cortex Specific
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
  const [bulkAction, setBulkAction] = useState("");
  const [viewIncident, setViewIncident] = useState<EventItem | null>(null);
  const [editIncident, setEditIncident] = useState<EventItem | null>(null);
  const [emailIncident, setEmailIncident] = useState<EventItem | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  /* --- DYNAMIC FILTER OPTIONS (Non-Hardcoded) --- */
  const getOptions = (key: keyof EventItem) => {
    // This dynamically pulls unique values from your API data
    const allValues = localData.map((item) => {
      const val = item[key];
      if (key === "timestamp") return new Date(String(val)).toLocaleString();
      return val ? String(val) : "";
    });

    return Array.from(new Set(allValues))
      .filter(Boolean)
      .sort();
  };

  /* ===================== UPDATED HANDLERS ===================== */
  const handleBulkAction = (action: string) => {
    setLocalData((prev) =>
      prev.map((item) => {
        if (!selectedIds.includes(item.incident_id)) return item;
        const platform = item.platform?.toLowerCase();
        let newStatus = item.status;

        if (action === "open_new") newStatus = platform === "cortex" ? "New" : "Open";
        else if (action === "close_resolve") newStatus = platform === "cortex" ? "Resolved True Positive" : "Closed";
        else if (action === "investigation") newStatus = platform === "cortex" ? "Under Investigation" : "Open";
        else {
          const directMap: Record<string, string> = {
            "res_false": "Resolved False Positive", "res_dup": "Resolved Duplicate",
            "res_known": "Resolved Known Issue", "res_other": "Resolved Other", "res_true": "Resolved True Positive"
          };
          if (directMap[action]) newStatus = platform === "cortex" ? directMap[action] : "Closed";
        }
        return { ...item, status: newStatus };
      })
    );
    setReminderMessage(`Bulk update applied.`);
    setBulkAction("");
    setSelectedIds([]);
    setShowBulkConfirm(false);
  };

  const exportToCSV = (dataToExport: EventItem[]) => {
    const headers = columns.map(col => col.label).join(",");
    const rows = dataToExport.map(e => columns.map(col => `"${String(e[col.key] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `incident-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // New: Export to PDF
  const exportToPDF = (dataToExport: EventItem[]) => {
      const doc = new jsPDF("l", "mm", "a4");
      const timestamp = new Date().toLocaleString();

      doc.setFontSize(18);
      doc.text("Unified Incident Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${timestamp}`, 14, 22);

      const tableRows = dataToExport.map(item => [
        item.incident_id,
        new Date(item.timestamp).toLocaleString(),
        item.customerName || "--",
        item.incidentName,
        item.severity,
        item.status,
        item.actionStatus || "New" // Added for Unified ESOC system
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["ID", "Time", "Customer", "Incident Name", "Severity", "Inc. Status", "Action Status"]],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [0, 82, 204] },
        styles: { fontSize: 8 }
      });

      doc.save(`incident-report-${new Date().toISOString().split('T')[0]}.pdf`);
    };

      

  const handleResetAll = () => {
    setColumnFilters({}); // Clears dropdowns
    if (cardFilter) {
      // This triggers the parent's setActiveFilter(null) if you pass 
      // a reset function prop, or simply clear local table state.
      // For now, we clear the table's internal dropdowns.
    }
  };
    
  /* --- Reusable Confirmation Component --- */
      const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message }: any) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-[420px] overflow-hidden animate-in zoom-in duration-200">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-[#0052CC] hover:bg-blue-700 rounded-lg shadow-sm">Confirm Action</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col h-[calc(100vh-220px)] overflow-visible">
      
      {/* 1. Header Actions */}
      <div className="flex items-center gap-3 mb-4 z-50 overflow-visible">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBulkOpen((prev) => !prev);
            }}
            className="flex items-center gap-2 bg-[#0052CC] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition"
          >
            <Layers className="h-4 w-4" />
            <span>Bulk Actions</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${bulkOpen ? "rotate-180" : ""}`} />
          </button>

          {bulkOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white border rounded-lg shadow-xl z-[100] py-1 animate-in fade-in zoom-in duration-100 max-h-[450px] overflow-y-auto">
              {/* --- CORTEX SECTION --- */}
              <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Cortex XDR</div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setBulkAction("open_new"); setBulkOpen(false); }}>New</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setBulkAction("investigation"); setBulkOpen(false); }}>Under Investigation</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setBulkAction("res_true"); setBulkOpen(false); }}>Resolved True Positive</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600" onClick={() => { setBulkAction("res_false"); setBulkOpen(false); }}>Resolved False Positive</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setBulkAction("res_dup"); setBulkOpen(false); }}>Resolved Duplicate</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-400" onClick={() => { setBulkAction("res_known"); setBulkOpen(false); }}>Resolved Known Issue</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-400" onClick={() => { setBulkAction("res_other"); setBulkOpen(false); }}>Resolved Other</button>

              <div className="border-t my-1"></div>

              {/* --- TREND / QRADAR SECTION --- */}
              <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Trend Micro & QRadar</div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setBulkAction("open_new"); setBulkOpen(false); }}>Open</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setBulkAction("close_resolve"); setBulkOpen(false); }}>Closed</button>
            </div>
          )}
        </div>

        {bulkAction && selectedIds.length > 0 && (
          <button
            onClick={() => handleBulkAction(bulkAction)}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium animate-in slide-in-from-left-2"
          >
            <Check className="h-4 w-4" />
            Apply {bulkAction.replace(/_/g, " ")}
          </button>
        )}

        <div className="relative">
          <button 
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-2 bg-[#1D9C5D] hover:bg-[#16804B] text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm transition-all"
          >
            <Download size={16} />
            Export ({selectedIds.length > 0 ? selectedIds.length : filtered.length})
            <ChevronDown size={14} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
          </button>

          {isExportOpen && (
            <>
              {/* Invisible backdrop to close dropdown when clicking outside */}
              <div className="fixed inset-0 z-50" onClick={() => setIsExportOpen(false)} />
              
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={() => { 
                    exportToCSV(selectedIds.length > 0 ? filtered.filter(e => selectedIds.includes(e.incident_id)) : filtered); 
                    setIsExportOpen(false); 
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <FileText size={16} className="text-green-600" />
                  Export to CSV
                </button>
                <button 
                  onClick={() => { 
                    exportToPDF(selectedIds.length > 0 ? filtered.filter(e => selectedIds.includes(e.incident_id)) : filtered); 
                    setIsExportOpen(false); 
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FileText size={16} className="text-red-600" />
                  Export to PDF
                </button>
                </div>
              </>
            )}
          </div>

        {/* NEW: Reset Button */}
        {(Object.keys(columnFilters).length > 0 || cardFilter) && (
        <button
          onClick={handleResetAll}
          className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
        >
          <X size={16} />
          Reset All Filters
        </button>
        )}

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {selectedIds.length} selected
            </span>
            <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Table */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-white relative border rounded-lg">
        <table className="min-w-[1540px] text-sm border-collapse"> {/* Increased min-width for new column */}
          <thead className="sticky top-0 z-40 bg-white shadow-sm">
            <tr className="bg-white">
              <th className="px-2 py-3 w-10 bg-white border-b text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleAll}
                />
              </th>
              {/* Dynamic Data Columns */}
              {columns.map((col) => (
                <th key={col.key} className={`px-3 py-2 align-top bg-white border-b ${col.width}`}>
                  <div
                    className="flex items-center justify-between font-semibold mb-2 cursor-pointer select-none text-gray-600"
                    onClick={() => {
                      if (sortKey === col.key) setSortAsc(!sortAsc);
                      else { setSortKey(col.key); setSortAsc(true); }
                    }}
                  >
                    {col.label}
                    <div className="flex flex-col leading-none text-gray-300">
                      <ChevronUp size={10} className={sortKey === col.key && sortAsc ? "text-gray-700" : ""} />
                      <ChevronDown size={10} className={sortKey === col.key && !sortAsc ? "text-gray-700" : ""} />
                    </div>
                  </div>
                  <MultiSelectFilter
                    label={col.label}
                    options={getOptions(col.key)}
                    selected={columnFilters[col.key] || []}
                    onChange={(vals: string[]) => setColumnFilters((prev) => ({ ...prev, [col.key]: vals }))}
                  />
                </th>
              ))}
              {/* FIXED: Dedicated Action Header at the far right */}
              <th className="px-3 py-2 text-gray-600 bg-white border-b w-[120px] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filtered.map((item) => (
              <tr key={item.incident_id} className={`border-b bg-white hover:bg-blue-50/30 transition-colors group ${selectedIds.includes(item.incident_id) ? "bg-blue-50/50" : ""}`}>
                <td className="px-2 py-3 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]"
                    checked={selectedIds.includes(item.incident_id)}
                    onChange={() => toggleRow(item.incident_id)}
                  />
                </td>
                <td className="px-3 py-3 font-medium text-gray-700 truncate max-w-[140px]">{item.incident_id}</td>
                <td className="px-3 py-3 text-gray-500 truncate max-w-[180px]">{new Date(item.timestamp).toLocaleString()}</td>
                <td className="px-3 py-3 text-gray-700 truncate max-w-[160px]">{item.customerName}</td>
                <td className="px-3 py-3 text-gray-700 truncate max-w-[140px]">{item.platform}</td>
                <td className="px-3 py-3 text-gray-700 font-semibold truncate max-w-[220px]">{item.incidentName}</td>
                <td className="px-3 py-3 text-gray-500 text-xs max-w-[200px] truncate">{item.description}</td>
                <td className="px-3 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${severityClass[item.severity]}`}>{item.severity}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusClass[item.status] || "bg-gray-100 text-gray-600"}`}>{item.status}</span>
                </td>
                <td className="px-3 py-3 text-gray-400 truncate max-w-[140px]">{item.source}</td>

                {/* NEW: Dedicated Action Status Column before the buttons */}
                <td className="px-3 py-3 text-center">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${actionStatusClass[item.actionStatus || 'New']}`}>
                    {item.actionStatus || "New"}
                  </span>
                </td>

                {/* FIXED: Action Buttons moved to the final column */}
                <td className="px-3 py-3">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setViewIncident(item)} className="p-1 hover:bg-blue-100 rounded-md text-blue-600 transition-colors" title="View Details">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => setEditIncident(item)} className="p-1 hover:bg-green-100 rounded-md text-green-600 transition-colors" title="Edit Incident">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setEmailIncident(item)} className="p-1 hover:bg-purple-100 rounded-md text-purple-600 transition-colors" title="Send Notification">
                      <Mail size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Record Count Footer (NEW PLACEMENT) */}
      <div className="mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600 font-medium">
            Showing <span className="text-[#0052CC] font-bold">{filtered.length}</span> of{" "}
            <span className="text-gray-900 font-bold">{localData.length}</span> incidents
          </p>
          
          {/* Progress bar shows how much of the data is currently visible after filtering */}
          {filtered.length !== localData.length && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500" 
                  style={{ width: `${(filtered.length / localData.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filtered View</span>
            </div>
          )}
        </div>
        <p className="text-[11px] text-gray-400 italic">SOC Dashboard v2.0</p>
      </div>


    {/* 3. STICKY BULK ACTION FOOTER */}
      {selectedIds.length > 0 && bulkAction && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-[110] flex items-center gap-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Selected Action</span>
            <span className="text-sm font-semibold">{bulkAction.replace(/_/g, " ").toUpperCase()} ({selectedIds.length} items)</span>
          </div>
          <div className="h-8 w-[1px] bg-gray-700" />
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedIds([])} className="px-4 py-1.5 text-sm font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button 
              onClick={() => setShowBulkConfirm(true)} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg transition-transform active:scale-95"
            >
              Apply to Selected
            </button>
          </div>
        </div>
      )}

      {/* Bulk Confirm Dialog */}
      <ConfirmDialog 
        isOpen={showBulkConfirm}
        title="Apply Bulk Action?"
        message={`Are you sure you want to change the status of ${selectedIds.length} incidents to "${bulkAction.replace(/_/g, " ").toUpperCase()}"?`}
        onConfirm={() => handleBulkAction(bulkAction)}
        onCancel={() => setShowBulkConfirm(false)}
      />

      {/* 3. Modals */}
      {viewIncident && (
        <ViewIncidentModal
          incident={viewIncident}
          onClose={() => setViewIncident(null)}
          onEdit={(inc) => { setEditIncident(inc); setViewIncident(null); }}
          onNotify={(inc) => { setEmailIncident(inc); setViewIncident(null); }}
        />
      )}
      {editIncident && (
      <EditIncidentModal
        incident={editIncident}
        onClose={() => setEditIncident(null)}
        onSave={(id, updates) => {
              setLocalData(prev => prev.map(item => {
                if (item.incident_id === id) {
                  // 1. Get logged-in analyst info
                  const authUser = JSON.parse(localStorage.getItem("auth_user") || '{"email":"Unknown Analyst"}');
                  const now = new Date().toLocaleString();
                  
                  // 2. Create the new timeline event object
                  const newTimelineEntry = {
                    actionStatus: updates.actionStatus, // Lifecycle (e.g., In Progress)
                    status: item.status,               // Keep technical status
                    remark: updates.remarks,           // The new note
                    actionBy: authUser.email,          // Who did it
                    timestamp: now                     // When
                  };

                  // 3. Update the incident with the new timeline history
                  return { 
                    ...item, 
                    actionStatus: updates.actionStatus, // Update lifecycle
                    // Spread existing timeline and add new entry to the front
                    timeline: [newTimelineEntry, ...(item.timeline || [])] 
                  };
                }
                return item;
              }));
              
              setReminderMessage(`Ticket ${id} status updated and logged to timeline.`);
              setEditIncident(null);
            }}
          />
        )}
      {emailIncident && (
        <EmailReminderModal
          incident={emailIncident}
          onClose={() => setEmailIncident(null)}
          onSend={(data) => {
            setReminderMessage(`Notification email sent to ${data.to}.`);
            setEmailIncident(null);
          }}
        />
      )}

      {/* Place the Bulk Confirmation here to solve the "Cannot find name" error */}
      <ConfirmDialog 
        isOpen={showBulkConfirm}
        title="Confirm Bulk Action"
        message={`You are about to update ${selectedIds.length} incidents. Do you want to proceed?`}
        onConfirm={() => handleBulkAction(bulkAction)}
        onCancel={() => setShowBulkConfirm(false)}
      />

      {/* Toast Notification */}
      {reminderMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-medium">{reminderMessage}</span>
          <button onClick={() => setReminderMessage(null)} className="ml-2 text-gray-400 hover:text-white transition-colors">
            <X size={16}/>
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsTable;