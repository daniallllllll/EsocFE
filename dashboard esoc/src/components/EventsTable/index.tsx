import React, { useState } from "react";
import { useEventTable } from "./useEventTable";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { EventItem } from "../../types/event";
import { ChevronUp, ChevronDown, Layers, Download, Eye, Edit2, Mail, Check, X, ChevronRight } from "lucide-react";

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
  { key: "incidentId", label: "Incident ID", width: "w-[140px]" },
  { key: "timestamp", label: "Time", width: "w-[180px]" },
  { key: "customerName", label: "Customer", width: "w-[160px]" },
  { key: "platform", label: "Platform", width: "w-[140px]" },
  { key: "incidentName", label: "Incident", width: "w-[220px]" },
  { key: "severity", label: "Severity", width: "w-[120px]" },
  { key: "status", label: "Status", width: "w-[120px]" },
  { key: "description", label: "Description", width: "w-[160px]" },
  { key: "source", label: "Source", width: "w-[140px]" },
];

const severityClass: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusClass: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Open: "bg-purple-100 text-purple-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-200 text-gray-600",
  "False Positive": "bg-slate-100 text-slate-600",
};

/* =====================================================
   COMPONENT
   ===================================================== */
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

  // UI States
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [viewIncident, setViewIncident] = useState<EventItem | null>(null);
  const [editIncident, setEditIncident] = useState<EventItem | null>(null);
  const [emailIncident, setEmailIncident] = useState<EventItem | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  // Define unique options for filters
  const getOptions = (key: keyof EventItem) => {
    if (key === "severity") return ["Critical", "High", "Medium", "Low"];
    if (key === "status") return ["New", "Open", "In Progress", "Resolved", "Closed", "False Positive"];
    return Array.from(new Set(localData.map((item) => String(item[key] ?? ""))))
      .filter(Boolean)
      .sort();
  };

  /* ===================== HANDLERS ===================== */
  const handleBulkAction = (action: string) => {
    const statusMap: Record<string, string> = {
      reviewed: "Open",
      investigation: "In Progress",
      resolved: "Resolved",
      closed: "Closed",
      false_positive: "False Positive",
    };

    setLocalData((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.incidentId)
          ? { ...item, status: statusMap[action] || item.status }
          : item
      )
    );

    setReminderMessage(`Bulk Action: "${action.replace("_", " ")}" applied to ${selectedIds.length} items.`);
    setBulkAction("");
    setSelectedIds([]);
  };

  const exportToCSV = (dataToExport: EventItem[]) => {
    const headers = columns.map(col => col.label).join(",");
    const rows = dataToExport.map(e => 
      columns.map(col => `"${String(e[col.key] ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `incident-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
            <div className="absolute left-0 mt-2 w-64 bg-white border rounded-lg shadow-xl z-[100] py-1 animate-in fade-in zoom-in duration-100">
              <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Incident Sta</div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex justify-between items-center" onClick={() => { setBulkAction("reviewed"); setBulkOpen(false); }}>
                Mark as Reviewed <ChevronRight size={12} className="text-gray-300"/>
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex justify-between items-center" onClick={() => { setBulkAction("investigation"); setBulkOpen(false); }}>
                Start Investigation <ChevronRight size={12} className="text-gray-300"/>
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex justify-between items-center" onClick={() => { setBulkAction("resolved"); setBulkOpen(false); }}>
                Resolve Selected <ChevronRight size={12} className="text-gray-300"/>
              </button>
              
              <div className="border-t my-1"></div>
              
              <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alert Handling</div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600" onClick={() => { setBulkAction("false_positive"); setBulkOpen(false); }}>
                False Positive
              </button>
              
              <div className="border-t my-1"></div>
              
              <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Management</div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { exportToCSV(filtered.filter(e => selectedIds.includes(e.incidentId))); setBulkOpen(false); }}>
                Export Batch
              </button>
            </div>
          )}
        </div>

        {bulkAction && selectedIds.length > 0 && (
          <button
            onClick={() => handleBulkAction(bulkAction)}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium animate-in slide-in-from-left-2"
          >
            <Check className="h-4 w-4" />
            Apply {bulkAction.replace("_", " ")}
          </button>
        )}

        <button
          onClick={() => exportToCSV(filtered.filter(e => selectedIds.includes(e.incidentId)))}
          disabled={selectedIds.length === 0}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition"
        >
          <Download className="h-4 w-4" />
          Export ({selectedIds.length})
        </button>

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
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="min-w-[1400px] text-sm border-collapse">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="px-2 py-3 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleAll}
                />
              </th>
              {columns.map((col) => (
                <th key={col.key} className={`px-3 py-2 align-top ${col.width}`}>
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
              <th className="px-3 py-2 text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.incidentId} className="border-b hover:bg-blue-50/30 transition-colors group">
                <td className="px-2 py-3 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]"
                    checked={selectedIds.includes(item.incidentId)}
                    onChange={() => toggleRow(item.incidentId)}
                  />
                </td>
                <td className="px-3 py-3 font-medium text-gray-700">{item.incidentId}</td>
                <td className="px-3 py-3 text-gray-500">{new Date(item.timestamp).toLocaleString()}</td>
                <td className="px-3 py-3 text-gray-700">{item.customerName}</td>
                <td className="px-3 py-3 text-gray-700">{item.platform}</td>
                <td className="px-3 py-3 text-gray-700">{item.incidentName}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${severityClass[item.severity]}`}>{item.severity}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusClass[item.status] || "bg-gray-100 text-gray-600"}`}>{item.status}</span>
                </td>
                <td className="px-3 py-3 truncate max-w-[160px] text-gray-500">{item.description}</td>
                <td className="px-3 py-3 text-gray-400">{item.source}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setViewIncident(item)}
                      className="p-1 hover:bg-blue-100 rounded-md transition-colors text-blue-600"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => setEditIncident(item)}
                      className="p-1 hover:bg-green-100 rounded-md transition-colors text-green-600"
                      title="Edit Incident"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setEmailIncident(item)}
                      className="p-1 hover:bg-purple-100 rounded-md transition-colors text-purple-600"
                      title="Send Notification"
                    >
                      <Mail size={16} />
                    </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            setLocalData(prev => prev.map(item => item.incidentId === id ? { ...item, ...updates } : item));
            setReminderMessage("Incident updated successfully.");
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