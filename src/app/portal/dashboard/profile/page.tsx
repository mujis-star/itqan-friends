"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield, Briefcase, Phone, Globe, Edit3, Check, Camera, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UserProfileData {
  displayName: string;
  email: string;
  role: string;
  wing: string;
  bio: string;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
  avatarUrl: string;
}

export default function ProfilePage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"view" | "edit">("view");

  const [profile, setProfile] = useState<UserProfileData>({
    displayName: user?.displayName || "Sayed Hudaif",
    email: user?.email || "hudaif@itqan.org",
    role: role || "Administrator",
    wing: "Executive Committee",
    bio: "President of ITQAN Union. Dedicated to building an interconnected academic and technology network for students.",
    phone: "+91 98765 43210",
    website: "https://itqan-friends.org",
    linkedin: "https://linkedin.com/in/hudaif",
    github: "https://github.com/hudaif",
    avatarUrl: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("itqan_user_profile");
      if (saved) {
        try {
          setProfile((prev) => ({ ...prev, ...JSON.parse(saved) }));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("itqan_user_profile", JSON.stringify(profile));
    }
    toast("Profile Saved", "Your profile details have been updated.", "success");
    setActiveTab("view");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-card p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Profile Settings
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Member Profile & Account
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            View and customize your public leadership bio, contact details, and wing assignments.
          </p>
        </div>

        {/* View / Edit Mode Toggle Pills */}
        <div className="flex space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-white/10 mt-4 sm:mt-0 relative z-10">
          <button
            onClick={() => setActiveTab("view")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "view"
                ? "bg-primary text-slate-950 shadow-md shadow-primary/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            View Profile
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "edit"
                ? "bg-primary text-slate-950 shadow-md shadow-primary/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Edit3 size={14} /> Edit Profile
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
                Active
              </span>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
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
                  <span className="text-gray-300 truncate">{profile.email}</span>
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

            <div>
              <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Website URL</label>
              <input
                type="text"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Avatar Image URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={profile.avatarUrl}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
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
    </div>
  );
}
