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
  // Color themes - each color has background, text, and icon colors
  // -------------------------------------------------------
  const colorStyles = {
    indigo: {
      bg: "bg-indigo-50",
      icon: "bg-indigo-100 text-indigo-600",
      value: "text-indigo-700",
      border: "border-indigo-100",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      value: "text-blue-700",
      border: "border-blue-100",
    },
    yellow: {
      bg: "bg-amber-50",
      icon: "bg-amber-100 text-amber-600",
      value: "text-amber-700",
      border: "border-amber-100",
    },
    green: {
      bg: "bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-600",
      value: "text-emerald-700",
      border: "border-emerald-100",
    },
    red: {
      bg: "bg-red-50",
      icon: "bg-red-100 text-red-600",
      value: "text-red-700",
      border: "border-red-100",
    },
  };

  // Look up the colors for the given color prop, default to indigo
  const theme = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      className={`${theme.bg} rounded-xl border ${theme.border} p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
    >
      {/* Top row: title and icon */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {/* Icon container */}
        <div className={`${theme.icon} w-10 h-10 rounded-lg flex items-center justify-center text-lg`}>
          {icon}
        </div>
      </div>

      {/* Big value number */}
      <p className={`text-2xl font-bold ${theme.value}`}>{value}</p>

      {/* Optional subtitle */}
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export default StatCard;
