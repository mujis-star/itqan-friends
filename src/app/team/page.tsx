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
              className="glass p-6 rounded-2xl group hover:border-accent/30 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors"></div>
              
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 group-hover:bg-accent group-hover:text-black transition-all duration-300 relative overflow-hidden">
                {member.image ? (
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  getLucideIcon(member.icon, 20)
                )}
              </div>
              
              <h3 className="text-lg font-bold mb-1">{member.name}</h3>
              <div className="text-accent text-sm font-medium mb-3">{member.role}</div>
              <p className="text-sm text-gray-400 flex-grow">
                {member.desc}
              </p>

              <div className="pt-6 mt-auto">
                <Link 
                  href={`/team/${member.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="inline-flex items-center text-sm font-medium text-white/70 hover:text-accent transition-colors"
                >
                  View Profile <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
