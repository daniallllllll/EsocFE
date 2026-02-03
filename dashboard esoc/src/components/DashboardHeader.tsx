import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
} from "recharts";
import { User, LogOut, Shield, Activity, Database, AlertTriangle, X } from "lucide-react";
import { EventItem } from "../types/event";

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
  if (lower.includes("resolved")) return "Resolved";
  if (lower.includes("closed")) return "Closed";
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

interface DashboardHeaderProps {
  events: EventItem[];
  onFilterChange: (key: keyof EventItem, value: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ events, onFilterChange }) => {
  const navigate = useNavigate();
  // Pull current user from storage for audit trail
  const user = JSON.parse(localStorage.getItem("auth_user") || '{"email":"admin@test.com"}');
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

  const customerSeverityData = Object.entries(
    events.reduce<Record<string, any>>((acc, e) => {
      if (!acc[e.customerName]) {
        acc[e.customerName] = { name: e.customerName, Critical: 0, High: 0, Medium: 0, Low: 0 };
      }
      const sev = normalizeSeverity(e.severity || "");
      acc[e.customerName][sev] = (acc[e.customerName][sev] || 0) + 1;
      return acc;
    }, {})
  ).map(([_, value]) => value);

  const platforms = [
    { name: "Cortex", icon: <Shield className="text-blue-500" />, color: "border-blue-200 bg-blue-50/30" },
    { name: "Trend Micro", icon: <Activity className="text-red-500" />, color: "border-red-200 bg-red-50/30" },
    { name: "QRadar", icon: <Database className="text-purple-500" />, color: "border-purple-200 bg-purple-50/30" }
  ];

  return (
    <header className="px-6 py-4 bg-white shrink-0 border-b relative shadow-sm">
      {/* HEADER TOP BAR */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Unified Incident Dashboard</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Security Operations Center</p>
        </div>
        
        <div className="relative">
          <button onClick={() => setOpenMenu(!openMenu)} className="flex items-center gap-2 rounded-full border bg-gray-50 px-4 py-1.5 text-sm hover:bg-gray-100 transition-all shadow-sm">
            <User className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-gray-700">{user.email || "admin@test.com"}</span>
          </button>
          {openMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95">
              <button onClick={() => { setConfirmLogout(true); setOpenMenu(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* LEFT: PLATFORM STATUS CARDS */}
        <div className="w-full xl:w-[320px] flex flex-col gap-3 group/platform">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Active Incident Status</p>
            <button 
              onClick={() => onFilterChange("platform", "")}
              className="text-[9px] font-bold text-blue-600 hover:underline opacity-0 group-hover/platform:opacity-100 transition-opacity"
            >
              RESET
            </button>
          </div>

          {platforms.map((p) => {
            const platformEvents = events.filter(e => e.platform === p.name);
            const activeCriticalCount = platformEvents.filter(e => {
              const sev = normalizeSeverity(e.severity);
              const stat = normalizeStatus(e.status);
              return sev === "Critical" && stat !== "Resolved" && stat !== "Closed";
            }).length;

            const hasActiveCritical = activeCriticalCount > 0;
            // Apply official logos as requested
            const logoUrl = p.name.toUpperCase() === 'CORTEX' ? "https://www.paloaltonetworks.com/content/dam/pan/en_US/images/logos/brand/cortex-logo-badge.png" :
                            p.name.toUpperCase() === 'TREND MICRO' ? "https://logos-world.net/wp-content/uploads/2022/05/Trend-Micro-Logo.png" :
                            p.name.toUpperCase() === 'QRADAR' ? "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" : null;

            return (
              <button 
                key={p.name} 
                onClick={() => onFilterChange("platform", p.name)} 
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer text-left w-full hover:scale-[1.02] active:scale-95 ${
                  hasActiveCritical ? "border-red-500 bg-red-50/50 animate-pulse" : "border-transparent bg-white shadow-sm hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg p-1.5 shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                    {logoUrl ? <img src={logoUrl} alt={p.name} className="w-full h-full object-contain" /> : <div className="text-gray-400">{p.icon}</div>}
                  </div>
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">{p.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {hasActiveCritical && (
                    <div className="flex items-center gap-1.5 text-red-600">
                      <AlertTriangle size={14} className="animate-bounce" />
                      <span className="text-xs font-black">{activeCriticalCount}</span>
                    </div>
                  )}
                  <span className="h-4 w-[1px] bg-gray-300 mx-1" />
                  <span className="text-lg font-black text-gray-900">{platformEvents.length}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CENTER & RIGHT: CHARTS */}
        <div className="flex-1 bg-gray-50/50 rounded-2xl p-4 border border-dashed border-gray-200">
          <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest text-center">
            Severity Breakdown by Customer
          </p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerSeverityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748B' }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '15px' }} />
                {["Low", "Medium", "High", "Critical"].map((sev) => (
                  <Bar 
                    key={sev} dataKey={sev} stackId="a" fill={COLORS[sev]} radius={sev === "Critical" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    onClick={(data) => { if (data && data.name) { onFilterChange("customerName", data.name); onFilterChange("severity", sev); }}}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CONFIRM LOGOUT */}
      {confirmLogout && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl border animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-black text-gray-900">Confirm Logout</h3>
              <button onClick={() => setConfirmLogout(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <p className="text-sm text-gray-600 mb-8">Are you sure you want to end your session?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmLogout(false)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleLogout} className="px-5 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl">Logout</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;