import React from "react";
import { Eye, Edit2, Mail } from "lucide-react";

// 1. ADD: Define the styling mapping for Action Status here
const actionStatusClass: Record<string, string> = {
  New: "bg-blue-100 text-blue-600 border-blue-200",
  "In Progress": "bg-yellow-100 text-yellow-600 border-yellow-200",
  Resolved: "bg-green-100 text-green-600 border-green-200",
  Closed: "bg-gray-100 text-gray-600 border-gray-200",
};

export const EventRow = ({ 
  item, 
  isSelected, 
  onToggle, 
  onView, 
  onEdit, 
  onNotify,
  severityClass,
  statusClass 
}: any) => {
  return (
    <tr className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition">
      <td className="px-4 py-2 text-center">
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => onToggle(item.incident_id)} 
        />
      </td>
      <td className="px-4 py-3 text-sm">{item.incident_id}</td>
      <td className="px-4 py-3 text-sm">{new Date(item.timestamp).toLocaleString()}</td>
      <td className="px-4 py-3 text-sm">{item.customerName}</td>
      <td className="px-4 py-3 text-sm">{item.platform}</td>
      <td className="px-4 py-3 text-sm">{item.incidentName}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityClass[item.severity]}`}>
          {item.severity}
        </span>
      </td>
      <td className="px-4 py-2">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass[item.status]}`}>
          {item.status}
        </span>
      </td>
      {/* 2. FIXED: This now uses the actionStatusClass defined above */}
      <td className="px-3 py-3">
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${actionStatusClass[item.actionStatus || 'New']}`}>
          {item.actionStatus || "New"}
        </span>
      </td>
      <td className="px-4 py-2 flex gap-2">
        <button onClick={() => onView(item)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="View Details">
          <Eye size={16} />
        </button>
        <button onClick={() => onEdit(item)} className="p-1 hover:bg-green-100 rounded text-green-600" title="Edit Incident">
          <Edit2 size={16} />
        </button>
        <button onClick={() => onNotify(item)} className="p-1 hover:bg-purple-100 rounded text-purple-600" title="Send Notification">
          <Mail size={16} />
        </button>
      </td>
    </tr>
  );
};