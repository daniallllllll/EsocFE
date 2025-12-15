import React, { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { EventsTable, sampleEvents, EventItem } from "../components/EventsTable";

export default function DashboardPage() {
  const [selectedCard, setSelectedCard] = useState<"all" | "critical" | "open">("all");
  const [cardFilter, setCardFilter] = useState<{ key: keyof EventItem; value: string } | null>(null);

  const handleCardClick = (type: "all" | "critical" | "open") => {
    setSelectedCard(type);

    if (type === "all") setCardFilter(null);
    if (type === "critical") setCardFilter({ key: "severity", value: "Critical" });
    if (type === "open") setCardFilter({ key: "status", value: "Open" });
  };

  return (
    <div className="p-6">
      <DashboardHeader
        totalEvents={sampleEvents.length}
        criticalEvents={sampleEvents.filter(e => e.severity === "Critical").length}
        openIncidents={sampleEvents.filter(e => e.status === "Open").length}
        onCardClick={handleCardClick}
        selectedCard={selectedCard} // highlight active card
      />

      <div className="mt-6">
        <EventsTable events={sampleEvents} cardFilter={cardFilter ?? undefined} />
      </div>
    </div>
  );
}
