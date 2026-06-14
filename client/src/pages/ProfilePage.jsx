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
  const fileInputRef = useRef(null);

  // Email State
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState({ type: "", text: "" });

  // Password State
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [avatarMsg, setAvatarMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setAvatarUrl(user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name || user.email}&backgroundColor=2563eb`);
      setEmail(user.email || "");
    }
  }, [user]);

  // --- Handlers ---

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

      // 1. Upload to Supabase Storage 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profiles Table via Backend API
      await fetchWithAuth('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ avatar_url: publicUrl })
      });

      setAvatarUrl(publicUrl);
      await refreshUserProfile();
      setAvatarMsg({ type: "success", text: "Profile picture updated!" });

    } catch (error) {
      console.error("Avatar upload error:", error);
      setAvatarMsg({ type: "error", text: error.message || "Failed to upload picture. Ensure the 'avatars' storage bucket exists and is public." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdatePersonalInfo = async (e) => {
    e.preventDefault();
    setPersonalMsg({ type: "", text: "" });

    try {
      await fetchWithAuth('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        })
      });

      await refreshUserProfile();
      setPersonalMsg({ type: "success", text: "Personal information updated successfully!" });
    } catch (error) {
      setPersonalMsg({ type: "error", text: error.message || "Failed to update profile." });
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailMsg({ type: "", text: "" });

    try {
      const { error } = await supabase.auth.updateUser({ email: email });
      if (error) throw error;

      setEmailMsg({ type: "success", text: "Verification links have been sent to your old and new email addresses. Please click both to confirm the change." });
    } catch (error) {
      setEmailMsg({ type: "error", text: error.message || "Failed to update email." });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (!oldPassword) {
      setPasswordMsg({ type: "error", text: "Please enter your old password." });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters and include a letter, a number, and a special character." });
      return;
    }

    try {
      // Verify old password by attempting a sign-in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) {
        throw new Error("Incorrect old password.");
      }

      // If successful, update to the new password
      const { error: updateError } = await supabase.auth.updateUser({ password: password });
      if (updateError) throw updateError;

      setPasswordMsg({ type: "success", text: "Password updated successfully!" });
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordMsg({ type: "error", text: error.message || "Failed to update password." });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your profile information and account security.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Avatar Section */}
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex-shrink-0">
                {uploadingAvatar ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : null}
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
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  Change Picture
                </button>
                <p className="mt-2 text-xs text-slate-500">JPG, GIF or PNG. 1MB max.</p>
                {avatarMsg.text && (
                  <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium ${avatarMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {avatarMsg.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Info Section */}
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>

            {personalMsg.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${personalMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {personalMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdatePersonalInfo} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-slate-300 px-3 py-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-slate-300 px-3 py-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Email Section */}
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Email Address</h2>
            <p className="text-sm text-slate-500 mb-4">Update the email address associated with your account.</p>

            {emailMsg.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${emailMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {emailMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="max-w-md">
              <div className="flex gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 px-3 py-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
                >
                  Update Email
                </button>
              </div>
            </form>
          </div>

          {/* Password Section */}
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Change Password</h2>
            <p className="text-sm text-slate-500 mb-4">Ensure your account is using a long, random password to stay secure.</p>

            {passwordMsg.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Old Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-slate-300 px-3 py-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-slate-300 px-3 py-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-slate-300 px-3 py-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
