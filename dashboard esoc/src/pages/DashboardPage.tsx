import React, { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { EventsTable, sampleEvents } from "../components/EventsTable";


export default function DashboardPage() {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalTitle, setModalTitle] = useState("");

  // The EventsTable now owns sampleEvents internally,
  // so DashboardPage no longer filters anything.
  const handleCardClick = (type: "all" | "critical" | "open") => {
    setModalTitle("This dashboard header is now static");
    setModalData([]);
    setShowCategoryModal(true);
  };

  return (
    <div className="p-6">
      <DashboardHeader
        totalEvents={sampleEvents.length}
        criticalEvents={sampleEvents.filter(e => e.severity === "Critical").length}
        openIncidents={sampleEvents.filter(e => e.status === "Open").length}
        onCardClick={handleCardClick}
      />

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-4xl shadow-lg">
            <h2 className="text-2xl font-bold text-tmone-blue mb-4">
              {modalTitle}
            </h2>

            <p className="text-gray-500 mb-4">
              Filtering is now handled inside EventsTable.
              This modal no longer displays event data.
            </p>

            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => setShowCategoryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <EventsTable />
    </div>
  );
}
