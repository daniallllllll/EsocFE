import React, { useMemo, useState } from "react";
import { Eye, Trash2, Mail, Edit2, X } from "lucide-react";

/* =======================
   TYPES
======================= */
export interface EventItem {
  incidentId: string;
  timestamp: string;
  platform: string;
  severity: string;
  status: string;
  incidentName: string;
  description: string;
  source: string;
}

/* =======================
   SAMPLE EVENTS (HERE ONLY)
======================= */
export const sampleEvents: EventItem[] = [
  {
    incidentId: "WB-21683-001",
    timestamp: "2025-09-09T03:14:10Z",
    platform: "Trend Micro",
    severity: "Critical",
    status: "Open",
    incidentName: "Credential Theft Detected",
    description: "Malicious credential harvesting behaviour detected.",
    source: "DESKTOP-001 • johndoe@company.com",
  },
  {
    incidentId: "QR-866602",
    timestamp: "2025-07-29T11:31:24Z",
    platform: "QRadar",
    severity: "High",
    status: "Open",
    incidentName: "Concurrent Sessions Above Threshold",
    description: "Possible DoS attack detected.",
    source: "Fortigate SOC",
  },
  {
    incidentId: "CX-119",
    timestamp: "2025-11-30T22:08:53Z",
    platform: "Cortex XDR",
    severity: "Low",
    status: "Resolved",
    incidentName: "Local Threat Prevented",
    description: "Malware execution blocked.",
    source: "XDR Agent",
  },
];

/* =======================
   PROPS
======================= */
interface EventsTableProps {
  events: EventItem[];
}

/* =======================
   COMPONENT
======================= */
export const EventsTable: React.FC<EventsTableProps> = ({ events }) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof EventItem>("timestamp");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    return events
      .filter(
        (e) =>
          e.incidentName.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.source.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [events, search, sortKey, sortAsc]);

  const handleSort = (key: keyof EventItem) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 h-full flex flex-col">
      <input
        className="border px-3 py-2 rounded mb-3"
        placeholder="Search incidents..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-tmone-blue text-white">
            <tr>
              {[
                ["incidentId", "Incident ID"],
                ["timestamp", "Time"],
                ["platform", "Platform"],
                ["incidentName", "Incident"],
                ["severity", "Severity"],
                ["status", "Status"],
              ].map(([key, label]) => (
                <th
                  key={key}
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort(key as keyof EventItem)}
                >
                  {label}
                </th>
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((e) => (
              <tr key={e.incidentId} className="border-b hover:bg-blue-50">
                <td className="px-4 py-2">{e.incidentId}</td>
                <td className="px-4 py-2">
                  {new Date(e.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2">{e.platform}</td>
                <td className="px-4 py-2">{e.incidentName}</td>
                <td className="px-4 py-2">{e.severity}</td>
                <td className="px-4 py-2">{e.status}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Eye size={16} />
                  <Edit2 size={16} />
                  <Mail size={16} />
                  <Trash2 size={16} className="text-red-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No incidents found
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsTable;
