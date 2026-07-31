"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Video,
  FileText,
  BookOpen,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Edit2,
  Trash2,
  Download,
  Maximize2,
  Search,
  Play,
  Film,
  Upload,
  Eye,
  Filter,
} from "lucide-react";
import { MediaService, MediaItem } from "@/services/MediaService";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

const CATEGORY_OPTIONS = ["Photos", "Videos", "Magazines", "Tabloids", "Publications"];

export default function MediaArchive() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<{ categories: string[]; items: MediaItem[] } | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Photos");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);

  const isAdmin = !!user || role === "Administrator" || role === "Admin" || role === "Super Admin";

  const loadData = useCallback(async () => {
    const customAndFirebaseItems = await MediaService.fetchAllMedia();

    let jsonItems: MediaItem[] = [];
    try {
      const res = await fetch("/data/media.json");
      const json = await res.json();
      jsonItems = json.items || [];
    } catch (err) {
      console.error("Failed to load static media fallback", err);
    }

    const combined = [...customAndFirebaseItems, ...jsonItems];
    const uniqueMap = new Map<string, MediaItem>();
    combined.forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });

    const finalItems = Array.from(uniqueMap.values());
    const uniqueCategories = ["All", ...Array.from(new Set(finalItems.map((i) => i.category)))];

    setData({ categories: uniqueCategories, items: finalItems });
  }, []);

  useEffect(() => {
    loadData();

    const handleMediaAdded = () => {
      loadData();
    };

    window.addEventListener("itqan-media-added", handleMediaAdded);
    return () => window.removeEventListener("itqan-media-added", handleMediaAdded);
  }, [loadData]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    return data.items.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [data, activeCategory, searchQuery]);

  const featuredItem = useMemo(() => {
    if (!data || data.items.length === 0) return null;
    return data.items.find((i) => i.category === "Magazines" || i.category === "Videos") || data.items[0];
  }, [data]);

  const handleNext = useCallback(() => {
    if (selectedItemIndex !== null && filteredItems.length > 0) {
      setSelectedItemIndex((selectedItemIndex + 1) % filteredItems.length);
    }
  }, [selectedItemIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (selectedItemIndex !== null && filteredItems.length > 0) {
      setSelectedItemIndex((selectedItemIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  }, [selectedItemIndex, filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItemIndex === null) return;
      if (e.key === "Escape") setSelectedItemIndex(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItemIndex, handleNext, handlePrev]);

  const openEditModal = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category || "Photos");
    setEditDescription(item.description || "");
    setEditCoverFile(null);
    setEditPdfFile(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updatedThumbnail = editingItem.thumbnail;
    let updatedFileUrl = editingItem.fileUrl;

    if (editCoverFile && editCoverFile.type.startsWith("image/")) {
      updatedThumbnail = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || "");
        reader.readAsDataURL(editCoverFile);
      });
    }

    if (editPdfFile) {
      updatedFileUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || "");
        reader.readAsDataURL(editPdfFile);
      });
      if (editPdfFile.type.startsWith("image/") && !updatedThumbnail) {
        updatedThumbnail = updatedFileUrl;
      }
    }

    const updated: MediaItem = {
      ...editingItem,
      title: editTitle,
      category: editCategory,
      description: editDescription,
      thumbnail: updatedThumbnail,
      fileUrl: updatedFileUrl,
    };

    MediaService.updateUploadedItem(updated);
    setEditingItem(null);
    toast("Media Saved", `Updated details for "${editTitle}".`, "success");
    loadData();
  };

  const handleDeleteItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to remove this item from the media archive?")) return;

    MediaService.deleteUploadedItem(id);
    if (selectedItemIndex !== null) setSelectedItemIndex(null);
    toast("Item Removed", "Media item removed from archive.", "info");
    loadData();
  };

  if (!data) {
    return (
      <div className="container mx-auto px-6 pt-32 pb-12">
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
          <div className="h-12 w-64 bg-white/5 rounded-xl animate-pulse mx-auto" />
          <div className="h-6 w-96 bg-white/5 rounded-xl animate-pulse mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const getIcon = (category: string) => {
    switch (category) {
      case "Photos":
        return <ImageIcon size={18} />;
      case "Videos":
        return <Video size={18} />;
      case "Magazines":
        return <BookOpen size={18} />;
      case "Tabloids":
        return <Layers size={18} />;
      case "Publications":
        return <FileText size={18} />;
      default:
        return <ImageIcon size={18} />;
    }
  };

  const selectedItem = selectedItemIndex !== null ? filteredItems[selectedItemIndex] : null;
  const isSelectedPdf = selectedItem
    ? selectedItem.category === "Magazines" ||
      selectedItem.category === "Tabloids" ||
      selectedItem.category === "Publications" ||
      (selectedItem.fileUrl && (selectedItem.fileUrl.startsWith("data:application/pdf") || selectedItem.fileUrl.endsWith(".pdf")))
    : false;
  const isSelectedVideo = selectedItem
    ? selectedItem.category === "Videos" ||
      (selectedItem.fileUrl &&
        (selectedItem.fileUrl.startsWith("data:video") ||
          selectedItem.fileUrl.startsWith("blob:") ||
          selectedItem.fileUrl.endsWith(".mp4") ||
          selectedItem.fileUrl.endsWith(".webm") ||
          selectedItem.fileUrl.endsWith(".mov") ||
          selectedItem.fileUrl.includes("youtube.com") ||
          selectedItem.fileUrl.includes("vimeo.com")))
    : false;

  return (
    <div className="container mx-auto px-4 md:px-6 pt-28 md:pt-36 pb-24 scroll-mt-24">
      {/* Hero Spotlight Section */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-extrabold text-primary uppercase tracking-wider">
            <Sparkles size={14} /> Official Digital Archives & Publications
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            ITQAN <span className="gradient-text">Media Hub</span>
          </h1>
          <p className="text-sm md:text-base text-gray-300">
            Explore event photo galleries, annual magazine publications, summit video highlights, and academic archives.
          </p>
        </div>

        {/* Featured Spotlight Showcase Card */}
        {featuredItem && (
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/15 relative overflow-hidden group shadow-2xl shadow-black/50">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary text-slate-950 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Film size={12} /> Featured Release
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {new Date(featuredItem.date).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {featuredItem.title}
                </h2>

                <p className="text-xs md:text-sm text-gray-300 leading-relaxed line-clamp-3">
                  {featuredItem.description || "Official ITQAN publication featuring academic summits, student achievements, and wing reports."}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const idx = filteredItems.findIndex((i) => i.id === featuredItem.id);
                      setSelectedItemIndex(idx !== -1 ? idx : 0);
                    }}
                    className="px-6 py-3 rounded-xl bg-primary text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-2"
                  >
                    <Eye size={16} /> Preview Publication
                  </button>

                  {isAdmin && (
                    <Link
                      href="/portal/dashboard/media-events"
                      className="px-5 py-3 rounded-xl bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                      <Upload size={14} /> Upload New Media
                    </Link>
                  )}
                </div>
              </div>

              <div className="md:col-span-5 relative h-56 md:h-64 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-xl group-hover:border-primary/40 transition-colors">
                {featuredItem.thumbnail ? (
                  <img
                    src={featuredItem.thumbnail}
                    alt={featuredItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-slate-900 to-slate-950 text-primary p-6 text-center">
                    <BookOpen size={48} className="mb-2 animate-pulse" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">{featuredItem.title}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Search & Category Filter Controls */}
      <div className="max-w-6xl mx-auto mb-10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-white/10">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search publications, videos, photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {data.categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setSelectedItemIndex(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeCategory === category
                    ? "bg-primary text-slate-950 shadow-md shadow-primary/20"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {category !== "All" && getIcon(category)}
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Grid / Empty State */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No Media Found"
          description={`No media items matched "${searchQuery || activeCategory}".`}
          actionLabel="Reset Search & Filters"
          onAction={() => {
            setActiveCategory("All");
            setSearchQuery("");
          }}
        />
      ) : (
        <motion.div layout className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                key={item.id}
                onClick={() => setSelectedItemIndex(idx)}
                className="glass-card rounded-3xl overflow-hidden group cursor-pointer border border-white/10 hover:border-primary/50 transition-all flex flex-col h-full relative shadow-xl hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
              >
                {/* Admin Quick Action Controls */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    {item.id.startsWith("upload-") && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-lg">
                        <Sparkles size={11} /> New
                      </span>
                    )}
                    <button
                      onClick={(e) => openEditModal(item, e)}
                      className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-gray-200 hover:text-primary hover:bg-slate-900 border border-white/15 transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-gray-200 hover:text-red-400 hover:bg-slate-900 border border-white/15 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                <div className="relative h-56 bg-slate-950 overflow-hidden shrink-0">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 z-0"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-slate-900 to-slate-950 text-primary p-4 text-center">
                      <BookOpen size={40} className="mb-2 animate-bounce" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-white mb-1">{item.title}</span>
                      <span className="text-[10px] text-primary/80 uppercase font-mono">{item.category} Document</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent z-10" />

                  {/* Play icon overlay for videos */}
                  {item.category === "Videos" && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/90 text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play size={20} className="ml-1 fill-slate-950" />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                    <div className="p-2 bg-slate-950/80 backdrop-blur-md rounded-xl text-primary border border-white/10">
                      {getIcon(item.category)}
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-gray-200 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {item.description || "Official ITQAN media item."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10 pt-4">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {item.category === "Photos"
                        ? "View Photo \u2192"
                        : item.category === "Videos"
                        ? "Watch Video \u2192"
                        : "Read Document \u2192"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-md w-full border border-white/15 relative space-y-4">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-white">Edit Media Record</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1 uppercase tracking-wider">Title / Caption</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1 uppercase tracking-wider">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-primary font-semibold mb-1 uppercase tracking-wider">Replace Cover Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)}
                  className="w-full text-gray-400 text-xs cursor-pointer"
                />
              </div>

              {editCategory !== "Photos" && editCategory !== "Videos" && (
                <div>
                  <label className="block text-accent font-semibold mb-1 uppercase tracking-wider">Attach / Replace PDF File (Optional)</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setEditPdfFile(e.target.files?.[0] || null)}
                    className="w-full text-gray-400 text-xs cursor-pointer"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-primary text-slate-950 font-bold rounded-xl hover:opacity-90 transition-opacity mt-2 cursor-pointer"
              >
                Save Media Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Reader Preview Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedItemIndex(null)}
          >
            <div
              className="relative max-w-4xl w-full glass-card p-6 md:p-8 rounded-3xl border border-white/15 overflow-hidden flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItemIndex(null)}
                className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Close Lightbox"
              >
                <X size={20} />
              </button>

              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Previous Item"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Next Item"
              >
                <ChevronRight size={24} />
              </button>

              {/* Media Display Container */}
              <div className="relative w-full h-[380px] md:h-[480px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10">
                {isSelectedPdf ? (
                  selectedItem.fileUrl && (selectedItem.fileUrl.startsWith("data:application/pdf") || selectedItem.fileUrl.endsWith(".pdf")) ? (
                    <iframe
                      src={selectedItem.fileUrl}
                      className="w-full h-full border-0 rounded-2xl"
                      title={selectedItem.title}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center bg-gradient-to-br from-primary/15 via-slate-900 to-slate-950 w-full h-full">
                      <BookOpen size={56} className="text-primary animate-pulse" />
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{selectedItem.title}</h3>
                        <p className="text-xs text-gray-400">PDF Publication Document ({selectedItem.category})</p>
                      </div>

                      <a
                        href={selectedItem.fileUrl || "#"}
                        target={selectedItem.fileUrl ? "_blank" : "_self"}
                        rel="noreferrer"
                        onClick={(e) => {
                          if (!selectedItem.fileUrl) {
                            e.preventDefault();
                            openEditModal(selectedItem);
                            toast("Attach PDF Document", "Use the Edit form to attach a PDF document file to this record.", "info");
                          }
                        }}
                        className="px-6 py-3.5 rounded-xl bg-primary text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xl hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer z-50 shadow-primary/20"
                      >
                        <BookOpen size={18} /> Open & Read PDF Document <ExternalLink size={14} />
                      </a>
                    </div>
                  )
                ) : isSelectedVideo ? (
                  /* Interactive Video Player */
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950 p-2">
                    {selectedItem.fileUrl && (selectedItem.fileUrl.startsWith("data:video") || selectedItem.fileUrl.startsWith("blob:") || selectedItem.fileUrl.endsWith(".mp4") || selectedItem.fileUrl.endsWith(".webm") || selectedItem.fileUrl.endsWith(".mov")) ? (
                      <video
                        src={selectedItem.fileUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain rounded-xl"
                        poster={selectedItem.thumbnail || undefined}
                      />
                    ) : selectedItem.fileUrl && (selectedItem.fileUrl.includes("youtube.com") || selectedItem.fileUrl.includes("youtu.be") || selectedItem.fileUrl.includes("vimeo.com")) ? (
                      <iframe
                        src={selectedItem.fileUrl.replace("watch?v=", "embed/")}
                        className="w-full h-full border-0 rounded-xl"
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                        title={selectedItem.title}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center bg-gradient-to-br from-primary/15 via-slate-900 to-slate-950 w-full h-full rounded-xl">
                        <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-xl animate-pulse">
                          <Play size={32} className="ml-1" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{selectedItem.title}</h3>
                          <p className="text-xs text-gray-400">Video Content ({selectedItem.category})</p>
                        </div>
                        {selectedItem.fileUrl && (
                          <a
                            href={selectedItem.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-6 py-3 rounded-xl bg-primary text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                          >
                            Watch Video <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Clean High-Res Image / Photo Viewer
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950 p-2">
                    <img
                      src={selectedItem.thumbnail || selectedItem.fileUrl || "/logo.png"}
                      alt={selectedItem.title}
                      className="max-w-full max-h-full object-contain rounded-xl"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/logo.png";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Details & Actions */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {selectedItem.category}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs text-gray-400">
                      {new Date(selectedItem.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedItem.title}</h2>
                  <p className="text-xs text-gray-300 mt-1 max-w-xl">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openEditModal(selectedItem)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-semibold text-xs uppercase tracking-wider hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(selectedItem.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}

                  {isSelectedPdf ? (
                    <a
                      href={selectedItem.fileUrl || "#"}
                      target={selectedItem.fileUrl ? "_blank" : "_self"}
                      rel="noreferrer"
                      onClick={(e) => {
                        if (!selectedItem.fileUrl) {
                          e.preventDefault();
                          openEditModal(selectedItem);
                          toast("Attach PDF Document", "Use the Edit form to attach a PDF document file.", "info");
                        }
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20"
                    >
                      <BookOpen size={14} /> Read PDF Document <ExternalLink size={14} />
                    </a>
                  ) : (
                    <a
                      href={selectedItem.thumbnail || selectedItem.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20"
                    >
                      <Maximize2 size={14} /> View Full Image <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
