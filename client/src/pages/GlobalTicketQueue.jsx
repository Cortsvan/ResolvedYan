import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchWithAuth } from "../lib/api";
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

function GlobalTicketQueue() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState("active"); // "active" | "archive"

  // Filter state
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTickets();

    const subscription = supabase
      .channel('tickets_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, (payload) => {
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
      // 1. Fetch tickets with profile joins
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          profiles:customer_id (first_name, last_name)
        `)
        .neq('category', 'Live Chat')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // 2. Fetch suspended customers from our backend securely
      const customersRes = await fetchWithAuth('/customers/list');
      const suspendedIds = new Set();
      if (customersRes.success) {
        customersRes.customers.forEach(c => {
          if (c.is_suspended) suspendedIds.add(c.id);
        });
      }
      
      // 3. Map the joined data and flag suspended authors
      const formattedData = data.map(t => ({
        ...t,
        customer: t.profiles ? `${t.profiles.first_name || ''} ${t.profiles.last_name || ''}`.trim() : 'Unknown',
        is_suspended: suspendedIds.has(t.customer_id)
      }));

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
      
      // Optimistic update
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

  // Split into active, archive, and suspended
  const activeTickets = tickets.filter((t) => t.status !== "Closed" && !t.is_suspended);
  const archivedTickets = tickets.filter((t) => t.status === "Closed" && !t.is_suspended);
  const suspendedTickets = tickets.filter((t) => t.is_suspended);
  
  const sourceTickets = activeTab === "archive" ? archivedTickets 
                      : activeTab === "suspended" ? suspendedTickets 
                      : activeTickets;

  const filteredTickets = sourceTickets.filter((ticket) => {
    const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === "All" || ticket.category === categoryFilter;
    
    const q = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      ticket.subject?.toLowerCase().includes(q) ||
      ticket.customer?.toLowerCase().includes(q) ||
      ticket.id?.toLowerCase().includes(q);
    
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Global Ticket Queue</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${user?.role === 'admin' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
              {user?.role === 'admin' ? '⚙️ Admin' : '🛡️ Staff'}
            </span>
          </div>
          <p className="text-slate-500">
            Manage and resolve all customer support tickets across the system.
          </p>
        </div>
      </div>

      {/* Active / Archive Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => { setActiveTab("active"); setStatusFilter("All"); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "active"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Active Queue
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
          🗄️ Archive
          {archivedTickets.length > 0 && (
            <span className="ml-2 bg-slate-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {archivedTickets.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("suspended"); setStatusFilter("All"); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "suspended"
              ? "bg-white text-red-600 shadow-sm"
              : "text-slate-500 hover:text-red-500"
          }`}
        >
          ⛔ Suspended Users
          {suspendedTickets.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-2 py-0.5 rounded-full">
              {suspendedTickets.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search input */}
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by subject, customer, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {(statusFilter !== "All" || priorityFilter !== "All" || categoryFilter !== "All" || search !== "") && (
            <button
              onClick={() => {
                setStatusFilter("All");
                setPriorityFilter("All");
                setCategoryFilter("All");
                setSearch("");
              }}
              className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-slate-100 gap-3 bg-slate-50/50">
          <div>
            <h2 className="font-bold text-slate-900">All Tickets</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {filteredTickets.length} tickets shown
            </p>
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading tickets...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error: {error}</div>
          ) : (
            <TicketTable
              tickets={filteredTickets}
              showCustomer={true}
              isAdmin={true}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default GlobalTicketQueue;
