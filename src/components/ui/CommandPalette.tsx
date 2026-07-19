"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Calendar, Users, Briefcase, X } from 'lucide-react';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const results = [
    { icon: <Calendar size={18} />, title: 'Upcoming Missions', category: 'Events', href: '#events' },
    { icon: <FileText size={18} />, title: 'Magazine 2026', category: 'Publications', href: '/media' },
    { icon: <Users size={18} />, title: 'Leadership Directory', category: 'Members', href: '#team' },
    { icon: <Briefcase size={18} />, title: 'Media Wing', category: 'Wings', href: '#wings' },
  ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="flex items-center px-4 py-4 border-b border-white/10">
              <Search className="text-gray-400 mr-3" size={20} />
              <input 
                type="text"
                autoFocus
                placeholder="Search ITQAN (Events, Media, Wings...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-gray-500 text-lg"
              />
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggestions</div>
                  {results.map((result, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        window.location.href = result.href;
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                        {result.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-200 font-medium group-hover:text-white">{result.title}</div>
                        <div className="text-xs text-gray-500">{result.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
              <div className="flex gap-4">
                <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300">↑↓</kbd> to navigate</span>
                <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300">↵</kbd> to select</span>
              </div>
              <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300">ESC</kbd> to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
