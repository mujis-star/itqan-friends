"use client";
import React, { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Shield, PenTool, Settings, Coins, BarChart, Megaphone, Users, Mail, Phone, MapPin, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TeamMember {
  name: string;
  role: string;
  desc: string;
  icon: string;
  about?: string;
  responsibilities?: string[];
}

export default function MemberProfilePage({ params }: { params: Promise<{ memberId: string }> }) {
  const unwrappedParams = use(params);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/team.json")
      .then((res) => res.json())
      .then((json) => {
        const found = json.coreMembers.find((m: TeamMember) => 
          m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === unwrappedParams.memberId
        );
        if (found) {
          setMember(found);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load team data", err);
        setLoading(false);
      });
  }, [unwrappedParams.memberId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!member) {
    return notFound();
  }

  // Helper to map font-awesome icon strings to lucide react icons
  const getLucideIcon = (iconString: string, size = 48) => {
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
      <Link href="/team" className="inline-flex items-center text-gray-400 hover:text-accent transition-colors mb-12">
        <ArrowLeft className="mr-2" size={20} />
        Back to Leadership
      </Link>
      
      <div className="max-w-4xl mx-auto glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
          <div className="w-48 h-48 shrink-0 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-accent shadow-[0_0_50px_rgba(var(--color-accent-rgb),0.2)]">
            {getLucideIcon(member.icon, 80)}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{member.name}</h1>
              <h2 className="text-2xl text-accent font-medium">{member.role}</h2>
            </div>
            
            <p className="text-lg text-gray-300 leading-relaxed border-l-4 border-accent/30 pl-4 py-2">
              {member.desc}
            </p>
            
            {/* Placeholder contact info for aesthetics */}
            <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-white/10 text-gray-400">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-accent" />
                <span className="text-sm">{member.name.split(' ')[0].toLowerCase()}@itqan.org</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-accent" />
                <span className="text-sm">ITQAN HQ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Details Section */}
        {(member.about || member.responsibilities) && (
          <div className="mt-16 grid md:grid-cols-2 gap-12 border-t border-white/10 pt-12">
            
            {/* About Section */}
            {member.about && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User size={20} className="text-accent" />
                  About
                </h3>
                <p className="text-gray-300 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10">
                  {member.about}
                </p>
              </div>
            )}

            {/* Responsibilities Section */}
            {member.responsibilities && member.responsibilities.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-secondary" />
                  Key Responsibilities
                </h3>
                <ul className="space-y-3">
                  {member.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="mt-1 w-2 h-2 rounded-full bg-secondary shrink-0"></div>
                      <span className="text-gray-300 text-sm">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
