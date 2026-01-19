import { useMemo, useState, useEffect } from "react";
import { EventItem } from "../../types/event";

export const useEventTable = (initialEvents: EventItem[], cardFilter?: { key: string; value: string } | null) => {
  const [localData, setLocalData] = useState<EventItem[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Partial<Record<keyof EventItem, string[]>>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<keyof EventItem>("timestamp");
  const [sortAsc, setSortAsc] = useState(true);

  // Synchronize local state when props change
  useEffect(() => { 
    setLocalData(initialEvents); 
  }, [initialEvents]);

  const filtered = useMemo(() => {
      return localData
        .filter((e) => {
          // 1. Apply Card Filter (from Donut Charts)
          if (!cardFilter || !cardFilter.key) return true;
          const rowValue = String(e[cardFilter.key as keyof EventItem] ?? "").toLowerCase().trim();
          const filterValue = String(cardFilter.value ?? "").toLowerCase().trim();
          return rowValue === filterValue;
        })
        .filter((e) => {
          // 2. Apply Global Search
          if (!search) return true;
          const q = search.toLowerCase().trim();
          return (
            e.incidentName.toLowerCase().includes(q) || 
            e.description.toLowerCase().includes(q) ||
            e.incident_id.toLowerCase().includes(q)
          );
        })
        .filter((e) => {
          // 3. Apply Multi-select Column Filters
          return Object.entries(columnFilters).every(([key, values]) => {
            if (!values || values.length === 0) return true;

            let rowValue = e[key as keyof EventItem];

            // Format timestamps to match exactly what is shown in dropdown
            if (key === "timestamp") {
              rowValue = new Date(String(rowValue)).toLocaleString();
            }

            // NORMALIZATION: Lowercase and Trim both sides for comparison
            const normalizedRowValue = String(rowValue ?? "").toLowerCase().trim();
            
            // Use .some() to compare each selected value against the normalized row data
            return values.some(val => 
              String(val).toLowerCase().trim() === normalizedRowValue
            );
          });
        })
        .sort((a, b) => {
          // 4. Apply Sorting
          const aVal = a[sortKey];
          const bVal = b[sortKey];
          if (aVal === bVal) return 0;
          const result = aVal < bVal ? -1 : 1;
          return sortAsc ? result : -result;
        });
    }, [localData, search, columnFilters, sortKey, sortAsc, cardFilter]);
  /* ===================== SELECTION LOGIC ===================== */
  
  const toggleRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(e => e.incident_id));
  };

  return {
    filtered, 
    localData, 
    setLocalData,
    search, 
    setSearch,
    columnFilters, 
    setColumnFilters,
    selectedIds, 
    setSelectedIds,
    sortKey, 
    setSortKey,
    sortAsc, 
    setSortAsc,
    toggleRow, 
    toggleAll
  };
};