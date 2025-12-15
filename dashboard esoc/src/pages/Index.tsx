import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { EventsTable, sampleEvents } from "@/components/EventsTable";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          {/* Chart-based Dashboard Header */}
          <DashboardHeader
            totalEvents={sampleEvents.length}
            criticalEvents={sampleEvents.filter((e) => e.severity === "Critical").length}
            openIncidents={sampleEvents.filter((e) => e.status === "Open").length}
          />

          <main className="flex-1 p-4 bg-muted/20">
            <Card className="h-full">
              <CardContent className="p-3 h-full">
                <EventsTable events={sampleEvents} />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
