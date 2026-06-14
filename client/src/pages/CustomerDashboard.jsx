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
        // Fetch all tickets for this user
        const { data: tickets, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("customer_id", user.id)
          .neq("category", "Live Chat")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Calculate stats
        const openCount = tickets.filter(
          (t) => t.status === "Open" || t.status === "In Progress"
        ).length;
        const resolvedCount = tickets.filter(
          (t) => t.status === "Resolved" || t.status === "Closed"
        ).length;

        setOpenTicketsCount(openCount);
        setResolvedTicketsCount(resolvedCount);

        // Get 5 most recent
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `customer_id=eq.${user.id}` }, (payload) => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 shadow-lg shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/50 pointer-events-none blur-3xl"></div>
        <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 rounded-full bg-indigo-500/50 pointer-events-none blur-2xl"></div>
        
        <div className="relative z-10 md:w-2/3">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Hi, {user?.name || "there"}!
          </h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Welcome to your support hub. How can we help you today? Create a new ticket or check the status of your existing requests below.
          </p>
        </div>
        
        <div className="relative z-10 mt-6 md:mt-0 md:w-1/3 flex justify-end">
          <Link
            to="/tickets/new"
            className="btn-white px-6 py-3 text-base shadow-md hover:-translate-y-0.5 whitespace-nowrap border-0"
          >
            Submit a Request
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flat-card p-5 flex items-center gap-4 group hover:border-amber-200">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0 border border-amber-100 shadow-sm transition-transform group-hover:scale-105 duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Response</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {loading ? "-" : openTicketsCount}
              </p>
            </div>
          </div>
          
          <div className="flat-card p-5 flex items-center gap-4 group hover:border-emerald-200">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0 border border-emerald-100 shadow-sm transition-transform group-hover:scale-105 duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {loading ? "-" : resolvedTicketsCount}
              </p>
            </div>
          </div>

          <div className="flat-card p-5 flex items-center gap-4 relative overflow-hidden group cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200" onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}>
            <div className="absolute inset-0 bg-blue-50/50 group-hover:bg-blue-50 transition-colors"></div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-200 shadow-sm relative z-10 group-hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Need Help?</p>
              <p className="text-base font-bold text-blue-700 mt-0.5 group-hover:text-blue-800 transition-colors">Chat with Support →</p>
            </div>
          </div>
        </div>

        <div className="flat-card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h2 className="font-bold text-lg text-slate-900">Recent Activity</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Your most recent support requests
              </p>
            </div>
            <Link
              to="/tickets"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 hover:bg-blue-50 rounded-lg"
            >
              View All Tickets →
            </Link>
          </div>
          <div className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading recent tickets...</div>
            ) : recentTickets.length > 0 ? (
              <TicketTable tickets={recentTickets} />
            ) : (
              <div className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No recent tickets</h3>
                <p className="text-slate-500">You don't have any support requests yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CustomerDashboard;
