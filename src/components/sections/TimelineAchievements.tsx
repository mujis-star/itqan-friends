"use client";
import React, { useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Campaign {
  year: string;
  title: string;
  stats: { label: string; value: string }[];
  media: string;
  festivals: string;
  honors: string;
}

export const TimelineAchievements = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    fetch("/data/achievements.json")
      .then((res) => res.json())
      .then((data) => setCampaigns(data.campaigns))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!containerRef.current || campaigns.length === 0) return;
    const items = gsap.utils.toArray(".timeline-item") as HTMLElement[];

    items.forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, [campaigns]);

  return (
    <section id="timeline" className="pt-28 md:pt-36 pb-24 relative scroll-mt-28">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Our Journey"
          title={
            <>
              A Legacy of <span className="gradient-text">Excellence</span>
            </>
          }
          description="Tracing our path from a local student club to a recognized leadership network."
        />

        <div className="max-w-4xl mx-auto relative mt-16" ref={containerRef}>
          {/* Vertical Line */}
          <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/40 via-white/10 to-transparent -translate-x-1/2 rounded-full" />

          {campaigns.map((c, i) => (
            <div
              key={c.year}
              className={`timeline-item flex flex-col md:flex-row items-start md:items-center justify-between mb-16 last:mb-0 relative ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-[15px] md:left-1/2 top-0 md:top-1/2 w-10 h-10 bg-slate-950 border-2 border-primary rounded-full -translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center z-10 shadow-lg shadow-primary/20">
                <Trophy size={18} className="text-primary" />
              </div>

              {/* Content */}
              <div
                className={`w-full md:w-[45%] pl-12 md:pl-0 ${
                  i % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"
                }`}
              >
                <div className="text-4xl font-extrabold text-white/20 mb-2 tracking-tighter font-mono">
                  {c.year}
                </div>
                <h4 className="text-2xl font-bold mb-2 text-white">{c.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{c.honors}</p>

                <Link
                  href="/achievements"
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group"
                >
                  View Full Report <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
