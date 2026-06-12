// ============================================================
// src/components/TicketTable.jsx
// ------------------------------------------------------------
// A reusable table component for displaying a list of tickets.
// We can pass different columns and data to customize it.
//
// Props:
//   - tickets (array): Array of ticket objects to display
//   - showCustomer (boolean): Whether to show the Customer column
//   - onStatusChange (function): Optional callback when admin changes status
//   - isAdmin (boolean): If true, shows admin action buttons
// ============================================================

import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import CategoryBadge from "./CategoryBadge";

function TicketTable({ tickets, showCustomer = false, onStatusChange, isAdmin = false }) {
  
  // -------------------------------------------------------
  // Helper: Format date string to readable format
  // -------------------------------------------------------
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // -------------------------------------------------------
  // If there are no tickets, show an empty state message
  // -------------------------------------------------------
  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-5xl mb-3">🎫</div>
        <p className="text-lg font-medium text-gray-500">No tickets found</p>
        <p className="text-sm mt-1">No tickets match the current filters.</p>
      </div>
    );
  }

  return (
    // "overflow-x-auto" adds horizontal scrolling on small screens
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        
        {/* Table header row */}
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50">
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
              Ticket ID
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
              Subject
            </th>
            {/* Only show Customer column if showCustomer prop is true */}
            {showCustomer && (
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                Customer
              </th>
            )}
            {/* Category header removed */}
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
              Priority
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
              Date
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table body - one row per ticket */}
        <tbody className="divide-y divide-gray-100">
          {/* 
            .map() loops through each ticket and creates a <tr> for it.
            "key" is required by React to track which row is which.
          */}
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-indigo-50/30 transition-colors"
            >
              {/* Ticket ID */}
              <td className="py-3 px-4">
                <span className="font-mono text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                  {ticket.id}
                </span>
              </td>

              {/* Subject - clicking it goes to the ticket details page */}
              <td className="py-3 px-4">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="text-gray-800 hover:text-indigo-600 font-medium transition-colors line-clamp-1 max-w-xs block"
                >
                  {ticket.subject}
                </Link>
              </td>

              {/* Customer name (only shown if showCustomer = true) */}
              {showCustomer && (
                <td className="py-3 px-4 text-gray-600">
                  {ticket.customer}
                </td>
              )}

              {/* Category cell removed */}

              {/* Priority badge */}
              <td className="py-3 px-4">
                <PriorityBadge priority={ticket.priority} />
              </td>

              {/* Status badge */}
              <td className="py-3 px-4">
                <StatusBadge status={ticket.status} />
              </td>

              {/* Formatted date */}
              <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">
                {formatDate(ticket.created_at || ticket.createdAt)}
              </td>

              {/* Action buttons */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {/* View button - always visible */}
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                  >
                    View
                  </Link>

                  {/* Status change dropdown - only visible to admins */}
                  {isAdmin && onStatusChange && (
                    <select
                      className="text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-600 bg-white hover:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
                      value={ticket.status}
                      // When admin selects a new status, call the function passed in
                      onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TicketTable;
