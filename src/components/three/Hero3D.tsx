"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { NetworkSphere } from "./NetworkSphere";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export const Hero3D = () => {
  return (
    <div className="relative w-full h-[90vh] min-h-[620px] max-h-[900px] flex items-center justify-center overflow-hidden pt-12">
      {/* Ambient Light Beam Glow Overlays */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-primary/15 via-accent/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0 opacity-70">
        <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
          <Suspense fallback={null}>
            <NetworkSphere />
          </Suspense>
        </Canvas>

        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,var(--background)_85%)] pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Subtitle Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-primary shadow-lg"
          >
            <Sparkles size={14} className="text-accent animate-pulse" />
            <span>Digital Campus & Leadership Network</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.1]">
            Building Future <br />
            <span className="gradient-text">Leaders & Innovators</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Empowering students through knowledge, creativity, and collaborative community. ITQAN Union is the ecosystem for tomorrow&apos;s pioneers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="#events">
              <Button size="lg" variant="primary" magnetic className="gap-2 group">
                Explore Events
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/portal/register">
              <Button size="lg" variant="outline" magnetic>
                Join Network
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 flex flex-col items-center gap-2 text-xs uppercase tracking-widest z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <span>Scroll to explore</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-primary to-transparent animate-pulse" />
      </motion.div>
    </div>
  );
};
