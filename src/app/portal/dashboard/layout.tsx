"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/portal");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Basic RBAC guard: Only allow elevated roles to see the dashboard layout at all
  if (role === "Member") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Access Denied</h1>
        <p className="text-gray-400 mb-6">
          Your account does not have permission to access the Command Center.
        </p>
        <button onClick={() => router.push("/")} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 glass border-r border-white/5 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-bold text-xl text-accent">Command Center</h2>
          <p className="text-xs text-gray-500 mt-1">Logged in as {role}</p>
        </div>
        <nav className="p-4 flex-1 space-y-2">
          <a href="/portal/dashboard" className="block px-4 py-3 rounded-xl bg-white/10 text-white font-medium">Dashboard</a>
          <a href="#" className="block px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">Media & Events</a>
          <a href="/portal/dashboard/members" className="block px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">Members</a>
          <a href="#" className="block px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">Audit Logs</a>
          
          <button 
            onClick={() => {
              import("@/lib/firebase/config").then(({ auth }) => {
                auth.signOut();
              });
            }}
            className="w-full text-left block px-4 py-3 mt-8 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
