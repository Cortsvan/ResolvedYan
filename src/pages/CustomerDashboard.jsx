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
  }, [user]);

  return (
    <DashboardLayout>
      <div className="bg-blue-600 rounded-2xl p-8 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500 opacity-50 pointer-events-none blur-3xl"></div>
        <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 rounded-full bg-blue-700 opacity-50 pointer-events-none blur-2xl"></div>
        
        <div className="relative z-10 md:w-2/3">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Hi, {user?.user_metadata?.first_name || user?.email?.split('@')[0] || "there"}! 👋
          </h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Welcome to your support hub. How can we help you today? Create a new ticket or check the status of your existing requests below.
          </p>
        </div>
        
        <div className="relative z-10 mt-6 md:mt-0 md:w-1/3 flex justify-end">
          <Link
            to="/tickets/new"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-blue-700 bg-white hover:bg-slate-50 shadow-sm transition-all hover:-translate-y-0.5 whitespace-nowrap"
          >
            Submit a Request
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0 border border-amber-100 shadow-sm">
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
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0 border border-emerald-100 shadow-sm">
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

          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm transition-all hover:shadow-md relative overflow-hidden group cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}>
            <div className="absolute inset-0 bg-blue-50/50 group-hover:bg-blue-50 transition-colors"></div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-200 shadow-sm relative z-10 group-hover:scale-110 transition-transform">
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

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                <div className="text-4xl mb-3">📭</div>
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
