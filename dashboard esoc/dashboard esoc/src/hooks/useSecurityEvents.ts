import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SecurityEvent {
  id: string;
  timestamp: string;
  domain_name: string;
  tunnel_detector: string | null;
  monitoring_tool: string;
  event_type: string;
  severity: string;
  risk_level: string | null;
  description: string | null;
  status: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export function useSecurityEvents() {
  return useQuery({
    queryKey: ["security-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_events")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data as SecurityEvent[];
    },
  });
}

export function useEventStats() {
  return useQuery({
    queryKey: ["event-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_events")
        .select("monitoring_tool, severity, status");

      if (error) throw error;

      const stats = {
        splunk: { total: 0, critical: 0 },
        qradar: { total: 0, critical: 0 },
        cortex: { total: 0, critical: 0 },
        trendmicro: { total: 0, critical: 0 },
      };

      data.forEach((event) => {
        const tool = event.monitoring_tool as keyof typeof stats;
        if (stats[tool]) {
          stats[tool].total++;
          if (event.severity === "critical") {
            stats[tool].critical++;
          }
        }
      });

      return stats;
    },
  });
}
