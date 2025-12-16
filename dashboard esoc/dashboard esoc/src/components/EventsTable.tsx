import React, { useState, useMemo } from "react";
import { Eye, Trash2, Mail, Edit2, X } from "lucide-react";

/* ---------------------------------------------------
 *  SAMPLE EVENTS (TrendMicro + Cortex + QRadar)
 * --------------------------------------------------- */
export const sampleEvents = [
  /* ---------------------- TREND MICRO ---------------------- */
  {
    incidentId: "WB-21683-20250909-00010",
    timestamp: "2025-09-09T03:14:10Z",
    platform: "Trend Micro",
    severity: "High",
    status: "Open",
    incidentName: "Malicious Activity Detected",
    description:
      "Investigation: Malicious. Score 85. MITRE: T1566.001, T1078. Model: Credential Theft Behavior. Threat Source verified from Trend Micro Vision One.",
    source: "Host: DESKTOP-001 • Account: johndoe@company.com • Sensor: TM Vision One",
  },
  {
    incidentId: "WB-21683-20250909-00011",
    timestamp: "2025-09-09T04:45:33Z",
    platform: "Trend Micro",
    severity: "Medium",
    status: "Open",
    incidentName: "Suspicious Activity Detected",
    description:
      "Investigation: Suspicious. Score 60. MITRE: T1566 Phishing. Email flagged due to abnormal sender pattern. Correlated via TM Email Security.",
    source:
      "Email: attacker@evil.com → victim@company.com • Gateway: TMES Anti-Phishing Engine",
  },

  /* ------------------------ CORTEX XDR ------------------------ */
  {
    incidentId: "119",
    timestamp: "2025-11-30T22:08:53Z",
    platform: "Cortex XDR",
    severity: "Low",
    status: "Under Investigation",
    incidentName: "Local Threat Detected (298 alerts)",
    description:
      "298 alerts prevented. Category: Malware. Host pkp-prod1. User: apache. Cortex XDR behavioral engine detected repeated blocked malicious executions.",
    source: "XDR Agent: pkp-prod1 • User apache • Analytics Engine: Malware Prevention",
  },
  {
    incidentId: "117",
    timestamp: "2025-11-29T09:09:48Z",
    platform: "Cortex XDR",
    severity: "Low",
    status: "Resolved",
    incidentName: "Local Threat Detected (649 alerts)",
    description:
      "649 alerts resolved. Users root & apache. Malware execution blocked by XDR BIOC rules. Incident closed automatically.",
    source: "XDR Agent: pkp-prod1 • Users root, apache • BIOC Rule Triggered",
  },

  /* -------------------------- QRADAR --------------------------- */
  {
    incidentId: "866604",
    timestamp: "2025-07-30T18:35:23Z",
    platform: "QRadar",
    severity: "Medium",
    status: "Open",
    incidentName: "Firewall Permit > Ping > IP Connection",
    description:
      "Offense triggered by 6 events. Categories: Information, Notice, Firewall Permit. QRadar offense magnitude: Medium. Credibility: 7 | Relevance: 5.",
    source: "Log Source: Fortigate SOC • IP Activity Correlated by QRadar Engine",
  },
  {
    incidentId: "866602",
    timestamp: "2025-07-29T11:31:24Z",
    platform: "QRadar",
    severity: "Critical",
    status: "Open",
    incidentName: "Concurrent Sessions Above Threshold",
    description:
      "11 events detected. Category: Misc DoS. QRadar Severity Magnitude: 5. Could indicate session flooding or resource exhaustion attempt.",
    source: "Log Source: Fortigate SOC • Traffic Pattern: Abnormal High Sessions",
  },
  {
    incidentId: "866600",
    timestamp: "2025-07-28T14:26:40Z",
    platform: "QRadar",
    severity: "High",
    status: "Open",
    incidentName: "Multiple Failed Login Attempts",
    description:
      "15 failed login attempts. Category: Brute Force. Offense magnitude: High. Username guessing behaviour detected.",
    source: "Log Source: Fortigate SOC • Authentication Logs • QRadar Brute Force Rule",
  },
];



