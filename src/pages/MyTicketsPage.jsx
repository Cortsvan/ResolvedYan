import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import TicketTable from "../components/TicketTable";

const CATEGORIES = [
  "Billing",
  "Technical Support",
  "Account",
  "Feature Request",
  "General Inquiry",
];

function MyTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "archive"

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();

    const subscription = supabase
      .channel('my_tickets_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `customer_id=eq.${user.id}` }, (payload) => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  // Split tickets into active (non-Closed) and archived (Closed)
  const activeTickets = tickets.filter((t) => t.status !== "Closed");
  const archivedTickets = tickets.filter((t) => t.status === "Closed");

  const sourceTickets = activeTab === "archive" ? archivedTickets : activeTickets;

  const filteredTickets = sourceTickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === "All" || ticket.priority === priorityFilter;
    const matchesCategory =
      categoryFilter === "All" || ticket.category === categoryFilter;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      ticket.subject?.toLowerCase().includes(query) ||
      String(ticket.id)?.toLowerCase().includes(query) ||
      ticket.category?.toLowerCase().includes(query);

    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-500 mt-1">
            View and manage all your support requests.
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition-all hover:-translate-y-0.5"
        >
          + New Ticket
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => { setActiveTab("active"); setStatusFilter("All"); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "active"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Active
          {activeTickets.length > 0 && (
            <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeTickets.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("archive"); setStatusFilter("All"); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "archive"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            Archive
          </div>
          {archivedTickets.length > 0 && (
            <span className="ml-2 bg-slate-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {archivedTickets.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by subject, ID, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
          </div>

          {activeTab === "active" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          )}

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {(statusFilter !== "All" || priorityFilter !== "All" || categoryFilter !== "All" || searchQuery !== "") && (
            <button
              onClick={() => {
                setStatusFilter("All");
                setPriorityFilter("All");
                setCategoryFilter("All");
                setSearchQuery("");
              }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">{filteredTickets.length}</span>
            {" "}of{" "}
            <span className="font-semibold text-gray-800">{sourceTickets.length}</span>
            {" "}{activeTab === "archive" ? "archived" : "active"} tickets
          </p>
          {activeTab === "archive" && archivedTickets.length > 0 && (
            <span className="text-xs text-slate-400">Closed tickets are read-only</span>
          )}
        </div>

        <div className="p-2">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading tickets...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error: {error}</div>
          ) : sourceTickets.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="flex justify-center mb-4">
                {activeTab === "archive" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                  </svg>
                )}
              </div>
              <p className="font-medium text-gray-500">
                {activeTab === "archive" ? "No archived tickets" : "No active tickets"}
              </p>
              <p className="text-sm mt-1">
                {activeTab === "archive"
                  ? "Closed tickets will appear here."
                  : "Submit a new ticket to get started."}
              </p>
            </div>
          ) : (
            <TicketTable tickets={filteredTickets} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyTicketsPage;
