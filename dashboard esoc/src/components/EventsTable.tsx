import React, { useMemo, useState, useEffect } from "react";
import { Eye, Trash2, Mail, Edit2, Check } from "lucide-react";
import { ChevronUp, ChevronDown } from "lucide-react";

/* =====================================================
   SAMPLE EVENTS
   ===================================================== */
export interface EventItem {
  incidentId: string;
  timestamp: string;
  platform: string;
  severity: string;
  status: string;
  incidentName: string;
  description: string;
  source: string; // Should contain email
  customerName?: string;
}

export const sampleEvents: EventItem[] = [
  {
    incidentId: "WB-21683-20250909-00010",
    timestamp: "2025-09-09T03:14:10Z",
    platform: "Trend Micro",
    severity: "Critical",
    status: "Open",
    incidentName: "Malicious Activity Detected",
    description: "Credential theft behavior detected.",
    source: "DESKTOP-001 • johndoe@company.com",
    customerName: "Acme Corp",
  },
  {
    incidentId: "866602",
    timestamp: "2025-07-29T11:31:24Z",
    platform: "QRadar",
    severity: "High",
    status: "Open",
    incidentName: "Concurrent Sessions Above Threshold",
    description: "Possible DoS attempt detected.",
    source: "Fortigate SOC • alice@company.com",
    customerName: "Beta Inc",
  },
  {
    incidentId: "119",
    timestamp: "2025-11-30T22:08:53Z",
    platform: "Cortex XDR",
    severity: "Low",
    status: "Resolved",
    incidentName: "Local Threat Detected",
    description: "Blocked malware execution.",
    source: "XDR Agent pkp-prod1 • bob@company.com",
    customerName: "Gamma LLC",
  },
];

/* =====================================================
   PROPS
   ===================================================== */
interface EventsTableProps {
  events?: EventItem[];
  cardFilter?: { key: keyof EventItem; value: string };
}

/* =====================================================
   COMPONENT
   ===================================================== */
export const EventsTable: React.FC<EventsTableProps> = ({ events = sampleEvents, cardFilter }) => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof EventItem>("timestamp");
  const [sortAsc, setSortAsc] = useState(true);

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
      .filter((e) => {
        // Apply card filter first
        if (cardFilter) {
          return e[cardFilter.key] === cardFilter.value;
        }
        return true;
      })
      .filter((e) => {
        // Apply search
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          e.incidentName.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.source.toLowerCase().includes(q) ||
          (e.customerName ?? "").toLowerCase().includes(q)
        );
      })
      .filter((e) => {
      if (severityFilter && e.severity !== severityFilter) return false;
      if (statusFilter && e.status !== statusFilter) return false;
      return true;
    })
      .sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal < bVal) return sortAsc ? -1 : 1;
        if (aVal > bVal) return sortAsc ? 1 : -1;
        return 0;
      });
      }, [localData, search, sortKey, sortAsc, cardFilter, severityFilter, statusFilter]);

      const handleSort = (key: keyof EventItem) => {
      if (sortKey === key) setSortAsc(!sortAsc);
      else {
      setSortKey(key);
      setSortAsc(true);
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
    setReminderMessage(`Reminder email successfully sent to ${emailTo}.`);
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

  return (
    <div className="bg-white rounded-xl shadow p-4 h-full flex flex-col">
      <div className="flex items-center mb-4">
        {/* Search */}
        <div className="flex items-center gap-2"></div>
        <input
          className="h-9 w-[240px] border px-3 rounded text-sm"
          placeholder="Search incident, description, source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Severity Filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="h-9 w-[130px] border rounded px-2 text-sm"
        >
          <option value="">All Severity</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 w-[120px] border rounded px-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="Resolved">Resolved</option>
        </select>
        
        {/* Download Report Button */}
        <div className="ml-auto">
        <button
          onClick={handleDownloadReport}
          disabled={filtered.length === 0}
          className="h-9 px-4 bg-green-600 text-white rounded text-sm font-medium
               hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download CSV Report
        </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-tmone-blue text-white">
            <tr>
              {([
                { key: "incidentId", label: "Incident ID", width: "w-[120px]" },
                { key: "timestamp", label: "Time", width: "w-[180px]" },
                { key: "customerName", label: "Customer", width: "w-[160px]" },
                { key: "platform", label: "Platform", width: "w-[140px]" },
                { key: "incidentName", label: "Incident", width: "w-[220px]" },
                { key: "severity", label: "Severity", width: "w-[120px]" },
                { key: "status", label: "Status", width: "w-[120px]" },
                { key: "description", label: "Description", width: "w-[200px]" },
                { key: "source", label: "Source", width: "w-[180px]" },
              ] as {
                key: keyof EventItem;
                label: string;
                width: string;
              }[]).map((col) => {
                const isActive = sortKey === col.key;
                return (
                <th
                  key={col.key}
                  className={`px-4 py-3 cursor-pointer text-left cursor-pointer select-none ${col.width}`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    <div className="flex flex-col leading-none">
                      <ChevronUp
                        size={12}
                        className={
                          isActive && sortAsc ? "text-white" : "text-white/50"
                        }
                      />
                      <ChevronDown
                        size={12}
                        className={ isActive && !sortAsc ? "text-white" : "text-white/50" }
                      />
                    </div>
                  </div>
                </th>
                );
                })}
              <th className="px-4 py-3 w-[100px]">Actions</th>  
            </tr>
          </thead>

          <tbody>
            {filtered.map((e) => (
              <tr key={e.incidentId} className="border-b hover:bg-blue-50">
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

      {/* VIEW DETAILS MODAL */}
      {viewIncident && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={handleCloseView}
        >
          <div
            className="bg-white p-6 rounded-xl w-96 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Incident Details</h2>
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> {viewIncident.incidentId}</div>
              <div><strong>Time:</strong> {new Date(viewIncident.timestamp).toLocaleString()}</div>
              <div><strong>Platform:</strong> {viewIncident.platform}</div>
              <div><strong>Incident:</strong> {viewIncident.incidentName}</div>
              <div><strong>Severity:</strong> {viewIncident.severity}</div>
              <div><strong>Status:</strong> {viewIncident.status}</div>
              <div><strong>Description:</strong> {viewIncident.description}</div>
              <div><strong>Source:</strong> {viewIncident.source}</div>
            </div>
          </div>
        </div>
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
                <input
                  type="text"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
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
