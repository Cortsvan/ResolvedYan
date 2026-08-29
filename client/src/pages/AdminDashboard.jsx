import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Setup real-time listener for tickets table
    const subscription = supabase
      .channel('admin_dashboard_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch tickets for stats
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .neq('category', 'Live Chat')
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Calculate stats
      const total = tickets.length;
      const open = tickets.filter(t => t.status === 'Open').length;
      const inProgress = tickets.filter(t => t.status === 'In Progress').length;
      const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
      const critical = tickets.filter(t => t.priority === 'High' && (t.status === 'Open' || t.status === 'In Progress')).length;

      setStats({ total, open, inProgress, resolved, critical });

      // 2. Fetch Recent Activities from audit_logs
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select(`
          *,
          users:changed_by (
            email,
            raw_user_meta_data
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (logsError) {
        console.warn("Could not fetch audit logs:", logsError.message);
        // Fallback to recent tickets if audit_logs table isn't populated
        setRecentActivity(tickets.slice(0, 5).map(t => ({
          id: t.id,
          type: 'ticket_created',
          ticket_id: t.id,
          created_at: t.created_at,
          details: { subject: t.subject }
        })));
      } else {
        setRecentActivity(logs);
      }

    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderActivityItem = (activity) => {
    const isLog = activity.action_type !== undefined;
    const timeString = new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = new Date(activity.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });

    if (isLog) {
      return (
        <div key={activity.id} className="relative pl-6 pb-6 last:pb-0 group">
          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-slate-900 shadow-sm flex items-center justify-center"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <p className="text-sm font-medium text-slate-800">
              <span className="font-bold text-slate-900 capitalize">{activity.action_type.replace('_', ' ')}</span>
              {" on "}
              <Link to={`/tickets/${activity.ticket_id}`} className="text-blue-600 hover:text-blue-700 font-mono font-semibold">
                #{activity.ticket_id}
              </Link>
            </p>
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{dateString} at {timeString}</span>
          </div>
          {activity.old_value && activity.new_value && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <span className="line-through text-slate-400">{activity.old_value}</span>
              <span>→</span>
              <span className="text-blue-600 font-bold">{activity.new_value}</span>
            </p>
          )}
        </div>
      );
    }

    // Fallback item
    return (
      <div key={activity.id} className="relative pl-6 pb-6 last:pb-0">
        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <p className="text-sm font-medium text-slate-800">
            Ticket <Link to={`/tickets/${activity.ticket_id}`} className="text-blue-600 hover:text-blue-700 font-mono font-semibold">#{activity.ticket_id}</Link> was created
          </p>
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{dateString} at {timeString}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{activity.details?.subject}</p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        
        {/* Consistent Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {user?.role === 'admin' ? "Admin Console" : "Staff Workspace"}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 flex items-center gap-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100 capitalize">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                {user?.role || 'Staff'}
              </span>
            </div>
            <p className="text-slate-500 text-sm sm:text-base">
              System overview, ticket health metrics, and team operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/tickets"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              <span>Go to Ticket Queue</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards with Black Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tickets</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? "-" : stats.total}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Across all customers</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Priority</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? "-" : stats.critical}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Needs prompt action</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Tickets</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? "-" : stats.open}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Awaiting staff response</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? "-" : stats.resolved}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Successfully completed</p>
          </div>

        </div>

        {/* 2 Column Operations & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Quick Operations Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Quick Operations</h2>
            <p className="text-xs text-slate-500 mb-6">Direct access to administrative tools and workflows.</p>

            <div className="space-y-3">
              <Link
                to="/admin/tickets"
                className="flex items-center justify-between p-4 bg-slate-50/60 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-slate-900 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Global Ticket Queue</h3>
                    <p className="text-xs text-slate-500">Triage, assign, and resolve customer support tickets</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-blue-600 font-bold transition-colors">→</span>
              </Link>

              <Link
                to="/customers"
                className="flex items-center justify-between p-4 bg-slate-50/60 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-slate-900 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Customer Directory</h3>
                    <p className="text-xs text-slate-500">View user accounts, history, and manage suspensions</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-blue-600 font-bold transition-colors">→</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/staff"
                  className="flex items-center justify-between p-4 bg-slate-50/60 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-slate-900 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Staff & Team Management</h3>
                      <p className="text-xs text-slate-500">Invite new team members and manage role permissions</p>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-blue-600 font-bold transition-colors">→</span>
                </Link>
              )}
            </div>
          </div>

          {/* Recent Audit & Activity Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Live Activity Feed</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time status changes and ticket updates</p>
              </div>
              <Link to="/admin/tickets" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                View Queue →
              </Link>
            </div>
            
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
              {recentActivity.length > 0 ? (
                recentActivity.map(renderActivityItem)
              ) : (
                <p className="text-sm text-slate-500 pl-6 py-2">No recent activity found.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
