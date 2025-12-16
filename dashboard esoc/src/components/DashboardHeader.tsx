import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

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
  Low: "#22C55E",
  Open: "#2563EB",
  Resolved: "#9CA3AF",
};

/* =====================================================
   COMPONENT
===================================================== */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ events }) => {
  /* ===================== DATA AGGREGATION ===================== */
  const severityData = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name],
  }));

  const statusData = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name],
  }));

  const totalSeverity = severityData.reduce((a, b) => a + b.value, 0);
  const totalStatus = statusData.reduce((a, b) => a + b.value, 0);

  /* ===================== UI ===================== */
  return (
    <header className="px-4 py-1 bg-background shrink-0">
      <h1 className="text-lg font-semibold text-tmone-blue mb-2">
        Incident Overview
      </h1>

      {/* COMPACT DONUT ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {/* ================= Severity Distribution ================= */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-medium mb-1 text-gray-700">
            Severity Distribution
          </p>

          <div className="h-[95px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={28}
                  outerRadius={42}
                  paddingAngle={2}
                  stroke="none"
                >
                  <Label
                    value={totalSeverity}
                    position="center"
                    className="text-xs font-semibold fill-gray-700"
                  />
                  {severityData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v} incidents`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex gap-3 text-[10px] mt-1">
            {severityData.map((d) => (
              <div key={d.name} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-gray-700">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= Incident Status ================= */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-medium mb-1 text-gray-700">
            Incident Status
          </p>

          <div className="h-[95px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={28}
                  outerRadius={42}
                  paddingAngle={2}
                  stroke="none"
                >
                  <Label
                    value={totalStatus}
                    position="center"
                    className="text-xs font-semibold fill-gray-700"
                  />
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v} incidents`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex gap-3 text-[10px] mt-1">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-gray-700">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
