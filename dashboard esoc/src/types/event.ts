// src/types/event.ts
export interface EventItem {
  incident_id: string;
  timestamp: string;
  platform: string;
  severity: string;
  status: string;
  incidentName: string;
  description: string;
  source: string;
  customerName?: string;
}