/* Dropdown options */
const severityOptions = ["All", "Low", "Medium", "High", "Critical"];
const statusOptions = ["All", "Open", "Closed", "Resolved", "Under Investigation"];

/* ---------------------------------------------------
 *  MAIN COMPONENT
 * --------------------------------------------------- */
export const EventsTable: React.FC = () => {
  const [events, setEvents] = useState(sampleEvents);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [platform, setPlatform] = useState("All");

  const [sortKey, setSortKey] = useState("timestamp");
  const [sortAsc, setSortAsc] = useState(true);

  const [viewModal, setViewModal] = useState<any>(null);
  const [editModal, setEditModal] = useState<any>(null);
  const [emailModal, setEmailModal] = useState<any>(null);

  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  /* ---------------------------------------------------
   *  FILTERING + SORTING
   * --------------------------------------------------- */
  const toolOptions = ["All", ...new Set(events.map((e) => e.platform))];

  const filtered = useMemo(() => {
    return events
      .filter((e) => {
        const matchSearch =
          search === "" ||
          e.incidentName.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.source.toLowerCase().includes(search.toLowerCase());

        const matchSeverity = severity === "All" || e.severity === severity;
        const matchStatus = status === "All" || e.status === status;
        const matchPlatform = platform === "All" || e.platform === platform;

        return matchSearch && matchSeverity && matchStatus && matchPlatform;
      })
      .sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [events, search, severity, status, platform, sortKey, sortAsc]);
/* ---------------------------------------------------
   *  DOWNLOAD CSV
   * --------------------------------------------------- */
  const downloadCSV = () => {
    if (filtered.length === 0) {
      showToast("No data to export");
      return;
    }

    const rows = filtered.map((e) => ({
      incidentId: e.incidentId,
      timestamp: new Date(e.timestamp).toLocaleString(),
      platform: e.platform,
      incidentName: e.incidentName,
      severity: e.severity,
      status: e.status,
      source: e.source,
      description: e.description,
    }));

    const header = Object.keys(rows[0]).join(",");

    const csvRows = rows
      .map((row) =>
        Object.values(row)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const csvContent = header + "\n" + csvRows;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "ESOC_Incidents.csv";
    link.click();

    URL.revokeObjectURL(url);
  };
  
  /* ---------------------------------------------------
   *  DELETE + EMAIL
   * --------------------------------------------------- */
  const handleDelete = (id: string) => {
    setEvents(events.filter((e) => e.incidentId !== id));
    showToast("Incident deleted");
  };

  const handleSendEmail = (incident: any) => {
  // Extract first email found in the "source" field
  const emailMatch =
    incident.source.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  const recipient = emailMatch ? emailMatch[0] : "no-reply@company.com";

  const subject = `Reminder: ${incident.incidentName}`;
  const body = `Hello,

  This is a reminder regarding the following security incident:

  Incident ID: ${incident.incidentId}
  Platform: ${incident.platform}
  Severity: ${incident.severity}
  Status: ${incident.status}

  Incident Name:
  ${incident.incidentName}

  Description:
  ${incident.description}

  Please take appropriate follow-up actions.

  Regards,
  ESOC Unified Monitoring Team`;

    setEmailModal({ recipient, subject, body });
  };


  /* ---------------------------------------------------
   *  SORT HEADER HANDLER
   * --------------------------------------------------- */
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc); // reverse sort
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortIcon = (key: string) => {
    if (sortKey !== key) return "";
    return sortAsc ? "▲" : "▼";
  };

  /* ---------------------------------------------------
   *  RENDER
   * --------------------------------------------------- */
  return (
    <div className="p-6 bg-white rounded-xl shadow">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-4 right-4 bg-tmone-blue text-white px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          className="border px-3 py-2 rounded"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          {severityOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          {toolOptions.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border shadow">
        <table className="w-full text-sm">
          <thead className="bg-tmone-blue text-white">
            <tr>
              {[
                ["incidentId", "Incident ID"],
                ["timestamp", "Timestamp"],
                ["platform", "Platform"],
                ["incidentName", "Incident Name"],
                ["severity", "Severity"],
                ["status", "Status"],
                ["source", "Source"],
                ["description", "Description"],
              ].map(([key, label]) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left font-semibold cursor-pointer select-none"
                  onClick={() => handleSort(key)}
                >
                  {label} <span className="text-xs">{sortIcon(key)}</span>
                </th>
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((e) => (
              <tr key={e.incidentId} className="border-b hover:bg-blue-50">
                <td className="px-4 py-3">{e.incidentId}</td>
                <td className="px-4 py-3">{new Date(e.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3">{e.platform}</td>
                <td className="px-4 py-3">{e.incidentName}</td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      e.severity === "Critical"
                        ? "bg-red-600 text-white"
                        : e.severity === "High"
                        ? "bg-tmone-orange text-white"
                        : e.severity === "Medium"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {e.severity}
                  </span>
                </td>

                <td className="px-4 py-3">{e.status}</td>
                <td className="px-4 py-3">{e.source}</td>
                <td className="px-4 py-3 max-w-xs truncate">{e.description}</td>

                <td className="px-4 py-3 flex gap-2">
                  <button className="text-blue-700 p-1" onClick={() => setViewModal(e)}>
                    <Eye size={18} />
                  </button>
                  <button className="text-green-700 p-1" onClick={() => setEditModal(e)}>
                    <Edit2 size={18} />
                  </button>
                  <button className="text-blue-700 p-1" onClick={() => handleSendEmail(e)}>
                    <Mail size={18} />
                  </button>
                  <button className="text-tmone-orange p-1" onClick={() => handleDelete(e.incidentId)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMAIL MODAL */}
      {emailModal && (
        <EmailModal
          data={emailModal}
          onClose={() => setEmailModal(null)}
          onSend={() => {
            showToast("Email sent successfully!");
            setEmailModal(null);
          }}
        />
      )}

      {/* VIEW MODAL */}
      {viewModal && (
        <ViewModal data={viewModal} onClose={() => setViewModal(null)} />
      )}

      {/* EDIT MODAL */}
      {editModal && (
        <EditModal data={editModal} onClose={() => setEditModal(null)} />
      )}
    </div>
  );
};

/* ---------------------------------------------------
 *  EMAIL MODAL COMPONENT
 * --------------------------------------------------- */
const EmailModal = ({ data, onClose, onSend }: any) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-tmone-blue">
            Send Email Reminder
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <label className="font-medium">Recipient</label>
        <input
          className="border w-full p-2 rounded mb-3 bg-gray-100"
          value={data.recipient}
          readOnly
        />

        <label className="font-medium">Subject</label>
        <input
          className="border w-full p-2 rounded mb-3"
          value={data.subject}
          readOnly
        />

        <label className="font-medium">Body</label>
        <textarea
          className="border w-full p-2 h-32 rounded"
          value={data.body}
          readOnly
        />

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-tmone-orange text-white rounded"
            onClick={onSend}
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};


/* ---------------------------------------------------
 *  VIEW MODAL
 * --------------------------------------------------- */
const ViewModal = ({ data, onClose }: any) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Incident Details</h2>

        {Object.entries(data).map(([key, val]) => (
          <p key={key} className="text-sm mb-1">
            <strong>{key}:</strong> {String(val)}
          </p>
        ))}

        <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------
 *  EDIT MODAL
 * --------------------------------------------------- */
const EditModal = ({ data, onClose }: any) => {
  const [form, setForm] = useState({ ...data });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Incident</h2>

        <label>Status</label>
        <select
          className="border w-full p-2 rounded mb-3"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option>Open</option>
          <option>Closed</option>
          <option>Resolved</option>
          <option>Under Investigation</option>
        </select>

        <label>Description</label>
        <textarea
          className="border w-full p-2 rounded h-32"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-tmone-orange text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
