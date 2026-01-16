import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts";
import { User, LogOut } from "lucide-react";
import { EventItem } from "../types/event"; // Ensure this path is correct

/* =====================================================
   NORMALIZATION & COLORS
===================================================== */
const normalizeSeverity = (s: string) => {
  const lower = s?.toLowerCase() || "";
  if (lower === "critical") return "Critical";
  if (lower === "high") return "High";
  if (lower === "medium") return "Medium";
  return "Low";
};

const normalizeStatus = (s: string) => {
  const lower = s?.toLowerCase() || "";
  if (lower === "open") return "Open";
  if (lower === "resolved" || lower.includes("resolved")) return "Resolved";
  return "New";
};

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
   PROPS
===================================================== */
interface DashboardHeaderProps {
  events: EventItem[];
  // Key must be keyof EventItem to satisfy DashboardPage's state
  onFilterChange: (key: keyof EventItem, value: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ events, onFilterChange }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const [openMenu, setOpenMenu] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_user");
    navigate("/auth", { replace: true });
  };

  /* ===================== DATA PROCESSING ===================== */
  const severityData = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      const key = normalizeSeverity(e.severity || "");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: COLORS[name] || "#CBD5E1" }));

  const statusData = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      const key = normalizeStatus(e.status || "");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: COLORS[name] || "#CBD5E1" }));

  return (
    <header className="px-4 py-3 bg-white shrink-0 border-b relative shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">Incident Overview</h1>
        
        <div className="relative">
          <button 
            onClick={() => setOpenMenu(!openMenu)} 
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
          >
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">{user.email || "User"}</span>
          </button>
          {openMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white shadow-xl z-[100] py-1 animate-in fade-in zoom-in duration-100">
              <button 
                onClick={() => { setConfirmLogout(true); setOpenMenu(false); }} 
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Severity Chart */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-bold uppercase text-gray-400 mb-2">Incident Severity</p>
          <div className="h-[130px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={severityData} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={40} 
                  outerRadius={55} 
                  paddingAngle={4}
                  stroke="none"
                  // Add a safety check: only call if onFilterChange exists
                  onClick={(data) => {
                    if (typeof onFilterChange === 'function') {
                      onFilterChange("severity", data.name);
                    } else {
                      console.error("onFilterChange prop is missing in DashboardHeader!");
                    }
                  }}
                  className="cursor-pointer outline-none"
                >
                  {severityData.map((d, i) => (
                    <Cell key={i} fill={d.color} className="hover:opacity-80 transition-opacity" />
                  ))}
                  <Label value={events.length} position="center" className="text-sm font-bold fill-gray-700" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend Buttons */}
          <div className="flex gap-4 mt-2">
            {severityData.map((d) => (
              <button 
                key={d.name} 
                onClick={() => onFilterChange("severity", d.name)} 
                className="flex items-center gap-1.5 hover:underline"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] font-bold text-gray-600 uppercase">{d.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Chart */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-bold uppercase text-gray-400 mb-2">Incident Status</p>
          <div className="h-[130px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={statusData} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={40} 
                  outerRadius={55} 
                  paddingAngle={4}
                  stroke="none"
                // Add a safety check: only call if onFilterChange exists
                    onClick={(data) => {
                      if (typeof onFilterChange === 'function') {
                        onFilterChange("status", data.name);
                      } else {
                        console.error("onFilterChange prop is missing in DashboardHeader!");
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} className="hover:opacity-80 transition-opacity" />
                  ))}
                  <Label value={events.length} position="center" className="text-sm font-bold fill-gray-700" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend Buttons */}
          <div className="flex gap-4 mt-2">
            {statusData.map((d) => (
              <button 
                key={d.name} 
                onClick={() => onFilterChange("status", d.name)} 
                className="flex items-center gap-1.5 hover:underline"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] font-bold text-gray-600 uppercase">{d.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {confirmLogout && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl border animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-2">Confirm Logout</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to log out of the SOC Dashboard?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmLogout(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleLogout} className="px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-md">Logout</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;