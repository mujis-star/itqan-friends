"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Camera, Book, Globe2, X, PenTool, Calculator, Atom, Palette, Activity, Printer, Briefcase, Droplet, UserCircle2 } from 'lucide-react';

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
    fetch('/data/wings.json')
      .then(res => res.json())
      .then(data => setCategories(data.categories))
      .catch(err => console.error(err));
  }, []);

  const getIcon = (iconStr: string, size = 48) => {
    const props = { size, className: "text-accent group-hover:text-black transition-colors duration-300" };
    switch (iconStr) {
      case 'fa-water': return <Droplet {...props} />;
      case 'fa-keyboard': return <Briefcase {...props} />;
      case 'fa-pen-fancy': return <PenTool {...props} />;
      case 'fa-moon': return <Globe2 {...props} />;
      case 'fa-atom': return <Atom {...props} />;
      case 'fa-calculator': return <Calculator {...props} />;
      case 'fa-globe': return <Globe2 {...props} />;
      case 'fa-palette': return <Palette {...props} />;
      case 'fa-camera-retro': return <Camera {...props} />;
      case 'fa-running': return <Activity {...props} />;
      case 'fa-book': return <Book {...props} />;
      case 'fa-print': return <Printer {...props} />;
      default: return <Briefcase {...props} />;
    }
  };

  return (
    <section id="wings" className="py-24 relative scroll-mt-24">
      <div className="container mx-auto px-6">
        <SectionHeader 
          eyebrow="Structure"
          title={<>Explore Our <span className="gradient-text">Ecosystem</span></>}
          description="ITQAN is composed of specialized wings, each operating as a focused command center."
        />

        <div className="max-w-7xl mx-auto space-y-20 relative z-10 mt-12">
          {categories.map((cat, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center gap-4 mb-10 justify-center">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-accent/50"></div>
                <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight uppercase">
                  {cat.category}
                </h3>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-accent/50"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {cat.wings.map((wing, wIdx) => (
                  <motion.div
                    key={wIdx}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setActiveWing(wing)}
                    className="glass p-8 rounded-3xl cursor-pointer text-center group border border-white/5 hover:border-accent/50 transition-all duration-500 relative overflow-hidden bg-[#0a0a0a]/80 hover:shadow-[0_0_40px_rgba(var(--color-accent-rgb),0.15)]"
                  >
                    {/* Background Glows on hover */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    {/* Icon Container */}
                    <div className="mb-8 flex justify-center relative">
                      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:shadow-[0_0_30px_rgba(var(--color-accent-rgb),0.5)] transition-all duration-500 relative z-10 group-hover:-translate-y-2">
                        {getIcon(wing.icon, 36)}
                      </div>
                      <div className="absolute inset-0 bg-accent/30 blur-2xl rounded-full scale-50 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    </div>
                    
                    <h4 className="text-xl font-bold text-white mb-4 group-hover:text-accent transition-colors duration-300">{wing.name}</h4>
                    
                    {/* Decorative line */}
                    <div className="w-12 h-1 bg-white/10 mx-auto rounded-full group-hover:w-24 group-hover:bg-accent transition-all duration-500"></div>
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
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-8 border-b border-white/10 relative text-center">
                <button onClick={() => setActiveWing(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X /></button>
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    {getIcon(activeWing.icon, 40)}
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-2">{activeWing.name}</h2>
                <p className="text-gray-400">Command Center Details</p>
              </div>
              <div className="p-8 bg-black/40">
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <UserCircle2 className="text-secondary" />
                      <span className="font-semibold text-gray-300">Chairman</span>
                    </div>
                    <span className="text-white font-bold">{activeWing.chairman}</span>
                  </div>
                  
                  {activeWing.convener !== "N/A" && (
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <UserCircle2 className="text-accent" />
                        <span className="font-semibold text-gray-300">Convener</span>
                      </div>
                      <span className="text-white font-bold">{activeWing.convener}</span>
                    </div>
                  )}

                  {activeWing.asst_convener && (
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <UserCircle2 className="text-gray-400" />
                        <span className="font-semibold text-gray-300">Asst. Convener</span>
                      </div>
                      <span className="text-white font-bold">{activeWing.asst_convener}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
