import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { EventsTable, sampleEvents } from "@/components/EventsTable";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Compact charts */}
          <DashboardHeader events={sampleEvents} />

          {/* Table takes MOST of screen */}
          <main className="flex-1 p-1 bg-muted/20">
            <Card className="h-full">
              <CardContent className="p-2 h-full">
                {/* Table shows fully without scroll */}
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
