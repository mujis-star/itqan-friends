"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export const LoadingScreen = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on first visit per session/browser
    const hasVisited = localStorage.getItem("itqan_visited");
    if (!hasVisited) {
      setShow(true);
      localStorage.setItem("itqan_visited", "true");
      
      const timer = setTimeout(() => {
        setShow(false);
      }, 1100); // Fast 1.1 second max transition

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
          className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative w-16 h-16">
              <Image
                src="/logo.png"
                alt="ITQAN Logo"
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xl font-black tracking-widest text-white">ITQAN UNION</span>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                Building Future Leaders
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
