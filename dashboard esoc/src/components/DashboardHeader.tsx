import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { User, LogOut } from "lucide-react";

/* =====================================================
   NORMALIZATION
===================================================== */
const normalizeSeverity = (s: string) =>
  s.toLowerCase() === "critical"
    ? "Critical"
    : s.toLowerCase() === "high"
    ? "High"
    : s.toLowerCase() === "medium"
    ? "Medium"
    : "Low";

const normalizeStatus = (s: string) =>
  s.toLowerCase() === "open"
    ? "Open"
    : s.toLowerCase() === "resolved"
    ? "Resolved"
    : "New";

/* =====================================================
   PROPS
===================================================== */
interface DashboardHeaderProps {
  events: {
    severity: string;
    status: string;
  }[];
}

/* =====================================================
   COLORS
===================================================== */
const COLORS: Record<string, string> = {
  Critical: "#DC2626",
  High: "#F97316",
  Medium: "#FACC15",
  Low: "#22C55E",

  Open: "#2563EB",
  Resolved: "#9CA3AF",
  New: "#111827",
};

/* =====================================================
   COMPONENT
===================================================== */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ events }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");

  const [openMenu, setOpenMenu] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_user");
    navigate("/auth", { replace: true });
  };

  /* ===================== DATA ===================== */
  const severityData = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      const key = normalizeSeverity(e.severity);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name] || "#CBD5E1",
  }));

  const statusData = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      const key = normalizeStatus(e.status);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name] || "#CBD5E1",
  }));

  const totalSeverity = severityData.reduce((a, b) => a + b.value, 0);
  const totalStatus = statusData.reduce((a, b) => a + b.value, 0);

  /* ===================== UI ===================== */
  return (
    <header className="px-4 py-3 bg-background shrink-0 border-b relative">
      {/* ===== Top Row ===== */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">
          Incident Overview
        </h1>

        {/* ===== User Menu ===== */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <User className="w-4 h-4" />
            <span>{user.email || "User"}</span>
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-md z-50">
              <button
                onClick={() => {
                  setConfirmLogout(true);
                  setOpenMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== Charts ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ================= Severity ================= */}
        <div className="flex flex-col items-center">
          <p className="text-base font-semibold mb-2">
            Incident Severity
          </p>

          <div className="h-[120px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={55}
                  paddingAngle={2}
                  stroke="none"
                >
                  <Label
                    value={totalSeverity}
                    position="center"
                    className="text-sm font-bold fill-gray-700"
                  />
                  {severityData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v} incidents`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4 text-sm mt-2">
            {severityData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= Status ================= */}
        <div className="flex flex-col items-center">
          <p className="text-base font-semibold mb-2">
            Incident Status
          </p>

          <div className="h-[120px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={55}
                  paddingAngle={2}
                  stroke="none"
                >
                  <Label
                    value={totalStatus}
                    position="center"
                    className="text-sm font-bold fill-gray-700"
                  />
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v} incidents`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4 text-sm mt-2">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Logout Modal ===== */}
      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-2">Confirm Logout</h3>

            <p className="text-sm text-gray-600 mb-4">
              Logged in as <b>{user.email}</b>
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmLogout(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
