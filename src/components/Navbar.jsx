import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  function isActive(path) {
    return location.pathname === path;
  }

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", roles: ['customer'] },
    { to: "/tickets", label: "My Tickets", roles: ['customer'] },
    { to: "/tickets/new", label: "New Ticket", roles: ['customer'] },
    { to: "/admin", label: user?.role === 'admin' ? "Admin Panel" : "Staff Panel", roles: ['staff', 'admin'] },
    { to: "/admin/tickets", label: "Tickets", roles: ['staff', 'admin'] },
    { to: "/analytics", label: "Analytics", roles: ['staff', 'admin'] },
    { to: "/customers", label: "Customers", roles: ['staff', 'admin'] },
    { to: "/staff", label: "Staff", roles: ['admin'] },
  ];

  const visibleLinks = navLinks.filter(link => {
    if (!isAuthenticated) return false;
    return link.roles.includes(user?.role);
  });

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-gray-200 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ---- Brand ---- */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 18c0-5 4-9 9-9s9 4 9 9" />
                <rect x="2" y="17" width="3.5" height="5" rx="1.75" fill="currentColor" stroke="none" />
                <rect x="18.5" y="17" width="3.5" height="5" rx="1.75" fill="currentColor" stroke="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 21c0 1-1 2-2.5 2" />
              </svg>
            </div>
            <div className="leading-none">
              <span className="font-bold text-sm block text-slate-900 transition-colors">
                TicketPH
              </span>
              <span className="text-xs text-slate-500 transition-colors">
                Ticket Manager
              </span>
            </div>
          </Link>

          {/* ---- Desktop Links ---- */}
          <div className="hidden md:flex items-center gap-0.5">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.to)
                    ? "text-blue-700 bg-blue-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ---- Desktop CTA ---- */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hover:-translate-y-0.5"
                >
                  Get Started
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  {user?.name}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>

          {/* ---- Mobile Hamburger ---- */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* ---- Mobile Menu ---- */}
        {mobileOpen && (
          <div className="md:hidden py-3 space-y-1 border-t border-slate-100 bg-white shadow-lg absolute w-full left-0 mt-[1px]">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.to)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {!isAuthenticated ? (
              <div className="px-4 pt-2 border-t border-slate-100 mt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Get Started Free
                </Link>
              </div>
            ) : (
              <div className="px-4 pt-4 pb-2 border-t border-slate-100 mt-2 flex justify-between items-center">
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-slate-600 hover:text-blue-600">
                  {user?.name}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
