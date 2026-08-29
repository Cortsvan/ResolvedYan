import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Helper to make authenticated requests to our Node.js backend.
 * Automatically fetches the current Supabase JWT token and attaches it to the headers.
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/invite/staff')
 * @param {object} options - Fetch options (method, body, etc.)
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
  // Get current session token from Supabase
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error("You must be logged in to perform this action.");
  }

  const token = session.access_token;

  // Set up headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text || `HTTP ${response.status} ${response.statusText}` };
    }

    if (!response.ok) {
      const errorMsg = data?.error || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      throw err;
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(`API Error on ${endpoint}:`, err);
    }
    throw err;
  }
};
