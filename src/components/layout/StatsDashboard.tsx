"use client";
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const AnimatedCounter = ({ value, label }: { value: number, label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const stepTime = Math.abs(Math.floor(duration / value));
      
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === value) clearInterval(timer);
      }, stepTime === 0 ? 1 : stepTime);
      
      return () => clearInterval(timer);
    }
  }, [value, isInView]);

  return (
    <div ref={ref} className="text-center p-3 sm:p-6 border-r last:border-0 border-white/5">
      <div className="text-2xl sm:text-4xl md:text-5xl font-bold mb-1 tracking-tighter text-white">
        {count}<span className="text-accent">+</span>
      </div>
      <div className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 font-bold">{label}</div>
    </div>
  );
};

export const StatsDashboard = () => {
  return (
    <div className="relative -mt-10 z-20 container mx-auto px-4 sm:px-6">
      <div className="glass rounded-2xl p-2 md:p-4 shadow-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-white/5">
          <AnimatedCounter value={450} label="Programs" />
          <AnimatedCounter value={100} label="Publications" />
          <AnimatedCounter value={32} label="Members" />
          <AnimatedCounter value={35} label="Teams" />
        </div>
      </div>
    </div>
  );
};
