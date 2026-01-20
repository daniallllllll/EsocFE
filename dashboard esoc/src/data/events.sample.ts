// src/data/events.sample.ts

export interface TimelineEvent {
  actionStatus: string;  // Lifecycle stage (New, In Progress, etc.)
  status: string;        // Technical finding (Cortex/Trend/QRadar specific)
  remark: string;        // Analyst investigation remarks
  actionBy: string;      // Analyst email or SYSTEM-COLLECTOR
  timestamp: string;     // Date and time of the event
}

export interface EventItem {
  incident_id: string;
  timestamp: string;
  platform: string;
  incidentName: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: string; 
  description: string;
  source: string;
  customerName: string;
  actionStatus?: string; // Ticket lifecycle stage
  timeline?: TimelineEvent[]; // History of actions
}

export const sampleEvents: EventItem[] = [
  {
    incident_id: "WB-21683-20250909-00010",
    timestamp: "2025-09-09T03:14:10Z",
    platform: "Trend Micro",
    severity: "Critical",
    status: "Open",
    actionStatus: "In Progress",
    incidentName: "Malicious Activity Detected",
    description: "Credential theft behavior detected on critical server.",
    source: "DESKTOP-001 • johndoe@company.com",
    customerName: "Acme Corp",
    timeline: [
      {
        actionStatus: "In Progress",
        status: "Open",
        remark: "Analyst confirmed malicious payload in temp directory. Escalating for full forensic sweep.",
        actionBy: "admin@test.com",
        timestamp: "2026-01-20T14:30:00Z"
      },
      {
        actionStatus: "New",
        status: "Open",
        remark: "System automatically collected and ingested incident from Trend Micro API.",
        actionBy: "SYSTEM-COLLECTOR",
        timestamp: "2025-09-09T03:14:10Z"
      }
    ]
  },
  {
    incident_id: "866602",
    timestamp: "2025-07-29T11:31:24Z",
    platform: "QRadar",
    severity: "High",
    status: "Open",
    actionStatus: "New",
    incidentName: "Concurrent Sessions Above Threshold",
    description: "Possible DoS attempt detected from external IP range.",
    source: "Fortigate SOC • alice@company.com",
    customerName: "Beta Inc",
    timeline: [
      {
        actionStatus: "New",
        status: "Open",
        remark: "System automatically collected and ingested incident from QRadar API.",
        actionBy: "SYSTEM-COLLECTOR",
        timestamp: "2025-07-29T11:31:24Z"
      }
    ]
  },
  {
    incident_id: "119",
    timestamp: "2025-11-30T22:08:53Z",
    platform: "Cortex",
    severity: "Low",
    status: "Resolved True Positive",
    actionStatus: "Resolved",
    incidentName: "Local Threat Detected",
    description: "Blocked malware execution on production workstation.",
    source: "XDR Agent pkp-prod1 • bob@company.com",
    customerName: "Gamma LLC",
    timeline: [
      {
        actionStatus: "Resolved",
        status: "Resolved True Positive",
        remark: "Threat was successfully blocked and quarantined by XDR agent. Policy updated.",
        actionBy: "admin@test.com",
        timestamp: "2025-12-01T09:00:00Z"
      },
      {
        actionStatus: "New",
        status: "New",
        remark: "System automatically collected and ingested incident from Cortex API.",
        actionBy: "SYSTEM-COLLECTOR",
        timestamp: "2025-11-30T22:08:53Z"
      }
    ]
  },
  {
    incident_id: "WB-21541-20251028-00016",
    timestamp: "2025-10-28T19:06:24Z",
    platform: "Trend Micro",
    severity: "Low",
    status: "Open",
    actionStatus: "New",
    incidentName: "Data Destruction via DD Command - Unix",
    description: "Overwrites and deletes a file using DD in Unix environment.",
    source: "unix-server01",
    customerName: "YPPB",
    timeline: [
      {
        actionStatus: "New",
        status: "Open",
        remark: "System automatically collected and ingested incident from Trend Micro API.",
        actionBy: "SYSTEM-COLLECTOR",
        timestamp: "2025-10-28T19:06:24Z"
      }
    ]
  },
  {
    incident_id: "WB-21683-20251112-00007",
    timestamp: "2025-11-12T12:26:23Z",
    platform: "Trend Micro",
    severity: "High",
    status: "Open",
    actionStatus: "In Progress",
    incidentName: "Suspicious Deletion of Volume Shadow Copy",
    description: "Volume shadow copies were deleted, a possible sign of ransomware behavior.",
    source: "DESKTOP-002",
    customerName: "Felcra",
    timeline: [
      {
        actionStatus: "In Progress",
        status: "Open",
        remark: "Host isolated from network. Investigating unauthorized vssadmin execution.",
        actionBy: "admin@test.com",
        timestamp: "2025-11-12T13:45:00Z"
      },
      {
        actionStatus: "New",
        status: "Open",
        remark: "System automatically collected and ingested incident from Trend Micro API.",
        actionBy: "SYSTEM-COLLECTOR",
        timestamp: "2025-11-12T12:26:23Z"
      }
    ]
  },
  {
    incident_id: "131",
    timestamp: "2025-06-15T08:45:12Z",
    platform: "Cortex",
    severity: "High",
    status: "New",
    actionStatus: "New",
    incidentName: "XDR Agent Protection Alert",
    description: "'Local Threat Detected' generated by XDR Agent detected on host pkp-prod1 involving user apache",
    source: "SERVER-DB01",
    customerName: "TMONE",
    timeline: [
      {
        actionStatus: "New",
        status: "New",
        remark: "System automatically collected and ingested incident from Cortex API.",
        actionBy: "SYSTEM-COLLECTOR",
        timestamp: "2025-06-15T08:45:12Z"
      }
    ]
  }
];