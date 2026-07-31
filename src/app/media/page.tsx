"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { MediaService, MediaItem } from "@/services/MediaService";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

interface MediaData {
  categories: string[];
  items: MediaItem[];
}

const CATEGORY_OPTIONS = ["Photos", "Videos", "Magazines", "Tabloids", "Publications"];

export default function MediaArchive() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<MediaData | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Photos");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);

  const isAdmin = !!user || role === "Administrator" || role === "Admin";

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

  const filteredItems = data
    ? data.items.filter(
        (item) => activeCategory === "All" || item.category === activeCategory
      )
    : [];

  const handleNext = useCallback(() => {
    if (selectedItemIndex !== null && filteredItems.length > 0) {
      setSelectedItemIndex((selectedItemIndex + 1) % filteredItems.length);
    }
  }, [selectedItemIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (selectedItemIndex !== null && filteredItems.length > 0) {
      setSelectedItemIndex(
        (selectedItemIndex - 1 + filteredItems.length) % filteredItems.length
      );
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
      case "Photos": return <ImageIcon size={18} />;
      case "Videos": return <Video size={18} />;
      case "Magazines": return <BookOpen size={18} />;
      case "Tabloids": return <Layers size={18} />;
      case "Publications": return <FileText size={18} />;
      default: return <ImageIcon size={18} />;
    }
  };

  const selectedItem = selectedItemIndex !== null ? filteredItems[selectedItemIndex] : null;
  const isSelectedPdf = selectedItem
    ? selectedItem.category === "Magazines" ||
      selectedItem.category === "Tabloids" ||
      selectedItem.category === "Publications" ||
      (selectedItem.fileUrl && (selectedItem.fileUrl.startsWith("data:application/pdf") || selectedItem.fileUrl.endsWith(".pdf")))
    : false;

  return (
    <div className="container mx-auto px-6 pt-32 pb-24 scroll-mt-24">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-white">
          ITQAN <span className="gradient-text">Media Archive</span>
        </h1>
        <p className="text-lg text-gray-300">
          Explore our collection of event photography, publications, cinematic videos, and organizational archives.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        {data.categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setSelectedItemIndex(null);
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === category
                ? "bg-primary text-slate-950 shadow-lg shadow-primary/20"
                : "glass text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Media Grid / Empty State */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No Media Found"
          description={`No media items currently available in category "${activeCategory}".`}
          actionLabel="Reset Category"
          onAction={() => setActiveCategory("All")}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-primary/40 transition-colors flex flex-col h-full relative"
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

                <div className="relative h-52 bg-slate-900 overflow-hidden shrink-0">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/15 via-slate-900 to-slate-950 text-primary p-4 text-center">
                      <BookOpen size={36} className="mb-2" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">{item.title}</span>
                      <span className="text-[9px] text-gray-500 uppercase mt-0.5 font-mono">{item.category} Document</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />

                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                    <div className="p-2 bg-slate-950/80 backdrop-blur-md rounded-lg text-primary border border-white/10">
                      {getIcon(item.category)}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-gray-200 uppercase tracking-wider">
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
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/5 pt-4">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    <span className="text-primary font-semibold">
                      {item.category === "Photos" ? "View Image \u2192" : item.category === "Videos" ? "Watch Video \u2192" : "Read Document \u2192"}
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
                <label className="block text-primary font-semibold mb-1 uppercase tracking-wider">Replace Image / Thumbnail (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)}
                  className="w-full text-gray-400 text-xs cursor-pointer"
                />
              </div>

              {editCategory !== "Photos" && editCategory !== "Videos" && (
                <div>
                  <label className="block text-accent font-semibold mb-1 uppercase tracking-wider">Attach / Replace PDF Document File (Optional)</label>
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

      {/* Lightbox Modal */}
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
                ) : (
                  // Clean High-Res Image / Photo Viewer (NO PDF Overlay)
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950 p-2">
                    <img
                      src={selectedItem.thumbnail || selectedItem.fileUrl}
                      alt={selectedItem.title}
                      className="max-w-full max-h-full object-contain rounded-xl"
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
