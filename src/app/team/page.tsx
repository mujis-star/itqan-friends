"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Crown, Shield, PenTool, Settings, 
  Coins, BarChart, Megaphone, Users, ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface TeamMember {
  name: string;
  role: string;
  desc: string;
  icon: string;
  image?: string;
}



interface TeamData {
  coreMembers: TeamMember[];
}

export default function TeamPage() {
  const [data, setData] = useState<TeamData | null>(null);

  useEffect(() => {
    fetch("/data/team.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load team data", err));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Helper to map font-awesome icon strings to lucide react icons
  const getLucideIcon = (iconString: string, size=24) => {
    switch (iconString) {
      case "fa-crown": return <Crown size={size} />;
      case "fa-shield-alt": return <Shield size={size} />;
      case "fa-pen-alt": return <PenTool size={size} />;
      case "fa-cog": return <Settings size={size} />;
      case "fa-coins": return <Coins size={size} />;
      case "fa-chart-bar": return <BarChart size={size} />;
      case "fa-bullhorn": return <Megaphone size={size} />;
      default: return <Users size={size} />;
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Leadership <span className="text-accent">Command Center</span>
        </h1>
        <p className="text-xl text-gray-400">
          Meet the dedicated committee members driving the ITQAN ecosystem forward.
        </p>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Crown className="text-accent" />
          Executive Committee
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.coreMembers.map((member, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              key={member.name}
              className="glass p-8 rounded-3xl group border border-white/5 hover:border-accent/40 transition-all duration-500 relative overflow-hidden flex flex-col h-full bg-gradient-to-br from-white/[0.05] to-transparent hover:shadow-[0_10px_40px_rgba(var(--color-accent-rgb),0.2)]"
            >
              {/* Background Glows on hover */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              {/* Subtle Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500" 
                   style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-accent group-hover:scale-105 group-hover:border-accent group-hover:shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.4)] transition-all duration-500 relative overflow-hidden">
                    {member.image ? (
                      <Image 
                        src={member.image} 
                        alt={member.name} 
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      getLucideIcon(member.icon, 28)
                    )}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-1 text-white group-hover:text-accent transition-colors duration-300">{member.name}</h3>
                <div className="text-accent text-sm font-bold tracking-wider uppercase mb-4">{member.role}</div>
                <p className="text-gray-400 flex-grow leading-relaxed group-hover:text-gray-300 transition-colors">
                  {member.desc}
                </p>

                <div className="pt-8 mt-auto">
                  <Link 
                    href={`/team/${member.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="inline-flex items-center justify-center w-full bg-white/5 hover:bg-accent hover:text-black border border-white/10 hover:border-accent px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg group-hover:shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.3)]"
                  >
                    View Full Profile <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
