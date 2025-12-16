import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardHeaderProps {
  events: {
    severity: string;
    status: string;
  }[];
}

const COLORS: Record<string, string> = {
  Critical: "#DC2626",
  High: "#F97316",
  Low: "#22C55E",
  Open: "#2563EB",
  Resolved: "#9CA3AF",
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ events }) => {
  /* ===================== AGGREGATION ===================== */
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

  /* ===================== UI ===================== */
  return (
    <header className="px-4 pt-2 pb-2 bg-muted/10">
      <h1 className="text-xl font-semibold text-tmone-blue mb-2">
        Incident Overview
      </h1>

      {/* ULTRA-COMPACT DONUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Severity */}
        <div className="bg-white rounded-lg shadow px-2 py-1 h-40">
          <p className="text-xs font-semibold text-center mb-1">
            Severity Distribution
          </p>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                innerRadius={32}
                outerRadius={48}
                paddingAngle={1}
              >
                {severityData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v} incidents`} />
              <Legend
                verticalAlign="bottom"
                height={22}
                wrapperStyle={{ fontSize: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow px-2 py-1 h-40">
          <p className="text-xs font-semibold text-center mb-1">
            Incident Status
          </p>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={32}
                outerRadius={48}
                paddingAngle={1}
              >
                {statusData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v} incidents`} />
              <Legend
                verticalAlign="bottom"
                height={22}
                wrapperStyle={{ fontSize: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
