// ============================================================
// src/components/Sidebar.jsx
// ------------------------------------------------------------
// A left-side navigation panel used in the Dashboard, Admin,
// Analytics, and Tickets pages.
//
// Props:
//   - activePage (string): The name of the current page,
//     used to highlight the active menu item
// ============================================================

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  // Get the current URL path to highlight the active link
  const location = useLocation();
  const { user } = useAuth();

  // -------------------------------------------------------
  // Menu items configuration
  // Each item has: an icon (emoji), a label, a path, and allowed roles.
  // -------------------------------------------------------
  const menuItems = [
    { icon: "🏠", label: "Dashboard", path: "/dashboard", roles: ['customer'] },
    { icon: "🎫", label: "My Tickets", path: "/tickets", roles: ['customer'] },
    { icon: "➕", label: "New Ticket", path: "/tickets/new", roles: ['customer'] },
    { icon: "⚙️", label: user?.role === 'admin' ? "Admin Panel" : "Staff Panel", path: "/admin", roles: ['staff', 'admin'] },
    { icon: "📋", label: "Tickets", path: "/admin/tickets", roles: ['staff', 'admin'] },
    { icon: "📊", label: "Analytics", path: "/analytics", roles: ['staff', 'admin'] },
    { icon: "👥", label: "Customers", path: "/customers", roles: ['staff', 'admin'] },
    { icon: "🛡️", label: "Staff", path: "/staff", roles: ['admin'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(user?.role));

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    // The sidebar container
    // On small screens it becomes a horizontal bar at the top
    // On large screens it's a fixed left column
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        
        {/* Sidebar title */}
        <div className="mb-4 pb-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Navigation
          </p>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  // Active item: filled blue background
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  // Inactive item: gray text, hover effect
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {/* Icon */}
              <span className="text-base">{item.icon}</span>
              {/* Label */}
              <span>{item.label}</span>
              
              {/* Right arrow for active item */}
              {isActive(item.path) && (
                <span className="ml-auto text-white/70 text-xs">›</span>
              )}
            </Link>
          ))}
        </nav>

        {/* ---- Help Box at the bottom of the sidebar ---- */}
        <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs font-bold text-slate-800 mb-1">🤖 AI Ready</p>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            This system is built for AI and n8n workflow integration.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
