"use client";

import React, { useState, useEffect } from "react";
import { useAuth, setAccountPassword } from "@/context/AuthContext";
import { User, Trash2, Search, Filter, Plus, Edit2, X, Eye, Camera, KeyRound } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { useToast } from "@/components/ui/Toast";
import { StudentProfileModal, StudentProfileData, getStudentImage, getOfficialAdmissionNo } from "@/components/ui/StudentProfileModal";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  wing?: string;
  admissionNo?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string | Date;
}

const ROLES = ["Pending", "Member", "Media", "Editor", "Administrator", "Super Admin"];

const WINGS = [
  "Executive",
  "Urdu Wing",
  "English Wing",
  "Arabic Wing",
  "Malayalam Wing",
  "Maths Wing",
  "Science Wing",
  "Media Wing",
  "Publishing Bureau",
  "General",
];

// Official 32 ITQAN Union members with official admission numbers provided by user
const FALLBACK_32_MEMBERS: UserProfile[] = [
  { uid: "m-733", displayName: "Sayed Hudaif", email: "hudaif@itqan.org", role: "Super Admin", wing: "Executive", admissionNo: "733", createdAt: "2024-01-15" },
  { uid: "m-725", displayName: "Sayed Burhan", email: "burhan@itqan.org", role: "Administrator", wing: "Executive", admissionNo: "725", createdAt: "2024-01-16" },
  { uid: "m-707", displayName: "Zidan", email: "zidan@itqan.org", role: "Administrator", wing: "Executive", admissionNo: "707", createdAt: "2024-01-20" },
  { uid: "m-742", displayName: "Muhyudheen", email: "muhyudheen@itqan.org", role: "Editor", wing: "Executive", admissionNo: "742", createdAt: "2024-02-01" },
  { uid: "m-717", displayName: "Mirsad", email: "mirsad@itqan.org", role: "Editor", wing: "Executive", admissionNo: "717", createdAt: "2024-02-05" },
  { uid: "m-705", displayName: "Thanzeeh Moosa", email: "thanzeeh@itqan.org", role: "Editor", wing: "Executive", admissionNo: "705", createdAt: "2024-02-10" },
  { uid: "m-714", displayName: "Shahzad", email: "shahzad@itqan.org", role: "Media", wing: "Media Wing", admissionNo: "714", createdAt: "2024-02-15" },
  { uid: "m-695", displayName: "Muhammed V.K", email: "vk.muhammed@itqan.org", role: "Member", wing: "Urdu Wing", admissionNo: "695", createdAt: "2024-03-01" },
  { uid: "m-676", displayName: "Hisham", email: "hisham@itqan.org", role: "Member", wing: "Urdu Wing", admissionNo: "676", createdAt: "2024-03-02" },
  { uid: "m-702", displayName: "Mujeeb Rahman", email: "mujeeb@itqan.org", role: "Member", wing: "English Wing", admissionNo: "702", createdAt: "2024-03-05" },
  { uid: "m-699", displayName: "Zameen", email: "zameen@itqan.org", role: "Member", wing: "English Wing", admissionNo: "699", createdAt: "2024-03-08" },
  { uid: "m-728", displayName: "Naseem", email: "naseem@itqan.org", role: "Member", wing: "Arabic Wing", admissionNo: "728", createdAt: "2024-03-12" },
  { uid: "m-724", displayName: "Razeen", email: "razeen@itqan.org", role: "Member", wing: "Arabic Wing", admissionNo: "724", createdAt: "2024-03-15" },
  { uid: "m-704", displayName: "Rabeeh", email: "rabeeh@itqan.org", role: "Member", wing: "Malayalam Wing", admissionNo: "704", createdAt: "2024-03-20" },
  { uid: "m-716", displayName: "Muzzammil", email: "muzzammil@itqan.org", role: "Member", wing: "Malayalam Wing", admissionNo: "716", createdAt: "2024-03-22" },
  { uid: "m-719", displayName: "Muhammed U", email: "muhammed.u@itqan.org", role: "Member", wing: "Maths Wing", admissionNo: "719", createdAt: "2024-04-01" },
  { uid: "m-723", displayName: "Muhammed PP", email: "muhammed.pp@itqan.org", role: "Member", wing: "Maths Wing", admissionNo: "723", createdAt: "2024-04-03" },
  { uid: "m-718", displayName: "Shabeel", email: "shabeel@itqan.org", role: "Member", wing: "Science Wing", admissionNo: "718", createdAt: "2024-04-10" },
  { uid: "m-697", displayName: "Muhaimin", email: "muhaimin@itqan.org", role: "Member", wing: "Science Wing", admissionNo: "697", createdAt: "2024-04-12" },
  { uid: "m-701", displayName: "Muhammed S.M", email: "sm.muhammed@itqan.org", role: "Media", wing: "Media Wing", admissionNo: "701", createdAt: "2024-04-15" },
  { uid: "m-722", displayName: "Zarhan", email: "zarhan@itqan.org", role: "Member", wing: "Malayalam Wing", admissionNo: "722", createdAt: "2024-05-01" },
  { uid: "m-715", displayName: "Abdu Rahman", email: "abdurahman@itqan.org", role: "Member", wing: "Science Wing", admissionNo: "715", createdAt: "2024-05-03" },
  { uid: "m-720", displayName: "Aslah", email: "aslah@itqan.org", role: "Member", wing: "Arabic Wing", admissionNo: "720", createdAt: "2024-05-20" },
  { uid: "m-696", displayName: "Fuad Habeeb", email: "habeeb@itqan.org", role: "Member", wing: "Media Wing", admissionNo: "696", createdAt: "2024-06-01" },
  { uid: "m-732", displayName: "Fuad M.A", email: "fuad@itqan.org", role: "Member", wing: "English Wing", admissionNo: "732", createdAt: "2024-06-05" },
  { uid: "m-743", displayName: "Nuhman", email: "nuhman@itqan.org", role: "Member", wing: "Malayalam Wing", admissionNo: "743", createdAt: "2024-06-10" },
  { uid: "m-677", displayName: "Minhaj", email: "minhaj@itqan.org", role: "Member", wing: "Publishing Bureau", admissionNo: "677", createdAt: "2024-06-15" },
  { uid: "m-710", displayName: "Rashad", email: "rashad@itqan.org", role: "Member", wing: "Urdu Wing", admissionNo: "710", createdAt: "2024-06-18" },
  { uid: "m-711", displayName: "Razin", email: "razin@itqan.org", role: "Member", wing: "Maths Wing", admissionNo: "711", createdAt: "2024-06-20" },
  { uid: "m-712", displayName: "Fidyan", email: "fidyan@itqan.org", role: "Member", wing: "Malayalam Wing", admissionNo: "712", createdAt: "2024-06-21" },
  { uid: "m-713", displayName: "Salah M.A", email: "salah@itqan.org", role: "Member", wing: "General", admissionNo: "713", createdAt: "2024-06-22" },
  { uid: "m-727", displayName: "Zayin", email: "zayin@itqan.org", role: "Member", wing: "General", admissionNo: "727", createdAt: "2024-06-25" },
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
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileData | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAdmNo, setFormAdmNo] = useState("");
  const [formWing, setFormWing] = useState("Executive");
  const [formRole, setFormRole] = useState("Member");
  const [formBio, setFormBio] = useState("");
  const [formAvatarUrl, setFormAvatarUrl] = useState("");
  const [formPassword, setFormPassword] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("itqan_custom_members");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUsers(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchUsers();
  }, []);

  const saveUsersState = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
    if (typeof window !== "undefined") {
      localStorage.setItem("itqan_custom_members", JSON.stringify(updatedUsers));
    }
  };

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
        saveUsersState(data);
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

  const handleWingChange = (uid: string, newWing: string) => {
    const targetUser = users.find((u) => u.uid === uid);
    const updated = users.map((u) => (u.uid === uid ? { ...u, wing: newWing } : u));
    saveUsersState(updated);
    toast("Wing Reassigned", `${targetUser?.displayName || "Member"} assigned to ${newWing}.`, "success");
  };

  const handleRoleChange = async (uid: string, newRole: string) => {
    const updated = users.map((u) => (u.uid === uid ? { ...u, role: newRole } : u));
    saveUsersState(updated);
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
      admissionNo: formAdmNo || getOfficialAdmissionNo(formName) || `${Math.floor(750 + Math.random() * 50)}`,
      wing: formWing,
      role: formRole,
      bio: formBio,
      avatarUrl: formAvatarUrl,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updated = [newMember, ...users];
    saveUsersState(updated);

    if (formPassword) {
      setAccountPassword(formEmail, formPassword);
    }

    setShowAddModal(false);
    setFormName("");
    setFormEmail("");
    setFormAdmNo("");
    setFormBio("");
    setFormAvatarUrl("");
    setFormPassword("");
    toast("Member Created", `${formName} added to directory as ${formRole}.`, "success");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !formName || !formEmail) return;

    const updated = users.map((u) =>
      u.uid === editingMember.uid
        ? {
            ...u,
            displayName: formName,
            email: formEmail,
            admissionNo: formAdmNo,
            wing: formWing,
            role: formRole,
            bio: formBio,
            avatarUrl: formAvatarUrl,
          }
        : u
    );

    saveUsersState(updated);

    if (formPassword) {
      setAccountPassword(formEmail, formPassword);
      toast("Password Reset", `Password updated for ${formName}.`, "success");
    }

    setEditingMember(null);
    toast("Member Saved", `Updated profile details for ${formName}.`, "success");
  };

  const openEditModal = (member: UserProfile) => {
    setEditingMember(member);
    setFormName(member.displayName);
    setFormEmail(member.email);
    setFormAdmNo(member.admissionNo || getOfficialAdmissionNo(member.displayName));
    setFormWing(member.wing || "Executive");
    setFormRole(member.role);
    setFormBio(member.bio || "");
    setFormAvatarUrl(member.avatarUrl || getStudentImage(member.displayName));
    setFormPassword("");
  };

  const openStudentModal = (member: UserProfile) => {
    setSelectedStudent({
      name: member.displayName,
      role: member.role,
      wing: member.wing || "ITQAN Member",
      admissionNo: member.admissionNo || getOfficialAdmissionNo(member.displayName),
      email: member.email,
      bio: member.bio,
      image: member.avatarUrl || getStudentImage(member.displayName),
    });
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Are you sure you want to remove this member from the directory?")) return;

    setUpdating(uid);
    const updated = users.filter((u) => u.uid !== uid);
    saveUsersState(updated);
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
      (u.admissionNo && u.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
            Approve, assign roles, edit details, custom bios, avatars, and manage account passwords for all 32 members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormName("");
              setFormEmail("");
              setFormAdmNo("");
              setFormWing("Executive");
              setFormRole("Member");
              setFormBio("");
              setFormAvatarUrl("");
              setFormPassword("");
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
            placeholder="Search by name, adm. no (e.g. 702), or wing..."
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
                <th className="p-4">Adm. No</th>
                <th className="p-4">Member</th>
                <th className="p-4">Email</th>
                <th className="p-4">Wing</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Administrator Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredUsers.map((u) => {
                const studentImg = u.avatarUrl || getStudentImage(u.displayName);
                const officialAdmNo = u.admissionNo || getOfficialAdmissionNo(u.displayName) || "700";
                return (
                  <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-[11px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
                        #{officialAdmNo}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => openStudentModal(u)}
                          className="w-10 h-10 rounded-full bg-slate-950 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden cursor-pointer hover:border-primary transition-colors"
                        >
                          {studentImg ? (
                            <img src={studentImg} alt={u.displayName} className="w-full h-full object-cover" />
                          ) : (
                            u.displayName?.charAt(0) || <User size={16} />
                          )}
                        </div>
                        <div>
                          <p
                            onClick={() => openStudentModal(u)}
                            className="font-bold text-white text-xs hover:text-primary transition-colors cursor-pointer"
                          >
                            {u.displayName}
                          </p>
                          {u.uid === currentUser?.uid && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full inline-block mt-0.5">
                              Active Account
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 font-mono text-[11px]">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.wing || "Executive"}
                        onChange={(e) => handleWingChange(u.uid, e.target.value)}
                        className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 outline-none focus:border-primary transition-colors cursor-pointer"
                      >
                        {WINGS.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
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
                          onClick={() => openStudentModal(u)}
                          className="text-gray-400 hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          title="View Full Student Profile Card"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="text-gray-400 hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          title="Complete Administrator Edit Option"
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
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
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
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-md w-full border border-white/15 relative space-y-4 max-h-[90vh] overflow-y-auto">
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
                  placeholder="e.g. Mujeeb Rahman"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Official Admission Number</label>
                <input
                  type="text"
                  value={formAdmNo}
                  onChange={(e) => setFormAdmNo(e.target.value)}
                  placeholder="e.g. 702"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. mujeeb@itqan.org"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-primary font-semibold mb-1 flex items-center gap-1.5">
                  <KeyRound size={13} /> Account Password
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Default: itqan123"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary font-mono"
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

      {/* Modal: Complete Administrator Edit Option for Any Member */}
      {editingMember && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-lg w-full border border-white/15 relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/20 text-primary">
                <Edit2 size={18} />
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-white">Administrator Member Edit</h3>
                <p className="text-[11px] text-gray-400">Complete edit permissions for {editingMember.displayName}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-gray-300 font-semibold mb-1">Official Admission Number</label>
                  <input
                    type="text"
                    value={formAdmNo}
                    onChange={(e) => setFormAdmNo(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary font-mono"
                  />
                </div>
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
                <label className="block text-primary font-semibold mb-1 flex items-center gap-1.5">
                  <KeyRound size={13} /> Reset Member Account Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (or leave blank to keep current)..."
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Bio / Profile Summary</label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Custom student summary..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-primary font-semibold mb-1 flex items-center gap-1.5">
                  <Camera size={13} /> Avatar Image URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. /profiles/Mujeeb.png"
                  value={formAvatarUrl}
                  onChange={(e) => setFormAvatarUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-slate-950 font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Save All Member Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rich Student Portfolio Modal */}
      <StudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
