import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import EventsTable from "@/components/EventsTable";
import { sampleEvents } from "@/data/events.sample";
import { EventItem } from "@/types/event"; //
import { FilterX } from "lucide-react";

const Index = () => {
  // 1. ADD: State to track which chart segment is active
  const [activeFilter, setActiveFilter] = useState<{ key: keyof EventItem; value: string } | null>(null);

  // 2. ADD: Handler to toggle filter when donut slices are clicked
  const handleChartClick = (key: keyof EventItem, value: string) => {
    if (activeFilter?.value === value && activeFilter?.key === key) {
      setActiveFilter(null); // Clear filter if clicking the same slice
    } else {
      setActiveFilter({ key, value });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 3. FIX: Pass the required onFilterChange prop to resolve the error */}
          <DashboardHeader 
            events={sampleEvents} 
            onFilterChange={handleChartClick} 
          />

          <main className="flex-1 p-4 bg-muted/20 overflow-hidden flex flex-col">
            
            {/* 4. OPTIONAL: Visual filter indicator for better UX */}
            {activeFilter && (
              <div className="mb-4 flex items-center justify-between bg-[#0052CC] text-white px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <FilterX size={16} />
                  <span className="text-sm font-bold uppercase tracking-tight">
                    Filtering {String(activeFilter.key)}: {activeFilter.value}
                  </span>
                </div>
                <button 
                  onClick={() => setActiveFilter(null)}
                  className="px-3 py-1 bg-white text-[#0052CC] text-xs font-bold rounded hover:bg-gray-100 transition-colors"
                >
                  SHOW ALL
                </button>
              </div>
            )}

            <Card className="flex-1 min-h-0">
              <CardContent className="p-2 h-full overflow-hidden">
                {/* 5. FIX: Pass activeFilter down as cardFilter to the Table */}
                <EventsTable 
                  events={sampleEvents} 
                  cardFilter={activeFilter || undefined} 
                />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;