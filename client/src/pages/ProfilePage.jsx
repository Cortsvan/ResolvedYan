import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { fetchWithAuth } from "../lib/api";
import DashboardLayout from "../layouts/DashboardLayout";

function ProfilePage() {
  const { user, refreshUserProfile } = useAuth();

  // Personal Info State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [personalMsg, setPersonalMsg] = useState({ type: "", text: "" });
  const [savingPersonal, setSavingPersonal] = useState(false);
  const fileInputRef = useRef(null);

  // Email State
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState({ type: "", text: "" });
  const [updatingEmail, setUpdatingEmail] = useState(false);

  // Password State
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setAvatarUrl(user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name || user.email}&backgroundColor=2563eb`);
      setEmail(user.email || "");
    }
  }, [user]);

  const handleAvatarUpload = async (event) => {
    try {
      setAvatarMsg({ type: "", text: "" });
      setUploadingAvatar(true);
      setPersonalMsg({ type: "", text: "" });

      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await fetchWithAuth('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ avatar_url: publicUrl }),
      });

      setAvatarUrl(publicUrl);
      await refreshUserProfile();
      setAvatarMsg({ type: "success", text: "Profile picture updated successfully!" });
    } catch (error) {
      console.error("Avatar upload error:", error);
      setAvatarMsg({
        type: "error",
        text: error.message || "Failed to upload picture. Ensure the 'avatars' storage bucket exists.",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdatePersonalInfo = async (e) => {
    e.preventDefault();
    setPersonalMsg({ type: "", text: "" });
    setSavingPersonal(true);

    try {
      await fetchWithAuth('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      });

      await refreshUserProfile();
      setPersonalMsg({ type: "success", text: "Personal details updated successfully." });
    } catch (error) {
      setPersonalMsg({ type: "error", text: error.message || "Failed to update profile." });
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailMsg({ type: "", text: "" });
    setUpdatingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) throw error;

      setEmailMsg({
        type: "success",
        text: "Verification emails sent to both addresses. Please click both links to complete the change.",
      });
    } catch (error) {
      setEmailMsg({ type: "error", text: error.message || "Failed to update email." });
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (!oldPassword) {
      setPasswordMsg({ type: "error", text: "Please enter your current password." });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordMsg({
        type: "error",
        text: "Password must be at least 6 characters and include a letter, a number, and a special character.",
      });
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect.");
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: password });
      if (updateError) throw updateError;

      setPasswordMsg({ type: "success", text: "Password updated successfully!" });
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordMsg({ type: "error", text: error.message || "Failed to update password." });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Manage your personal profile, email settings, and security preferences.
          </p>
        </div>

        {/* 1. Profile Picture & Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900">Profile Photo</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex-shrink-0">
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs z-10">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${firstName || 'User'}&backgroundColor=2563eb`}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${firstName || 'User'}&backgroundColor=2563eb`;
                  }}
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {user?.first_name || user?.name ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() : 'Customer'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                    {user?.role || 'Customer'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {uploadingAvatar ? "Uploading..." : "Change Photo"}
              </button>
            </div>
          </div>

          {avatarMsg.text && (
            <div className={`mt-4 p-3 rounded-xl text-xs font-medium ${avatarMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {avatarMsg.text}
            </div>
          )}
        </div>

        {/* 2. Personal Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">Update your display name across ticket responses and live chat.</p>

          {personalMsg.text && (
            <div className={`mb-6 p-3 rounded-xl text-xs font-medium ${personalMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {personalMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePersonalInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/30 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/30 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={savingPersonal}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60"
              >
                {savingPersonal ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* 3. Email Settings Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900">Email Address</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">Manage the primary email address used for sign-in and notifications.</p>

          {emailMsg.text && (
            <div className={`mb-6 p-3 rounded-xl text-xs font-medium ${emailMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {emailMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateEmail} className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Email</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/30 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={updatingEmail}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60 whitespace-nowrap"
                >
                  {updatingEmail ? "Sending..." : "Update Email"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 4. Security & Password Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900">Change Password</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">Ensure your account uses a secure password with at least 6 characters, numbers, and symbols.</p>

          {passwordMsg.text && (
            <div className={`mb-6 p-3 rounded-xl text-xs font-medium ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/30 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/30 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/30 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updatingPassword}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60"
              >
                {updatingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
