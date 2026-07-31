"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Shield,
  PenTool,
  Settings,
  Coins,
  BarChart,
  Megaphone,
  Users,
  ArrowRight,
  Globe,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { StudentProfileModal, StudentProfileData, getStudentImage } from "@/components/ui/StudentProfileModal";

interface TeamMember {
  name: string;
  role: string;
  desc: string;
  icon: string;
  image?: string;
  about?: string;
  responsibilities?: string[];
}

interface TeamData {
  coreMembers: TeamMember[];
}

export default function TeamPage() {
  const [data, setData] = useState<TeamData | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileData | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("itqan_custom_team") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setData({ coreMembers: parsed });
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetch("/data/team.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load team data", err));
  }, []);

  if (!data) {
    return (
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
          <div className="h-12 w-64 bg-white/5 rounded-xl animate-pulse mx-auto" />
          <div className="h-6 w-96 bg-white/5 rounded-xl animate-pulse mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const getLucideIcon = (iconString: string, size = 24) => {
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

  const handleOpenProfile = (member: TeamMember) => {
    setSelectedStudent({
      name: member.name,
      role: member.role,
      wing: "Executive Committee",
      image: member.image || getStudentImage(member.name),
      bio: member.about || member.desc,
      responsibilities: member.responsibilities,
    });
  };

  return (
    <div className="container mx-auto px-6 py-24 scroll-mt-24">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-white">
          Leadership <span className="gradient-text">Command Center</span>
        </h1>
        <p className="text-lg text-gray-300">
          Meet the dedicated committee members driving the ITQAN ecosystem forward.
        </p>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
          <Crown className="text-accent" />
          Executive Committee
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.coreMembers.map((member, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              key={member.name}
              onClick={() => handleOpenProfile(member)}
              className="cursor-pointer"
            >
              <Card
                tiltEffect
                className="p-6 flex flex-col h-full border-white/10 hover:border-primary/40 group relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-primary group-hover:border-primary transition-all duration-300 relative overflow-hidden shrink-0">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        getLucideIcon(member.icon, 24)
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Website"
                      >
                        <Globe size={14} />
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Email"
                      >
                        <Mail size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-1 text-white group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <div className="text-primary text-xs font-bold tracking-wider uppercase mb-3">
                    {member.role}
                  </div>
                  <p className="text-xs text-gray-400 flex-grow leading-relaxed mb-6">
                    {member.desc}
                  </p>

                  <div className="pt-4 mt-auto">
                    <button className="inline-flex items-center justify-center w-full bg-white/5 hover:bg-primary hover:text-slate-950 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer">
                      View Full Profile <ArrowRight size={14} className="ml-1.5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <StudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
