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
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-sm">
        
        {/* Table header row */}
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50">
            <th className="text-left py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">
              Ticket ID
            </th>
            <th className="text-left py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">
              Subject
            </th>
            {showCustomer && (
              <th className="text-left py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Customer
              </th>
            )}
            <th className="text-left py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">
              Priority
            </th>
            <th className="text-left py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">
              Date
            </th>
            <th className="text-right py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table body - one row per ticket */}
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-slate-50 transition-colors group"
            >
              {/* Ticket ID */}
              <td className="py-4 px-6">
                <span className="font-mono text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-1 rounded">
                  {ticket.id}
                </span>
              </td>

              {/* Subject */}
              <td className="py-4 px-6">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="text-slate-900 hover:text-blue-600 font-medium transition-colors line-clamp-1 max-w-xs block"
                >
                  {ticket.subject}
                </Link>
              </td>

              {/* Customer */}
              {showCustomer && (
                <td className="py-4 px-6 text-slate-600">
                  {ticket.customer}
                </td>
              )}

              {/* Priority badge */}
              <td className="py-4 px-6">
                <PriorityBadge priority={ticket.priority} />
              </td>

              {/* Status badge */}
              <td className="py-4 px-6">
                <StatusBadge status={ticket.status} />
              </td>

              {/* Formatted date */}
              <td className="py-4 px-6 text-slate-500 text-sm whitespace-nowrap">
                {formatDate(ticket.created_at || ticket.createdAt)}
              </td>

              {/* Action buttons */}
              <td className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    View Details
                  </Link>

                  {isAdmin && onStatusChange && (
                    <select
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      value={ticket.status}
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
