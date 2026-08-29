import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import CategoryBadge from "../components/CategoryBadge";

const CATEGORIES = [
  "Technical Support",
  "Billing",
  "Account",
  "Feature Request",
  "General Inquiry",
];

function MyTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & State
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("customer_id", user.id)
          .neq("category", "Live Chat")
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `customer_id=eq.${user.id}` }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  // Counts for quick chips
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === "Open").length;
  const inProgressCount = tickets.filter(t => t.status === "In Progress").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved").length;
  const closedCount = tickets.filter(t => t.status === "Closed").length;

  // Filtered dataset
  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Active"
        ? ticket.status !== "Closed"
        : ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || ticket.priority === priorityFilter;
    const matchesCategory =
      categoryFilter === "All" || ticket.category === categoryFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      ticket.subject?.toLowerCase().includes(query) ||
      String(ticket.id)?.toLowerCase().includes(query) ||
      ticket.category?.toLowerCase().includes(query) ||
      ticket.description?.toLowerCase().includes(query);

    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  const hasActiveFilters =
    statusFilter !== "All" ||
    priorityFilter !== "All" ||
    categoryFilter !== "All" ||
    searchQuery !== "";

  const clearFilters = () => {
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
    setSearchQuery("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* Dedicated Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Tickets
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Manage your support inquiries, monitor progress, and review resolutions.
            </p>
          </div>

          <Link
            to="/tickets/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Ticket
          </Link>
        </div>

        {/* Quick Status Filter Chips (One-Click Triage) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setStatusFilter("All")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
              statusFilter === "All"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span>All Tickets</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                statusFilter === "All"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Open")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
              statusFilter === "Open"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Open</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                statusFilter === "Open"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {openCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("In Progress")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
              statusFilter === "In Progress"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>In Progress</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                statusFilter === "In Progress"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {inProgressCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Resolved")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
              statusFilter === "Resolved"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Resolved</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                statusFilter === "Resolved"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {resolvedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Closed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
              statusFilter === "Closed"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Archived</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                statusFilter === "Closed"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {closedCount}
            </span>
          </button>
        </div>

        {/* Search & Advanced Filters Control Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by subject, description, ID, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/40 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Filters & View Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Reset
                </button>
              )}

              {/* View Switcher (Table vs Grid) */}
              <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-xl ml-auto sm:ml-0">
                <button
                  onClick={() => setViewMode("table")}
                  title="Table View"
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  title="Card View"
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 text-center text-red-600">
            <p className="font-bold">Error loading tickets</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {hasActiveFilters ? "No tickets match your filters" : "No support tickets found"}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              {hasActiveFilters
                ? "Try clearing some filters or updating your search keyword."
                : "You haven't submitted any tickets yet. Create one whenever you need assistance."}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <Link
                to="/tickets/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Your First Ticket
              </Link>
            )}
          </div>
        ) : viewMode === "grid" ? (
          
          /* Card Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200" title={ticket.id}>
                      #{String(ticket.id).substring(0, 8)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>

                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 block"
                  >
                    {ticket.subject}
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                    {ticket.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <CategoryBadge category={ticket.category} />
                  <div className="flex items-center gap-2">
                    <span>{formatRelativeTime(ticket.created_at)}</span>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-blue-600 hover:text-blue-700 font-bold ml-2"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3 sm:px-4 w-20">ID</th>
                    <th className="py-3 px-3 sm:px-4">Subject</th>
                    <th className="py-3 px-3 sm:px-4">Category</th>
                    <th className="py-3 px-3 sm:px-4">Priority</th>
                    <th className="py-3 px-3 sm:px-4">Status</th>
                    <th className="py-3 px-3 sm:px-4">Created</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title={ticket.id}>
                          #{String(ticket.id).substring(0, 8)}
                        </span>
                      </td>

                      <td className="py-3 px-3 sm:px-4">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[180px] sm:max-w-xs block"
                          title={ticket.subject}
                        >
                          {ticket.subject}
                        </Link>
                      </td>

                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <CategoryBadge category={ticket.category} />
                      </td>

                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <PriorityBadge priority={ticket.priority} />
                      </td>

                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>

                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-xs text-slate-500">
                        {formatDate(ticket.created_at)}
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-semibold rounded-lg transition-colors border border-slate-200 hover:border-blue-200"
                        >
                          <span>View</span>
                          <span>→</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong>{filteredTickets.length}</strong> of <strong>{totalCount}</strong> tickets
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default MyTicketsPage;
