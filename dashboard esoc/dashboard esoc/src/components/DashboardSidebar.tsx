import React, { useState } from "react";
import {
  LayoutDashboard,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const DashboardSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={22} /> },
    { name: "Incidents", icon: <Shield size={22} /> },
    { name: "Reports", icon: <FileText size={22} /> },
  ];

  return (
    <aside
      className={`
        h-screen sticky top-0 left-0 z-50 bg-tmone-blue text-white shadow-xl
        flex flex-col transition-all duration-300 overflow-hidden flex-none
        border-r border-black/10
        ${collapsed ? "w-[70px] min-w-[70px]" : "w-[220px] min-w-[220px]"}
      `}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h2 className="text-lg font-bold text-tmone-orange tracking-wide">
            ESOC Unified
          </h2>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-tmone-orange/20 transition"
        >
          {collapsed ? (
            <ChevronRight size={22} />
          ) : (
            <ChevronLeft size={22} />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="mt-4 space-y-2 flex-1 overflow-y-auto px-2">
        {menuItems.map((item) => {
          const isActive = active === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`
                flex items-center gap-3 p-3 w-full rounded-lg transition-all duration-300 text-left
                ${collapsed ? "justify-center" : ""}
                ${
                  isActive
                    ? "bg-white text-tmone-blue shadow-inner"
                    : "text-white/90 hover:bg-tmone-orange/80 hover:text-white"
                }
              `}
            >
              <span>{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 text-xs text-white/60">
        {!collapsed && "© 2025 TM One ESOC Unifi"}
      </div>
    </aside>
  );
};
