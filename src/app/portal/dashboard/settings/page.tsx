"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Sliders,
  ShieldCheck,
  Palette,
  Bell,
  Globe,
  AlertTriangle,
  Save,
  RefreshCw,
  Layout,
  Eye,
  Phone,
  Mail,
  Share2,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface SiteSettings {
  // Branding & Header
  siteTitle: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroCtaText: string;
  navStyle: "glass" | "solid" | "floating";
  showSearchBar: boolean;

  // Announcement Banner
  showAnnouncement: boolean;
  announcementText: string;
  announcementLink: string;

  // Color Theme & Appearance
  themePreset: "gold" | "cyan" | "purple" | "emerald" | "amber";
  accentGlow: "gold" | "emerald" | "cyan" | "violet";

  // Section Toggles
  showHero: boolean;
  showWingsSection: boolean;
  showTeamSection: boolean;
  showMediaArchive: boolean;
  showStatsCounter: boolean;

  // Footer & Contact
  contactEmail: string;
  contactPhone: string;
  footerText: string;
  instagramUrl: string;
  youtubeUrl: string;
  telegramUrl: string;

  // Security & Maintenance
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowSelfRegistration: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: "ITQAN Union Platform",
  heroHeadline: "Excellence, Innovation & Student Leadership",
  heroSubtitle: "Empowering 32 union members across 12 specialized academic and media wings.",
  heroCtaText: "Explore Ecosystem",
  navStyle: "glass",
  showSearchBar: true,

  showAnnouncement: true,
  announcementText: "Welcome to ITQAN 2026 Academic Summit & Media Archive!",
  announcementLink: "/media",

  themePreset: "gold",
  accentGlow: "gold",

  showHero: true,
  showWingsSection: true,
  showTeamSection: true,
  showMediaArchive: true,
  showStatsCounter: true,

  contactEmail: "admin@itqan.org",
  contactPhone: "+91 98765 43210",
  footerText: "© 2026 ITQAN Union. Empowering Student Excellence.",
  instagramUrl: "https://instagram.com/itqan",
  youtubeUrl: "https://youtube.com/itqan",
  telegramUrl: "https://t.me/itqan",

  maintenanceMode: false,
  maintenanceMessage: "ITQAN Portal is undergoing scheduled maintenance. Please check back shortly.",
  allowSelfRegistration: true,
};

