"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, Filter, Download, Lock, FileText, UserCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  category: "Security" | "Content" | "Members" | "System";
  action: string;
  details: string;
  ip: string;
  status: "Success" | "Warning" | "Info";
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-101",
    timestamp: "2026-07-30 22:15:02",
    actor: "Sayed Hudaif",
    role: "Administrator",
    category: "Security",
    action: "Admin Login",
    details: "Authenticated into Portal Command Center via Demo Auth Provider",
    ip: "127.0.0.1",
    status: "Success",
  },
  {
    id: "log-102",
    timestamp: "2026-07-30 21:40:18",
    actor: "Sayed Burhan",
    role: "Admin",
    category: "Members",
    action: "Role Assignment",
    details: "Promoted user 'Muhyudheen' to Editor role",
    ip: "192.168.1.45",
    status: "Success",
  },
  {
    id: "log-103",
    timestamp: "2026-07-30 19:10:55",
    actor: "Shahzad",
    role: "Media",
    category: "Content",
    action: "Media Upload",
    details: "Published 'Annual Assembly 2026 Poster' to Media Archive",
    ip: "10.0.4.12",
    status: "Success",
  },
  {
    id: "log-104",
    timestamp: "2026-07-30 18:22:40",
    actor: "System Sentinel",
    role: "System",
    category: "Security",
    action: "Failed Auth Attempt",
    details: "3 consecutive invalid password attempts for user 'test@unknown.com'",
    ip: "45.132.18.99",
    status: "Warning",
  },
  {
    id: "log-105",
    timestamp: "2026-07-30 15:05:10",
    actor: "Zidan",
    role: "Admin",
    category: "Members",
    action: "Member Approved",
    details: "Approved new member registration for 'Ameen' (Science Wing)",
    ip: "192.168.1.50",
    status: "Success",
  },
  {
    id: "log-106",
    timestamp: "2026-07-30 12:00:00",
    actor: "System Backup",
    role: "System",
    category: "System",
    action: "Database Snapshot",
    details: "Automated daily snapshot created successfully",
    ip: "localhost",
    status: "Info",
  },
  {
    id: "log-107",
    timestamp: "2026-07-29 20:45:12",
    actor: "Mirsad",
    role: "Editor",
    category: "Content",
    action: "Event Updated",
    details: "Updated description for 'Global Leadership Summit 2026'",
    ip: "192.168.1.88",
    status: "Success",
  },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const { toast } = useToast();

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery);
    const matchesCategory = categoryFilter === "All" || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const exportAuditLogs = () => {
    const csvHeader = "ID,Timestamp,Actor,Role,Category,Action,Details,IP,Status\n";
    const csvRows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.actor}","${l.role}","${l.category}","${l.action}","${l.details.replace(/"/g, '""')}","${l.ip}","${l.status}"`
      )
      .join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ITQAN_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast("Audit Logs Exported", "Downloaded CSV file.", "success");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Security & Audit Logs
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time immutable activity record of administrator actions, member updates, and system events.
          </p>
        </div>

        <button
          onClick={exportAuditLogs}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <Lock size={14} className="text-primary" /> Security Events
          </div>
          <div className="text-2xl font-black text-white">
            {logs.filter((l) => l.category === "Security").length}
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <UserCheck size={14} className="text-emerald-400" /> Member Actions
          </div>
          <div className="text-2xl font-black text-white">
            {logs.filter((l) => l.category === "Members").length}
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <FileText size={14} className="text-accent" /> Content Modifications
          </div>
          <div className="text-2xl font-black text-white">
            {logs.filter((l) => l.category === "Content").length}
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <AlertTriangle size={14} className="text-amber-400" /> Warnings Flagged
          </div>
          <div className="text-2xl font-black text-white">
            {logs.filter((l) => l.status === "Warning").length}
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Security">Security</option>
            <option value="Members">Members</option>
            <option value="Content">Content</option>
            <option value="System">System</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-gray-400">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Category</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-white block">{log.actor}</span>
                    <span className="text-[10px] text-gray-400">{log.role}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-gray-300">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-primary">{log.action}</td>
                  <td className="p-4 text-gray-300 max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.status === "Success"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : log.status === "Warning"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No audit logs match query &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
