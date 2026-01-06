// src/types/event.ts
export interface EventItem {
  incidentId: string;
  timestamp: string;
  platform: string;
  severity: string;
  status: string;
  incidentName: string;
  description: string;
  source: string;
  customerName?: string;
}
