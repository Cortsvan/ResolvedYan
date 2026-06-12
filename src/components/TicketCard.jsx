// ============================================================
// src/components/TicketCard.jsx
// ------------------------------------------------------------
// A card component that shows a summary of one ticket.
// Used on dashboards to show an overview of individual tickets.
//
// Props:
//   - ticket (object): A ticket object from our data/tickets.js file
// ============================================================

import React from "react";
// Link lets us navigate to another page when clicked (like an <a> tag)
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import CategoryBadge from "./CategoryBadge";

function TicketCard({ ticket }) {
  // -------------------------------------------------------
  // Helper function: converts an ISO date string to a
  // human-friendly format like "Jun 1, 2024"
  // -------------------------------------------------------
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    // The outer div is the card container
    // "group" enables child elements to react to the parent's hover state
    <div className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      
      {/* Top row: Ticket ID and both badges */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-mono text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded">
          {ticket.id}
        </span>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Ticket subject (the title/heading) */}
      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
        {ticket.subject}
      </h3>

      {/* Short description preview - shows only first 80 characters */}
      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
        {ticket.description}
      </p>

      {/* Bottom row: category, customer, date, and view button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          {/* Category tag */}
          <div className="mb-1.5"><CategoryBadge category={ticket.category} /></div>
          {/* Customer name */}
          <span className="text-xs text-gray-400">
            👤 {ticket.customer}
          </span>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Creation date */}
          <span className="text-xs text-gray-400">
            {formatDate(ticket.createdAt)}
          </span>
          {/* Link to the detailed ticket page */}
          <Link
            to={`/tickets/${ticket.id}`}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TicketCard;
