"use client";

import React, { useState, useEffect } from "react";
import { useAuth, getAccountPassword, setAccountPassword } from "@/context/AuthContext";
import { Mail, Phone, Globe, Edit3, Check, Camera, Sparkles, Tag, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UserProfileData {
  displayName: string;
  email: string;
  admissionNo: string;
  role: string;
  wing: string;
  bio: string;
  phone: string;
  website: string;
  avatarUrl: string;
}

export default function ProfilePage() {
  const { user, role, updateCurrentUserProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"view" | "edit" | "security">("view");

  const [profile, setProfile] = useState<UserProfileData>({
    displayName: user?.displayName || "Mujeeb Rahman",
    email: user?.email || "mujeeb@itqan.org",
    admissionNo: (user as any)?.admissionNo || "702",
    role: role || "Member",
    wing: (user as any)?.wing || "English Wing",
    bio: "Official Member leading the English Wing activities and academic initiatives within ITQAN Union.",
    phone: "+91 98765 43210",
    website: "https://itqan-friends.org",
    avatarUrl: (user as any)?.avatarUrl || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Password change state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`itqan_profile_${user?.email || "default"}`);
      if (saved) {
        try {
          setProfile((prev) => ({ ...prev, ...JSON.parse(saved) }));
        } catch (e) {
          console.error(e);
        }
      } else if (user) {
        setProfile((prev) => ({
          ...prev,
          displayName: user.displayName || prev.displayName,
          email: user.email || prev.email,
          admissionNo: (user as any).admissionNo || prev.admissionNo,
          wing: (user as any).wing || prev.wing,
          role: role || prev.role,
        }));
      }
    }
  }, [user, role]);

  const handleAvatarFileSelect = async (file: File) => {
    setAvatarFile(file);
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.readAsDataURL(file);
    });
    setProfile((prev) => ({ ...prev, avatarUrl: dataUrl }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem(`itqan_profile_${profile.email}`, JSON.stringify(profile));
    }

    if (updateCurrentUserProfile) {
      updateCurrentUserProfile({
        displayName: profile.displayName,
        email: profile.email,
        role: profile.role,
        wing: profile.wing,
        admissionNo: profile.admissionNo,
        avatarUrl: profile.avatarUrl,
      });
    }

    toast("Profile Saved", "Your profile details have been updated.", "success");
    setActiveTab("view");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");

    const actualPass = getAccountPassword(profile.email);
    if (currentPass !== actualPass) {
      setPassError("Incorrect current password. (Default is 'itqan123')");
      return;
    }

    if (newPass.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }

    if (newPass !== confirmPass) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    setAccountPassword(profile.email, newPass);
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    toast("Password Changed", "Your account password has been successfully updated.", "success");
    setActiveTab("view");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-card p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Profile & Security Settings
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Account & Password Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your personal profile bio, avatar image, and account password security.
          </p>
        </div>

        {/* View / Edit / Password Mode Toggle Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-white/10 mt-4 sm:mt-0 relative z-10">
          <button
            onClick={() => setActiveTab("view")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "view"
                ? "bg-primary text-slate-950 shadow-md shadow-primary/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            View Profile
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "edit"
                ? "bg-primary text-slate-950 shadow-md shadow-primary/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Edit3 size={14} /> Edit Details
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "security"
                ? "bg-primary text-slate-950 shadow-md shadow-primary/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <KeyRound size={14} /> Security
          </button>
        </div>
      </div>

      {/* VIEW PROFILE MODE */}
      {activeTab === "view" && (
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl bg-slate-900 border-2 border-primary/40 flex items-center justify-center text-primary font-extrabold text-4xl shadow-xl overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  profile.displayName.charAt(0) || "U"
                )}
              </div>
              <span className="absolute -bottom-2 -right-2 px-3 py-1 bg-primary text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                Protected
              </span>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-primary font-mono text-[11px] font-bold tracking-wider mb-1">
                  <Tag size={12} /> Adm. No: #{profile.admissionNo}
                </div>
                <h2 className="text-2xl font-bold text-white">{profile.displayName}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                  <span className="px-3 py-1 bg-primary/20 border border-primary/30 text-primary text-xs font-bold rounded-full">
                    {profile.role}
                  </span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold rounded-full">
                    {profile.wing}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed max-w-xl bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                {profile.bio || "No bio provided."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <Mail size={16} className="text-primary shrink-0" />
                  <span className="text-gray-300 font-mono text-[11px] truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <Phone size={16} className="text-accent shrink-0" />
                  <span className="text-gray-300">{profile.phone || "Not specified"}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <Globe size={16} className="text-purple-400 shrink-0" />
                    <a href={profile.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODE */}
      {activeTab === "edit" && (
        <form onSubmit={handleSaveProfile} className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-xl font-bold text-white mb-4">Update Profile Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Official Admission No</label>
              <input
                type="text"
                value={profile.admissionNo}
                onChange={(e) => setProfile({ ...profile, admissionNo: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Wing Assignment</label>
              <input
                type="text"
                value={profile.wing}
                onChange={(e) => setProfile({ ...profile, wing: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Website URL</label>
              <input
                type="text"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Bio / Summary</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Briefly describe your role and contributions..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-primary font-semibold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Camera size={14} /> Profile Picture (Upload Image File or URL)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAvatarFileSelect(f);
                  }}
                  className="text-xs text-gray-400 cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="Or paste image URL (e.g. /profiles/Mujeeb.png)..."
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("view")}
              className="px-6 py-3 rounded-xl bg-white/5 text-gray-300 hover:text-white font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Check size={16} /> Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* SECURITY & PASSWORD CHANGE MODE */}
      {activeTab === "security" && (
        <form onSubmit={handleChangePassword} className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/20 text-primary">
              <Lock size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Change Account Password</h2>
              <p className="text-xs text-gray-400">
                Update the login password for <span className="text-primary font-mono">{profile.email}</span>.
              </p>
            </div>
          </div>

          {passError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
              {passError}
            </div>
          )}

          <div className="space-y-4 text-xs max-w-lg">
            <div>
              <label className="block text-gray-300 font-semibold mb-1 uppercase tracking-wider">Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Enter current password (default: itqan123)"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="block text-primary font-semibold mb-1 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter new password (min. 6 characters)..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm new password..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-gray-400 text-xs flex items-start gap-3">
            <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
            <p>
              Changing your password updates your credentials across the ITQAN Portal. Make sure to remember your new password for future sign-ins.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("view")}
              className="px-6 py-3 rounded-xl bg-white/5 text-gray-300 hover:text-white font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Check size={16} /> Update Password Now
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
