import React, { useMemo, useState, useEffect } from "react";
import { Eye, Trash2, Mail, Edit2, Check } from "lucide-react";
import { ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
import { sampleEvents } from "../data/events.sample";
import { EventItem } from "../types/event";
import { Search, X } from "lucide-react";
import { Download } from "lucide-react";
import { Layers } from "lucide-react";




/* =====================================================
   PROPS
   ===================================================== */
interface EventsTableProps {
  events?: EventItem[];
  cardFilter?: { key: keyof EventItem; value: string };
}
const columns: {
  key: keyof EventItem;
  label: string;
  width: string;
}[] = [
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

type BulkAction =
  | "reviewed"
  | "investigation"
  | "contained"
  | "resolved"
  | "closed"
  | "false_positive"
  | "suppress"
  | "archive"
  | "export";

  const severityClass = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusClass = {
  New: "bg-blue-100 text-blue-700",
  Open: "bg-purple-100 text-purple-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-200 text-gray-600",
};

/* =====================================================
   HELPER COMPONENTS
   ===================================================== */

const MultiSelectFilter = ({ options, selected, onChange, label }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((opt: string) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full font-normal">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-gray-300 rounded px-2 py-1 text-[11px] bg-white hover:border-orange-400"
      >
        <span className="truncate">{selected.length > 0 ? `${selected.length} Selected` : `All ${label}`}</span>
        <ChevronDown size={10} className={isOpen ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {isOpen && (
        <>
          {/* Transparent click-away overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute top-full left-0 mt-1 w-52 bg-white border rounded shadow-xl z-50 p-2 animate-in fade-in zoom-in duration-100">
            <div className="relative mb-2">
               <Search size={12} className="absolute left-2 top-2 text-gray-400" />
               <input
                className="w-full pl-7 pr-2 py-1 border rounded text-xs outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="max-h-40 overflow-y-auto custom-scrollbar">
              {filteredOptions.map((opt: string) => (
                <label key={opt} className="flex items-center gap-2 px-1 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    checked={selected.includes(opt)}
                    onChange={() => {
                      const next = selected.includes(opt) 
                        ? selected.filter((s: string) => s !== opt) 
                        : [...selected, opt];
                      onChange(next);
                    }}
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
              {filteredOptions.length === 0 && (
                <div className="text-center py-2 text-gray-400 text-[10px]">No results found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* =====================================================
   COMPONENT
   ===================================================== */
export const EventsTable: React.FC<EventsTableProps> = ({ events = sampleEvents, cardFilter }) => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof EventItem>("timestamp");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction | "">("");
  const [bulkOpen, setBulkOpen] = useState(false);

  

  const [columnFilters, setColumnFilters] = useState<Partial<Record<keyof EventItem, string[]>>>({});
  const [viewIncident, setViewIncident] = useState<EventItem | null>(null);
  const [editIncident, setEditIncident] = useState<EventItem | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [emailIncident, setEmailIncident] = useState<EventItem | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  

  // Local copy of events to allow edits and deletes
  const [localData, setLocalData] = useState<EventItem[]>(events);

  // Sync localData whenever props.events changes
  useEffect(() => {
    setLocalData(events);
  }, [events]);

// ✅ ADD THIS RIGHT HERE
  useEffect(() => {
    const close = () => setBulkOpen(false);
    if (bulkOpen) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [bulkOpen]);

  useEffect(() => {
  setSelectedIds([]);
  }, [columnFilters, search]);

  
  /* ===================== Filtering & Sorting ===================== */
    const filtered = useMemo(() => {
      return localData
        /* ===== CARD FILTER ===== */
        .filter((e) => {
          if (!cardFilter) return true;
          return e[cardFilter.key] === cardFilter.value;
        })

        /* ===== GLOBAL SEARCH ===== */
        .filter((e) => {
          if (!search) return true;
          const q = search.toLowerCase();
          return (
            e.incidentName.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.source.toLowerCase().includes(q) ||
            (e.customerName ?? "").toLowerCase().includes(q)
          );
        })

        /* ===== COLUMN FILTERS (SINGLE SOURCE OF TRUTH) ===== */
        .filter((e) => {
          return Object.entries(columnFilters).every(([key, values]) => {
            if (!values || (Array.isArray(values) && values.length === 0)) return true;

            const cellValue = String(e[key as keyof EventItem] ?? "");

            return values.includes(cellValue);
          });
            
        })

        /* ===== SORTING ===== */
        .sort((a, b) => {
          const aVal = a[sortKey];
          const bVal = b[sortKey];

          if (aVal < bVal) return sortAsc ? -1 : 1;
          if (aVal > bVal) return sortAsc ? 1 : -1;
          return 0;
        });
    }, [
      localData,
      search,
      sortKey,
      sortAsc,
      cardFilter,
      columnFilters,
    ]);

      const handleSort = (key: keyof EventItem) => {
      if (sortKey === key) setSortAsc(!sortAsc);
      else {
      setSortKey(key);
      setSortAsc(true);
      }
    };
    /* ===================== Selection Helpers ===================== */
    const toggleRow = (id: string) => {
      setSelectedIds((prev) =>
        prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id]
      );
    };

    const toggleAll = () => {
      if (selectedIds.length === filtered.length) {
        setSelectedIds([]);
      } else {
        setSelectedIds(filtered.map((e) => e.incidentId));
      }
    };

      


  /* ===================== View Details ===================== */
  const handleViewDetails = (incident: EventItem) => setViewIncident(incident);
  const handleCloseView = () => setViewIncident(null);

  /* ===================== Edit Details ===================== */
  const handleEditDetails = (incident: EventItem) => {
    setEditIncident(incident);
    setEditStatus(incident.status);
    setEditDescription(incident.description);
  };
  const handleSaveEdit = () => {
    if (!editIncident) return;

    setLocalData((prev) =>
      prev.map((item) =>
        item.incidentId === editIncident.incidentId
          ? { ...item, status: editStatus, description: editDescription }
          : item
      )
    );

    setReminderMessage(
      `Changes saved for incident "${editIncident.incidentId}".`
    );

    setEditIncident(null);
  };
  const handleCloseEdit = () => setEditIncident(null);

  /* ===================== Send Notification Email ===================== */
  const handleSendReminder = (incident: EventItem) => {
    setEmailIncident(incident);

    const emailMatch = incident.source.match(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
    );
    const to = emailMatch ? emailMatch[0] : "";
    setEmailTo(to);
    setEmailSubject(`Notification: ${incident.incidentId} - ${incident.incidentName}`);
    setEmailBody(
      `Dear ${to ? to.split("@")[0] : "User"},\n\n` +
        `This is a notification regarding the incident:\n\n` +
        `Incident ID: ${incident.incidentId}\n` +
        `Incident Name: ${incident.incidentName}\n` +
        `Status: ${incident.status}\n` +
        `Description: ${incident.description}\n\n` +
        `Please take necessary actions.\n\nThank you.`
    );
  };

  const handleSendEmail = () => {
    alert(
      `Email sent to: ${emailTo}\n\nSubject: ${emailSubject}\n\nBody:\n${emailBody}`
    );
    setReminderMessage(`Notification email successfully sent to ${emailTo}.`);
    setEmailIncident(null);
  };
  const handleCloseEmail = () => setEmailIncident(null);

      /* ===================== Download Report ===================== */
    const handleDownloadReport = () => {

      const dataToExport = filtered.filter((e) =>
        selectedIds.includes(e.incidentId)
      );
      if (filtered.length === 0) return;


      const headers = [
        "Incident ID",
        "Time",
        "Customer",
        "Platform",
        "Incident",
        "Severity",
        "Status",
        "Description",
        "Source",
      ];

      const rows = dataToExport.map((e) => [
        e.incidentId,
        new Date(e.timestamp).toLocaleString(),
        e.customerName ?? "",
        e.platform,
        e.incidentName,
        e.severity,
        e.status,
        e.description,
        e.source,
      ]);

      const csv =
        [headers, ...rows]
          .map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
          )
          .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `incident-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();

      URL.revokeObjectURL(url);
    };

      const handleBulkAction = () => {
        if (!bulkAction || selectedIds.length === 0) return;

        // Export is special
        if (bulkAction === "export") {
          handleDownloadReport();
          return;
        }

        const statusMap: Record<string, string> = {
          reviewed: "Reviewed",
          investigation: "Under Investigation",
          contained: "Contained",
          resolved: "Resolved",
          closed: "Closed",
          false_positive: "False Positive",
          suppress: "Suppressed",
          archive: "Archived",
        };

        setLocalData((prev) =>
          prev.map((item) =>
            selectedIds.includes(item.incidentId)
              ? { ...item, status: statusMap[bulkAction] }
              : item
          )
        );

        setReminderMessage(
          `Bulk action "${bulkAction.replace("_", " ")}" applied to ${selectedIds.length} incident(s).`
        );

        setBulkAction("");
        setSelectedIds([]);
      };

    const renderColumnFilter = (key: keyof EventItem) => {
        // 1. Get current selections for this specific column
        const currentSelections = columnFilters[key] || [];

        // 2. Logic to generate the List of Values (LOV)
        const getOptions = (k: keyof EventItem) => {
          if (k === "severity") return ["Critical", "High", "Medium", "Low"];
          if (k === "status") return ["New", "Open", "Resolved", "Closed"];
          
          // For other columns, extract unique values currently in your data
          return Array.from(new Set(localData.map((item) => String(item[k] ?? ""))))
            .filter(Boolean)
            .sort();
        };

        const columnLabel = columns.find((c) => c.key === key)?.label || "Value";

        // 3. Return the new Multi-Select Searchable component
        return (
          <MultiSelectFilter
            label={columnLabel}
            options={getOptions(key)}
            selected={currentSelections}
            onChange={(vals: string[]) => 
              setColumnFilters((prev) => ({ ...prev, [key]: vals }))
            }
          />
        );
      };
      
      
    const DropdownItem = ({
        label,
        onClick,
      }: {
        label: string;
        onClick: () => void;
      }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
            setBulkOpen(false);
          }}
          className="
            w-full px-4 py-2 text-left
            text-sm text-gray-700
            hover:bg-gray-100
          "
        >
          {label}
        </button>
      );

    return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col h-[calc(100vh-220px)] overflow-visible">
          <div className="flex items-center gap-3 relative z-50 overflow-visible">
    {/* ================= BULK ACTIONS DROPDOWN ================= */}
          <div className="relative">
            <button
              onClick={ (e) => {
                e.stopPropagation();
                setBulkOpen((prev) => !prev);
              }}
              className="
                flex items-center gap-2
                bg-tmone-blue text-white
                px-4 py-3 rounded-lg
                text-sm font-medium
                shadow-card
                hover:bg-tmone-blue/90
              "
            >
              <Layers className="h-4 w-4" />

              <span>Bulk Actions</span>
              
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  bulkOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {bulkOpen && (
              <div
                className="
                  absolute left-0 mt-2 w-56
                  bg-white border rounded-lg shadow-card
                  z-50
                "
                onClick={(e) => e.stopPropagation()}
              >
                {/* ===== INCIDENT LIFECYCLE ===== */}
                <div className="relative group">
                  <div className="flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100">
                    Incident Lifecycle
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="absolute top-0 left-full ml-1 hidden group-hover:block
                                  w-56 bg-white border rounded-lg shadow-card">
                    <DropdownItem label="Mark as Reviewed" onClick={() => setBulkAction("reviewed")} />
                    <DropdownItem label="Under Investigation" onClick={() => setBulkAction("investigation")} />
                    <DropdownItem label="Contained" onClick={() => setBulkAction("contained")} />
                    <DropdownItem label="Resolved" onClick={() => setBulkAction("resolved")} />
                    <DropdownItem label="Close Incident" onClick={() => setBulkAction("closed")} />
                  </div>
                </div>

                {/* ===== ALERT HANDLING ===== */}
                <div className="relative group">
                  <div className="flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100">
                    Alert Handling
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="absolute top-0 left-full ml-1 hidden group-hover:block
                                  w-56 bg-white border rounded-lg shadow-card">
                    <DropdownItem label="False Positive" onClick={() => setBulkAction("false_positive")} />
                    <DropdownItem label="Suppress Alerts" onClick={() => setBulkAction("suppress")} />
                  </div>
                </div>

                <div className="border-t my-1" />

                {/* ===== GOVERNANCE ===== */}
                <DropdownItem
                  label="Archive"
                  onClick={() => setBulkAction("archive")}
                />
              </div>
            )}
            </div>
          {/* ================= APPLY ================= */}
          <button
            onClick={handleBulkAction}
            disabled={!bulkAction || selectedIds.length === 0}
            className={`
              px-4 py-3 rounded-lg
              text-sm font-medium
              transition
              ${
                bulkAction && selectedIds.length > 0
                  ? "bg-tmone-blue text-white hover:bg-tmone-blue/90"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Apply
          </button>

          {/* ================= EXPORT ================= */}
          <button
            onClick={handleDownloadReport}
            disabled={selectedIds.length === 0}
            className="
              flex items-center gap-2
              bg-green-600 text-white
              px-4 py-3 rounded-lg
              text-sm font-medium
              shadow-card
              hover:bg-green-700
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          {selectedIds.length > 0 && (
            <span className="text-xs text-gray-500">
              {selectedIds.length} selected
            </span>
          )}
        </div>

          
      {/* TABLE */}
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-[1400px] text-sm border-collapse bg-white">
          <thead className="px-4 py-3 text-left text-sm font-semibold text-gray-700 !bg-white whitespace-nowrap border-b">
            <tr>
              {/* ===== CHECKBOX COLUMN ===== */}
              <th className="w-[56px] px-2 align-top text-center">
                <input
                  type="checkbox"
                  checked={
                    filtered.length > 0 &&
                    selectedIds.length === filtered.length
                  }
                  onChange={toggleAll}
                />
              </th>

              {/* ===== DATA COLUMNS ===== */}
              {columns.map((col) => {
                const isActive = sortKey === col.key;

                return (
                  <th
                    key={col.key}
                    className={`px-3 py-2 align-top ${col.width} hover:bg-gray-50 transition`}
                  >
                    {/* COLUMN TITLE + SORT */}
                    <div
                      className="flex items-center justify-between cursor-pointer select-none"
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="font-semibold text-sm">
                        {col.label}
                      </span>

                      <div className="flex flex-col leading-none">
                        <ChevronUp
                          size={12}
                          className={
                            isActive && sortAsc
                              ? "text-gray-700"
                              : "text-gray-300"
                          }
                        />
                        <ChevronDown
                          size={12}
                          className={
                            isActive && !sortAsc
                              ? "text-gray-700"
                              : "text-gray-300"
                          }
                        />
                      </div>
                    </div>

                    {/* FILTER INPUT (BELOW TITLE) */}
                    <div className="mt-2 flex items-center gap-1">
                      {renderColumnFilter(col.key)}
                    </div>
                  </th>
                );
              })}

              {/* ===== ACTIONS ===== */}
              <th className="w-[100px] px-3 py-2 align-top">
                Actions
              </th>
            </tr>
          </thead>
 
          <tbody>
            {filtered.map((e) => (
              <tr
                key={e.incidentId}
                className="
                  border-b
                  odd:bg-white
                  even:bg-gray-50
                  hover:bg-blue-50
                  transition
                "
              >
                <td className="px-4 py-2 w-[56px] text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(e.incidentId)}
                    onChange={() => toggleRow(e.incidentId)}
                  />
                </td>
                <td className="px-4 py-3 text-sm hover:bg-gray-50">{e.incidentId}</td>
                <td className="px-4 py-3 text-sm hover:bg-gray-50">{new Date(e.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm hover:bg-gray-50">{e.customerName}</td>
                <td className="px-4 py-3 text-sm hover:bg-gray-50">{e.platform}</td>
                <td className="px-4 py-3 text-sm hover:bg-gray-50">{e.incidentName}</td>
                <td className="px-4 py-3 text-sm hover:bg-gray-50">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${severityClass[e.severity]}`}>
                  {e.severity}
                </span>
              </td>

              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusClass[e.status]}`}>
                  {e.status}
                </span>
              </td>
                <td className="px-4 py-2 max-w-xs truncate" title={e.description}>
                  {e.description}
                </td>
                <td className="px-4 py-2 max-w-xs truncate">{e.source}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Eye
                    size={16}
                    className="cursor-pointer text-blue-600"
                    onClick={() => handleViewDetails(e)}
                  />
                  <Edit2
                    size={16}
                    className="cursor-pointer text-green-600"
                    onClick={() => handleEditDetails(e)}
                  />
                  <Mail
                    size={16}
                    className="cursor-pointer text-purple-600"
                    onClick={() => handleSendReminder(e)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-10">No incidents found</div>
        )}
      </div>

      {/* ================= INCIDENT DETAIL DRAWER ================= */}
      {viewIncident && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setViewIncident(null)}
          />

          {/* Drawer */}
          <div className="
            fixed top-0 right-0 h-full w-[420px]
            bg-white z-50
            shadow-2xl
            flex flex-col
            animate-slide-in
          ">
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Incident Details
                </h2>
                <p className="text-xs text-gray-500">
                  ID: {viewIncident.incidentId}
                </p>
              </div>

              <button
                onClick={() => setViewIncident(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm">
              
              {/* Status & Severity */}
              <div className="flex gap-2">
                <span className={`
                  px-2 py-1 rounded text-xs font-semibold
                  ${viewIncident.status === "Open" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}
                `}>
                  {viewIncident.status}
                </span>

                <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold">
                  {viewIncident.severity}
                </span>
              </div>

              {/* Core Info */}
              <div>
                <p className="text-xs text-gray-500">Incident Name</p>
                <p className="font-semibold text-gray-900">
                  {viewIncident.incidentName}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Platform</p>
                <p>{viewIncident.platform}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p>{viewIncident.customerName ?? "-"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Detected Time</p>
                <p>{new Date(viewIncident.timestamp).toLocaleString()}</p>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-gray-800 whitespace-pre-line">
                  {viewIncident.description}
                </p>
              </div>

              {/* Source */}
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="break-all text-gray-700">
                  {viewIncident.source}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t px-5 py-3 flex gap-2">
              <button
                className="flex-1 h-9 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                onClick={() => {
                  setEditIncident(viewIncident);
                  setViewIncident(null);
                }}
              >
                Edit Incident
              </button>

              <button
                className="flex-1 h-9 rounded bg-purple-600 text-white text-sm hover:bg-purple-700"
                onClick={() => {
                  handleSendReminder(viewIncident);
                  setViewIncident(null);
                }}
              >
                Notify
              </button>
            </div>
          </div>
        </>
      )}


      {/* EDIT DETAILS MODAL */}
      {editIncident && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={handleCloseEdit}
        >
          <div
            className="bg-white p-6 rounded-xl w-96 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Edit Incident</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block font-semibold">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-1"
                onClick={handleSaveEdit}
              >
                <Check size={16} /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND REMINDER EMAIL MODAL */}
      {emailIncident && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={handleCloseEmail}
        >
          <div
            className="bg-white p-6 rounded-xl w-96 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Send Notification Email</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block font-semibold">To</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Body</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                  rows={6}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-purple-600 text-white rounded"
                onClick={handleSendEmail}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMINDER MESSAGE MODAL */}
      {reminderMessage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
          onClick={() => setReminderMessage(null)}
        >
          <div
            className="bg-white p-4 rounded-xl w-80 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm">{reminderMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};


export default EventsTable;
