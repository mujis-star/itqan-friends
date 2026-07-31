"use client";

import React from "react";
import {
  Camera,
  Book,
  Globe,
  PenTool,
  Calculator,
  Atom,
  Palette,
  Activity,
  Printer,
  Droplet,
  Moon,
  Keyboard,
  Sparkles,
} from "lucide-react";

interface WingLogoProps {
  wingName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const WingLogo: React.FC<WingLogoProps> = ({ wingName, size = "md", className = "" }) => {
  const cleanName = wingName.toLowerCase();

  // Size styling maps
  const sizeMap = {
    sm: { container: "w-10 h-10 rounded-xl", iconSize: 18, monogram: "text-[9px]" },
    md: { container: "w-14 h-14 rounded-2xl", iconSize: 24, monogram: "text-[10px]" },
    lg: { container: "w-20 h-20 rounded-2xl", iconSize: 34, monogram: "text-xs" },
    xl: { container: "w-24 h-24 rounded-3xl", iconSize: 42, monogram: "text-sm" },
  };

  const currentSize = sizeMap[size];

  // Specific Wing Branding Configs
  const getWingConfig = () => {
    if (cleanName.includes("media")) {
      return {
        bg: "from-teal-500/20 via-cyan-500/10 to-slate-950",
        border: "border-cyan-400/40 group-hover:border-cyan-400",
        glow: "shadow-[0_0_20px_rgba(14,165,164,0.3)]",
        iconColor: "text-cyan-400",
        monogram: "MW",
        Icon: Camera,
      };
    }
    if (cleanName.includes("malayalam")) {
      return {
        bg: "from-emerald-500/20 via-teal-500/10 to-slate-950",
        border: "border-emerald-400/40 group-hover:border-emerald-400",
        glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        iconColor: "text-emerald-400",
        monogram: "ML",
        Icon: Droplet,
      };
    }
    if (cleanName.includes("english")) {
      return {
        bg: "from-indigo-500/20 via-blue-500/10 to-slate-950",
        border: "border-indigo-400/40 group-hover:border-indigo-400",
        glow: "shadow-[0_0_20px_rgba(99,102,241,0.3)]",
        iconColor: "text-indigo-400",
        monogram: "EN",
        Icon: Keyboard,
      };
    }
    if (cleanName.includes("arabic")) {
      return {
        bg: "from-amber-500/20 via-yellow-500/10 to-slate-950",
        border: "border-amber-400/40 group-hover:border-amber-400",
        glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
        iconColor: "text-amber-400",
        monogram: "AR",
        Icon: Moon,
      };
    }
    if (cleanName.includes("urdu")) {
      return {
        bg: "from-rose-500/20 via-red-500/10 to-slate-950",
        border: "border-rose-400/40 group-hover:border-rose-400",
        glow: "shadow-[0_0_20px_rgba(244,63,94,0.3)]",
        iconColor: "text-rose-400",
        monogram: "UR",
        Icon: PenTool,
      };
    }
    if (cleanName.includes("science")) {
      return {
        bg: "from-sky-500/20 via-blue-500/10 to-slate-950",
        border: "border-sky-400/40 group-hover:border-sky-400",
        glow: "shadow-[0_0_20px_rgba(56,189,248,0.3)]",
        iconColor: "text-sky-400",
        monogram: "SC",
        Icon: Atom,
      };
    }
    if (cleanName.includes("math")) {
      return {
        bg: "from-lime-500/20 via-emerald-500/10 to-slate-950",
        border: "border-lime-400/40 group-hover:border-lime-400",
        glow: "shadow-[0_0_20px_rgba(163,230,53,0.3)]",
        iconColor: "text-lime-400",
        monogram: "MA",
        Icon: Calculator,
      };
    }
    if (cleanName.includes("gk") || cleanName.includes("general")) {
      return {
        bg: "from-blue-500/20 via-cyan-500/10 to-slate-950",
        border: "border-blue-400/40 group-hover:border-blue-400",
        glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
        iconColor: "text-blue-400",
        monogram: "GK",
        Icon: Globe,
      };
    }
    if (cleanName.includes("art")) {
      return {
        bg: "from-purple-500/20 via-fuchsia-500/10 to-slate-950",
        border: "border-purple-400/40 group-hover:border-purple-400",
        glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
        iconColor: "text-purple-400",
        monogram: "ART",
        Icon: Palette,
      };
    }
    if (cleanName.includes("sport")) {
      return {
        bg: "from-orange-500/20 via-amber-500/10 to-slate-950",
        border: "border-orange-400/40 group-hover:border-orange-400",
        glow: "shadow-[0_0_20px_rgba(249,115,22,0.3)]",
        iconColor: "text-orange-400",
        monogram: "SP",
        Icon: Activity,
      };
    }
    if (cleanName.includes("library")) {
      return {
        bg: "from-teal-500/20 via-emerald-500/10 to-slate-950",
        border: "border-teal-400/40 group-hover:border-teal-400",
        glow: "shadow-[0_0_20px_rgba(20,184,166,0.3)]",
        iconColor: "text-teal-400",
        monogram: "LIB",
        Icon: Book,
      };
    }
    if (cleanName.includes("publish") || cleanName.includes("bureau")) {
      return {
        bg: "from-violet-500/20 via-purple-500/10 to-slate-950",
        border: "border-violet-400/40 group-hover:border-violet-400",
        glow: "shadow-[0_0_20px_rgba(139,92,246,0.3)]",
        iconColor: "text-violet-400",
        monogram: "PUB",
        Icon: Printer,
      };
    }

    return {
      bg: "from-primary/20 via-slate-900 to-slate-950",
      border: "border-primary/40 group-hover:border-primary",
      glow: "shadow-[0_0_20px_rgba(14,165,164,0.3)]",
      iconColor: "text-primary",
      monogram: "IT",
      Icon: Sparkles,
    };
  };

  const config = getWingConfig();
  const IconComponent = config.Icon;

  return (
    <div
      className={`relative bg-gradient-to-br ${config.bg} border-2 ${config.border} ${config.glow} ${currentSize.container} flex items-center justify-center transition-all duration-500 group overflow-hidden shrink-0 ${className}`}
    >
      {/* Subtle Inner Lens Ring */}
      <div className="absolute inset-1 rounded-xl border border-white/10 pointer-events-none group-hover:scale-105 transition-transform duration-500" />

      {/* Vector Icon */}
      <IconComponent size={currentSize.iconSize} className={`${config.iconColor} transition-transform duration-500 group-hover:scale-110 relative z-10`} />

      {/* Monogram Badge Overlay */}
      <span
        className={`absolute bottom-1 right-1 font-black ${currentSize.monogram} ${config.iconColor} bg-slate-950/90 border border-white/10 px-1 py-0.2 rounded-md uppercase tracking-wider z-20 shadow-md`}
      >
        {config.monogram}
      </span>
    </div>
  );
};
