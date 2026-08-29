import React from "react";

function PriorityBadge({ priority }) {
  const priorityStyles = {
    Critical: "bg-red-50 text-red-700 border-red-200",
    High: "bg-orange-50 text-orange-700 border-orange-200",
    Medium: "bg-blue-50 text-blue-700 border-blue-200",
    Low: "bg-slate-50 text-slate-600 border-slate-200",
  };

  const style = priorityStyles[priority] || "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${style}`}
    >
      {priority}
    </span>
  );
}

export default PriorityBadge;
