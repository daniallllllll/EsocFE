import { useMemo, useState, useEffect } from "react";
import { EventItem } from "../../types/event";

export const useEventTable = (initialEvents: EventItem[], cardFilter?: any) => {
  const [localData, setLocalData] = useState<EventItem[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Partial<Record<keyof EventItem, string[]>>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<keyof EventItem>("timestamp");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => { setLocalData(initialEvents); }, [initialEvents]);

  const filtered = useMemo(() => {
    return localData
      .filter((e) => !cardFilter || e[cardFilter.key as keyof EventItem] === cardFilter.value)
      .filter((e) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return e.incidentName.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
      })
      .filter((e) => {
        return Object.entries(columnFilters).every(([key, values]) => {
          if (!values || values.length === 0) return true;
          return values.includes(String(e[key as keyof EventItem] ?? ""));
        });
      })
      .sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        return sortAsc ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
      });
  }, [localData, search, columnFilters, sortKey, sortAsc, cardFilter]);

  const toggleRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(e => e.incidentId));
  };

  return {
    filtered, localData, setLocalData,
    search, setSearch,
    columnFilters, setColumnFilters,
    selectedIds, setSelectedIds,
    sortKey, setSortKey,
    sortAsc, setSortAsc,
    toggleRow, toggleAll
  };
};