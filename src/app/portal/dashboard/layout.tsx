"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileVideo, Users, ShieldCheck, User, LogOut, ArrowLeft } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, isDemo, logoutDemo } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/portal");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSignOut = () => {
    if (isDemo && logoutDemo) {
      logoutDemo();
      router.push("/portal");
    } else {
      import("@/lib/firebase/config").then(({ auth }) => {
        if (auth) auth.signOut();
        router.push("/portal");
      });
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/portal/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Media & Events", href: "/portal/dashboard/media-events", icon: <FileVideo size={18} /> },
    { name: "Members", href: "/portal/dashboard/members", icon: <Users size={18} /> },
    { name: "Audit Logs", href: "/portal/dashboard/audit-logs", icon: <ShieldCheck size={18} /> },
    { name: "My Profile", href: "/portal/dashboard/profile", icon: <User size={18} /> },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-foreground selection:bg-primary/30">
      {/* Sidebar Navigation */}
      <aside className="w-64 glass-card border-r border-white/10 flex flex-col h-screen sticky top-0 bg-slate-900/90 shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-primary mb-3 transition-colors">
            <ArrowLeft size={14} /> Back to Website
          </Link>
          <h2 className="font-extrabold text-lg text-white tracking-wide">
            ITQAN <span className="text-primary">Command</span>
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Role: <span className="text-primary font-bold">{role || "Administrator"}</span>
          </p>
        </div>

        <nav className="p-3 flex-1 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30 shadow-md shadow-primary/10"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-primary" : "text-gray-400"}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto min-h-screen">{children}</main>
    </div>
  );
}
