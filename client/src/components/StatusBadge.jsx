// ============================================================
// src/components/StatusBadge.jsx
// ------------------------------------------------------------
import React from "react";

function StatusBadge({ status }) {
  const statusStyles = {
    Open: "bg-blue-50 text-blue-700 border-blue-200",
    "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
    Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Closed: "bg-slate-50 text-slate-600 border-slate-200",
  };

  const style = statusStyles[status] || "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export default StatusBadge;
