"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Camera, Book, Globe2, X } from 'lucide-react';

export const EcosystemWings = () => {
  const [activeWing, setActiveWing] = useState<number | null>(null);

  const wings = [
    {
      id: 1,
      title: "Media Wing",
      icon: <Camera size={48} className="text-secondary" />,
      members: 25,
      projects: 120,
      description: "Driving the digital narrative through cutting-edge photography, videography, and graphic design."
    },
    {
      id: 2,
      title: "Library Wing",
      icon: <Book size={48} className="text-accent" />,
      members: 18,
      projects: 45,
      description: "Curating a vast repository of academic resources, research papers, and literary archives."
    },
    {
      id: 3,
      title: "Arabic Wing",
      icon: <Globe2 size={48} className="text-highlight" />,
      members: 30,
      projects: 60,
      description: "Promoting linguistic excellence, cultural heritage, and literature."
    }
  ];

  return (
    <section id="wings" className="py-24 relative">
      <div className="container mx-auto px-6">
        <SectionHeader 
          eyebrow="Structure"
          title={<>Explore Our <span className="gradient-text">Ecosystem</span></>}
          description="ITQAN is composed of specialized wings, each operating as a focused command center."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative z-10">
          {wings.map((wing) => (
            <motion.div
              key={wing.id}
              whileHover={{ y: -10 }}
              onClick={() => setActiveWing(wing.id)}
              className="glass p-8 rounded-2xl cursor-pointer text-center group border border-white/10 hover:border-white/30 transition-colors shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-6 flex justify-center">{wing.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{wing.title}</h3>
              <div className="w-12 h-1 bg-white/20 mx-auto rounded-full mb-6 group-hover:w-24 group-hover:bg-accent transition-all"></div>
              <p className="text-gray-400 text-sm">Click to explore Command Center</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Expanded Wing Modal */}
      <AnimatePresence>
        {activeWing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveWing(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              {(() => {
                const wing = wings.find(w => w.id === activeWing);
                return wing ? (
                  <>
                    <div className="p-8 border-b border-white/10 relative">
                      <button onClick={() => setActiveWing(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X /></button>
                      <div className="flex items-center gap-4 mb-4">
                        {wing.icon}
                        <h2 className="text-3xl font-bold">{wing.title}</h2>
                      </div>
                      <p className="text-gray-400">{wing.description}</p>
                    </div>
                    <div className="p-8 grid grid-cols-2 gap-8 bg-black/40">
                      <div>
                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Members</div>
                        <div className="text-4xl font-bold text-accent">{wing.members}</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Projects Completed</div>
                        <div className="text-4xl font-bold text-highlight">{wing.projects}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Leadership</div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gray-800"></div>
                            <div>
                              <div className="font-semibold text-sm">Director</div>
                              <div className="text-xs text-gray-400">View Profile</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gray-800"></div>
                            <div>
                              <div className="font-semibold text-sm">Coordinator</div>
                              <div className="text-xs text-gray-400">View Profile</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null;
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
