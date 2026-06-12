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
import { supabase } from "../lib/supabase";
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
      const { error } = await supabase.from('tickets').insert([{
        subject: formData.subject,
        category: formData.category,
        description: formData.description,
        status: 'Open',
        priority: 'Medium', // Default priority, AI could change this later
        customer_id: user.id
      }]);

      if (error) throw error;
      
      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit ticket: " + err.message);
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
          <div className="text-center max-w-md p-8 bg-white rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
            {/* Success icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ticket Submitted!
            </h2>
            <p className="text-gray-500 mb-2">
              Your support ticket has been successfully created.
            </p>
            <p className="text-sm text-indigo-600 font-medium mb-6 bg-indigo-50 px-3 py-2 rounded-lg">
              📌 Subject: "{formData.subject}"
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Our AI system will analyze and categorize your ticket shortly.
              You'll receive an email confirmation with your ticket ID.
            </p>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ subject: "", category: "", description: "" });
                }}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Submit Another
              </button>
              <button
                onClick={() => navigate("/tickets")}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors"
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
          <h1 className="text-2xl font-bold text-gray-900">Submit a Support Ticket</h1>
          <p className="text-gray-500 mt-1">
            Describe your issue and our team will help you as soon as possible.
          </p>
        </div>

        {/* AI note banner */}
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-sm font-semibold text-indigo-700">AI-Enhanced Processing</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              In future versions, AI will automatically classify your ticket,
              assign priority, and route it to the right agent.
            </p>
          </div>
        </div>

        {/* The Form card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          
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
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"              // Must match the key in formData
                value={formData.subject}    // Controlled: value comes from state
                onChange={handleChange}     // Update state when user types
                placeholder="e.g., Payment was charged but account not upgraded"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.subject
                    ? "border-red-400 bg-red-50 focus:ring-red-300"  // Error state
                    : "border-gray-200 focus:ring-indigo-300"         // Normal state
                } focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all`}
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
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.category
                    ? "border-red-400 bg-red-50 focus:ring-red-300"
                    : "border-gray-200 focus:ring-indigo-300"
                } focus:outline-none focus:ring-2 focus:border-transparent text-sm bg-white transition-all cursor-pointer`}
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
                className="block text-sm font-semibold text-gray-700 mb-1.5"
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
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.description
                    ? "border-red-400 bg-red-50 focus:ring-red-300"
                    : "border-gray-200 focus:ring-indigo-300"
                } focus:outline-none focus:ring-2 focus:border-transparent text-sm resize-y transition-all`}
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
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                📋 What happens after you submit?
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>1. Your ticket will be assigned a unique ID (e.g., TKT-009)</li>
                <li>2. AI will automatically classify and prioritize your ticket</li>
                <li>3. An agent will be assigned and reach out within 24 hours</li>
                <li>4. You'll receive email updates at each stage</li>
              </ul>
            </div>

            {/* ---- SUBMIT BUTTON ---- */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed text-white"  // Disabled state
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5"
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
