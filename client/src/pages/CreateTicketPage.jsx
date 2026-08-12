// ============================================================
// src/pages/CreateTicketPage.jsx
// ------------------------------------------------------------
// Route: /tickets/new
// A form page where customers can submit a new support ticket.
//
// KEY CONCEPTS USED HERE:
//   - useState: stores what the user types in the form
//   - Controlled components: form inputs are "controlled" by state
//   - Form validation: we check required fields before submitting
// ============================================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { fetchWithAuth } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "Billing",
  "Technical Support",
  "Account",
  "Feature Request",
  "General Inquiry",
];

function CreateTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // -------------------------------------------------------
  // FORM STATE
  // useState stores the current values of each form field.
  // When a user types in a field, we update the state.
  // This is called a "controlled component" pattern.
  // -------------------------------------------------------
  const [formData, setFormData] = useState({
    subject: "",      // The ticket title/subject
    category: "",     // The selected category (Billing, Technical, etc.)
    description: "",  // The full description of the issue
  });

  // State to track whether the form was submitted successfully
  const [submitted, setSubmitted] = useState(false);

  // State for storing validation error messages
  const [errors, setErrors] = useState({});

  // State for the loading/submitting animation
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -------------------------------------------------------
  // HANDLE INPUT CHANGE
  // This single function handles ALL form inputs.
  // The "name" attribute on each input matches a key in formData.
  // -------------------------------------------------------
  function handleChange(event) {
    // Get the name and value from the input that changed
    const { name, value } = event.target;

    // Update only the field that changed (spread operator "..." keeps others)
    setFormData({ ...formData, [name]: value });

    // Clear the error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  }

  // -------------------------------------------------------
  // VALIDATE FORM
  // Check that required fields are filled in.
  // Returns an error object (empty = no errors)
  // -------------------------------------------------------
  function validateForm() {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Please describe your issue in at least 20 characters";
    }

    return newErrors;
  }

  // -------------------------------------------------------
  // HANDLE FORM SUBMIT
  // Called when the user clicks the Submit button.
  // In a real app, this would send data to your API.
  // For now, we just simulate a delay and show success.
  // -------------------------------------------------------
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
          subject: formData.subject,
          category: formData.category,
          description: formData.description
        })
      });

      setSubmitted(true);
    } catch (err) {
      // Safely handle error which might be a parsed JSON or a generic string
      const errMessage = err.details
        ? err.details.map(d => `${d.field}: ${d.message}`).join(', ')
        : err.message || 'Unknown error';
      alert("Failed to submit ticket: " + errMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  // -------------------------------------------------------
  // SUCCESS STATE
  // If submitted = true, show a success message instead of the form
  // -------------------------------------------------------
  if (submitted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md p-8 flat-card animate-fade-in">
            {/* Success icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Ticket Submitted!
            </h2>
            <p className="text-slate-500 mb-2">
              Your support ticket has been successfully created.
            </p>
            <p className="text-sm text-blue-600 font-medium mb-6 bg-blue-50 px-3 py-2 rounded-lg">
              📌 Subject: "{formData.subject}"
            </p>
            <p className="text-sm text-slate-400 mb-8">
              Our AI system will analyze and prioritize your ticket shortly.
              You'll receive an email confirmation with your ticket ID.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ subject: "", category: "", description: "" });
                }}
                className="btn-secondary px-5 py-2.5 bg-slate-50 hover:bg-slate-100"
              >
                Submit Another
              </button>
              <button
                onClick={() => navigate("/tickets")}
                className="btn-primary px-5 py-2.5 shadow-lg shadow-blue-500/20"
              >
                View My Tickets →
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // -------------------------------------------------------
  // FORM RENDER (shown before submission)
  // -------------------------------------------------------
  return (
    <DashboardLayout>
      <div className="max-w-3xl">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Submit a Support Ticket</h1>
          <p className="text-slate-500 mt-1">
            Describe your issue and our team will help you as soon as possible.
          </p>
        </div>

        {/* The Form card */}
        <div className="flat-card p-6 sm:p-8">

          {/*
            onSubmit calls our handleSubmit function when user clicks submit.
            "noValidate" disables the browser's default validation so we can
            use our custom validation instead.
          */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* ---- SUBJECT FIELD ---- */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Payment was charged but account not upgraded"
                className={`input-field ${errors.subject ? "border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-500" : ""
                  }`}
              />
              {/* Show error message if validation failed */}
              {errors.subject && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors.subject}
                </p>
              )}
            </div>

            {/* ---- CATEGORY DROPDOWN ---- */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`input-field cursor-pointer ${errors.category ? "border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-500" : ""
                  }`}
              >
                {/* Default empty option */}
                <option value="">Select a category...</option>
                {/* Loop through categories from our data file */}
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors.category}
                </p>
              )}
            </div>

            {/* ---- DESCRIPTION TEXTAREA ---- */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you expected to happen..."
                className={`input-field resize-y ${errors.description ? "border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-500" : ""
                  }`}
              />
              {/* Character count helper */}
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <span>⚠️</span> {errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-400">
                  {formData.description.length} characters
                </span>
              </div>
            </div>

            {/* ---- WHAT HAPPENS NEXT INFO BOX ---- */}
            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                📋 What happens after you submit?
              </p>
              <ul className="text-sm text-slate-500 space-y-2">
                <li><span className="font-medium text-slate-700">1.</span> Your ticket will be assigned a unique ID (e.g., TKT-009)</li>
                <li><span className="font-medium text-slate-700">2.</span> AI will automatically classify and prioritize your ticket</li>
                <li><span className="font-medium text-slate-700">3.</span> An agent will be assigned and reach out within 24 hours</li>
                <li><span className="font-medium text-slate-700">4.</span> You'll receive email updates at each stage</li>
              </ul>
            </div>

            {/* ---- SUBMIT BUTTON ---- */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-primary w-full justify-center py-3.5 text-base shadow-lg shadow-blue-500/20 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {/* Show spinner when submitting, otherwise show normal text */}
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting Ticket...
                </span>
              ) : (
                "Submit Support Ticket →"
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateTicketPage;
