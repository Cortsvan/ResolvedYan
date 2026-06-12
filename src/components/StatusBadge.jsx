// ============================================================
// src/components/StatusBadge.jsx
// ------------------------------------------------------------
// A small colored badge/label that shows the status of a ticket.
// Example: "Open" shows in blue, "Resolved" shows in green.
//
// Props:
//   - status (string): The ticket status text to display
// ============================================================

// We import React so we can write JSX (the HTML-like syntax)
import React from "react";

function StatusBadge({ status }) {
  // -------------------------------------------------------
  // This object maps each status value to a Tailwind CSS
  // class string. When status = "Open", we use the blue classes.
  // -------------------------------------------------------
  const statusStyles = {
    Open: "bg-blue-100 text-blue-700 border border-blue-200",
    "In Progress": "bg-yellow-100 text-yellow-700 border border-yellow-200",
    Resolved: "bg-green-100 text-green-700 border border-green-200",
    Closed: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  // Look up the style for the given status.
  // If status is not found, use a default gray style.
  const style = statusStyles[status] || "bg-gray-100 text-gray-600 border border-gray-200";

  return (
    // The <span> is an inline element (stays on the same line as text)
    // We apply the dynamic style classes using template literals (backticks)
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-medium w-[140px] h-7 ${style}`}
    >
      {/* Show a small colored dot before the status text */}
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

// We export this so other files can import and use it
export default StatusBadge;
