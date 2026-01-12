import React, { useMemo, useState } from "react";
import { useEventTable } from "./useEventTable";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { EventItem } from "../../types/event";
import { ChevronUp, ChevronDown, Layers, Download, Eye, Edit2, Mail, Check, X } from "lucide-react";

// Import your new Modals
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
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-200 text-gray-600",
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
    if (key === "status") return ["New", "Open", "Resolved", "Closed"];
    return Array.from(new Set(localData.map((item) => String(item[key] ?? ""))))
      .filter(Boolean)
      .sort();
  };

  /* ===================== HANDLERS ===================== */
  const handleBulkAction = (action: string) => {
    const statusMap: Record<string, string> = {
      reviewed: "Reviewed",
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

    setReminderMessage(`Applied ${action} to ${selectedIds.length} items.`);
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
            <div className="absolute left-0 mt-2 w-56 bg-white border rounded-lg shadow-xl z-[100]">
              <div className="p-2 border-b bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Incident Status
              </div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setBulkAction("reviewed"); setBulkOpen(false); }}>Mark as Reviewed</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setBulkAction("resolved"); setBulkOpen(false); }}>Resolve Incident</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setBulkAction("closed"); setBulkOpen(false); }}>Close Incident</button>
              <div className="p-2 border-b bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Alert Handling
              </div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setBulkAction("false_positive"); setBulkOpen(false); }}>False Positive</button>
            </div>
          )}
        </div>

        {bulkAction && selectedIds.length > 0 && (
          <button
            onClick={() => handleBulkAction(bulkAction)}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
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
              {selectedIds.length} incidents selected
            </span>
            <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-[1400px] text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-3">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleAll}
                />
              </th>
              {columns.map((col) => (
                <th key={col.key} className={`px-3 py-2 align-top ${col.width}`}>
                  <div
                    className="flex items-center justify-between font-semibold mb-2 cursor-pointer select-none"
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
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.incidentId} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-2 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.incidentId)}
                    onChange={() => toggleRow(item.incidentId)}
                  />
                </td>
                <td className="px-3 py-3">{item.incidentId}</td>
                <td className="px-3 py-3">{new Date(item.timestamp).toLocaleString()}</td>
                <td className="px-3 py-3">{item.customerName}</td>
                <td className="px-3 py-3">{item.platform}</td>
                <td className="px-3 py-3">{item.incidentName}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${severityClass[item.severity]}`}>{item.severity}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusClass[item.status]}`}>{item.status}</span>
                </td>
                <td className="px-3 py-3 truncate max-w-[160px]">{item.description}</td>
                <td className="px-3 py-3">{item.source}</td>
                <td className="px-3 py-3 flex gap-2">
                  <Eye size={16} className="text-blue-600 cursor-pointer" onClick={() => setViewIncident(item)} />
                  <Edit2 size={16} className="text-green-600 cursor-pointer" onClick={() => setEditIncident(item)} />
                  <Mail size={16} className="text-purple-600 cursor-pointer" onClick={() => setEmailIncident(item)} />
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
            setEditIncident(null);
          }}
        />
      )}
      {emailIncident && (
        <EmailReminderModal
          incident={emailIncident}
          onClose={() => setEmailIncident(null)}
          onSend={(data) => {
            console.log("Email Sent to", data);
            setReminderMessage(`Notification email sent to ${data.to}.`);
            setEmailIncident(null);
          }}
        />
      )}

      {/* Reminder Message Popup */}
      {reminderMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-[100] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span>{reminderMessage}</span>
          <button onClick={() => setReminderMessage(null)}><X size={14}/></button>
        </div>
      )}
    </div>
  );
};

export default EventsTable;