"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  Camera,
  Book,
  Globe2,
  X,
  PenTool,
  Calculator,
  Atom,
  Palette,
  Activity,
  Printer,
  Briefcase,
  Droplet,
  UserCircle2,
  ArrowUpRight,
} from "lucide-react";

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

  useEffect(() => {
    fetch("/data/wings.json")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error(err));
  }, []);

  const getIcon = (iconStr: string, size = 24) => {
    const props = {
      size,
      className: "text-primary group-hover:text-slate-950 transition-colors duration-300",
    };
    switch (iconStr) {
      case "fa-water": return <Droplet {...props} />;
      case "fa-keyboard": return <Briefcase {...props} />;
      case "fa-pen-fancy": return <PenTool {...props} />;
      case "fa-moon": return <Globe2 {...props} />;
      case "fa-atom": return <Atom {...props} />;
      case "fa-calculator": return <Calculator {...props} />;
      case "fa-globe": return <Globe2 {...props} />;
      case "fa-palette": return <Palette {...props} />;
      case "fa-camera-retro": return <Camera {...props} />;
      case "fa-running": return <Activity {...props} />;
      case "fa-book": return <Book {...props} />;
      case "fa-print": return <Printer {...props} />;
      default: return <Briefcase {...props} />;
    }
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
                      {/* Top Row: Icon & Arrow */}
                      <div className="flex justify-between items-start mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300 relative overflow-hidden shrink-0">
                          {getIcon(wing.icon, 24)}
                        </div>

                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-primary/20">
                          <ArrowUpRight className="text-primary" size={18} />
                        </div>
                      </div>

                      {/* Bottom Row: Content */}
                      <div>
                        <h4 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors">
                          {wing.name}
                        </h4>

                        <div className="flex flex-col gap-1.5 text-xs text-gray-400">
                          <div className="flex items-center gap-2">
                            <UserCircle2 size={14} className="text-primary/70" />
                            <span className="font-semibold text-gray-400">Chair:</span>
                            <span className="text-gray-200">{wing.chairman}</span>
                          </div>
                          {wing.convener !== "N/A" && (
                            <div className="flex items-center gap-2">
                              <UserCircle2 size={14} className="text-accent/70" />
                              <span className="font-semibold text-gray-400">Conv:</span>
                              <span className="text-gray-200">{wing.convener}</span>
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

      {/* Expanded Wing Modal */}
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
                <div className="flex justify-center mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                    {getIcon(activeWing.icon, 36)}
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-1 text-white">{activeWing.name}</h2>
                <p className="text-primary font-semibold uppercase tracking-widest text-xs">
                  Command Center Details
                </p>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="text-primary" size={18} />
                    <span className="text-xs font-semibold text-gray-300">Chairman</span>
                  </div>
                  <span className="text-white font-bold text-sm">{activeWing.chairman}</span>
                </div>

                {activeWing.convener !== "N/A" && (
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <UserCircle2 className="text-accent" size={18} />
                      <span className="text-xs font-semibold text-gray-300">Convener</span>
                    </div>
                    <span className="text-white font-bold text-sm">{activeWing.convener}</span>
                  </div>
                )}

                {activeWing.asst_convener && (
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <UserCircle2 className="text-gray-400" size={18} />
                      <span className="text-xs font-semibold text-gray-300">Asst. Convener</span>
                    </div>
                    <span className="text-white font-bold text-sm">{activeWing.asst_convener}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
