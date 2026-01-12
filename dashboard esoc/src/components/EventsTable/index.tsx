import { useEventTable } from "./useEventTable";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { EventItem } from "../../types/event";
import { ChevronUp, ChevronDown, Layers, Download, Eye, Edit2, Mail, Check} from "lucide-react";
import { useState } from "react";
// Import your new Modals
import { ViewIncidentModal } from "./Modals/ViewIncidentModal";
import { EditIncidentModal } from "./Modals/EditIncidentModal";
import { EmailReminderModal } from "./Modals/EmailReminderModal";


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

export const EventsTable: React.FC<EventsTableProps> = ({ events = [], cardFilter }) => {
  const { 
    filtered, localData, search, setSearch, 
    columnFilters, setColumnFilters, selectedIds, 
    toggleRow, toggleAll, sortKey, setSortKey, sortAsc, setSortAsc 
  } = useEventTable(events, cardFilter);

  // Modal States
  const [bulkOpen, setBulkOpen] = useState(false);
  const [viewIncident, setViewIncident] = useState<EventItem | null>(null);
  const [editIncident, setEditIncident] = useState<EventItem | null>(null);
  const [emailIncident, setEmailIncident] = useState<EventItem | null>(null);
  
  // Define unique options for filters
  const getOptions = (key: keyof EventItem) => {
    if (key === "severity") return ["Critical", "High", "Medium", "Low"];
    if (key === "status") return ["New", "Open", "Resolved", "Closed"];
    return Array.from(new Set(localData.map(item => String(item[key] ?? "")))).filter(Boolean).sort();
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col h-[calc(100vh-220px)] overflow-visible">
      {/* 1. Header Actions (Search, Bulk Action, Export) */}
      <div className="flex items-center gap-3 mb-4 z-50 overflow-visible">
          {/* Your Bulk Actions & Export Button code here */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setBulkOpen(!bulkOpen); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              <Layers size={16} /> Bulk Actions
            </button>
         </div>
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
              {columns.map(col => (
                <th key={col.key} className={`px-3 py-2 align-top ${col.width}`}>
                  <div 
                    className="flex items-center justify-between font-semibold mb-2 cursor-pointer" 
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
                    onChange={(vals) => setColumnFilters(prev => ({ ...prev, [col.key]: vals }))}
                  />
                </th>
              ))}
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
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
      
      {/* 3. Modals (Place at end) */}
      <ViewIncidentModal 
        incident={viewIncident} 
        onClose={() => setViewIncident(null)} 
        onEdit={(inc) => { setEditIncident(inc); setViewIncident(null); }}
        onNotify={(inc) => { setEmailIncident(inc); setViewIncident(null); }}
      />
        <EditIncidentModal
        incident={editIncident}
        onClose={() => setEditIncident(null)}
        onSave={(updatedIncident) => {
          // Handle save logic here
          setEditIncident(null);
        }}
        />
        <EmailReminderModal
        incident={emailIncident}
        onClose={() => setEmailIncident(null)}
        onSend={(incident) => {
            // Handle send email logic here
            setEmailIncident(null);
        }}
        />
    </div>
  );
};

export default EventsTable;