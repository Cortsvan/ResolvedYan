import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import resolvedYanLogo from "../assets/ResolvedYan Logo.png";
import NotificationBell from "./NotificationBell";

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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ---- Left: Brand (flex-1 for perfect dead-center alignment) ---- */}
          <div className="flex items-center justify-start flex-1 min-w-0">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <img src={resolvedYanLogo} alt="ResolvedYan" className="w-8 h-8 object-contain" />
              <div className="leading-none">
                <span className="font-black text-lg text-slate-900 tracking-tight transition-colors">
                  ResolvedYan
                </span>
              </div>
            </Link>
          </div>

          {/* ---- Center: Desktop Navigation Links ---- */}
          <div className="hidden md:flex items-center justify-center gap-1 flex-shrink-0">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.to)
                    ? "text-blue-700 bg-blue-50 border border-blue-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ---- Right: Desktop CTA / Profile (flex-1 for perfect dead-center alignment) ---- */}
          <div className="hidden md:flex items-center justify-end gap-3 flex-1 min-w-0">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  Get Started
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors group"
                >
                  <img 
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=2563eb`} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-xl border border-slate-200 group-hover:border-blue-300 transition-colors object-cover shadow-xs"
                  />
                  <span className="hidden lg:inline-block max-w-[120px] truncate">{user?.name || 'Account'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors px-2.5 py-1.5 hover:bg-red-50 rounded-lg"
                >
                  Log out
                </button>
              </div>
            )}
          </div>

          {/* ---- Mobile Hamburger ---- */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
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
          <div className="md:hidden py-3 space-y-1 border-t border-slate-100 bg-white shadow-lg absolute w-full left-0 mt-[1px] px-4">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive(link.to)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {!isAuthenticated ? (
              <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Get Started Free
                </Link>
              </div>
            ) : (
              <div className="pt-4 pb-2 border-t border-slate-100 mt-2 flex justify-between items-center">
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 group">
                  <img 
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=2563eb`} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-xl border border-slate-200 group-hover:border-blue-300 transition-colors object-cover"
                  />
                  {user?.name}
                </Link>
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded-lg"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
