import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";

function AdminDashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    open: 0,
    resolved: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: tickets, error } = await supabase
          .from("tickets")
          .select("*, profiles:customer_id (first_name, last_name)");

        if (error) throw error;

        if (tickets) {
          setStats({
            total: tickets.length,
            critical: tickets.filter((t) => t.priority === "High").length,
            open: tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length,
            resolved: tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length,
          });

          const sortedTickets = [...tickets].sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at);
            const dateB = new Date(b.updated_at || b.created_at);
            return dateB - dateA; // Descending
          });
          setRecentActivity(sortedTickets.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const subscription = supabase
      .channel('admin_dashboard_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, (payload) => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  function formatActivityTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  const renderActivityItem = (ticket) => {
    const customerName = ticket.profiles ? `${ticket.profiles.first_name || ''} ${ticket.profiles.last_name || ''}`.trim() || 'Unknown Customer' : 'Unknown Customer';
    const timeAgo = formatActivityTime(ticket.updated_at || ticket.created_at);

    let icon, bgColor, title, hoverColor;

    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-green-600"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>;
      bgColor = "bg-green-100";
      hoverColor = "hover:border-green-200 hover:bg-green-50/50";
      title = `Ticket marked as ${ticket.status}`;
    } else if (ticket.priority === 'High') {
      icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-red-600"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
      bgColor = "bg-red-100";
      hoverColor = "hover:border-red-200 hover:bg-red-50/50";
      title = `High priority ticket detected`;
    } else if (ticket.status === 'In Progress') {
      icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-amber-600"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" /></svg>;
      bgColor = "bg-amber-100";
      hoverColor = "hover:border-amber-200 hover:bg-amber-50/50";
      title = `Staff assigned to ticket`;
    } else {
      icon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>;
      bgColor = "bg-blue-100";
      hoverColor = "hover:border-blue-200 hover:bg-blue-50/50";
      title = `New ticket created by ${customerName}`;
    }

    return (
      <div key={ticket.id} className="relative pl-6">
        <span className={`absolute -left-[13px] top-1 flex items-center justify-center w-6 h-6 rounded-full ${bgColor} ring-4 ring-white`}>
          {icon}
        </span>
        <div className={`bg-slate-50 border border-slate-100 rounded-lg p-3 transition-colors ${hoverColor}`}>
          <Link to={`/tickets/${ticket.id}`} className="block">
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">{ticket.category}</span>
              <span className="text-xs text-slate-400">{timeAgo}</span>
            </div>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {user?.role === 'admin' ? "Admin Panel" : "Staff Panel"}
            </h1>
            <span className={`text-xs font-semibold px-2.5 py-1 flex items-center gap-1.5 rounded-full border ${user?.role === 'admin' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
              {user?.role === 'admin' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                  </svg>
                  Admin
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Staff
                </>
              )}
            </span>
          </div>
          <p className="text-slate-500">
            System overview and top-level statistics.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/tickets"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            Go to Ticket Queue →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Tickets"
          value={loading ? "-" : stats.total}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          }
          color="indigo"
          subtitle="All customers"
        />
        <StatCard
          title="High Priority"
          value={loading ? "-" : stats.critical}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
          color="red"
          subtitle="Needs immediate attention"
        />
        <StatCard
          title="Open Tickets"
          value={loading ? "-" : stats.open}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
          subtitle="Awaiting assignment"
        />
        <StatCard
          title="Resolved"
          value={loading ? "-" : stats.resolved}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          subtitle="Successfully closed"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Operations</h2>
          <div className="space-y-3">
            <Link to="/admin/tickets" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 bg-blue-100 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold text-slate-800">Ticket Queue</h3>
                  <p className="text-sm text-slate-500">Resolve customer requests</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-blue-600 transition-colors">→</span>
            </Link>

            <Link to="/customers" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-indigo-600 bg-indigo-100 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold text-slate-800">Customer Management</h3>
                  <p className="text-sm text-slate-500">View and manage users</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-blue-600 transition-colors">→</span>
            </Link>

            {user?.role === 'admin' && (
              <Link to="/staff" className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg hover:border-amber-300 hover:bg-amber-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-amber-600 bg-amber-100 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-amber-900">Staff Management</h3>
                    <p className="text-sm text-amber-700">Add or remove staff</p>
                  </div>
                </div>
                <span className="text-amber-400 group-hover:text-amber-600 transition-colors">→</span>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            <Link to="/admin/tickets" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</Link>
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
    </DashboardLayout>
  );
}

export default AdminDashboard;
