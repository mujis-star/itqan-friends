"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Users, Plus, Edit2, Trash2, X, Check, RefreshCw, Camera, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getStudentImage } from "@/components/ui/StudentProfileModal";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  desc: string;
  icon: string;
  image?: string;
  about?: string;
  responsibilities?: string[];
}

const OFFICIAL_32_NAMES = [
  "Sayed Hudaif",
  "Sayed Burhan",
  "Zidan",
  "Muhyudheen",
  "Mirsad",
  "Thanzeeh Moosa",
  "Shahzad",
  "Muhammed V.K",
  "Hisham",
  "Minhaj",
  "Habeeb",
  "Muhaimin",
  "Zameen",
  "Muhammed S.M",
  "Mujeeb Rahman",
  "Rabeeh",
  "Rashad",
  "Razin",
  "Fidyan V",
  "Salah M.A",
  "Abdu Rahman",
  "Muzzammil",
  "Shabeel",
  "Muhammed U",
  "Aslah",
  "Zarhan",
  "Muhammed P.P",
  "Razeen",
  "Zayin",
  "Naseem",
  "Fuad M.A",
  "Nuhman",
];

const DEFAULT_CORE_MEMBERS: TeamMember[] = [
  {
    id: "tm-president",
    name: "Sayed Hudaif",
    role: "President",
    desc: "Leads strategic planning and represents the union externally.",
    icon: "fa-crown",
    image: "/profiles/Hudaif.png",
    about: "Sayed Hudaif is a visionary leader with a passion for student welfare and community building.",
  },
  {
    id: "tm-vice-president",
    name: "Sayed Burhan",
    role: "Vice President",
    desc: "Supports the President and oversees operations.",
    icon: "fa-shield-alt",
    image: "/profiles/Sayyid-Burhan.png",
    about: "Sayed Burhan acts as the strong operational backbone of the committee.",
  },
  {
    id: "tm-secretary",
    name: "Zidan",
    role: "Secretary",
    desc: "Manages official records and documentation.",
    icon: "fa-pen-alt",
    image: "/profiles/Zidan.png",
    about: "Zidan is the organizational powerhouse behind ITQAN.",
  },
  {
    id: "tm-joint-secretary",
    name: "Muhyudheen",
    role: "Joint Secretary",
    desc: "Administrative support and portfolio management.",
    icon: "fa-cog",
    image: "/profiles/Muhyudheen.png",
    about: "Providing crucial administrative support and maintaining workflow standards.",
  },
  {
    id: "tm-treasurer",
    name: "Mirsad",
    role: "Treasurer",
    desc: "Manages financial assets and budgets.",
    icon: "fa-coins",
    image: "/profiles/Mirsad.png",
    about: "Mirsad brings financial discipline and transparency to ITQAN.",
  },
  {
    id: "tm-financial-manager",
    name: "Thanzeeh Moosa",
    role: "Financial Manager",
    desc: "Oversees financial operations and compliance.",
    icon: "fa-chart-bar",
    image: "/profiles/Thanzeeh.png",
    about: "Conducts financial compliance checks and monitors expenditure.",
  },
  {
    id: "tm-pro",
    name: "Shahzad",
    role: "P.R.O",
    desc: "External communications and media relations.",
    icon: "fa-bullhorn",
    image: "/profiles/Shahzad.png",
    about: "Shahzad manages public relations and crafts compelling union narratives.",
  },
];

