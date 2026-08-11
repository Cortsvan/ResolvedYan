import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { fetchWithAuth } from "../lib/api";

// Create the Context
const AuthContext = createContext();

// Create a custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for active session on load
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          // Ping our backend server to strictly verify the user is not banned
          await fetchWithAuth('/auth/verify');
          await handleSessionUser(session.user);
        } catch (error) {
          if (error.message === 'Failed to fetch') {
            console.warn("Backend server is unreachable. Bypassing strict verify for now.");
            await handleSessionUser(session.user);
          } else {
            // The backend returned an actual error (likely 401 Unauthorized due to suspension)
            console.warn("User account suspended or deleted. Forcing logout.");
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await handleSessionUser(session.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
        }
      }
    );

    // 3. Actively poll our backend every 30 seconds to catch real-time bans
    const verifyInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          await fetchWithAuth('/auth/verify');
        } catch (error) {
          if (error.message !== 'Failed to fetch') {
            if (import.meta.env.DEV) console.warn("Real-time ban detected. Forcing logout.");
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      }
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(verifyInterval);
    };
  }, []);

  // Helper to fetch user profile data and set state
  const handleSessionUser = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) console.error("Error fetching profile (code:", error.code, "):", error.message);
        throw error;
      }

      if (!profile) {
        if (import.meta.env.DEV) console.warn("No profile found for user:", authUser.id);
        throw new Error("User profile not found in database.");
      } else {
        if (import.meta.env.DEV) console.log("Profile loaded successfully:", profile.role);
      }

      const firstName = profile?.first_name || authUser.user_metadata?.first_name;
      const lastName = profile?.last_name || authUser.user_metadata?.last_name;
      const computedName = (firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : authUser.email.split('@')[0];

      setUser({
        id: authUser.id,
        email: authUser.email,
        name: computedName,
        role: profile.role,
        ...profile
      });
      setIsAuthenticated(true);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Unexpected error fetching user profile:", err);
      // Security fix: If we can't reliably determine the user's role, we MUST NOT let them proceed.
      // Silently falling back to 'customer' is dangerous.
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await handleSessionUser(session.user);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signup = async (firstName, lastName, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    signup,
    logout,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
