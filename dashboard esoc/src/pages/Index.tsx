import { useMemo, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { EventsTable, sampleEvents } from "@/components/EventsTable";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [filterType, setFilterType] = useState<
    "all" | "critical" | "open"
  >("all");

  const filteredEvents = useMemo(() => {
    if (filterType === "critical") {
      return sampleEvents.filter(
        (e) => e.severity.toLowerCase() === "critical"
      );
    }
    if (filterType === "open") {
      return sampleEvents.filter(
        (e) => e.status.toLowerCase() === "open"
      );
    }
    return sampleEvents;
  }, [filterType]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader
            totalEvents={sampleEvents.length}
            criticalEvents={
              sampleEvents.filter((e) => e.severity === "Critical").length
            }
            openIncidents={
              sampleEvents.filter((e) => e.status === "Open").length
            }
            onCardClick={setFilterType}
          />

          <main className="flex-1 p-4 bg-muted/20">
            <Card className="h-full">
              <CardContent className="p-3 h-full">
                <EventsTable events={filteredEvents} />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
