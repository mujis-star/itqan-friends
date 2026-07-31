"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { NetworkSphere } from "./NetworkSphere";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";

export const Hero3D = () => {
  return (
    <div className="relative w-full min-h-[85svh] sm:min-h-[90vh] max-h-[760px] pt-28 sm:pt-36 md:pt-40 pb-16 flex items-start sm:items-center justify-center overflow-hidden">
      {/* Ambient Light Beam Glow Overlays */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] h-[350px] bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-[120px] rounded-full pointer-events-none" />

      {/* 3D Canvas Background (Full 100% Width & Height) */}
      <div className="absolute inset-0 z-0 opacity-70 w-full h-full">
        <Canvas camera={{ position: [0, 0, 9], fov: 45 }} style={{ width: "100%", height: "100%" }}>
          <Suspense fallback={null}>
            <NetworkSphere />
          </Suspense>
        </Canvas>

        {/* Smooth Linear Gradient Fade (No Dark Side Vignettes) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950 pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto space-y-4 sm:space-y-6"
        >
          {/* Subtitle Badge - Positioned below Header with generous clearance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/15 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary shadow-xl backdrop-blur-md max-w-[95%]"
          >
            <Sparkles size={12} className="text-accent animate-pulse shrink-0" />
            <span className="truncate">Digital Campus & Leadership Network</span>
          </motion.div>

          <h1 className="fluid-hero-title font-extrabold tracking-tight text-white">
            Building Future <br className="hidden sm:inline" />
            <span className="gradient-text">Leaders & Innovators</span>
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal px-2">
            Empowering students through knowledge, creativity, and collaborative community. ITQAN Union is the ecosystem for tomorrow&apos;s pioneers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 pt-2 sm:pt-4 max-w-xs sm:max-w-none mx-auto">
            <Link href="#events" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-[48px] sm:h-[56px] px-6 sm:px-8 rounded-full bg-primary text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group">
                <span>Explore Events</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <Link href="/portal/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-[44px] sm:h-[56px] px-6 sm:px-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer">
                Join Network
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bouncing Chevron Scroll Cue */}
      <motion.a
        href="#events"
        className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 text-gray-400 hover:text-primary flex flex-col items-center gap-1 z-10 transition-colors cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        aria-label="Scroll to next section"
      >
        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-bounce">
          <ChevronDown size={16} />
        </div>
      </motion.a>
    </div>
  );
};