export default function ManageTeamPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_CORE_MEMBERS);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [replacingMember, setReplacingMember] = useState<TeamMember | null>(null);
  const [replacementName, setReplacementName] = useState("");

  // Form states
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formIcon, setFormIcon] = useState("fa-crown");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("itqan_custom_team") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if data is corrupted (e.g. all 7 members have the same name)
          const uniqueNames = new Set(parsed.map((m: any) => m.name));
          if (uniqueNames.size > 1) {
            // Attach unique ID if missing
            const sanitized = parsed.map((m: any, idx: number) => ({
              ...m,
              id: m.id || `tm-seat-${idx}-${m.role.toLowerCase().replace(/\s+/g, "-")}`,
            }));
            setMembers(sanitized);
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Default load
    setMembers(DEFAULT_CORE_MEMBERS);
  }, []);

  const saveTeamState = (updated: TeamMember[]) => {
    setMembers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("itqan_custom_team", JSON.stringify(updated));
    }
  };

  const handleRestoreDefaultBoard = () => {
    if (!confirm("Are you sure you want to restore the default Executive Board seats?")) return;
    saveTeamState(DEFAULT_CORE_MEMBERS);
    toast("Executive Board Restored", "Restored default 7 executive board seats.", "info");
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formRole) return;

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: formName,
      role: formRole,
      desc: formDesc || `${formRole} of ITQAN Executive Board.`,
      icon: formIcon,
      image: formImage || getStudentImage(formName),
      about: formBio || `${formName} is an active member of the ITQAN leadership committee.`,
    };

    const updated = [...members, newMember];
    saveTeamState(updated);
    setShowAddModal(false);
    resetForm();
    toast("Team Member Added", `${formName} added to Executive Board as ${formRole}.`, "success");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !formName || !formRole) return;

    const updated = members.map((m) =>
      m.id === editingMember.id
        ? {
            ...m,
            name: formName,
            role: formRole,
            desc: formDesc,
            about: formBio,
            image: formImage || getStudentImage(formName),
            icon: formIcon,
          }
        : m
    );

    saveTeamState(updated);
    setEditingMember(null);
    resetForm();
    toast("Executive Member Saved", `Updated details for ${formName}.`, "success");
  };

  const handleConfirmReplace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingMember || !replacementName) return;

    // STRICT MATCHING BY MEMBER ID or ROLE (prevents replacing all cards)
    const updated = members.map((m) =>
      m.id === replacingMember.id || m.role === replacingMember.role
        ? {
            ...m,
            name: replacementName,
            image: getStudentImage(replacementName),
            about: `${replacementName} holds the executive position of ${m.role} in ITQAN.`,
          }
        : m
    );

    saveTeamState(updated);
    toast("Leader Replaced", `Replaced ${replacingMember.name} with ${replacementName} as ${replacingMember.role}.`, "success");
    setReplacingMember(null);
    setReplacementName("");
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormDesc(member.desc || "");
    setFormBio(member.about || "");
    setFormImage(member.image || getStudentImage(member.name));
    setFormIcon(member.icon || "fa-crown");
  };

  const openReplaceModal = (member: TeamMember) => {
    setReplacingMember(member);
    setReplacementName(OFFICIAL_32_NAMES[0]);
  };

  const handleDeleteMember = (member: TeamMember) => {
    if (!confirm(`Are you sure you want to remove ${member.name} (${member.role}) from the Executive Committee?`)) return;

    const updated = members.filter((m) => m.id !== member.id);
    saveTeamState(updated);
    toast("Executive Member Removed", `${member.name} removed from committee.`, "info");
  };

  const resetForm = () => {
    setFormName("");
    setFormRole("");
    setFormDesc("");
    setFormBio("");
    setFormImage("");
    setFormIcon("fa-crown");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-card p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-2">
            <Users size={14} /> Executive Leadership Management
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Manage & Replace Executive Team ({members.length})
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Replace individual executive board seats, edit biographies, and photos across all ITQAN members.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 sm:mt-0 relative z-10">
          <button
            onClick={handleRestoreDefaultBoard}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            title="Restore Default Executive Board"
          >
            <RotateCcw size={14} /> Reset Board
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20"
          >
            <Plus size={16} /> Add Executive Member
          </button>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member, idx) => {
          const imgSrc = member.image || getStudentImage(member.name);
          return (
            <div
              key={member.id || idx}
              className="glass-card p-6 rounded-3xl border border-white/10 hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-full bg-slate-950 border-2 border-primary/40 overflow-hidden flex items-center justify-center text-primary font-bold text-lg">
                  {imgSrc ? (
                    <img src={imgSrc} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openReplaceModal(member)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Replace Executive Leader"
                  >
                    <RefreshCw size={12} /> Replace
                  </button>
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-primary hover:bg-white/10 transition-colors cursor-pointer"
                    title="Edit Member Details"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member)}
                    className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Remove Member"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {member.name}
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-extrabold uppercase tracking-wider my-1">
                  {member.role}
                </span>
                <p className="text-xs text-gray-400 leading-relaxed mt-2 line-clamp-2">
                  {member.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Replace Leader */}
      {replacingMember && (
        <div className="fixed inset-0 z-[1150] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-md w-full border border-white/15 relative space-y-4">
            <button
              onClick={() => setReplacingMember(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
              <RefreshCw size={13} /> Leadership Swap
            </div>

            <h3 className="text-xl font-bold text-white">
              Replace {replacingMember.role}
            </h3>
            <p className="text-xs text-gray-400">
              Current Leader: <strong className="text-white">{replacingMember.name}</strong>
            </p>

            <form onSubmit={handleConfirmReplace} className="space-y-4 text-xs pt-2">
              <div>
                <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">
                  Select New Replacement Leader
                </label>
                <select
                  value={replacementName}
                  onChange={(e) => setReplacementName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 cursor-pointer font-bold"
                >
                  {OFFICIAL_32_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplacingMember(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-400 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 text-slate-950 font-extrabold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-amber-400/20 flex items-center gap-2"
                >
                  <Check size={16} /> Confirm Replacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Executive Member */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1150] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-md w-full border border-white/15 relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-white">Add Executive Board Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Select or Enter Name</label>
                <select
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary font-bold"
                >
                  <option value="">-- Choose Member --</option>
                  {OFFICIAL_32_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-primary font-semibold mb-1 uppercase tracking-wider">Executive Role Title</label>
                <input
                  type="text"
                  required
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="e.g. President, Vice President, Secretary..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Short Role Summary</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. Leads strategic planning and operations..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Executive Biography</label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Full background and achievements..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-primary font-semibold mb-1 flex items-center gap-1.5">
                  <Camera size={13} /> Profile Image URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. /profiles/Hudaif.png"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-slate-950 font-bold rounded-xl hover:opacity-90 transition-opacity mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                <Check size={16} /> Add Executive Member
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Executive Member */}
      {editingMember && (
        <div className="fixed inset-0 z-[1150] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-md w-full border border-white/15 relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-white">Edit Executive Member</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-primary font-semibold mb-1 uppercase tracking-wider">Executive Role Title</label>
                <input
                  type="text"
                  required
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Short Role Summary</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Executive Biography</label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-primary font-semibold mb-1 flex items-center gap-1.5">
                  <Camera size={13} /> Profile Image URL
                </label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-slate-950 font-bold rounded-xl hover:opacity-90 transition-opacity mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                <Check size={16} /> Save Executive Member Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
