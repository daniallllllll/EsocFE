import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ToolStatusCard } from "@/components/ToolStatusCard";
import { EventsTable } from "@/components/EventsTable";
import { useSecurityEvents, useEventStats } from "@/hooks/useSecurityEvents";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield, Activity, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: events, isLoading: eventsLoading, refetch } = useSecurityEvents();
  // Real-time subscription for security_events
  useEffect(() => {
    const channel = supabase
      .channel('realtime-security-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'security_events' }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  const { data: stats, isLoading: statsLoading } = useEventStats();

  const totalEvents = events?.length || 0;
  const criticalEvents = events?.filter(e => e.severity === "critical").length || 0;
  const openEvents = events?.filter(e => e.status === "open").length || 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader
            totalEvents={events?.length || 0}
            criticalEvents={events?.filter(e => e.severity === "critical").length || 0}
            openIncidents={events?.filter(e => e.status === "open").length || 0}
          />
          <main className="flex-1 h-screen overflow-hidden bg-gradient-to-br from-background to-muted/20">
            <div className="h-full flex flex-col p-4 gap-3">
              {/* Events Table */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {eventsLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <Card className="h-full flex flex-col">
                    <CardContent className="p-3 flex-1 overflow-hidden">
                      <EventsTable />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
