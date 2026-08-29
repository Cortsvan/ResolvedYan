import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchWithAuth } from '../lib/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ----------------------------------------------------------------
  // Fetch all notifications from the backend
  // ----------------------------------------------------------------
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth('/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ----------------------------------------------------------------
  // Initial fetch + Supabase Realtime subscription
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    // Subscribe to new rows in the notifications table for this user
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Prepend the new notification to the list
          setNotifications(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  // ----------------------------------------------------------------
  // Mark a single notification as read (optimistic update)
  // ----------------------------------------------------------------
  const markAsRead = useCallback(async (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await fetchWithAuth(`/notifications/${id}/read`, { method: 'PUT' });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // ----------------------------------------------------------------
  // Mark all notifications as read (optimistic update)
  // ----------------------------------------------------------------
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await fetchWithAuth('/notifications/read-all', { method: 'PUT' });
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
