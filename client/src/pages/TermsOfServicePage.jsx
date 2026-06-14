import React from "react";
import Navbar from "../components/Navbar";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">Terms of Service</h1>
          <p className="text-slate-500 font-medium mb-8">Last updated: June 2026</p>

          <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the ResolvedYan customer support portal, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Description of Service</h2>
            <p>
              ResolvedYan provides a platform for customers to submit support tickets, track issues, and communicate with support staff via live chat. We reserve the right to modify or discontinue the service at any time without notice.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. User Conduct</h2>
            <p>
              You agree to use the service only for lawful purposes. You are prohibited from posting or transmitting any material that is abusive, harassing, defamatory, fraudulent, or otherwise objectionable.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Account Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account login information and are fully responsible for all activities that occur under your account. You agree to immediately notify us of any unauthorized use, or suspected unauthorized use of your account.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Limitation of Liability</h2>
            <p>
              ResolvedYan shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
