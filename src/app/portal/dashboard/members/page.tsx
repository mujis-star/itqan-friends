"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, ShieldAlert, Trash2, Search, Filter, Info, Plus, Edit2, X, Check } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { useToast } from "@/components/ui/Toast";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  wing?: string;
  createdAt: string | Date;
}

const ROLES = ["Pending", "Member", "Media", "Editor", "Admin", "Administrator", "Super Admin"];

const WINGS = [
  "Executive",
  "Urdu Wing",
  "English Wing",
  "Arabic Wing",
  "Malayalam Wing",
  "Maths Wing",
  "Science Wing",
  "Media Wing",
  "General",
];

// Full 32 ITQAN Union member dataset for demo/fallback mode
const FALLBACK_32_MEMBERS: UserProfile[] = [
  { uid: "m-1", displayName: "Sayed Hudaif", email: "hudaif@itqan.org", role: "Administrator", wing: "Executive", createdAt: "2024-01-15" },
  { uid: "m-2", displayName: "Sayed Burhan", email: "burhan@itqan.org", role: "Admin", wing: "Executive", createdAt: "2024-01-16" },
  { uid: "m-3", displayName: "Zidan", email: "zidan@itqan.org", role: "Admin", wing: "Executive", createdAt: "2024-01-20" },
  { uid: "m-4", displayName: "Muhyudheen", email: "muhyudheen@itqan.org", role: "Editor", wing: "Executive", createdAt: "2024-02-01" },
  { uid: "m-5", displayName: "Mirsad", email: "mirsad@itqan.org", role: "Editor", wing: "Executive", createdAt: "2024-02-05" },
  { uid: "m-6", displayName: "Thanzeeh", email: "thanzeeh@itqan.org", role: "Editor", wing: "Executive", createdAt: "2024-02-10" },
  { uid: "m-7", displayName: "Shahzad", email: "shahzad@itqan.org", role: "Media", wing: "Media Wing", createdAt: "2024-02-15" },
  { uid: "m-8", displayName: "Muhammed V.K", email: "vk.muhammed@itqan.org", role: "Member", wing: "Urdu Wing", createdAt: "2024-03-01" },
  { uid: "m-9", displayName: "Hisham", email: "hisham@itqan.org", role: "Member", wing: "Urdu Wing", createdAt: "2024-03-02" },
  { uid: "m-10", displayName: "Mujeeb", email: "mujeeb@itqan.org", role: "Member", wing: "English Wing", createdAt: "2024-03-05" },
  { uid: "m-11", displayName: "Zameen", email: "zameen@itqan.org", role: "Member", wing: "English Wing", createdAt: "2024-03-08" },
  { uid: "m-12", displayName: "Naseem", email: "naseem@itqan.org", role: "Member", wing: "Arabic Wing", createdAt: "2024-03-12" },
  { uid: "m-13", displayName: "Razeen", email: "razeen@itqan.org", role: "Member", wing: "Arabic Wing", createdAt: "2024-03-15" },
  { uid: "m-14", displayName: "Rabeeh", email: "rabeeh@itqan.org", role: "Member", wing: "Malayalam Wing", createdAt: "2024-03-20" },
  { uid: "m-15", displayName: "Muzzammil", email: "muzzammil@itqan.org", role: "Member", wing: "Malayalam Wing", createdAt: "2024-03-22" },
  { uid: "m-16", displayName: "Muhammed U", email: "muhammed.u@itqan.org", role: "Member", wing: "Maths Wing", createdAt: "2024-04-01" },
  { uid: "m-17", displayName: "Muhammed PP", email: "muhammed.pp@itqan.org", role: "Member", wing: "Maths Wing", createdAt: "2024-04-03" },
  { uid: "m-18", displayName: "Shabeel", email: "shabeel@itqan.org", role: "Member", wing: "Science Wing", createdAt: "2024-04-10" },
  { uid: "m-19", displayName: "Muhaimin", email: "muhaimin@itqan.org", role: "Member", wing: "Science Wing", createdAt: "2024-04-12" },
  { uid: "m-20", displayName: "Muhammed S.M", email: "sm.muhammed@itqan.org", role: "Media", wing: "Media Wing", createdAt: "2024-04-15" },
  { uid: "m-21", displayName: "Faris", email: "faris@itqan.org", role: "Member", wing: "English Wing", createdAt: "2024-05-01" },
  { uid: "m-22", displayName: "Ameen", email: "ameen@itqan.org", role: "Member", wing: "Science Wing", createdAt: "2024-05-03" },
  { uid: "m-23", displayName: "Rashid", email: "rashid@itqan.org", role: "Pending", wing: "Urdu Wing", createdAt: "2024-05-10" },
  { uid: "m-24", displayName: "Suhail", email: "suhail@itqan.org", role: "Pending", wing: "Malayalam Wing", createdAt: "2024-05-12" },
  { uid: "m-25", displayName: "Adnan", email: "adnan@itqan.org", role: "Member", wing: "Maths Wing", createdAt: "2024-05-15" },
  { uid: "m-26", displayName: "Bilal", email: "bilal@itqan.org", role: "Member", wing: "Arabic Wing", createdAt: "2024-05-20" },
  { uid: "m-27", displayName: "Danish", email: "danish@itqan.org", role: "Member", wing: "Media Wing", createdAt: "2024-06-01" },
  { uid: "m-28", displayName: "Eesa", email: "eesa@itqan.org", role: "Member", wing: "Science Wing", createdAt: "2024-06-05" },
  { uid: "m-29", displayName: "Hamza", email: "hamza@itqan.org", role: "Pending", wing: "English Wing", createdAt: "2024-06-10" },
  { uid: "m-30", displayName: "Imran", email: "imran@itqan.org", role: "Member", wing: "Maths Wing", createdAt: "2024-06-15" },
  { uid: "m-31", displayName: "Junaid", email: "junaid@itqan.org", role: "Member", wing: "Malayalam Wing", createdAt: "2024-06-20" },
  { uid: "m-32", displayName: "Khalid", email: "khalid@itqan.org", role: "Member", wing: "Arabic Wing", createdAt: "2024-06-25" },
];

