// ============================================================
// src/routes/AppRoutes.jsx
// ------------------------------------------------------------
// This file defines ALL the routes (URL paths) in the app.
// React Router reads this file to know which page component
// to show when the user visits each URL.
//
// HOW REACT ROUTER WORKS:
//   - <BrowserRouter>: wraps the app, enables client-side routing
//   - <Routes>: the container for all route definitions
//   - <Route path="/" element={<ComponentName />}>:
//       When the URL matches "path", show the "element" component
//   - <Link to="/path">: navigates without page reload
//   - useNavigate(): navigates programmatically from JavaScript
//   - useParams(): reads dynamic URL segments like :id
// ============================================================

import React from "react";
// Import routing components from react-router-dom
import { Routes, Route } from "react-router-dom";

// Import all page components
import HomePage from "../pages/HomePage";
import CustomerDashboard from "../pages/CustomerDashboard";
import CreateTicketPage from "../pages/CreateTicketPage";
import MyTicketsPage from "../pages/MyTicketsPage";
import TicketDetailPage from "../pages/TicketDetailPage";
import AdminDashboard from "../pages/AdminDashboard";
import AnalyticsPage from "../pages/AnalyticsPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import ProtectedRoute from "../components/ProtectedRoute";
import GlobalTicketQueue from "../pages/GlobalTicketQueue";
import CustomerManagement from "../pages/CustomerManagement";
import StaffManagement from "../pages/StaffManagement";
import ProfilePage from "../pages/ProfilePage";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/TermsOfServicePage";

function AppRoutes() {
  return (
    // <Routes> contains all the route definitions.
    // React Router will match the current URL to one of these routes
    // and render the corresponding component.
    <Routes>
      
      {/* 
        Route: /
        The home/landing page of the application.
        This is the first page users see.
      */}
      <Route path="/" element={<HomePage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />

      {/* 
        Route: /dashboard
        The customer dashboard showing ticket statistics.
      */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />

      {/* 
        Route: /profile
        Global profile page for managing personal info, password, and email.
      */}
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}><ProfilePage /></ProtectedRoute>} />

      {/* 
        Route: /tickets
        Shows all tickets in a filterable table.
      */}
      <Route path="/tickets" element={<ProtectedRoute allowedRoles={['customer']}><MyTicketsPage /></ProtectedRoute>} />

      {/* 
        Route: /tickets/new
        The form to create a new support ticket.
        IMPORTANT: This route must come BEFORE /tickets/:id
        so React Router doesn't mistake "new" for a ticket ID.
      */}
      <Route path="/tickets/new" element={<ProtectedRoute allowedRoles={['customer']}><CreateTicketPage /></ProtectedRoute>} />

      {/* 
        Route: /tickets/:id
        The detail page for a single ticket.
        ":id" is a dynamic parameter - it matches any value.
        Examples: /tickets/TKT-001, /tickets/TKT-007
        The component reads this value using useParams().
      */}
      <Route path="/tickets/:id" element={<ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}><TicketDetailPage /></ProtectedRoute>} />

      {/* 
        Route: /admin
        The admin panel with high-level stats and overview.
      */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><AdminDashboard /></ProtectedRoute>} />

      {/* 
        Route: /admin/tickets
        The global ticket queue for resolving requests.
      */}
      <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><GlobalTicketQueue /></ProtectedRoute>} />

      {/* 
        Route: /customers
        Customer management placeholder.
      */}
      <Route path="/customers" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><CustomerManagement /></ProtectedRoute>} />

      {/* 
        Route: /staff
        Staff management placeholder (Admin only).
      */}
      <Route path="/staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffManagement /></ProtectedRoute>} />

      {/* 
        Route: /analytics
        Charts and statistics about ticket data.
      */}
      <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><AnalyticsPage /></ProtectedRoute>} />

      {/* 
        Route: * (catch-all / 404)
        If no other route matches, show a "Not Found" page.
        The "*" wildcard matches any URL not matched above.
      */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="text-center max-w-sm p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-6xl mb-4">404</div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
              <p className="text-gray-500 text-sm mb-6">
                The page you're looking for doesn't exist.
              </p>
              <a
                href="/"
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors"
              >
                ← Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
