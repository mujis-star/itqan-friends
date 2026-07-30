"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Calendar, Users, Briefcase, X, Award, Shield, Compass } from "lucide-react";
import { useRouter } from "next/navigation";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const togglePalette = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const handleCustomToggle = () => setOpen((prev) => !prev);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("toggle-command-palette", handleCustomToggle);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("toggle-command-palette", handleCustomToggle);
    };
  }, [togglePalette]);

  const searchableItems = [
    { icon: <Calendar size={18} />, title: "Annual General Assembly 2026", category: "Events", href: "/#events" },
    { icon: <Calendar size={18} />, title: "Global Leadership Summit", category: "Events", href: "/#events" },
    { icon: <Users size={18} />, title: "Executive Committee Directory", category: "Team", href: "/team" },
    { icon: <Award size={18} />, title: "National Excellence Awards", category: "Achievements", href: "/achievements" },
    { icon: <FileText size={18} />, title: "ITQAN Annual Magazine & Media", category: "Media", href: "/media" },
    { icon: <Briefcase size={18} />, title: "Ecosystem Wings & Hubs", category: "Wings", href: "/#wings" },
    { icon: <Shield size={18} />, title: "Member Portal & Registration", category: "Portal", href: "/portal" },
    { icon: <Compass size={18} />, title: "About ITQAN Union Experience", category: "About", href: "/#about" },
  ];

  const filteredResults = searchableItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[12vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl glass-card bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Input Row */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/10">
              <Search className="text-primary mr-3 shrink-0" size={20} />
              <input
                type="text"
                autoFocus
                placeholder="Type to search ITQAN (Events, Team, Publications)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-gray-500 text-sm font-medium"
              />
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[55vh] overflow-y-auto p-2">
              {filteredResults.length > 0 ? (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Quick Results ({filteredResults.length})
                  </div>
                  {filteredResults.map((result, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(result.href)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-slate-950 transition-colors shrink-0">
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">
                          {result.title}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {result.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 text-sm">
                  No matching results found for &ldquo;<span className="text-white">{query}</span>&rdquo;
                </div>
              )}
            </div>

            {/* Shortcut Legend */}
            <div className="px-4 py-2.5 bg-slate-950/60 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex gap-3">
                <span>
                  <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">↵</kbd> select
                </span>
              </div>
              <span>
                <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">ESC</kbd> close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
