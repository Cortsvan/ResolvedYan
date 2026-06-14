import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If they are logged in but don't have the right role, send them to their respective default page
    if (user.role === 'customer') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
