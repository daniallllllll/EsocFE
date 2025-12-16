import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { EventsTable, sampleEvents } from "@/components/EventsTable";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <SidebarProvider>
      {/* Lock viewport height & disable page scroll */}
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />

        {/* Main content column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ✅ Donut-chart Dashboard Header */}
          <DashboardHeader events={sampleEvents} />

          {/* Main content area */}
          <main className="flex-1 p-4 bg-muted/20 overflow-hidden">
            <Card className="h-full">
              <CardContent className="p-3 h-full overflow-hidden">
                {/* Table takes full height without page scrolling */}
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
