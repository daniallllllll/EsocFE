import React from "react";
import { Layers, Download, ChevronDown, ChevronRight } from "lucide-react";

export const TableActions = ({ 
  selectedCount, 
  onBulkAction, 
  onExport, 
  bulkOpen, 
  setBulkOpen 
}: any) => {
  return (
    <div className="flex items-center gap-3 relative z-50">
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setBulkOpen(!bulkOpen); }}
          className="flex items-center gap-2 bg-tmone-blue text-white px-4 py-3 rounded-lg text-sm font-medium shadow-card"
        >
          <Layers className="h-4 w-4" />
          <span>Bulk Actions</span>
          <ChevronDown size={16} />
        </button>
        {/* Bulk Action Dropdown Menu Logic Goes Here */}
      </div>

      <button
        onClick={onExport}
        disabled={selectedCount === 0}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Export
      </button>

      {selectedCount > 0 && (
        <span className="text-xs text-gray-500">{selectedCount} selected</span>
      )}
    </div>
  );
};