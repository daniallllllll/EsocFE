import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
} from "recharts";
import { 
  User, LogOut, Shield, Activity, Database, 
  AlertTriangle, X, Maximize2, Search, Camera, FileText 
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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
  Critical: "#DC2626", High: "#F97316", Medium: "#FACC15", Low: "#22C55E",
  Open: "#2563EB", Resolved: "#9CA3AF", New: "#111827",
};

interface DashboardHeaderProps {
  events: EventItem[];
  onFilterChange: (key: keyof EventItem, value: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ events, onFilterChange }) => {
  const navigate = useNavigate();
  const modalChartRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem("auth_user") || '{"email":"admin@test.com"}');
  
  const [openMenu, setOpenMenu] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Threshold Alert State
  const [criticalBreaches, setCriticalBreaches] = useState<any[]>([]);
  const CRITICAL_THRESHOLD = 1; 

  const handleLogout = () => {
    localStorage.removeItem("auth_user");
    navigate("/auth", { replace: true });
  };

  /* ===================== DATA PROCESSING ===================== */
  
  // 1. Restore Donut Chart Data
  const severityPieData = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      const key = normalizeSeverity(e.severity || "");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: COLORS[name] || "#CBD5E1" }));

  const statusPieData = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      const key = normalizeStatus(e.status || "");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: COLORS[name] || "#CBD5E1" }));

  // 2. Customer Bar Chart Data
  const processCustomerData = (data: EventItem[]) => {
    return Object.entries(
      data.reduce<Record<string, any>>((acc, e) => {
        if (!acc[e.customerName]) {
          acc[e.customerName] = { name: e.customerName, Critical: 0, High: 0, Medium: 0, Low: 0, total: 0 };
        }
        const sev = normalizeSeverity(e.severity || "");
        acc[e.customerName][sev] = (acc[e.customerName][sev] || 0) + 1;
        acc[e.customerName].total += 1;
        return acc;
      }, {})
    ).map(([_, value]) => value).sort((a, b) => b.total - a.total);
  };

  const allCustomerData = processCustomerData(events);
  const top10Data = allCustomerData.slice(0, 10);
  const filteredCustomers = allCustomerData.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Monitor for Threshold Breaches
  useEffect(() => {
    const breaches = allCustomerData.filter(c => c.Critical > CRITICAL_THRESHOLD);
    setCriticalBreaches(breaches);
  }, [events]);

  /* ===================== EXPORT LOGIC ===================== */
  const handleExportImage = async () => {
    if (modalChartRef.current) {
      const canvas = await html2canvas(modalChartRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `SOC_Customer_Summary_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    }
  };

  const generateDailyReport = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('en-GB');
    doc.setFontSize(20);
    doc.setTextColor(11, 87, 208);
    doc.text("SOC DAILY SUMMARY REPORT", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${dateStr} | Analyst: ${user.email || "admin@test.com"}`, 14, 30);
    doc.line(14, 35, 196, 35);

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Total Incidents Ingested', events.length.toString()],
        ['Active Critical Alerts', events.filter(e => normalizeSeverity(e.severity) === "Critical").length.toString()],
        ['Security Status', 'Operational'],
      ],
      headStyles: { fillColor: [11, 87, 208] }
    });

    doc.text("Top Impacted Customers", 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Customer', 'Crit', 'High', 'Med', 'Low', 'Total']],
      body: top10Data.map(c => [c.name, c.Critical, c.High, c.Medium, c.Low, c.total]),
    });
    doc.save(`SOC_Daily_Report_${dateStr.replace(/\//g, '-')}.pdf`);
  };

  const platforms = [
    { name: "Cortex", icon: <Shield className="text-blue-500" /> },
    { name: "Trend Micro", icon: <Activity className="text-red-500" /> },
    { name: "QRadar", icon: <Database className="text-purple-500" /> }
  ];

  return (
    <header className="px-6 py-4 bg-white shrink-0 border-b relative shadow-sm">
      
      {/* THRESHOLD BREACH ALERT BANNER */}
      {criticalBreaches.length > 0 && (
        <div className="mb-4 bg-red-600 text-white px-4 py-2.5 rounded-xl flex items-center justify-between animate-pulse shadow-lg border-2 border-red-400">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <div className="text-xs">
              <span className="font-black uppercase">Threshold Breach:</span>
              <span className="ml-2 font-medium">
                {criticalBreaches.length} customer(s) have exceeded {CRITICAL_THRESHOLD} critical incidents.
              </span>
            </div>
          </div>
          <button 
            onClick={() => onFilterChange("severity", "Critical")}
            className="bg-white text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-gray-100 transition-colors"
          >
            Investigate
          </button>
        </div>
      )}

      {/* HEADER TOP BAR */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Unified Incident Dashboard</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Security Operations Center</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={generateDailyReport}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-[11px] font-black uppercase transition-all shadow-sm border border-blue-100"
          >
            <FileText size={14} /> Daily Report (PDF)
          </button>

          <div className="relative">
            <button onClick={() => setOpenMenu(!openMenu)} className="flex items-center gap-2 rounded-full border bg-gray-50 px-4 py-1.5 text-sm hover:bg-gray-100 transition-all shadow-sm transition-all">
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
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* LEFT: PLATFORM STATUS */}
        <div className="w-full xl:w-[320px] flex flex-col gap-3 group/platform">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Active Incident Status</p>
            <button onClick={() => onFilterChange("platform", "")} className="text-[9px] font-bold text-blue-600 hover:underline opacity-0 group-hover/platform:opacity-100 transition-opacity">RESET</button>
          </div>

          {platforms.map((p) => {
            const platformEvents = events.filter(e => e.platform === p.name);
            const activeCriticalCount = platformEvents.filter(e => normalizeSeverity(e.severity) === "Critical" && normalizeStatus(e.status) !== "Resolved").length;
            const logoUrl = p.name.toUpperCase() === 'CORTEX' ? "https://www.paloaltonetworks.com/content/dam/pan/en_US/images/logos/brand/cortex-logo-badge.png" :
                            p.name.toUpperCase() === 'TREND MICRO' ? "https://logos-world.net/wp-content/uploads/2022/05/Trend-Micro-Logo.png" :
                            p.name.toUpperCase() === 'QRADAR' ? "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" : null;

            return (
              <button key={p.name} onClick={() => onFilterChange("platform", p.name)} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all w-full hover:scale-[1.02] ${activeCriticalCount > 0 ? "border-red-500 bg-red-50/50 animate-pulse" : "border-transparent bg-white shadow-sm hover:border-gray-200"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg p-1.5 shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                    {logoUrl ? <img src={logoUrl} alt={p.name} className="w-full h-full object-contain" /> : <div className="text-gray-400">{p.icon}</div>}
                  </div>
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {activeCriticalCount > 0 && <div className="flex items-center gap-1.5 text-red-600"><AlertTriangle size={14} className="animate-bounce" /><span className="text-xs font-black">{activeCriticalCount}</span></div>}
                  <span className="h-4 w-[1px] bg-gray-300 mx-1" /><span className="text-lg font-black text-gray-900">{platformEvents.length}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CENTER: TOP 10 CUSTOMER BAR CHART */}
        <div className="flex-1 bg-gray-50/50 rounded-2xl p-4 border border-dashed border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Top 10 Customers by Incident</p>
            <button onClick={() => setShowAllCustomers(true)} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded">
              <Maximize2 size={10} /> SEE ALL
            </button>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10Data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748B' }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px' }} />
                {["Low", "Medium", "High", "Critical"].map((sev) => (
                  <Bar key={sev} dataKey={sev} stackId="a" fill={COLORS[sev]} barSize={12} onClick={(data) => onFilterChange("customerName", data.name)} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RESTORED: RIGHT PIE CHARTS (MIX ANALYSIS) */}
        <div className="w-full xl:w-[280px] flex xl:flex-col gap-6 justify-center border-l xl:pl-6 border-gray-100">
          <div className="flex flex-col items-center">
            <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest text-center">Global Severity</p>
            <div className="h-[90px] w-[90px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={severityPieData} dataKey="value" nameKey="name" innerRadius={28} outerRadius={38} paddingAngle={4} stroke="none" onClick={(data) => onFilterChange("severity", data.name)} className="cursor-pointer outline-none">
                    {severityPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    <Label value={events.length} position="center" className="text-[10px] font-black fill-gray-700" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest text-center">Incident Status</p>
            <div className="h-[90px] w-[90px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={28} outerRadius={38} paddingAngle={4} stroke="none" onClick={(data) => onFilterChange("status", data.name)} className="cursor-pointer outline-none">
                    {statusPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    <Label value={events.length} position="center" className="text-[10px] font-black fill-gray-700" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* FULL CUSTOMER LIST MODAL */}
      {showAllCustomers && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-[90%] h-[85%] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Full Customer Summary</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredCustomers.length} of {allCustomerData.length} Customers</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type="text" placeholder="Search customer..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button onClick={handleExportImage} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md"><Camera size={14} /> EXPORT PNG</button>
                <button onClick={() => { setShowAllCustomers(false); setSearchTerm(""); }} className="p-2 hover:bg-gray-200 rounded-full"><X size={24} className="text-gray-400" /></button>
              </div>
            </div>
            <div ref={modalChartRef} className="flex-1 overflow-y-auto p-10 bg-white">
              <div style={{ height: `${Math.max(filteredCustomers.length * 45, 500)}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredCustomers} layout="vertical" margin={{ left: 120, right: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                    {["Low", "Medium", "High", "Critical"].map((sev) => (<Bar key={sev} dataKey={sev} stackId="a" fill={COLORS[sev]} barSize={25} />))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM LOGOUT */}
      {confirmLogout && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl border animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-2"><h3 className="text-xl font-black text-gray-900">Confirm Logout</h3><button onClick={() => setConfirmLogout(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button></div>
            <p className="text-sm text-gray-600 mb-8">Are you sure you want to end your session?</p>
            <div className="flex justify-end gap-3"><button onClick={() => setConfirmLogout(false)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button><button onClick={handleLogout} className="px-5 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-lg active:scale-95">Logout</button></div>
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;