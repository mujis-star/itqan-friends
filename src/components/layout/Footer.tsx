import React from 'react';
import Link from 'next/link';
import { Globe, MessageCircle, Mail, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black pt-24 pb-12 border-t border-white/5 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Col */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tight">ITQAN UNION</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              A premium digital campus and leadership network empowering the next generation of creators, thinkers, and makers.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors border border-white/10">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors border border-white/10">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors border border-white/10">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="#about" className="text-gray-400 hover:text-accent transition-colors">The Experience</Link></li>
              <li><Link href="#events" className="text-gray-400 hover:text-accent transition-colors">Upcoming Missions</Link></li>
              <li><Link href="#wings" className="text-gray-400 hover:text-accent transition-colors">Ecosystem Wings</Link></li>
              <li><Link href="#timeline" className="text-gray-400 hover:text-accent transition-colors">Achievements</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="/media" className="text-gray-400 hover:text-accent transition-colors">Media Archive</Link></li>
              <li><Link href="/media/magazines" className="text-gray-400 hover:text-accent transition-colors">Publications</Link></li>
              <li><Link href="/guidelines" className="text-gray-400 hover:text-accent transition-colors">Brand Guidelines</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-accent transition-colors">Union FAQ</Link></li>
            </ul>
          </div>

          {/* Portal & Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Portal</h4>
            <ul className="space-y-4 mb-8">
              <li>
                <Link href="/portal/login" className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors group">
                  Member Login
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/portal/register" className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors group">
                  Join Network
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <h5 className="text-sm font-semibold mb-2">Subscribe to Newsletter</h5>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-accent" />
                <button className="bg-white text-black px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200">Go</button>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} ITQAN Friends. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
