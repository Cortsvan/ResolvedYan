import React from "react";

function StatusBadge({ status }) {
  const statusConfig = {
    Open: {
      style: "bg-sky-50 text-sky-700 border-sky-200",
      dot: "bg-sky-500"
    },
    "In Progress": {
      style: "bg-indigo-50 text-indigo-700 border-indigo-200",
      dot: "bg-indigo-500"
    },
    Resolved: {
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500"
    },
    Closed: {
      style: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400"
    },
  };

  const config = statusConfig[status] || {
    style: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400"
  };

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}

export default StatusBadge;
