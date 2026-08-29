import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchWithAuth } from "../lib/api";
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

function GlobalTicketQueue() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTickets();

    const subscription = supabase
      .channel('global_tickets_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          profiles:customer_id (first_name, last_name)
        `)
        .neq('category', 'Live Chat')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const customersRes = await fetchWithAuth('/customers/list');
      const customerMap = new Map();
      if (customersRes.success && customersRes.customers) {
        customersRes.customers.forEach(c => {
          customerMap.set(c.id, c);
        });
      }
      
      const formattedData = (data || []).map(t => {
        const customerInfo = customerMap.get(t.customer_id);
        const nameFromProfile = t.profiles ? `${t.profiles.first_name || ''} ${t.profiles.last_name || ''}`.trim() : '';
        const nameFromCustomer = customerInfo ? `${customerInfo.first_name || ''} ${customerInfo.last_name || ''}`.trim() : '';
        const customerName = nameFromProfile || nameFromCustomer || customerInfo?.email || 'Customer';

        return {
          ...t,
          customerName,
          customerEmail: customerInfo?.email || '',
          is_suspended: customerInfo?.is_suspended || false
        };
      });

      setTickets(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await fetchWithAuth(`/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: newStatus }
            : ticket
        )
      );
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Status counts
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === "Open").length;
  const inProgressCount = tickets.filter(t => t.status === "In Progress").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved").length;
  const closedCount = tickets.filter(t => t.status === "Closed").length;

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
      ticket.customerName?.toLowerCase().includes(query) ||
      ticket.category?.toLowerCase().includes(query);

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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Global Ticket Queue
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 flex items-center gap-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Staff & Admin
              </span>
            </div>
            <p className="text-slate-500 text-sm sm:text-base">
              Unified queue of all incoming customer requests, priorities, and triage states.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTickets}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Status Triage Strip */}
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === "All" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}>
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === "Open" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}>
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === "In Progress" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}>
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === "Resolved" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}>
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === "Closed" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}>
              {closedCount}
            </span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by ticket subject, customer, or ID..."
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

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
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
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Global Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-medium">Loading ticket queue...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center text-red-600">
              <p className="font-bold">Error loading queue</p>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No tickets in this view</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                All requests have been addressed or match zero filters.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3 sm:px-4 w-20">ID</th>
                  <th className="py-3 px-3 sm:px-4">Subject</th>
                  <th className="py-3 px-3 sm:px-4">Customer</th>
                  <th className="py-3 px-3 sm:px-4">Category</th>
                  <th className="py-3 px-3 sm:px-4">Priority</th>
                  <th className="py-3 px-3 sm:px-4">Status & Triage</th>
                  <th className="py-3 px-3 sm:px-4">Created</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
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
                        className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[160px] sm:max-w-xs block"
                        title={ticket.subject}
                      >
                        {ticket.subject}
                      </Link>
                    </td>

                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center border border-slate-200 flex-shrink-0">
                          {ticket.customerName.charAt(0)}
                        </div>
                        <div className="max-w-[120px] truncate">
                          <span className="font-medium text-slate-900 text-xs block truncate" title={ticket.customerName}>
                            {ticket.customerName}
                          </span>
                          {ticket.is_suspended && (
                            <span className="text-[10px] text-red-600 font-bold block">Suspended</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <CategoryBadge category={ticket.category} />
                    </td>

                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} />
                    </td>

                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          ticket.status === 'Open'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : ticket.status === 'In Progress'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : ticket.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-xs text-slate-500">
                      {formatDate(ticket.created_at)}
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-semibold rounded-lg transition-colors border border-slate-200 hover:border-blue-200"
                      >
                        <span>Manage</span>
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{filteredTickets.length}</strong> of <strong>{totalCount}</strong> global tickets
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default GlobalTicketQueue;
