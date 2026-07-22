"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Camera, Book, Globe2, X, PenTool, Calculator, Atom, Palette, Activity, Printer, Briefcase, Droplet, UserCircle2, ArrowUpRight } from 'lucide-react';

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
      {/* Global Background Elements for the section */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <SectionHeader 
          eyebrow="Structure"
          title={<>Explore Our <span className="gradient-text">Ecosystem</span></>}
          description="ITQAN is composed of specialized wings, each operating as a focused command center."
        />

        <div className="max-w-7xl mx-auto space-y-24 mt-16">
          {categories.map((cat, idx) => (
            <div key={idx} className="relative">
              
              {/* Category Header */}
              <div className="flex items-center gap-6 mb-12">
                <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tight uppercase shrink-0">
                  {cat.category}
                </h3>
                <div className="h-[1px] w-full bg-gradient-to-r from-accent/30 via-white/10 to-transparent"></div>
              </div>
              
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cat.wings.map((wing, wIdx) => (
                  <motion.div
                    key={wIdx}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setActiveWing(wing)}
                    className="p-6 md:p-8 rounded-3xl cursor-pointer group border border-white/10 hover:border-accent/50 transition-all duration-500 relative overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl hover:shadow-[0_8px_32px_rgba(var(--color-accent-rgb),0.15)] text-left flex flex-col h-full"
                  >
                    {/* Card Inner Glows */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                    
                    {/* Subtle Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500" 
                         style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Top Row: Icon & Arrow */}
                      <div className="flex justify-between items-start mb-12">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:shadow-[0_0_30px_rgba(var(--color-accent-rgb),0.4)] transition-all duration-500 group-hover:-rotate-12 relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {getIcon(wing.icon, 28)}
                        </div>
                        
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:bg-accent/10">
                          <ArrowUpRight className="text-accent" size={20} />
                        </div>
                      </div>
                      
                      {/* Bottom Row: Text content */}
                      <div className="mt-auto">
                        <h4 className="text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors duration-300">
                          {wing.name}
                        </h4>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                            <UserCircle2 size={16} className="text-accent/70" />
                            <span className="font-medium text-gray-500 mr-1">Chair:</span> {wing.chairman}
                          </div>
                          {wing.convener !== "N/A" && (
                            <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                              <UserCircle2 size={16} className="text-secondary/70" />
                              <span className="font-medium text-gray-500 mr-1">Conv:</span> {wing.convener}
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
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-8 border-b border-white/10 relative text-center bg-gradient-to-b from-accent/10 to-transparent">
                <button onClick={() => setActiveWing(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white bg-white/5 rounded-full p-2 hover:bg-white/10 transition-colors"><X size={20}/></button>
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-accent-rgb),0.2)]">
                    {getIcon(activeWing.icon, 48)}
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-2 text-white">{activeWing.name}</h2>
                <p className="text-accent font-medium uppercase tracking-widest text-sm">Command Center Details</p>
              </div>
              
              <div className="p-8 bg-black/60">
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-accent/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <UserCircle2 className="text-accent" size={20} />
                      </div>
                      <span className="font-semibold text-gray-300">Chairman</span>
                    </div>
                    <span className="text-white font-bold text-lg">{activeWing.chairman}</span>
                  </div>
                  
                  {activeWing.convener !== "N/A" && (
                    <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-secondary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <UserCircle2 className="text-secondary" size={20} />
                        </div>
                        <span className="font-semibold text-gray-300">Convener</span>
                      </div>
                      <span className="text-white font-bold text-lg">{activeWing.convener}</span>
                    </div>
                  )}

                  {activeWing.asst_convener && (
                    <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <UserCircle2 className="text-gray-400" size={20} />
                        </div>
                        <span className="font-semibold text-gray-300">Asst. Convener</span>
                      </div>
                      <span className="text-white font-bold text-lg">{activeWing.asst_convener}</span>
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
