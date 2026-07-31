"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Globe,
  Award,
  BookOpen,
  CheckCircle2,
  Send,
  MessageSquare,
  Sparkles,
  Briefcase,
  Share2,
  ExternalLink,
  Tag,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface StudentProfileData {
  name: string;
  role: string;
  wing: string;
  admissionNo?: string;
  email?: string;
  image?: string;
  bio?: string;
  responsibilities?: string[];
  achievements?: string[];
}

export function getOfficialAdmissionNo(name: string): string {
  if (!name) return "";
  const clean = name.toLowerCase().trim();
  if (clean.includes("hudaif")) return "733";
  if (clean.includes("burhan")) return "725";
  if (clean.includes("zidan")) return "744";
  if (clean.includes("muhyudheen") || clean.includes("muhayaddin") || clean.includes("muhyuddin")) return "742";
  if (clean.includes("mirsad")) return "717";
  if (clean.includes("thanzeeh")) return "745";
  if (clean.includes("shahzad")) return "714";
  if (clean.includes("hisham")) return "676";
  if (clean.includes("minhaj")) return "677";
  if (clean.includes("vk") || clean.includes("v.k")) return "695";
  if (clean.includes("habeeb")) return "696";
  if (clean.includes("muhaimin")) return "697";
  if (clean.includes("zameen")) return "699";
  if (clean.includes("sm") || clean.includes("s.m")) return "701";
  if (clean.includes("mujeeb")) return "702";
  if (clean.includes("rabeeh")) return "704";
  if (clean.includes("rashad")) return "710";
  if (clean.includes("razin")) return "711";
  if (clean.includes("fidyan")) return "712";
  if (clean.includes("abdu") || clean.includes("rahman")) return "715";
  if (clean.includes("muzzammil") || clean.includes("muzammil")) return "716";
  if (clean.includes("shabeel")) return "718";
  if (clean.includes("muhammed u") || clean.includes("muahmmed u")) return "719";
  if (clean.includes("aslah")) return "720";
  if (clean.includes("zarhan")) return "722";
  if (clean.includes("pp") || clean.includes("p.p")) return "723";
  if (clean.includes("razeen")) return "724";
  if (clean.includes("zayin")) return "727";
  if (clean.includes("naseem")) return "728";
  if (clean.includes("fuad")) return "732";
  if (clean.includes("nuhman")) return "743";
  if (clean.includes("adnan")) return "746";
  return "";
}

export function getStudentImage(name: string): string {
  if (!name) return "";
  const clean = name.toLowerCase().trim();
  if (clean.includes("mujeeb")) return "/profiles/Mujeeb.png";
  if (clean.includes("hudaif")) return "/profiles/Hudaif.png";
  if (clean.includes("burhan")) return "/profiles/Sayyid-Burhan.png";
  if (clean.includes("zidan")) return "/profiles/Zidan.png";
  if (clean.includes("muhyudheen")) return "/profiles/Muhyudheen.png";
  if (clean.includes("mirsad")) return "/profiles/Mirsad.png";
  if (clean.includes("thanzeeh")) return "/profiles/Thanzeeh.png";
  if (clean.includes("shahzad")) return "/profiles/Shahzad.png";
  if (clean.includes("zarhan")) return "/profiles/Zarhan.png";
  if (clean.includes("abdu")) return "/profiles/abdu-rahman.png";
  if (clean.includes("zameen")) return "/profiles/Zameen.png";
  if (clean.includes("naseem")) return "/profiles/Naseem.png";
  if (clean.includes("razeen")) return "/profiles/Razeen.png";
  if (clean.includes("rabeeh")) return "/profiles/Rabeeh.png";
  if (clean.includes("muzzammil")) return "/profiles/Muzzammil.png";
  if (clean.includes("vk") || clean.includes("v.k")) return "/profiles/Muhammed V.K.png";
  if (clean.includes("hisham")) return "/profiles/Hisham.png";
  if (clean.includes("muhammed u") || clean.includes("muahmmed u")) return "/profiles/Muahmmed U.png";
  if (clean.includes("pp") || clean.includes("p.p")) return "/profiles/Muhammed P.P.png";
  if (clean.includes("shabeel")) return "/profiles/Shabeel.png";
  if (clean.includes("muhaimin")) return "/profiles/Muhaimin.png";
  if (clean.includes("sm") || clean.includes("s.m")) return "/profiles/Muhammed S.M.png";
  if (clean.includes("adnan")) return "/profiles/Adnan.png";
  if (clean.includes("aslah")) return "/profiles/Aslah.png";
  if (clean.includes("habeeb")) return "/profiles/Fuad Habeeb.png";
  if (clean.includes("fuad")) return "/profiles/Fuad M.A.png";
  if (clean.includes("nuhman")) return "/profiles/Nuhman.png";
  if (clean.includes("minhaj")) return "/profiles/Minhaj.png";
  if (clean.includes("rashad")) return "/profiles/Rashad.png";
  if (clean.includes("razin")) return "/profiles/Razin.png";
  if (clean.includes("ridhan")) return "/profiles/Ridhan.png";
  if (clean.includes("salah")) return "/profiles/Salah.png";
  if (clean.includes("zayin")) return "/profiles/Zayin.png";
  return "";
}

