import React, { useEffect } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { EventsTable, sampleEvents } from "../components/EventsTable";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  /* ===== Auth Guard ===== */
  useEffect(() => {
    if (!localStorage.getItem("auth_user")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ===== Dashboard Header ===== */}
      <DashboardHeader events={sampleEvents} />

      {/* ===== Table Section ===== */}
      <div className="flex-1 overflow-hidden p-6">
        <EventsTable events={sampleEvents} />
      </div>
    </div>
  );
}
