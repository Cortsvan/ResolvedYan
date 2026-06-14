import React, { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { supabase } from "../lib/supabase";
import { fetchWithAuth } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function StaffManagement() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite Form State
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // Use our backend endpoint to securely get the staff list + pending status
      const response = await fetchWithAuth('/staff/list');
      if (response.success) {
        setStaffList(response.staff || []);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, firstName, lastName) => {
    const name = `${firstName || ''} ${lastName || ''}`.trim() || 'this user';
    if (!window.confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(`/staff/${id}`, {
        method: 'DELETE'
      });
      if (response.success) {
        // Refresh list
        fetchStaff();
      }
    } catch (err) {
      alert(err.message || "Failed to remove staff member.");
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetchWithAuth('/invite/staff', {
        method: 'POST',
        body: JSON.stringify({ email, firstName, lastName })
      });

      setMessage(response.message || "Invite sent successfully!");
      setEmail("");
      setFirstName("");
      setLastName("");
      
      // Refresh the staff list after a short delay
      setTimeout(fetchStaff, 1500);
      
    } catch (err) {
      setError(err.message || "Failed to send invite");
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
        <p className="text-slate-500">
          Invite new staff members and view your team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Invite Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.66-1.546 9.974 9.974 0 01-5.023 1.185A9.974 9.974 0 014 19.235z" />
              </svg>
              Invite Staff
            </h2>

            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {message}
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {inviteLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Invite...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Staff List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Current Team</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading team members...</div>
            ) : staffList.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No staff members found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {staffList.map((member) => (
                  <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                        {member.first_name?.charAt(0) || ''}{member.last_name?.charAt(0) || ''}
                        {(!member.first_name && !member.last_name) ? '?' : ''}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{member.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {member.is_pending && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <svg className="mr-1 h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Pending
                        </span>
                      )}
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        member.role === 'admin' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role === 'admin' ? 'Admin' : 'Staff'}
                      </span>

                      {/* Delete / Cancel Button */}
                      {user && user.id !== member.id && (
                        <button
                          onClick={() => handleDelete(member.id, member.first_name, member.last_name)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                          title={member.is_pending ? "Cancel Invite" : "Remove Staff"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StaffManagement;
