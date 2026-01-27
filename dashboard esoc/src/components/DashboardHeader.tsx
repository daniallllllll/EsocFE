import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
} from "recharts";
import { User, LogOut, Shield, Activity, Database, AlertTriangle } from "lucide-react";
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
  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const [openMenu, setOpenMenu] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_user");
    navigate("/auth", { replace: true });
  };

  /* ===================== DATA PROCESSING ===================== */
  
  // 1. Pie Chart Data
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

  // 2. Stacked Bar Chart Data (Customer vs Severity)
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

  // 3. Platform Configuration
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
            <span className="font-bold text-gray-700">{user.email || "Analyst"}</span>
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
        {/* LEFT: PLATFORM STATUS CARDS WITH ACTIVE CRITICAL ALERTS */}
        <div className="w-full xl:w-[320px] flex flex-col gap-3">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Active Platform Status</p>
          {platforms.map((p) => {
            const platformEvents = events.filter(e => e.platform === p.name);
            
            // LOGIC: Count Critical incidents that are NOT Resolved or Closed
            const activeCriticalCount = platformEvents.filter(e => {
              const sev = normalizeSeverity(e.severity);
              const stat = normalizeStatus(e.status);
              return sev === "Critical" && stat !== "Resolved" && stat !== "Closed";
            }).length;

            const hasActiveCritical = activeCriticalCount > 0;

            return (
              <div 
                key={p.name} 
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  hasActiveCritical 
                    ? "border-red-500 bg-red-50/50 animate-pulse" 
                    : `${p.color} border-transparent shadow-sm`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">{p.icon}</div>
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
              </div>
            );
          })}
        </div>

        {/* CENTER: INTERACTIVE STACKED SEVERITY BAR CHART */}
          <div className="flex-1 bg-gray-50/50 rounded-2xl p-4 border border-dashed border-gray-200">
            <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest text-center">
              Severity Breakdown by Customer (Click to Filter)
            </p>
            
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={customerSeverityData} 
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748B' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748B' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} 
                  />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '15px' }} 
                  />
                  
                  {/* Clickable Bars: Triggers dual-filtering for Customer + Severity */}
                  {["Low", "Medium", "High", "Critical"].map((sev) => (
                    <Bar 
                      key={sev}
                      dataKey={sev} 
                      stackId="a" 
                      fill={COLORS[sev]} 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      radius={sev === "Critical" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      onClick={(data) => {
                        // Filters the entire table by both customer name and selected severity
                        onFilterChange("customerName", data.name);
                        onFilterChange("severity", sev);
                      }}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        {/* RIGHT: PIE CHARTS (MIX ANALYSIS) */}
        <div className="w-full xl:w-[280px] flex xl:flex-col gap-6 justify-center border-l xl:pl-6 border-gray-100">
          <div className="flex flex-col items-center">
            <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Global Severity</p>
            <div className="h-[90px] w-[90px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={28} outerRadius={38} paddingAngle={4} stroke="none" onClick={(data) => onFilterChange("severity", data.name)} className="cursor-pointer outline-none">
                    {severityData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    <Label value={events.length} position="center" className="text-[10px] font-black fill-gray-700" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Incident Status</p>
            <div className="h-[90px] w-[90px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={28} outerRadius={38} paddingAngle={4} stroke="none" onClick={(data) => onFilterChange("status", data.name)} className="cursor-pointer outline-none">
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    <Label value={events.length} position="center" className="text-[10px] font-black fill-gray-700" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM LOGOUT OVERLAY */}
      {confirmLogout && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl border animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-sm text-gray-600 mb-8">Are you sure you want to end your active session on the ESOC Unified Dashboard?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmLogout(false)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleLogout} className="px-5 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-lg transition-all active:scale-95">Logout</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;