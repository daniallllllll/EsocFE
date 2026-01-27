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
  },
  // --- NEW SAMPLES FOR DRASTIC CHART CHANGES ---
  {
    incident_id: "288",
    timestamp: "2026-01-27T08:15:00Z",
    platform: "Cortex",
    severity: "Critical",
    status: "Under Investigation",
    actionStatus: "In Progress",
    incidentName: "Ransomware Execution Blocked",
    description: "Cortex XDR blocked 'encryptor.exe' on high-value asset.",
    source: "TMONE-SRV-01",
    customerName: "TMONE",
    timeline: [
      { actionStatus: "In Progress", status: "Under Investigation", remark: "Analyst isolated host.", actionBy: "danial@esoc.com", timestamp: "2026-01-27T09:00:00Z" },
      { actionStatus: "New", status: "New", remark: "Ingested from API.", actionBy: "SYSTEM-COLLECTOR", timestamp: "2026-01-27T08:15:00Z" }
    ]
  },
  {
    incident_id: "289",
    timestamp: "2026-01-27T08:30:00Z",
    platform: "Cortex",
    severity: "Critical",
    status: "New",
    actionStatus: "New",
    incidentName: "Multiple LSASS Dumps",
    description: "Sequential credential harvesting attempts detected.",
    source: "TMONE-SRV-02",
    customerName: "TMONE",
    timeline: [{ actionStatus: "New", status: "New", remark: "System ingested.", actionBy: "SYSTEM-COLLECTOR", timestamp: "2026-01-27T08:30:00Z" }]
  },
  {
    incident_id: "WB-22001",
    timestamp: "2026-01-27T05:00:00Z",
    platform: "Trend Micro",
    severity: "High",
    status: "Open",
    actionStatus: "New",
    incidentName: "Lateral Movement via SMB",
    description: "Suspicious movement patterns detected across 5 workstations.",
    source: "VRS-GATEWAY-01",
    customerName: "Acme Corp",
    timeline: [{ actionStatus: "New", status: "Open", remark: "Ingested from API.", actionBy: "SYSTEM-COLLECTOR", timestamp: "2026-01-27T05:00:00Z" }]
  },
  {
    incident_id: "WB-22002",
    timestamp: "2026-01-27T05:15:00Z",
    platform: "Trend Micro",
    severity: "High",
    status: "Open",
    actionStatus: "New",
    incidentName: "Mass File Deletion",
    description: "Unusual volume of file deletions on Finance Share.",
    source: "FILE-SRV-01",
    customerName: "Acme Corp",
    timeline: [{ actionStatus: "New", status: "Open", remark: "Injected from API.", actionBy: "SYSTEM-COLLECTOR", timestamp: "2026-01-27T05:15:00Z" }]
  },
  {
    incident_id: "QR-7001",
    timestamp: "2026-01-26T20:00:00Z",
    platform: "QRadar",
    severity: "Medium",
    status: "Open",
    actionStatus: "In Progress",
    incidentName: "Anomalous VPN Login",
    description: "VPN login detected from unauthorized country (NG).",
    source: "VPN-GW-FELCRA",
    customerName: "Felcra",
    timeline: [{ actionStatus: "In Progress", status: "Open", remark: "MFA challenge sent.", actionBy: "analyst-01@esoc.com", timestamp: "2026-01-26T21:00:00Z" }]
  },
  {
    incident_id: "QR-7002",
    timestamp: "2026-01-26T20:05:00Z",
    platform: "QRadar",
    severity: "Medium",
    status: "Open",
    actionStatus: "New",
    incidentName: "Brute Force Attempt",
    description: "1,000+ failed login attempts from external IP.",
    source: "FELCRA-FIREWALL",
    customerName: "Felcra",
    timeline: [{ actionStatus: "New", status: "Open", remark: "Automatic ingestion.", actionBy: "SYSTEM-COLLECTOR", timestamp: "2026-01-26T20:05:00Z" }]
  },
  {
    incident_id: "WB-22005",
    timestamp: "2026-01-27T10:00:00Z",
    platform: "Trend Micro",
    severity: "Critical",
    status: "Open",
    actionStatus: "New",
    incidentName: "Internal Spreading Worm",
    description: "Worm-like behavior detected replicating via network shares.",
    source: "DC-01",
    customerName: "YPPB",
    timeline: [{ actionStatus: "New", status: "Open", remark: "High risk detection.", actionBy: "SYSTEM-COLLECTOR", timestamp: "2026-01-27T10:00:00Z" }]
  },
  {
    incident_id: "QR-7010",
    timestamp: "2026-01-27T11:00:00Z",
    platform: "QRadar",
    severity: "Critical",
    status: "Open",
    actionStatus: "New",
    incidentName: "Database Schema Modification",
    description: "Unauthorized 'DROP TABLE' command executed on production DB.",
    source: "DB-PROD-CLUSTER",
    customerName: "Beta Inc",
    timeline: [{ actionStatus: "New", status: "Open", remark: "Critical alert.", actionBy: "SYSTEM-COLLECTOR", timestamp: "2026-01-27T11:00:00Z" }]
  },
  {
    incident_id: "310",
    timestamp: "2026-01-27T12:00:00Z",
    platform: "Cortex",
    severity: "Medium",
    status: "New",
    actionStatus: "New",
    incidentName: "Suspicious PowerShell Script",
    description: "Encoded PowerShell command executed by unusual process.",
    source: "TMONE-SRV-05",
    customerName: "TMONE",
    timeline: [{ actionStatus: "New", status: "New", remark: "Ingested.", actionBy: "SYSTEM-COLLECTOR", timestamp: "2026-01-27T12:00:00Z" }]
  },
  {
    incident_id: "WB-22009",
    timestamp: "2026-01-27T12:15:00Z",
    platform: "Trend Micro",
    severity: "Medium",
    status: "Open",
    actionStatus: "New",
    incidentName: "Unusual Admin Login Time",
    description: "Administrator login detected at 3:00 AM local time.",
    source: "ACME-CORE-SW",
    customerName: "Acme Corp",
    timeline: [{ actionStatus: "New", status: "Open", remark: "Ingested.", actionBy: "SYSTEM-COLLECTOR", timestamp: "2026-01-27T12:15:00Z" }]
  },
  {
    incident_id: "QR-7015",
    timestamp: "2026-01-27T12:30:00Z",
    platform: "QRadar",
    severity: "Low",
    status: "Closed",
    actionStatus: "Closed",
    incidentName: "Port Scan Detected",
    description: "Vertical port scan detected from internal IP.",
    source: "DEV-LAB-NET",
    customerName: "Felcra",
    timeline: [{ actionStatus: "Closed", status: "Closed", remark: "Authorized testing.", actionBy: "admin@test.com", timestamp: "2026-01-27T12:45:00Z" }]
  },
  {
    incident_id: "295",
    timestamp: "2026-01-25T12:00:00Z",
    platform: "Cortex",
    severity: "Low",
    status: "Resolved Other",
    actionStatus: "Resolved",
    incidentName: "PUP Extension Detected",
    description: "Adware extension detected in Chrome browser.",
    source: "GAMMA-PC-12",
    customerName: "Gamma LLC",
    timeline: [{ actionStatus: "Resolved", status: "Resolved Other", remark: "FP confirmed.", actionBy: "danial@esoc.com", timestamp: "2026-01-26T09:00:00Z" }]
  }
];