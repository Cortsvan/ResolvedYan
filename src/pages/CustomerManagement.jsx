import React, { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { fetchWithAuth } from "../lib/api";

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
          <p className="text-slate-500">
            View, suspend, or manage your registered customers.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No Customers Yet</h3>
            <p>Once users sign up, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Tickets</th>
                  <th className="px-6 py-4">Last Login</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                          {customer.first_name?.charAt(0) || ''}{customer.last_name?.charAt(0) || ''}
                          {(!customer.first_name && !customer.last_name) ? '?' : ''}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {customer.first_name || 'Unknown'} {customer.last_name || ''}
                          </p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{customer.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {customer.is_suspended ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {customer.ticketCount || 0}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(customer.last_sign_in_at)}
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {customer.is_suspended ? (
                          <button
                            onClick={() => handleAction('reactivate', customer.id, customer.first_name)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Reactivate Customer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction('suspend', customer.id, customer.first_name)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Suspend Customer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        )}
                        
                        <div className="w-px h-5 bg-slate-200 mx-1"></div>
                        
                        <button
                          onClick={() => handleAction('delete', customer.id, customer.first_name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Customer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
      </div>
    </DashboardLayout>
  );
}

export default CustomerManagement;
