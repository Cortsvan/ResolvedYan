// ============================================================
// src/components/TicketTable.jsx
// ------------------------------------------------------------
// A reusable table component for displaying a list of tickets.
// ============================================================

import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import CategoryBadge from "./CategoryBadge";

function TicketTable({ tickets, showCustomer = false, onStatusChange, isAdmin = false }) {
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-700">No tickets found</p>
        <p className="text-xs text-slate-400 mt-0.5">No tickets match the current view.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3 px-3 sm:px-4 w-20">ID</th>
            <th className="py-3 px-3 sm:px-4">Subject</th>
            {showCustomer && (
              <th className="py-3 px-3 sm:px-4">Customer</th>
            )}
            <th className="py-3 px-3 sm:px-4">Category</th>
            <th className="py-3 px-3 sm:px-4">Priority</th>
            <th className="py-3 px-3 sm:px-4">Status</th>
            <th className="py-3 px-3 sm:px-4">Date</th>
            <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-slate-50/80 transition-colors group"
            >
              {/* Ticket ID */}
              <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title={ticket.id}>
                  #{String(ticket.id).substring(0, 8)}
                </span>
              </td>

              {/* Subject */}
              <td className="py-3 px-3 sm:px-4">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="text-slate-900 hover:text-blue-600 font-bold transition-colors truncate max-w-[160px] sm:max-w-xs block"
                  title={ticket.subject}
                >
                  {ticket.subject}
                </Link>
              </td>

              {/* Customer */}
              {showCustomer && (
                <td className="py-3 px-3 sm:px-4 text-slate-600 whitespace-nowrap">
                  {ticket.customer}
                </td>
              )}

              {/* Category */}
              <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                <CategoryBadge category={ticket.category} />
              </td>

              {/* Priority badge */}
              <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                <PriorityBadge priority={ticket.priority} />
              </td>

              {/* Status badge */}
              <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                <StatusBadge status={ticket.status} />
              </td>

              {/* Formatted date */}
              <td className="py-3 px-3 sm:px-4 text-slate-500 text-xs whitespace-nowrap">
                {formatDate(ticket.created_at || ticket.createdAt)}
              </td>

              {/* Action buttons */}
              <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-semibold rounded-lg transition-colors border border-slate-200 hover:border-blue-200"
                  >
                    <span>View</span>
                    <span>→</span>
                  </Link>

                  {isAdmin && onStatusChange && (
                    <select
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
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
