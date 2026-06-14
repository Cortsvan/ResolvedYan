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
  // Each priority level gets its own color scheme
  const priorityStyles = {
    Low: "bg-green-100 text-green-700 border border-green-200",
    Medium: "bg-blue-100 text-blue-700 border border-blue-200",
    High: "bg-orange-100 text-orange-700 border border-orange-200",
  };

  const style = priorityStyles[priority] || "bg-gray-100 text-gray-600 border border-gray-200";

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-medium w-[140px] h-7 ${style}`}
    >
      {priority}
    </span>
  );
}

export default PriorityBadge;