interface StudentProfileModalProps {
  student: StudentProfileData | null;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, onClose }) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");

  if (!student) return null;

  const imageSrc = student.image || getStudentImage(student.name);
  const emailStr = student.email || `${student.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@itqan.org`;
  const admNoStr = student.admissionNo || getOfficialAdmissionNo(student.name) || "700";

  const defaultBio =
    student.bio ||
    `Official ${student.role} leading the ${student.wing} activities, academic workshops, and student initiatives within ITQAN Union. Dedicated to excellence, innovation, and community leadership.`;

  const responsibilities = student.responsibilities || [
    `Lead ${student.wing} operational planning and strategic vision`,
    "Coordinate student workshops, competitions, and publications",
    "Collaborate with Executive Board on union-wide initiatives",
    "Maintain transparent communication with all 32 ITQAN members",
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    toast("Message Sent", `Your message has been delivered to ${student.name}.`, "success");
    setMessage("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl w-full glass-card bg-slate-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto text-left flex flex-col lg:flex-row max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close Profile"
          >
            <X size={18} />
          </button>

          {/* LEFT SIDEBAR COLUMN (Profile Picture & Key Info) */}
          <div className="w-full lg:w-80 bg-slate-950/80 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-6">
              {/* High-res Student Avatar Container */}
              <div className="relative mx-auto lg:mx-0 w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-slate-900 border-2 border-primary/40 p-1.5 shadow-2xl group overflow-hidden shrink-0">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center relative">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={student.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-5xl font-extrabold text-primary">{student.name.charAt(0)}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                </div>
                <span className="absolute bottom-2 right-2 px-2.5 py-0.5 bg-primary text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-full shadow-lg">
                  Active
                </span>
              </div>

              {/* Student Name & Badges */}
              <div className="text-center lg:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-primary font-mono text-[11px] font-bold tracking-wider">
                  <Tag size={12} /> Adm. No: {admNoStr}
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">{student.name}</h2>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-extrabold uppercase tracking-wider">
                    {student.role}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 text-[10px] font-semibold">
                    {student.wing}
                  </span>
                </div>
              </div>

              {/* Key Quick Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                  <span className="block text-primary font-extrabold text-lg">32</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">Union Peers</span>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                  <span className="block text-accent font-extrabold text-lg">100%</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">Commitment</span>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="space-y-2 text-xs pt-2 border-t border-white/10">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail size={15} className="text-primary shrink-0" />
                  <span className="font-mono text-[11px] truncate">{emailStr}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Briefcase size={15} className="text-accent shrink-0" />
                  <span>{student.wing} Leadership</span>
                </div>
              </div>
            </div>

            {/* Social Channels Footer */}
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-center lg:justify-start gap-3">
              <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-primary/20 text-gray-300 hover:text-primary transition-colors">
                <Globe size={16} />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-primary/20 text-gray-300 hover:text-primary transition-colors">
                <Share2 size={16} />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-primary/20 text-gray-300 hover:text-primary transition-colors">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* MAIN DETAILS COLUMN (Portfolio / Hero / Responsibilities) */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 bg-slate-900/60">
            {/* Hero Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-extrabold text-primary uppercase tracking-wider mb-2">
                <Sparkles size={13} /> Leadership Profile
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Hello, I&apos;m {student.name} (Adm No. {admNoStr})
              </h3>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1 leading-tight">
                Leading <span className="gradient-text">{student.wing}</span> at ITQAN Union
              </h1>
            </div>

            {/* Biography */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} className="text-primary" /> Executive Bio & Summary
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">{defaultBio}</p>
            </div>

            {/* Core Responsibilities */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Award size={14} className="text-accent" /> Key Wing Responsibilities
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {responsibilities.map((resp, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-white/5 p-3.5 rounded-2xl border border-white/5 text-xs text-gray-300">
                    <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Message Form */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={14} className="text-primary" /> Direct Leadership Contact
              </h4>
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  rows={2}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Send a direct message or feedback to ${student.name}...`}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-all"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
                >
                  <Send size={14} /> Send Message
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
