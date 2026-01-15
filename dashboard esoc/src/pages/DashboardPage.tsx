import React, { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { useNavigate } from "react-router-dom";
import EventsTable from "../components/EventsTable";
import { EventItem } from "../types/event"; // Ensure this matches your type location
import { FilterX } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  
  /* 1. STATE: Uses 'keyof EventItem' to ensure the filter key is valid for your data */
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

  /* 2. HANDLER: Captures clicks from Donut Charts */
  const handleChartClick = (key: keyof EventItem, value: string) => {
    // If the user clicks the same slice twice, we clear the filter (Toggle behavior)
    if (activeFilter?.value === value && activeFilter?.key === key) {
      setActiveFilter(null); 
    } else {
      setActiveFilter({ key, value }); 
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
        
        {/* 4. Visual Indicator: Tells the user they are looking at a filtered view */}
        {activeFilter && (
          <div className="mb-4 flex items-center justify-between bg-[#0052CC] text-white px-5 py-2.5 rounded-lg shadow-lg animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-md">
                <FilterX size={16} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase opacity-70 tracking-tighter">Filtering Results By</span>
                <p className="text-sm font-bold leading-tight">
                   {String(activeFilter.key).toUpperCase()}: <span className="text-yellow-300">{activeFilter.value}</span>
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