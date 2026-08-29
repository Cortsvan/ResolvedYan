import React, { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { fetchWithAuth } from "../lib/api";

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/customers/list');
      if (response.success) {
        setCustomers(response.customers || []);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, id, name) => {
    const actionText = action === 'suspend' ? 'suspend'
      : action === 'reactivate' ? 'reactivate'
        : 'permanently delete';

    if (!window.confirm(`Are you sure you want to ${actionText} ${name || 'this customer'}?`)) {
      return;
    }

    try {
      const endpoint = action === 'delete'
        ? `/customers/${id}`
        : `/customers/${id}/${action}`;

      const response = await fetchWithAuth(endpoint, {
        method: action === 'delete' ? 'DELETE' : 'POST'
      });

      if (response.success) {
        fetchCustomers();
      }
    } catch (err) {
      alert(err.message || `Failed to ${action} customer.`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => !c.is_suspended).length;
  const suspendedCustomers = customers.filter(c => c.is_suspended).length;

  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const id = (c.id || '').toLowerCase();
    return fullName.includes(query) || email.includes(query) || id.includes(query);
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Customer Directory
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 flex items-center gap-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                User Management
              </span>
            </div>
            <p className="text-slate-500 text-sm sm:text-base">
              View customer profiles, monitor ticket activity, and manage account access status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCustomers}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{loading ? "-" : totalCustomers}</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">All customer accounts</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Accounts</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{loading ? "-" : activeCustomers}</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">In good standing</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suspended</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{loading ? "-" : suspendedCustomers}</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Access restricted</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search customers by name, email, or user ID..."
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
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-medium">Loading customer accounts...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {searchQuery ? "No matching customers found" : "No customers registered yet"}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {searchQuery ? "Try searching with a different name or email." : "As new customers sign up, they will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-center">Tickets</th>
                    <th className="py-3.5 px-6">Last Login</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                            {customer.first_name?.charAt(0) || ''}{customer.last_name?.charAt(0) || ''}
                            {(!customer.first_name && !customer.last_name) ? '?' : ''}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {customer.first_name || 'Customer'} {customer.last_name || ''}
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{customer.id.substring(0, 12)}...</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {customer.is_suspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {customer.ticketCount || 0}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500">
                        {formatDate(customer.last_sign_in_at)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {customer.is_suspended ? (
                            <button
                              onClick={() => handleAction('reactivate', customer.id, customer.first_name)}
                              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction('suspend', customer.id, customer.first_name)}
                              className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all"
                            >
                              Suspend
                            </button>
                          )}

                          <button
                            onClick={() => handleAction('delete', customer.id, customer.first_name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Customer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-500">
            Showing <strong>{filteredCustomers.length}</strong> of <strong>{totalCustomers}</strong> customers
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default CustomerManagement;
