import React, { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { useNavigate } from "react-router-dom";
import EventsTable from "../components/EventsTable";
import { EventItem } from "../data/events.sample";
import { FilterX } from "lucide-react"; // Nice icon for clearing filters

export default function DashboardPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  
  /* 1. STATE: Active filter triggered from charts */
  const [activeFilter, setActiveFilter] = useState<{ key: keyof EventItem; value: string } | null>(null);

  /* ===== Auth Guard ===== */
  useEffect(() => {
    if (!localStorage.getItem("auth_user")) {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  /* ===== Fetch incidents from backend ===== */
  useEffect(() => {
    fetch("http://localhost:8080/incidents")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
      })
      .catch((err) => console.error("API Error:", err));
  }, []);

  /* 2. HANDLER: Toggle logic for chart clicks */
  const handleChartClick = (key: "severity" | "status", value: string) => {
    if (activeFilter?.value === value) {
      setActiveFilter(null); // Clicked same slice: clear filter
    } else {
      setActiveFilter({ key, value }); // Clicked new slice: set filter
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* 3. Pass the click handler to the header */}
      <DashboardHeader 
        events={events} 
        onFilterChange={handleChartClick} 
      />

      {/* ===== Table Section ===== */}
      <div className="flex-1 overflow-hidden p-6 flex flex-col">
        
        {/* 4. Visual Indicator for Active Chart Filters */}
        {activeFilter && (
          <div className="mb-4 flex items-center justify-between bg-[#0052CC] text-white px-5 py-2.5 rounded-lg shadow-lg animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-md">
                <FilterX size={16} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase opacity-70 tracking-tighter">Filtering Results By</span>
                <p className="text-sm font-bold leading-tight">
                   {activeFilter.key.toUpperCase()}: <span className="text-yellow-300">{activeFilter.value}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveFilter(null)}
              className="px-4 py-1.5 bg-white text-[#0052CC] text-xs font-black rounded-md hover:bg-gray-100 transition-all active:scale-95 shadow-sm uppercase tracking-wider"
            >
              Show All Incidents
            </button>
          </div>
        )}

        {/* 5. Pass events and activeFilter to the Table */}
        <div className="flex-1 min-h-0">
          <EventsTable 
            events={events} 
            cardFilter={activeFilter || undefined} 
          />
        </div>
      </div>
    </div>
  );
}