"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Layers, Edit2, Check, X, UserCircle2, ArrowUpRight } from "lucide-react";
import { WingLogo } from "@/components/ui/WingLogo";
import { useToast } from "@/components/ui/Toast";

interface Wing {
  name: string;
  chairman: string;
  convener: string;
  asst_convener?: string;
  icon: string;
}

interface WingCategory {
  category: string;
  wings: Wing[];
}

export default function WingsManagementPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<WingCategory[]>([]);
  const [editingWing, setEditingWing] = useState<Wing | null>(null);

  // Edit form state
  const [editWingName, setEditWingName] = useState("");
  const [editChairman, setEditChairman] = useState("");
  const [editConvener, setEditConvener] = useState("");
  const [editAsstConvener, setEditAsstConvener] = useState("");

  useEffect(() => {
    const savedWings = typeof window !== "undefined" ? localStorage.getItem("itqan_custom_wings") : null;
    if (savedWings) {
      try {
        setCategories(JSON.parse(savedWings));
        return;
      } catch (e) {
        console.error(e);
      }
    }

    fetch("/data/wings.json")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error(err));
  }, []);

  const openEditWingModal = (wing: Wing) => {
    setEditingWing(wing);
    setEditWingName(wing.name);
    setEditChairman(wing.chairman);
    setEditConvener(wing.convener);
    setEditAsstConvener(wing.asst_convener || "");
  };

  const handleSaveWingEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWing) return;

    const updatedCategories = categories.map((cat) => ({
      ...cat,
      wings: cat.wings.map((w) =>
        w.name === editingWing.name
          ? {
              ...w,
              name: editWingName,
              chairman: editChairman,
              convener: editConvener,
              asst_convener: editAsstConvener || undefined,
            }
          : w
      ),
    }));

    setCategories(updatedCategories);
    if (typeof window !== "undefined") {
      localStorage.setItem("itqan_custom_wings", JSON.stringify(updatedCategories));
    }

    setEditingWing(null);
    toast("Wing Details Saved", `Updated leadership & details for "${editWingName}".`, "success");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-card p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-wider mb-2">
            <Layers size={14} /> Structure & Leadership Editor
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Manage Wing Command Centers
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Edit wing names, assign Chairmen, Conveners, and Assistant Conveners across all 12 ITQAN wings.
          </p>
        </div>
      </div>

      {/* Categories & Wing Cards Grid */}
      <div className="space-y-12">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">{cat.category}</h2>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.wings.map((wing, wIdx) => (
                <div
                  key={wIdx}
                  className="glass-card p-6 rounded-3xl border border-white/10 hover:border-primary/40 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <WingLogo wingName={wing.name} size="md" />

                    <button
                      onClick={() => openEditWingModal(wing)}
                      className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-slate-950 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 size={13} /> Edit Wing
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{wing.name}</h3>
                    <div className="space-y-1.5 text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <UserCircle2 size={14} className="text-primary" />
                        <span className="text-gray-400">Chairman:</span>
                        <span className="font-bold text-white">{wing.chairman}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCircle2 size={14} className="text-accent" />
                        <span className="text-gray-400">Convener:</span>
                        <span className="font-bold text-white">{wing.convener}</span>
                      </div>
                      {wing.asst_convener && (
                        <div className="flex items-center gap-2">
                          <UserCircle2 size={14} className="text-gray-400" />
                          <span className="text-gray-400">Asst. Conv:</span>
                          <span className="font-bold text-white">{wing.asst_convener}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Wing Details Modal */}
      {editingWing && (
        <div className="fixed inset-0 z-[1150] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-md w-full border border-white/15 relative space-y-4">
            <button
              onClick={() => setEditingWing(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-white">Edit Wing Command Center</h3>
            <form onSubmit={handleSaveWingEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1 uppercase tracking-wider">Wing Title</label>
                <input
                  type="text"
                  required
                  value={editWingName}
                  onChange={(e) => setEditWingName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-primary font-semibold mb-1 uppercase tracking-wider">Chairman</label>
                <input
                  type="text"
                  required
                  value={editChairman}
                  onChange={(e) => setEditChairman(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-accent font-semibold mb-1 uppercase tracking-wider">Convener</label>
                <input
                  type="text"
                  required
                  value={editConvener}
                  onChange={(e) => setEditConvener(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider">Asst. Convener (Optional)</label>
                <input
                  type="text"
                  value={editAsstConvener}
                  onChange={(e) => setEditAsstConvener(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-slate-950 font-bold rounded-xl hover:opacity-90 transition-opacity mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                <Check size={16} /> Save Wing Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
