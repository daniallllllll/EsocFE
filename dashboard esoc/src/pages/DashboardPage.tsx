import React, { useEffect, useState } from "react";
import { DashboardHeader } from "../components/DashboardHeader";
import { useNavigate } from "react-router-dom";
import EventsTable from "../components/EventsTable";
import { EventItem } from "../types/event"; 
import { FilterX } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<{ key: keyof EventItem; value: string } | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("auth_user")) {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    fetch("http://localhost:8080/incidents")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("API Error:", err));
  }, []);

  const handleChartClick = (key: keyof EventItem, value: string) => {
    // Console log here to verify the click is working!
    console.log("Chart Clicked:", key, value);
    
    setActiveFilter(prev => {
      if (prev?.value === value && prev?.key === key) return null;
      return { key, value };
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <DashboardHeader events={events} onFilterChange={handleChartClick} />

      <div className="flex-1 overflow-hidden p-6 flex flex-col">
        {activeFilter && (
          <div className="mb-4 flex items-center justify-between bg-[#0052CC] text-white px-5 py-2.5 rounded-lg shadow-lg animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-md">
                <FilterX size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase opacity-70">Active Chart Filter</span>
                <p className="text-sm font-bold">
                   {String(activeFilter.key).toUpperCase()}: <span className="text-yellow-300">{activeFilter.value}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveFilter(null)}
              className="px-4 py-1.5 bg-white text-[#0052CC] text-xs font-bold rounded-md hover:bg-gray-100 transition-all active:scale-95"
            >
              Clear Filter
            </button>
          </div>
        )}

        <div className="flex-1 min-h-0">
          <EventsTable events={events} cardFilter={activeFilter} />
        </div>
      </div>
    </div>
  );
}