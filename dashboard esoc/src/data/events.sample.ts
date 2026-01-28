// src/data/events.sample.ts

export interface TimelineEvent {
  actionStatus: string;
  status: string;
  remark: string;
  actionBy: string;
  timestamp: string;
}

// Updated Email Interface to include 'sender'
export interface EmailLog {
  sentAt: string;
  subject: string;
  recipient: string;
  sender: string; // New: Field to identify the dispatcher
  message: string;
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
  actionStatus?: string;
  timeline?: TimelineEvent[];
  emailHistory?: EmailLog[]; 
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
    emailHistory: [
      {
        sentAt: "20/01/2026, 02:45:00 PM",
        subject: "CRITICAL: Credential Theft Alert - Acme Corp",
        recipient: "security_admin@acmecorp.com",
        sender: "ESOC-AUTOMATION", // Identifying the sender
        message: "This is an automated alert from ESOC. We have detected Malicious Activity on server DESKTOP-001. Forensic analysis is currently in progress. Please acknowledge receipt of this notification."
      }
    ],
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
    emailHistory: [
      {
        sentAt: "27/01/2026, 11:05:22 AM",
        subject: "HIGH PRIORITY: Unauthorized Database Command - Beta Inc",
        recipient: "db_team@betainc.com",
        sender: "SYSTEM-COLLECTOR", 
        message: "An unauthorized 'DROP TABLE' command was detected on the production cluster. Immediate investigation is required to prevent data loss."
      },
      {
        sentAt: "27/01/2026, 11:45:10 AM",
        subject: "UPDATE: Investigation started for Incident QR-7010",
        recipient: "it_manager@betainc.com",
        sender: "danial@esoc.com", // Showing a specific analyst sender
        message: "Our analysts have identified the source IP of the modification. The affected account has been temporarily disabled while we verify the activity."
      }
    ],
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
    emailHistory: [
      {
        sentAt: "27/01/2026, 12:15:00 PM",
        subject: "Incident Notification: Suspicious Process on TMONE-SRV-05",
        recipient: "soc_ops@tmone.com.my",
        sender: "ESOC-ANALYST-02",
        message: "Medium severity alert: Suspicious encoded PowerShell script detected. Our team is monitoring the situation for further escalation."
      }
    ],
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
    emailHistory: [], 
    timeline: [{ actionStatus: "New", status: "Open", remark: "Ingested.", actionBy: "SYSTEM-COLLECTOR", timestamp: "2026-01-27T12:15:00Z" }]
  }
];