// ============================================================
// src/components/PriorityBadge.jsx
// ------------------------------------------------------------
// A small colored badge that shows the priority level of a ticket.
// Example: "Critical" = red, "High" = orange, "Low" = green
//
// Props:
//   - priority (string): The priority text to display
// ============================================================

import React from "react";

function PriorityBadge({ priority }) {
  const priorityStyles = {
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medium: "bg-blue-50 text-blue-700 border-blue-200",
    High: "bg-amber-50 text-amber-700 border-amber-200",
    Critical: "bg-red-50 text-red-700 border-red-200",
  };

  const style = priorityStyles[priority] || "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}
    >
      {priority}
    </span>
  );
}

export default PriorityBadge;
