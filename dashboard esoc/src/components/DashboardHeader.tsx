import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DashboardHeaderProps {
  totalEvents: number;
  criticalEvents: number;
  openIncidents: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalEvents,
  criticalEvents,
  openIncidents,
}) => {
  const data = [
    { name: "Total", count: totalEvents, color: "#2563EB" }, // blue
    { name: "Critical", count: criticalEvents, color: "#F97316" }, // orange
    { name: "Open", count: openIncidents, color: "#22C55E" }, // green
  ];

  return (
    <header className="px-8 pt-8 pb-4">
      <h1 className="text-3xl font-bold text-tmone-blue mb-6">
        Security Incidents
      </h1>

      <div className="w-full h-64 bg-white rounded-xl shadow p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <XAxis dataKey="name" />
            <YAxis
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.ceil(dataMax)]}
            />
            <Tooltip />
            <Bar dataKey="count">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </header>
  );
};

export default DashboardHeader;
