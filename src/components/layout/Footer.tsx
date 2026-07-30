"use client";
import React from "react";
import Link from "next/link";
import { MessageSquare, Send, Globe, Mail, ArrowUp, ArrowUpRight } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-slate-950 pt-20 pb-12 border-t border-white/5 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tight text-white">ITQAN UNION</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              A premium digital campus and leadership network empowering the next generation of creators, thinkers, and innovators.
            </p>

            <div className="flex gap-3 pt-2">
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:bg-emerald-500 hover:text-slate-950 transition-all border border-white/10"
                aria-label="WhatsApp Community"
              >
                <MessageSquare size={18} />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:bg-sky-500 hover:text-white transition-all border border-white/10"
                aria-label="Telegram"
              >
                <Send size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:bg-pink-600 hover:text-white transition-all border border-white/10"
                aria-label="Website"
              >
                <Globe size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:bg-primary hover:text-slate-950 transition-all border border-white/10"
                aria-label="Contact Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/#about" className="text-gray-400 hover:text-primary transition-colors">
                  The Experience
                </Link>
              </li>
              <li>
                <Link href="/#events" className="text-gray-400 hover:text-primary transition-colors">
                  Upcoming Missions
                </Link>
              </li>
              <li>
                <Link href="/#wings" className="text-gray-400 hover:text-primary transition-colors">
                  Ecosystem Wings
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="text-gray-400 hover:text-primary transition-colors">
                  Achievements
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Media */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Community</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/team" className="text-gray-400 hover:text-primary transition-colors">
                  Leadership Committee
                </Link>
              </li>
              <li>
                <Link href="/media" className="text-gray-400 hover:text-primary transition-colors">
                  Media Gallery
                </Link>
              </li>
              <li>
                <Link href="/portal" className="text-gray-400 hover:text-primary transition-colors">
                  Member Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Join Us</h4>
            <p className="text-sm text-gray-400 mb-4">
              Get active updates and announcements directly through our official WhatsApp Community.
            </p>
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-xs uppercase tracking-wider hover:bg-emerald-500/20 transition-all group"
            >
              Join WhatsApp Community
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {currentYear} ITQAN Friends Union. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span>Built for Innovators</span>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Scroll to top"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
