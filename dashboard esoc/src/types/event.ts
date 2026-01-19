// src/types/event.ts
export interface EventItem {
  incident_id: string;
  timestamp: string;
  customerName?: string;
  platform: string;
  severity: string;
  status: string;
  incidentName: string;
  description: string;
  actionStatus?: string;
  source: string;
}
