import React from "react";
import { Eye, Edit2, Mail } from "lucide-react";

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
          onChange={() => onToggle(item.incidentId)} 
        />
      </td>
      <td className="px-4 py-3 text-sm">{item.incidentId}</td>
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
      <td className="px-4 py-2 flex gap-2">
        <Eye size={16} className="cursor-pointer text-blue-600" onClick={() => onView(item)} />
        <Edit2 size={16} className="cursor-pointer text-green-600" onClick={() => onEdit(item)} />
        <Mail size={16} className="cursor-pointer text-purple-600" onClick={() => onNotify(item)} />
      </td>
    </tr>
  );
};