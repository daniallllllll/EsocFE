import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
  label: string;
}

export const MultiSelectFilter: React.FC<MultiSelectProps> = ({ options, selected, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full font-normal">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-gray-300 rounded px-2 py-1 text-[11px] bg-white"
      >
        <span className="truncate">{selected.length > 0 ? `${selected.length} Selected` : `All ${label}`}</span>
        <ChevronDown size={10} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-52 bg-white border rounded shadow-xl z-50 p-2">
            <div className="relative mb-2">
              <Search size={12} className="absolute left-2 top-2 text-gray-400" />
              <input
                className="w-full pl-7 pr-2 py-1 border rounded text-xs outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 px-1 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => {
                      const next = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt];
                      onChange(next);
                    }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};