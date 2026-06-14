import React from "react";
import Navbar from "../components/Navbar";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">Privacy Policy</h1>
          <p className="text-slate-500 font-medium mb-8">Last updated: June 2026</p>

          <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, submit a support ticket, or use our live chat feature. This may include your name, email address, and any details you share regarding your support request.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p>
              The information we collect is used solely to provide, maintain, and improve our customer support services. This includes resolving your tickets, communicating with you about your account, and ensuring platform security.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Data Sharing and Security</h2>
            <p>
              We do not sell or rent your personal information to third parties. We use industry-standard security measures, including encryption and secure database access, to protect your data from unauthorized access or disclosure.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time. You can manage your profile settings directly through the portal, or contact our support team to request complete data deletion.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or how we handle your data, please submit a support ticket or reach out to our privacy team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
