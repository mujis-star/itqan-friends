"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  X,
  UserCircle2,
  ArrowUpRight,
} from "lucide-react";
import { StudentProfileModal, StudentProfileData, getStudentImage } from "@/components/ui/StudentProfileModal";
import { WingLogo } from "@/components/ui/WingLogo";

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

export const EcosystemWings = () => {
  const [categories, setCategories] = useState<WingCategory[]>([]);
  const [activeWing, setActiveWing] = useState<Wing | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileData | null>(null);

  useEffect(() => {
    fetch("/data/wings.json")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error(err));
  }, []);

  const handleOpenMemberProfile = (name: string, role: string, wing: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedStudent({
      name,
      role,
      wing,
      image: getStudentImage(name),
    });
  };

  return (
    <section id="wings" className="pt-28 md:pt-36 pb-24 relative scroll-mt-28">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <SectionHeader
          eyebrow="Structure"
          title={
            <>
              Explore Our <span className="gradient-text">Ecosystem</span>
            </>
          }
          description="ITQAN is composed of specialized wings, each operating as a focused command center."
        />

        <div className="max-w-7xl mx-auto space-y-20 mt-16">
          {categories.map((cat, idx) => (
            <div key={idx} className="relative">
              {/* Category Header */}
              <div className="flex items-center gap-6 mb-10">
                <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-wide uppercase shrink-0">
                  {cat.category}
                </h3>
                <div className="h-[1px] w-full bg-gradient-to-r from-primary/40 via-white/10 to-transparent" />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cat.wings.map((wing, wIdx) => (
                  <motion.div
                    key={wIdx}
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setActiveWing(wing)}
                    className="p-6 md:p-7 rounded-3xl cursor-pointer group border border-white/10 hover:border-primary/40 transition-all duration-300 relative overflow-hidden glass-card flex flex-col justify-between h-full"
                  >
                    {/* Card Inner Glow */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                      {/* Top Row: Custom Wing Logo Emblem & Arrow */}
                      <div className="flex justify-between items-start mb-8">
                        <WingLogo wingName={wing.name} size="md" />

                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-primary/20">
                          <ArrowUpRight className="text-primary" size={18} />
                        </div>
                      </div>

                      {/* Bottom Row: Content */}
                      <div>
                        <h4 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors">
                          {wing.name}
                        </h4>

                        <div className="flex flex-col gap-2 text-xs text-gray-400">
                          <div
                            onClick={(e) => handleOpenMemberProfile(wing.chairman, "Chairman", wing.name, e)}
                            className="flex items-center gap-2 hover:text-primary transition-colors group/item"
                          >
                            <UserCircle2 size={14} className="text-primary/70 group-hover/item:text-primary" />
                            <span className="font-semibold text-gray-400">Chair:</span>
                            <span className="text-gray-200 font-bold underline decoration-primary/40 underline-offset-2">
                              {wing.chairman}
                            </span>
                          </div>

                          {wing.convener !== "N/A" && (
                            <div
                              onClick={(e) => handleOpenMemberProfile(wing.convener, "Convener", wing.name, e)}
                              className="flex items-center gap-2 hover:text-accent transition-colors group/item"
                            >
                              <UserCircle2 size={14} className="text-accent/70 group-hover/item:text-accent" />
                              <span className="font-semibold text-gray-400">Conv:</span>
                              <span className="text-gray-200 font-bold underline decoration-accent/40 underline-offset-2">
                                {wing.convener}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Wing Command Center Modal */}
      <AnimatePresence>
        {activeWing && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveWing(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg glass-card bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-8 border-b border-white/10 relative text-center bg-gradient-to-b from-primary/10 to-transparent">
                <button
                  onClick={() => setActiveWing(null)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 rounded-full p-2 hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>

                {/* Clean Custom Wing Logo Emblem */}
                <div className="flex justify-center mb-5">
                  <WingLogo wingName={activeWing.name} size="xl" />
                </div>

                <h2 className="text-2xl font-bold mb-1 text-white">{activeWing.name}</h2>
                <p className="text-primary font-semibold uppercase tracking-widest text-xs">
                  Command Center Details
                </p>
              </div>

              <div className="p-6 space-y-3">
                <div
                  onClick={() => handleOpenMemberProfile(activeWing.chairman, "Chairman", activeWing.name)}
                  className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 hover:border-primary/40 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="text-primary" size={18} />
                    <span className="text-xs font-semibold text-gray-300">Chairman</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm group-hover:text-primary transition-colors">
                      {activeWing.chairman}
                    </span>
                    <span className="text-xs text-primary font-semibold">View Full Profile &rarr;</span>
                  </div>
                </div>

                {activeWing.convener !== "N/A" && (
                  <div
                    onClick={() => handleOpenMemberProfile(activeWing.convener, "Convener", activeWing.name)}
                    className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 hover:border-accent/40 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UserCircle2 className="text-accent" size={18} />
                      <span className="text-xs font-semibold text-gray-300">Convener</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm group-hover:text-accent transition-colors">
                        {activeWing.convener}
                      </span>
                      <span className="text-xs text-accent font-semibold">View Full Profile &rarr;</span>
                    </div>
                  </div>
                )}

                {activeWing.asst_convener && (
                  <div
                    onClick={() => handleOpenMemberProfile(activeWing.asst_convener!, "Asst. Convener", activeWing.name)}
                    className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 hover:border-white/20 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UserCircle2 className="text-gray-400" size={18} />
                      <span className="text-xs font-semibold text-gray-300">Asst. Convener</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm group-hover:text-white transition-colors">
                        {activeWing.asst_convener}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">View Full Profile &rarr;</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rich Student Profile Portfolio Modal */}
      <StudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </section>
  );
};
