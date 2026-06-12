// ============================================================
// src/components/CategoryBadge.jsx
// ------------------------------------------------------------
// A small colored badge that visually distinguishes ticket categories.
//
// Props:
//   - category (string): The category text to display
// ============================================================

import React from "react";

function CategoryBadge({ category }) {
  // Each category gets its own color scheme
  const categoryStyles = {
    "Billing": "bg-purple-100 text-purple-700 border border-purple-200",
    "Technical Support": "bg-blue-100 text-blue-700 border border-blue-200",
    "Account": "bg-emerald-100 text-emerald-700 border border-emerald-200",
    "Feature Request": "bg-amber-100 text-amber-700 border border-amber-200",
    "General Inquiry": "bg-gray-100 text-gray-700 border border-gray-200",
  };

  // Icons for visual appeal
  const categoryIcons = {
    "Billing": "💳",
    "Technical Support": "🛠️",
    "Account": "👤",
    "Feature Request": "💡",
    "General Inquiry": "📋",
  };

  const style = categoryStyles[category] || "bg-gray-100 text-gray-600 border border-gray-200";
  const icon = categoryIcons[category] || "•";

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-medium w-[140px] h-7 ${style}`}
    >
      <span className="text-[10px]">{icon}</span>
      {category}
    </span>
  );
}

export default CategoryBadge;
