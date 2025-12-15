import React from "react";
import DashboardHeader from "../components/DashboardHeader";
import { EventsTable, sampleEvents } from "../components/EventsTable";

export default function DashboardPage() {
  return (
    <div className="p-6">
      {/* Chart-based Dashboard Header */}
      <DashboardHeader
        totalEvents={sampleEvents.length}
        criticalEvents={sampleEvents.filter(e => e.severity === "Critical").length}
        openIncidents={sampleEvents.filter(e => e.status === "Open").length}
      />

      {/* Events Table */}
      <div className="mt-6">
        <EventsTable events={sampleEvents} />
      </div>
    </div>
  );
}