export default function SuperAdminSettingsPage() {
  const { role } = useAuth();
  const { toast } = useToast();

  const isSuperAdmin = role === "Super Admin";
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<"general" | "hero" | "sections" | "theme" | "footer" | "system">("general");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("itqan_site_settings");
      if (saved) {
        try {
          setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("itqan_site_settings", JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent("itqan-settings-updated", { detail: settings }));
    }
    toast("Site Configuration Saved", "All website customizations apply globally across the platform.", "success");
  };

  const handleResetDefaults = () => {
    if (!confirm("Are you sure you want to reset all site customizations to default?")) return;
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== "undefined") {
      localStorage.setItem("itqan_site_settings", JSON.stringify(DEFAULT_SETTINGS));
      window.dispatchEvent(new CustomEvent("itqan-settings-updated", { detail: DEFAULT_SETTINGS }));
    }
    toast("Settings Reset", "Restored default website parameters.", "info");
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white">Super Admin Privilege Required</h1>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Website Customizer and System Controls are strictly reserved for Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-card p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-extrabold text-amber-400 uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> Super Admin Control Suite
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Website Customizer & Site Settings
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Customize site branding, hero copy, theme colors, section toggles, footer links, and system security controls.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="mt-4 sm:mt-0 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition-all font-bold text-xs flex items-center gap-2 cursor-pointer relative z-10"
        >
          <RefreshCw size={14} /> Reset Defaults
        </button>
      </div>

      {/* Settings Category Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-950 p-2 rounded-2xl border border-white/10">
        {[
          { id: "general", label: "Branding & Nav", icon: <Globe size={14} /> },
          { id: "hero", label: "Hero Copy", icon: <Sparkles size={14} /> },
          { id: "sections", label: "Page Sections", icon: <Layout size={14} /> },
          { id: "theme", label: "Theme & Glows", icon: <Palette size={14} /> },
          { id: "footer", label: "Footer & Socials", icon: <Share2 size={14} /> },
          { id: "system", label: "System Security", icon: <Lock size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* TAB 1: BRANDING & NAVIGATION */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe size={18} className="text-primary" /> Platform Title & Header Navigation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Website Main Title</label>
                  <input
                    type="text"
                    required
                    value={settings.siteTitle}
                    onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Header Style</label>
                  <select
                    value={settings.navStyle}
                    onChange={(e) => setSettings({ ...settings, navStyle: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="glass">Glassmorphism Dark (Recommended)</option>
                    <option value="solid">Solid Dark Slate</option>
                    <option value="floating">Floating Modern Pill</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Top Announcement Banner */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell size={18} className="text-amber-400" /> Announcement Banner Broadcast
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Top alert banner shown on all pages for major announcements.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showAnnouncement}
                    onChange={(e) => setSettings({ ...settings, showAnnouncement: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Banner Broadcast Text</label>
                  <input
                    type="text"
                    value={settings.announcementText}
                    onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Target Link URL</label>
                  <input
                    type="text"
                    value={settings.announcementLink}
                    onChange={(e) => setSettings({ ...settings, announcementLink: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HERO COPY CUSTOMIZER */}
        {activeTab === "hero" && (
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" /> Homepage Hero Copy & Call To Action
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Main Hero Headline</label>
                <input
                  type="text"
                  required
                  value={settings.heroHeadline}
                  onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Subtitle Description</label>
                <textarea
                  rows={3}
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-primary font-semibold mb-2 uppercase tracking-wider">Primary Call-To-Action Button Text</label>
                <input
                  type="text"
                  value={settings.heroCtaText}
                  onChange={(e) => setSettings({ ...settings, heroCtaText: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAGE SECTIONS VISIBILITY */}
        {activeTab === "sections" && (
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layout size={18} className="text-primary" /> Homepage Section Visibility Toggles
            </h2>
            <p className="text-xs text-gray-400">Show or hide specific sections on the public homepage.</p>

            <div className="space-y-4 text-xs pt-2">
              {[
                { key: "showHero", label: "Hero Banner & Introduction Section" },
                { key: "showWingsSection", label: "12 Ecosystem Wings Grid (/#wings)" },
                { key: "showTeamSection", label: "Executive Leadership & Team Section (/team)" },
                { key: "showMediaArchive", label: "Digital Media & Publications Archive (/media)" },
                { key: "showStatsCounter", label: "Live Impact Stats Counter (32 Members, 12 Wings)" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-slate-950/60 rounded-2xl border border-white/5"
                >
                  <span className="font-semibold text-gray-200">{item.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(settings as any)[item.key]}
                      onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: THEME & COLOR ACCENTS */}
        {activeTab === "theme" && (
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Palette size={18} className="text-purple-400" /> Site Color Presets & Background Glows
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">Color Theme Palette</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  {[
                    { id: "gold", name: "Gold / Amber", color: "from-amber-400 to-yellow-500" },
                    { id: "cyan", name: "Cyber Cyan", color: "from-cyan-400 to-blue-500" },
                    { id: "purple", name: "Royal Purple", color: "from-purple-400 to-pink-500" },
                    { id: "emerald", name: "Emerald Tech", color: "from-emerald-400 to-teal-500" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, themePreset: t.id as any })}
                      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        settings.themePreset === t.id
                          ? "bg-white/10 border-amber-400 text-white shadow-lg shadow-amber-400/20 scale-105"
                          : "bg-slate-950/60 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${t.color} mx-auto mb-2`} />
                      <span className="font-bold block">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">Background Radial Glow Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  {[
                    { id: "gold", name: "Warm Gold" },
                    { id: "emerald", name: "Emerald Glow" },
                    { id: "cyan", name: "Cyan Electric" },
                    { id: "violet", name: "Deep Violet" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, accentGlow: g.id as any })}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                        settings.accentGlow === g.id
                          ? "bg-amber-400/20 border-amber-400 text-amber-300"
                          : "bg-slate-950/60 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FOOTER & SOCIALS */}
        {activeTab === "footer" && (
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Share2 size={18} className="text-primary" /> Footer Copyright & Social Channels
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Contact Phone</label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Instagram URL</label>
                <input
                  type="text"
                  value={settings.instagramUrl}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">YouTube URL</label>
                <input
                  type="text"
                  value={settings.youtubeUrl}
                  onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Telegram URL</label>
                <input
                  type="text"
                  value={settings.telegramUrl}
                  onChange={(e) => setSettings({ ...settings, telegramUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">Footer Copyright Notice</label>
                <input
                  type="text"
                  value={settings.footerText}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SYSTEM SECURITY & MAINTENANCE */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock size={18} className="text-red-400" /> Platform Maintenance Mode
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Toggle maintenance mode to restrict public site access during upgrades.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>

              {settings.maintenanceMode && (
                <div className="text-xs space-y-2">
                  <label className="block text-red-400 font-semibold uppercase tracking-wider">Maintenance Message Broadcast</label>
                  <textarea
                    rows={2}
                    value={settings.maintenanceMessage}
                    onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                    className="w-full bg-slate-950 border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400"
                  />
                </div>
              )}
            </div>

            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Member Self-Registration</h3>
                <p className="text-xs text-gray-400">Allow new students to request account access via sign-up page.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowSelfRegistration}
                  onChange={(e) => setSettings({ ...settings, allowSelfRegistration: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-400"></div>
              </label>
            </div>
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-amber-400/20 flex items-center gap-2"
          >
            <Save size={16} /> Save All Website Settings
          </button>
        </div>
      </form>
    </div>
  );
}
