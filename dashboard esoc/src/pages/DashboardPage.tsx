import React, { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { useNavigate } from "react-router-dom";
import  EventsTable  from "../components/EventsTable";
import { EventItem } from "../data/events.sample";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ===== Auth Guard ===== */
  useEffect(() => {
    if (!localStorage.getItem("auth_user")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /* ===== Fetch incidents from backend ===== */
      useEffect(() => {
      fetch("http://localhost:8080/incidents")
        .then(res => res.json())
        .then(data => {
        console.log("FETCHED EVENTS:", data); // 👈 IMPORTANT
          setEvents(data);
        })
        .catch(err => console.error(err));
      }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ===== Dashboard Header ===== */}
      <DashboardHeader events={events} />

      {/* ===== Table Section ===== */}
      <div className="flex-1 overflow-hidden p-6">
        <EventsTable events={events} />
      </div>
    </div>
  );


}
