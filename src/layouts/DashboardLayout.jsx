// ============================================================
// src/layouts/DashboardLayout.jsx
// ------------------------------------------------------------
// Layout wrapper for all dashboard / app pages.
// Uses max-w-7xl mx-auto for consistent centering that matches
// the landing page — content fills the viewport with padding
// rather than being pinned to the left.
// ============================================================

import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import GlobalChatWidget from "../components/GlobalChatWidget";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* pt-16 offsets the fixed navbar height */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <Sidebar />

          {/* Main content — flex-1 takes all remaining width */}
          <main className="flex-1 min-w-0 animate-fade-in">
            {children}
          </main>

        </div>
      </div>
      
      {/* Global Chat accessible from any dashboard page */}
      <GlobalChatWidget />
    </div>
  );
}

export default DashboardLayout;
