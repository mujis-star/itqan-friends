"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Upload, Users, FileText, ShieldAlert, Sparkles, Clock, CheckCircle2, Image, Layers, User, Sliders } from "lucide-react";
import MediaUploadForm from "@/components/admin/MediaUploadForm";
import Link from "next/link";

interface ActivityItem {
  id: string;
  title: string;
  actor: string;
  timeAgo: string;
  category: "Media" | "Security" | "Events" | "Members";
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    title: 'Magazine "Tech Trends 2026" Published',
    actor: "Sayed Hudaif",
    timeAgo: "10 minutes ago",
    category: "Media",
  },
  {
    id: "act-2",
    title: "Member Role Updated (IU-2026-042 > Media)",
    actor: "Sayed Burhan",
    timeAgo: "1 hour ago",
    category: "Security",
  },
  {
    id: "act-3",
    title: 'Event "Annual Assembly 2026" Created',
    actor: "Zidan",
    timeAgo: "3 hours ago",
    category: "Events",
  },
];

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  const userRole = role || "Member";
  const isSuperAdmin = userRole === "Super Admin";
  const isAdmin = isSuperAdmin || userRole === "Administrator" || userRole === "Admin";
  const isEditor = isAdmin || userRole === "Editor" || userRole === "Media";

  useEffect(() => {
    // Listen for live activity events dispatched anywhere in the dashboard
    const handleNewActivity = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; category: ActivityItem["category"]; actor?: string }>;
      if (customEvent.detail) {
        const newAct: ActivityItem = {
          id: `act-${Date.now()}`,
          title: customEvent.detail.title,
          actor: customEvent.detail.actor || user?.displayName || "Member",
          timeAgo: "Just now",
          category: customEvent.detail.category || "Media",
        };
        setActivities((prev) => [newAct, ...prev]);
      }
    };

    window.addEventListener("itqan-activity-logged", handleNewActivity);
    return () => window.removeEventListener("itqan-activity-logged", handleNewActivity);
  }, [user]);

  const getCategoryBadgeClass = (cat: ActivityItem["category"]) => {
    switch (cat) {
      case "Media":
        return "bg-primary/20 text-primary border border-primary/30";
      case "Security":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "Events":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
      case "Members":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      default:
        return "bg-white/10 text-gray-300";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-card p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Command Center Active
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.displayName || "Member"}!
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Logged in as <span className="text-primary font-bold">{userRole}</span>. Welcome to your ITQAN portal space.
          </p>
        </div>

        <div className="hidden sm:block shrink-0 relative z-10 mt-4 sm:mt-0">
          <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary font-extrabold text-xl shadow-lg">
            {user?.displayName?.charAt(0) || "M"}
          </div>
        </div>
      </div>

      {/* Role-Based Quick Action Cards */}
      {isSuperAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link href="/portal/dashboard/settings" className="block">
            <div className="glass-card p-5 rounded-2xl border border-amber-500/30 hover:border-amber-400 transition-all group cursor-pointer h-full bg-amber-500/5">
              <Sliders className="text-amber-400 mb-3 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Site Customizer
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Super Admin exclusive: themes, title, & announcement banner.
              </p>
            </div>
          </Link>

          <Link href="#upload-section" className="block">
            <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-primary/40 transition-all group cursor-pointer h-full">
              <Upload className="text-primary mb-3 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                Upload Media
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Add new photos, videos, or magazines.
              </p>
            </div>
          </Link>

          <Link href="/portal/dashboard/members" className="block">
            <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-accent/40 transition-all group cursor-pointer h-full">
              <Users className="text-accent mb-3 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-sm font-bold text-white group-hover:text-accent transition-colors">
                Manage Members
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Approve 32 members, roles, & details.
              </p>
            </div>
          </Link>

          <Link href="/portal/dashboard/wings" className="block">
            <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-purple-400/40 transition-all group cursor-pointer h-full">
              <Layers className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Manage Wings
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Edit 12 wing chairmen & conveners.
              </p>
            </div>
          </Link>

          <Link href="/portal/dashboard/audit-logs" className="block">
            <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all group cursor-pointer h-full">
              <ShieldAlert className="text-amber-400 mb-3 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Audit Logs
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Security actions & CSV exports.
              </p>
            </div>
          </Link>
        </div>
      ) : isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="#upload-section" className="block">
            <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary/40 transition-all group cursor-pointer h-full">
              <Upload className="text-primary mb-3 group-hover:scale-110 transition-transform" size={26} />
              <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">
                Upload Media
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Add new photos, videos, or magazines to the archive.
              </p>
            </div>
          </Link>

          <Link href="/portal/dashboard/members" className="block">
            <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-accent/40 transition-all group cursor-pointer h-full">
              <Users className="text-accent mb-3 group-hover:scale-110 transition-transform" size={26} />
              <h3 className="text-base font-bold text-white group-hover:text-accent transition-colors">
                Manage Members
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Approve 32 members, edit details, and assign roles.
              </p>
            </div>
          </Link>

          <Link href="/portal/dashboard/wings" className="block">
            <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-purple-400/40 transition-all group cursor-pointer h-full">
              <Layers className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={26} />
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                Manage Wings
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Edit 12 wing chairmen and conveners.
              </p>
            </div>
          </Link>

          <Link href="/portal/dashboard/audit-logs" className="block">
            <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all group cursor-pointer h-full">
              <ShieldAlert className="text-amber-400 mb-3 group-hover:scale-110 transition-transform" size={26} />
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                Audit Logs
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Review administrative security actions and CSV exports.
              </p>
            </div>
          </Link>
        </div>
      ) : isEditor ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="#upload-section" className="block">
            <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary/40 transition-all group cursor-pointer h-full">
              <Upload className="text-primary mb-3 group-hover:scale-110 transition-transform" size={26} />
              <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">
                Upload Media
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Add new photos, videos, or magazines to the archive.
              </p>
            </div>
          </Link>

          <Link href="/portal/dashboard/media-events" className="block">
            <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-purple-400/40 transition-all group cursor-pointer h-full">
              <FileText className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={26} />
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                Publish Event
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Draft and publish upcoming events or summits.
              </p>
            </div>
          </Link>

          <Link href="/portal/dashboard/profile" className="block">
            <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-emerald-400/40 transition-all group cursor-pointer h-full">
              <User className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" size={26} />
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                My Profile
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Edit personal bio, avatar photo, and password security.
              </p>
            </div>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/media" className="block">
            <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary/40 transition-all group cursor-pointer h-full">
              <Image className="text-primary mb-3 group-hover:scale-110 transition-transform" size={26} />
              <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">
                View Media Archive
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Browse official magazines, photo galleries, and publications.
              </p>
            </div>
          </Link>

          <Link href="/#wings" className="block">
            <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-accent/40 transition-all group cursor-pointer h-full">
              <Layers className="text-accent mb-3 group-hover:scale-110 transition-transform" size={26} />
              <h3 className="text-base font-bold text-white group-hover:text-accent transition-colors">
                Explore Wings
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                View all 12 specialized wings, chairmen, and conveners.
              </p>
            </div>
          </Link>

          <Link href="/portal/dashboard/profile" className="block">
            <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-emerald-400/40 transition-all group cursor-pointer h-full">
              <User className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" size={26} />
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                My Profile
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Customize your leadership bio, avatar photo, and account password.
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Upload Media Form (Editors & Admins Only) */}
      {isEditor && (
        <div id="upload-section" className="scroll-mt-24">
          <MediaUploadForm />
        </div>
      )}

      {/* Live Synced Recent Activity Feed */}
      <div className="glass-card p-8 rounded-3xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Recent Activity Feed
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Live updates synced across administrator actions and media uploads.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <CheckCircle2 size={14} /> Live Synced ({activities.length})
          </span>
        </div>

        <div className="space-y-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between p-4 bg-slate-950/60 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="space-y-0.5">
                <p className="font-bold text-xs text-white">{act.title}</p>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span>by {act.actor}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {act.timeAgo}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${getCategoryBadgeClass(
                  act.category
                )}`}
              >
                {act.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
