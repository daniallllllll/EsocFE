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
        // 1. Apply Card Filter (from Pie Charts)
        // Ensure comparison is case-insensitive for robustness
        if (!cardFilter || !cardFilter.key) return true;

        const rowValue = String(e[cardFilter.key as keyof EventItem] ?? "");
        const filterValue = String(cardFilter.value ?? "");

        // Use case-insensitive comparison to be safe
        return rowValue.toLowerCase() === filterValue.toLowerCase();
      })
      .filter((e) => {
        // 2. Apply Global Search
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          e.incidentName.toLowerCase().includes(q) || 
          e.description.toLowerCase().includes(q) ||
          e.incident_id.toLowerCase().includes(q) // Included ID in search
        );
      })
      .filter((e) => {
        // 3. Apply Multi-select Column Filters
        return Object.entries(columnFilters).every(([key, values]) => {
          if (!values || values.length === 0) return true;
          return values.includes(String(e[key as keyof EventItem] ?? ""));
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
    // FIXED: Now uses 'incident_id' to match your staging environment
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