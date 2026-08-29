import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { fetchWithAuth } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  {
    id: "Technical Support",
    label: "Technical Support",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.07a4.507 4.507 0 002.502-1.045l.934-.934a1.875 1.875 0 00-2.652-2.652l-.934.934a4.507 4.507 0 00-1.045 2.502c.118.58.094 1.193-.07 1.743z" />
      </svg>
    ),
    description: "System bugs, errors, or unexpected behavior",
  },
  {
    id: "Billing",
    label: "Billing & Plans",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 002.25 19.5z" />
      </svg>
    ),
    description: "Invoices, subscription changes, and payment issues",
  },
  {
    id: "Account",
    label: "Account & Access",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    description: "Login problems, profile settings, and permissions",
  },
  {
    id: "Feature Request",
    label: "Feature Request",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    description: "Suggestions, enhancements, and workflow ideas",
  },
  {
    id: "General Inquiry",
    label: "General Inquiry",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
    description: "General questions and assistance from our team",
  },
];

function CreateTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    subject: "",
    category: "Technical Support",
    description: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function handleCategorySelect(categoryId) {
    setFormData((prev) => ({ ...prev, category: categoryId }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Please enter a subject";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Please provide a detailed description";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Please describe your issue in at least 20 characters";
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await fetchWithAuth('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: formData.subject.trim(),
          category: formData.category,
          description: formData.description.trim(),
        }),
      });

      setSubmitted(true);
    } catch (err) {
      const errMessage = err.details
        ? err.details.map((d) => `${d.field}: ${d.message}`).join(', ')
        : err.message || 'Unknown error';
      alert("Failed to submit ticket: " + errMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[65vh]">
          <div className="text-center max-w-lg p-8 sm:p-10 bg-white border border-slate-200 rounded-2xl shadow-sm animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Ticket Submitted Successfully
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Your support ticket has been received. Our AI system will evaluate urgency and route it to the right support agent.
            </p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left mb-8 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Category</span>
                <span className="font-semibold text-slate-700">{formData.category}</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 truncate">
                {formData.subject}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ subject: "", category: "Technical Support", description: "" });
                }}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-sm transition-all"
              >
                Submit Another Ticket
              </button>
              <button
                onClick={() => navigate("/tickets")}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
              >
                View My Tickets →
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tickets" className="hover:text-blue-600 transition-colors">My Tickets</Link>
            <span>/</span>
            <span className="text-slate-700">New Request</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Submit a Support Ticket
              </h1>
              <p className="text-slate-500 text-sm sm:text-base mt-1">
                Describe your issue in detail and our support team will get back to you promptly.
              </p>
            </div>
            <Link
              to="/tickets"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back to Tickets
            </Link>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Form (2 Columns on Large Screens) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-7">
              
              {/* Category Selector Cards */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  1. Select Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/20 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {cat.icon}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold truncate ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
                            {cat.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                            {cat.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                    <span>⚠️</span> {errors.category}
                  </p>
                )}
              </div>

              {/* Subject Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="subject" className="block text-sm font-bold text-slate-800">
                    2. Subject / Title <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400 font-medium">
                    {formData.subject.length}/100
                  </span>
                </div>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  maxLength={100}
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Unable to process invoice #4092 on checkout"
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50/30 text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:bg-white ${
                    errors.subject
                      ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      : "border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                    <span>⚠️</span> {errors.subject}
                  </p>
                )}
              </div>

              {/* Description Textarea */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="description" className="block text-sm font-bold text-slate-800">
                    3. Description <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400 font-medium">
                    {formData.description.length} characters (min 20)
                  </span>
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Please describe the issue in detail. Include any relevant error messages, steps to reproduce, or context that helps us resolve this quickly..."
                  className={`w-full p-4 text-sm border rounded-xl bg-slate-50/30 text-slate-900 placeholder:text-slate-400 transition-all resize-y focus:outline-none focus:bg-white ${
                    errors.description
                      ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      : "border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                    <span>⚠️</span> {errors.description}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Analyzing & Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Support Ticket</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar Helper Information */}
          <div className="space-y-5">
            
            {/* Live Chat Prompt Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Need immediate help?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                If your issue requires real-time support, you can chat with available agents directly.
              </p>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Open Live Chat</span>
                <span>→</span>
              </button>
            </div>

            {/* AI Prioritization Notice Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  AI Prioritization
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Automatic Urgency Analysis
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When you submit, our AI evaluates the severity of your issue to ensure critical blockers are handled first.
              </p>
            </div>

            {/* Tips for Faster Resolution */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Tips for Fast Resolution
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Include specific error codes or message text.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Describe the exact steps you took before the issue occurred.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Select the most relevant category so the right team claims your ticket.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default CreateTicketPage;
