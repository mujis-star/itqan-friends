"use client";
import React, { useEffect, useRef } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const TimelineAchievements = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = gsap.utils.toArray('.timeline-item') as HTMLElement[];
    
    items.forEach((item, i) => {
      gsap.fromTo(item, 
        { opacity: 0, y: 50 },
        {
          opacity: 1, 
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, []);

  const milestones = [
    {
      year: '2024',
      title: 'Best Union Award',
      desc: 'Recognized globally for exceptional community engagement and leadership initiatives.',
      icon: '🏆'
    },
    {
      year: '2025',
      title: '400+ Programs Milestone',
      desc: 'Scaled operations to host over 400 academic and extracurricular programs in a single year.',
      icon: '🚀'
    },
    {
      year: '2026',
      title: 'Leadership Transformation',
      desc: 'Launched the digital campus ecosystem, redefining student network architecture.',
      icon: '⚡'
    }
  ];

  return (
    <section id="timeline" className="py-24 bg-black/40 relative">
      <div className="container mx-auto px-6">
        <SectionHeader 
          eyebrow="Our Journey"
          title={<>A Legacy of <span className="text-highlight">Excellence</span></>}
          description="Tracing our path from a local student club to a global leadership network."
        />

        <div className="max-w-4xl mx-auto relative" ref={containerRef}>
          {/* Vertical Line */}
          <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-[2px] bg-white/10 -translate-x-1/2 rounded-full"></div>

          {milestones.map((m, i) => (
            <div key={m.year} className={`timeline-item flex flex-col md:flex-row items-start md:items-center justify-between mb-16 last:mb-0 relative ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              
              {/* Timeline Dot */}
              <div className="absolute left-[15px] md:left-1/2 top-0 md:top-1/2 w-10 h-10 bg-black border-4 border-highlight rounded-full -translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                <span className="text-sm">{m.icon}</span>
              </div>

              {/* Content */}
              <div className={`w-full md:w-[45%] pl-12 md:pl-0 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                <div className="text-4xl font-black text-white/20 mb-2 tracking-tighter">{m.year}</div>
                <h4 className="text-2xl font-bold mb-3">{m.title}</h4>
                <p className="text-gray-400 leading-relaxed">{m.desc}</p>
                
                <button className="mt-4 text-accent text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">
                  View Report <span aria-hidden="true">&rarr;</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
