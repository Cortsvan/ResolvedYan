// ============================================================
// src/components/StatCard.jsx
// ------------------------------------------------------------
// A reusable statistics card used on dashboards.
// Shows a number (value), a label, and an icon.
//
// Props:
//   - title (string): Label text (e.g., "Total Tickets")
//   - value (number): The number to display
//   - icon (string): Emoji icon (e.g., "🎫")
//   - color (string): Color theme - "indigo", "blue", "yellow", "green", "red"
//   - subtitle (string): Optional small text below the value
// ============================================================

import React from "react";

function StatCard({ title, value, icon, color = "indigo", subtitle }) {
  // -------------------------------------------------------
  // Color themes - applied to the icon container
  // -------------------------------------------------------
  const themeColors = {
    indigo: { iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    blue: { iconBg: "bg-blue-50 text-blue-600 border-blue-100" },
    yellow: { iconBg: "bg-amber-50 text-amber-600 border-amber-100" },
    green: { iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    red: { iconBg: "bg-red-50 text-red-600 border-red-100" },
  };

  const theme = themeColors[color] || themeColors.indigo;

  return (
    <div className="flat-card p-5 group hover:border-slate-300">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${theme.iconBg} group-hover:scale-105 duration-200`}>
          {icon}
        </div>
      </div>

      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>

      {subtitle && (
        <p className="text-sm font-medium text-slate-400 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

export default StatCard;
