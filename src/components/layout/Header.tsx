"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X } from "lucide-react";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const triggerCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("toggle-command-palette"));
  };

  const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Wings", href: "/#wings" },
    { name: "Events", href: "/#events" },
    { name: "Achievements", href: "/achievements" },
    { name: "Media", href: "/media" },
    { name: "Team", href: "/team" },
    { name: "Portal", href: "/portal" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-center">
        <div
          className={`flex items-center justify-between w-full max-w-5xl rounded-full px-5 py-2.5 transition-all duration-300 ${
            scrolled ? "glass shadow-2xl shadow-black/40 border border-white/10" : "bg-transparent"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="ITQAN Logo"
              width={34}
              height={34}
              className="object-contain"
              unoptimized
            />
            <span className="font-bold text-base hidden sm:block tracking-wider group-hover:text-primary transition-colors">
              ITQAN
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs uppercase tracking-widest font-semibold transition-colors relative py-1 ${
                    isActive ? "text-primary" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={triggerCommandPalette}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors border border-white/10"
              aria-label="Open Command Palette"
            >
              <Search size={14} className="text-primary" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-flex bg-black/40 px-1.5 py-0.5 rounded text-[10px] text-gray-400 font-mono border border-white/10">
                Ctrl K
              </kbd>
            </button>

            <button
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 p-4 md:hidden"
          >
            <div className="glass-card rounded-2xl p-4 flex flex-col gap-2 border border-white/10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold tracking-wide p-3 rounded-xl hover:bg-white/10 transition-colors text-gray-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
