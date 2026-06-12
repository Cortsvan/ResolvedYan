import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      setIsSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 18c0-5 4-9 9-9s9 4 9 9" />
              <rect x="2" y="17" width="3.5" height="5" rx="1.75" fill="currentColor" stroke="none"/>
              <rect x="18.5" y="17" width="3.5" height="5" rx="1.75" fill="currentColor" stroke="none"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 21c0 1-1 2-2.5 2" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">TicketPH</span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-black text-slate-900 tracking-tight">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          We'll email you instructions to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">Check your email</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <Link
                to="/login"
                className="w-full flex justify-center py-2.5 px-4 border border-blue-200 rounded-lg shadow-sm text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Return to log in
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
