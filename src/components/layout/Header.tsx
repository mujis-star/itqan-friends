"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, ArrowRight, Bell } from "lucide-react";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);

    const loadSettings = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("itqan_site_settings");
        if (saved) {
          try {
            setSiteSettings(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    loadSettings();

    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) setSiteSettings(customEvent.detail);
      else loadSettings();
    };

    window.addEventListener("itqan-settings-updated", handleSettingsUpdated);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("itqan-settings-updated", handleSettingsUpdated);
    };
  }, []);

  // Hide the global website header when inside the portal dashboard to prevent header overlap
  if (pathname?.startsWith("/portal/dashboard")) {
    return null;
  }

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

  const showBanner = siteSettings?.showAnnouncement ?? true;
  const bannerText = siteSettings?.announcementText || "Welcome to ITQAN 2026 Academic Summit & Media Archive!";
  const bannerLink = siteSettings?.announcementLink || "/media";
  const siteTitle = siteSettings?.siteTitle || "ITQAN";

  return (
    <>
      {/* Super Admin Top Announcement Broadcast Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-amber-500/20 via-primary/20 to-amber-500/20 border-b border-primary/20 text-white py-2 text-center text-xs font-bold relative z-[60] flex items-center justify-center gap-2 px-4">
          <Bell size={13} className="text-amber-400 animate-pulse shrink-0" />
          <span className="truncate">{bannerText}</span>
          <Link href={bannerLink} className="underline text-amber-400 hover:text-white transition-colors shrink-0 flex items-center gap-1">
            Explore <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          showBanner ? "top-8" : "top-0"
        } ${scrolled ? "py-3" : "py-5"}`}
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
              <span className="font-extrabold text-lg text-white tracking-wide group-hover:text-primary transition-colors">
                {siteTitle.split(" ")[0]} <span className="text-primary">{siteTitle.split(" ").slice(1).join(" ") || "UNION"}</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 glass px-4 py-1.5 rounded-full border border-white/10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs font-medium text-gray-300 hover:text-primary px-3 py-1.5 rounded-full transition-colors hover:bg-white/5"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Quick Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={triggerCommandPalette}
                className="p-2 rounded-full text-gray-300 hover:text-primary hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Search Command Palette"
                title="Search Command Palette (Ctrl+K)"
              >
                <Search size={18} />
              </button>

              <Link
                href="/portal"
                className="px-4 py-2 rounded-full bg-primary text-slate-950 font-extrabold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Command Center
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={triggerCommandPalette}
                className="p-2 rounded-full text-gray-300 hover:text-white"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full text-gray-300 hover:text-white"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-b border-white/10 mt-3 px-6 py-6 space-y-4"
            >
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold text-gray-200 hover:text-primary py-2 border-b border-white/5"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  href="/portal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 text-center py-3 rounded-xl bg-primary text-slate-950 font-extrabold text-xs tracking-wider uppercase"
                >
                  Command Center
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
