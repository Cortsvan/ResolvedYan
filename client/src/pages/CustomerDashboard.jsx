import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import TicketTable from "../components/TicketTable";

function CustomerDashboard() {
  const { user } = useAuth();
  const [recentTickets, setRecentTickets] = useState([]);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [resolvedTicketsCount, setResolvedTicketsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data: tickets, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("customer_id", user.id)
          .neq("category", "Live Chat")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const openCount = tickets.filter(
          (t) => t.status === "Open" || t.status === "In Progress"
        ).length;
        const resolvedCount = tickets.filter(
          (t) => t.status === "Resolved" || t.status === "Closed"
        ).length;

        setOpenTicketsCount(openCount);
        setResolvedTicketsCount(resolvedCount);
        setRecentTickets(tickets.slice(0, 5));
      } catch (err) {
        console.error("Error fetching customer dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const subscription = supabase
      .channel('customer_dashboard_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `customer_id=eq.${user.id}` }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const totalTickets = openTicketsCount + resolvedTicketsCount;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Consistent Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Customer Dashboard
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 flex items-center gap-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Customer
              </span>
            </div>
            <p className="text-slate-500 text-sm sm:text-base">
              Welcome back, {user?.first_name || user?.name || "there"}. Track and manage your support requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              Live Chat
            </button>
            <Link
              to="/tickets/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Ticket
            </Link>
          </div>
        </div>

        {/* 3 Metric Cards with Solid Black Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Awaiting Response</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? "-" : openTicketsCount}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Open & in-progress support tickets</p>
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
              {loading ? "-" : resolvedTicketsCount}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Successfully completed requests</p>
          </div>

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
              {loading ? "-" : totalTickets}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">All-time submitted requests</p>
          </div>

        </div>

        {/* Recent Tickets Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h2 className="font-bold text-lg text-slate-900">Recent Activity</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Your most recent support tickets and updates
              </p>
            </div>
            <Link
              to="/tickets"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 hover:bg-blue-50 rounded-lg flex items-center gap-1"
            >
              <span>View All Tickets</span>
              <span>→</span>
            </Link>
          </div>

          <div className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading recent tickets...</div>
            ) : recentTickets.length > 0 ? (
              <TicketTable tickets={recentTickets} />
            ) : (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">No support tickets yet</h3>
                <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
                  Whenever you submit a support ticket, it will appear here with live progress updates.
                </p>
                <Link
                  to="/tickets/new"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Submit a Request
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default CustomerDashboard;
