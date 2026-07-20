"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Upload, Users, FileText, AlertCircle } from "lucide-react";
import MediaUploadForm from "@/components/admin/MediaUploadForm";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-accent/10 border border-accent/20 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-accent mb-1">Welcome back, {user?.displayName || "Admin"}!</h1>
          <p className="text-gray-400 text-sm">Here's a quick overview of the ITQAN ecosystem.</p>
        </div>
        <div className="hidden sm:block">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-black font-bold">
            {user?.displayName?.charAt(0) || "A"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl">
          <Upload className="text-secondary mb-4" size={28} />
          <h3 className="text-lg font-bold">Upload Media</h3>
          <p className="text-sm text-gray-400 mt-2">Add new photos, videos, or magazines to the public archive.</p>
        </div>
        
        <div className="glass p-6 rounded-2xl">
          <Users className="text-accent mb-4" size={28} />
          <h3 className="text-lg font-bold">Manage Members</h3>
          <p className="text-sm text-gray-400 mt-2">Approve new ITQAN members and manage roles.</p>
        </div>

        <div className="glass p-6 rounded-2xl">
          <FileText className="text-purple-400 mb-4" size={28} />
          <h3 className="text-lg font-bold">Publish Event</h3>
          <p className="text-sm text-gray-400 mt-2">Draft and publish upcoming events or hackathons.</p>
        </div>

        <div className="glass p-6 rounded-2xl">
          <AlertCircle className="text-orange-400 mb-4" size={28} />
          <h3 className="text-lg font-bold">Audit Logs</h3>
          <p className="text-sm text-gray-400 mt-2">Review recent administrative actions for security.</p>
        </div>
      </div>

      <div className="mt-8">
        <MediaUploadForm />
      </div>

      <div className="glass p-8 rounded-2xl mt-8">
        <h2 className="text-xl font-bold mb-6">Recent Activity (Preview)</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="font-semibold text-sm">Magazine "Tech Trends 2026" Uploaded</p>
              <p className="text-xs text-gray-500">by Super Admin • 2 hours ago</p>
            </div>
            <span className="text-xs bg-accent/20 text-accent px-3 py-1 rounded-full">Media</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="font-semibold text-sm">User Role Updated (IU-2026-042 &gt; Media)</p>
              <p className="text-xs text-gray-500">by Administrator • 5 hours ago</p>
            </div>
            <span className="text-xs bg-orange-400/20 text-orange-400 px-3 py-1 rounded-full">Security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