export default function MembersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>(FALLBACK_32_MEMBERS);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [updating, setUpdating] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formWing, setFormWing] = useState("Executive");
  const [formRole, setFormRole] = useState("Member");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!auth?.currentUser) {
      setIsFallback(true);
      setLoading(false);
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("API unconfigured");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
        setIsFallback(false);
      } else {
        setIsFallback(true);
      }
    } catch (err) {
      console.warn("Using fallback ITQAN members directory", err);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: string) => {
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)));
    setUpdating(uid);
    toast("Role Updated", `Member role changed to ${newRole}.`, "success");

    if (auth?.currentUser && !isFallback) {
      try {
        const token = await auth.currentUser.getIdToken();
        await fetch("/api/users", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetUid: uid, newRole }),
        });
      } catch (err) {
        console.error(err);
      }
    }
    setTimeout(() => setUpdating(null), 300);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    const newMember: UserProfile = {
      uid: `m-${Date.now()}`,
      displayName: formName,
      email: formEmail,
      wing: formWing,
      role: formRole,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setUsers((prev) => [newMember, ...prev]);
    setShowAddModal(false);
    setFormName("");
    setFormEmail("");
    toast("Member Created", `${formName} added to directory as ${formRole}.`, "success");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !formName || !formEmail) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.uid === editingMember.uid
          ? { ...u, displayName: formName, email: formEmail, wing: formWing, role: formRole }
          : u
      )
    );
    setEditingMember(null);
    toast("Member Saved", `Updated profile details for ${formName}.`, "success");
  };

  const openEditModal = (member: UserProfile) => {
    setEditingMember(member);
    setFormName(member.displayName);
    setFormEmail(member.email);
    setFormWing(member.wing || "Executive");
    setFormRole(member.role);
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Are you sure you want to remove this member from the directory?")) return;

    setUpdating(uid);
    setUsers((prev) => prev.filter((u) => u.uid !== uid));
    toast("Member Removed", "Member record removed.", "info");

    if (auth?.currentUser && !isFallback) {
      try {
        const token = await auth.currentUser.getIdToken();
        await fetch(`/api/users/${uid}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error(err);
      }
    }
    setUpdating(null);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.wing && u.wing.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Member Directory <span className="text-primary text-xl">({users.length})</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Approve, assign roles, edit details, and manage all registered ITQAN members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormName("");
              setFormEmail("");
              setFormWing("Executive");
              setFormRole("Member");
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20"
          >
            <Plus size={16} /> Add Member
          </button>
        </div>
      </div>

      {/* Search & Role Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search members or wings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-gray-400">
                <th className="p-4">Member</th>
                <th className="p-4">Email</th>
                <th className="p-4">Wing</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Advanced Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {u.displayName?.charAt(0) || <User size={16} />}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{u.displayName}</p>
                        {u.uid === currentUser?.uid && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full inline-block mt-0.5">
                            You (Admin)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300 font-mono text-[11px]">{u.email}</td>
                  <td className="p-4 text-gray-400">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-gray-300">
                      {u.wing || "Executive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                      disabled={updating === u.uid}
                      className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="text-gray-400 hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title="Edit Member Details"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.uid)}
                        disabled={updating === u.uid}
                        className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Remove Member"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No members match search query &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Member */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-md w-full border border-white/15 relative space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-white">Add New ITQAN Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Muhammed Hisham"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. hisham@itqan.org"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Wing</label>
                <select
                  value={formWing}
                  onChange={(e) => setFormWing(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  {WINGS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Assigned Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-slate-950 font-bold rounded-xl hover:opacity-90 transition-opacity mt-2"
              >
                Create Member Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Member */}
      {editingMember && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-md w-full border border-white/15 relative space-y-4">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-white">Edit Member Details</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Wing</label>
                <select
                  value={formWing}
                  onChange={(e) => setFormWing(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  {WINGS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-slate-950 font-bold rounded-xl hover:opacity-90 transition-opacity mt-2"
              >
                Save Member Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
