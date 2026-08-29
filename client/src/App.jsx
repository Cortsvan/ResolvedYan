// ============================================================
// src/App.jsx
// ------------------------------------------------------------
// The ROOT component of the entire application.
// Every React app has one root component (usually App.jsx).
//
// This component:
//   1. Wraps the app in <BrowserRouter> for routing to work
//   2. Renders <AppRoutes> which contains all our page routes
//
// COMPONENT TREE:
//   main.jsx
//     └── <App />
//           └── <BrowserRouter>
//                 └── <AppRoutes>
//                       ├── <HomePage />  (path="/")
//                       ├── <CustomerDashboard />  (path="/dashboard")
//                       ├── <CreateTicketPage />  (path="/tickets/new")
//                       ├── <MyTicketsPage />  (path="/tickets")
//                       ├── <TicketDetailPage />  (path="/tickets/:id")
//                       ├── <AdminDashboard />  (path="/admin")
//                       └── <AnalyticsPage />  (path="/analytics")
// ============================================================

import React from "react";
// BrowserRouter enables URL-based navigation in the browser
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    // BrowserRouter must wrap everything that uses routing.
    // Without this, Link, useNavigate, useParams, etc. won't work.
    <AuthProvider>
      <BrowserRouter>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Export App so main.jsx can import and render it
export default App;
