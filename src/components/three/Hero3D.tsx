"use client";
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { NetworkSphere } from './NetworkSphere';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export const Hero3D = () => {
  return (
    <div className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <NetworkSphere />
          </Suspense>
        </Canvas>
        
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_80%)] pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-6 pt-24 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            Building Future <br/>
            <span className="gradient-text">Leaders</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Through Knowledge, Creativity & Community. ITQAN Union is the premium digital campus designed for the next generation of innovators.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="primary">Explore Union</Button>
            <Button size="lg" variant="outline">Join Network</Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 flex flex-col items-center gap-2 text-sm uppercase tracking-widest z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span>Discover</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gray-500 to-transparent"></div>
      </motion.div>
    </div>
  );
};
