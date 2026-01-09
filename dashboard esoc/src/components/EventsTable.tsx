import React, { useMemo, useState, useEffect } from "react";
import { Eye, Trash2, Mail, Edit2, Check } from "lucide-react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { sampleEvents } from "../data/events.sample";
import { EventItem } from "../types/event";
import { Search, X } from "lucide-react";
import { Download } from "lucide-react";




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
  

  const [columnFilters, setColumnFilters] = useState<Partial<Record<keyof EventItem, string>>>({});
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
          return Object.entries(columnFilters).every(([key, value]) => {
            if (!value) return true;

            const cell = e[key as keyof EventItem];
            if (!cell) return false;

            return String(cell)
              .toLowerCase()
              .includes(value.toLowerCase());
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

      const rows = filtered.map((e) => [
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
      // Dropdown filters
      if (key === "severity") {
        return (
          <select
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            value={columnFilters[key] ?? ""}
            onChange={(e) =>
              setColumnFilters((prev) => ({
                ...prev,
                [key]: e.target.value,
              }))
            }
          >
            <option value="">All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        );
      }

      if (key === "status") {
        return (
          <select
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            value={columnFilters[key] ?? ""}
            onChange={(e) =>
              setColumnFilters((prev) => ({
                ...prev,
                [key]: e.target.value,
              }))
            }
          >
            <option value="">All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        );
      }
      
      // Default text filter
      return (
        <input
          type="text"
          className="w-full border border-gray-300 roundedmpx-2 py-1 text-xs text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
          placeholder="Filter..."
          value={columnFilters[key] ?? ""}
          onChange={(e) =>
            setColumnFilters((prev) => ({
              ...prev,
              [key]: e.target.value,
            }))
          }
        />
      );
    };

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col h-[calc(100vh-220px)]">
          <div className="flex items-center gap-4 mb-4">
      {/* ================= SEARCH ================= */}
      <input
        className="
          h-11 w-[260px]
          bg-white border rounded-lg px-4
          text-sm
          shadow-card
          focus:outline-none focus:ring-1 focus:ring-tmone-blue
        "
        placeholder="Search incident, description, source..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= BULK ACTIONS ================= */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-card">
        <span className="text-sm font-medium text-gray-700">
          Bulk Actions
        </span>

        <select
          value={bulkAction}
          onChange={(e) => setBulkAction(e.target.value as BulkAction)}
          className="border rounded px-3 py-2 text-sm bg-white min-w-[220px]"
        >
          <option value="">Select Action</option>

          {/* INCIDENT LIFECYCLE */}
          <option value="reviewed">Mark as Reviewed</option>
          <option value="investigation">Under Investigation</option>
          <option value="contained">Contained</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Close Incident</option>

          <option disabled>────────────</option>

          {/* OPERATIONAL */}
          <option value="false_positive">False Positive</option>
          <option value="suppress">Suppress Alerts</option>

          <option disabled>────────────</option>

          {/* GOVERNANCE */}
          <option value="export">Export Selected</option>
          <option value="archive">Archive</option>
        </select>

        <button
          onClick={handleBulkAction}
          disabled={!bulkAction || selectedIds.length === 0}
          className={`
            px-4 py-2 rounded text-sm font-medium transition
            ${
              bulkAction && selectedIds.length > 0
                ? "bg-tmone-blue text-white hover:bg-tmone-blue/90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          Apply
        </button>

        {selectedIds.length > 0 && (
          <span className="text-xs text-gray-500">
            {selectedIds.length} selected
          </span>
        )}
      </div>


      {/* ================= EXPORT ================= */}
      <div className="ml-auto relative">
        <div className="group relative">
          <button
            disabled={filtered.length === 0}
            className="
              flex items-center gap-2
              bg-white p-3 rounded-lg shadow-card
              text-sm font-medium
              hover:bg-gray-50
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Download className="h-4 w-4" />
            Export
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {filtered.length > 0 && (
            <div className="
              absolute right-0 mt-2 w-44
              bg-white border rounded-lg shadow-card
              opacity-0 scale-95
              group-hover:opacity-100 group-hover:scale-100
              transition-all z-50
            ">
              <button
                onClick={handleDownloadReport}
                className="
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100
                  flex items-center gap-2
                "
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* TABLE */}
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-[1400px] text-sm border-collapse">
          <thead className="bg-tmone-blue text-white sticky top-0 z-20">
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
                    className={`px-3 py-2 align-top ${col.width}`}
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
                              ? "text-white"
                              : "text-white/50"
                          }
                        />
                        <ChevronDown
                          size={12}
                          className={
                            isActive && !sortAsc
                              ? "text-white"
                              : "text-white/50"
                          }
                        />
                      </div>
                    </div>

                    {/* FILTER INPUT (BELOW TITLE) */}
                    <div className="mt-2">
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
              <tr key={e.incidentId} className="border-b hover:bg-blue-50">
                <td className="px-4 py-2 w-[56px] text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(e.incidentId)}
                    onChange={() => toggleRow(e.incidentId)}
                  />
                </td>
                <td className="px-4 py-2">{e.incidentId}</td>
                <td className="px-4 py-2">{new Date(e.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2">{e.customerName}</td>
                <td className="px-4 py-2">{e.platform}</td>
                <td className="px-4 py-2">{e.incidentName}</td>
                <td className="px-4 py-2">{e.severity}</td>
                <td className="px-4 py-2">{e.status}</td>
                <td className="px-4 py-2 max-w-xs truncate">{e.description}</td>
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
