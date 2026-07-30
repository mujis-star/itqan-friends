"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Video, FileText, BookOpen, Layers, X, ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import { MediaService, MediaItem } from "@/services/MediaService";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface MediaData {
  categories: string[];
  items: MediaItem[];
}

export default function MediaArchive() {
  const [data, setData] = useState<MediaData | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const firebaseItems = await MediaService.fetchAllMedia();

      if (firebaseItems.length > 0) {
        const uniqueCategories = ["All", ...Array.from(new Set(firebaseItems.map((i) => i.category)))];
        setData({ categories: uniqueCategories, items: firebaseItems });
      } else {
        try {
          const res = await fetch("/data/media.json");
          const json = await res.json();
          setData(json);
        } catch (err) {
          console.error("Failed to load fallback media", err);
        }
      }
    };

    loadData();
  }, []);

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
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-primary/40 transition-colors flex flex-col h-full"
              >
                <div className="relative h-52 bg-slate-900 overflow-hidden shrink-0">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
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
                    <span className="text-primary font-semibold">Click to expand &rarr;</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
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
              {/* Close Button */}
              <button
                onClick={() => setSelectedItemIndex(null)}
                className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Close Lightbox"
              >
                <X size={20} />
              </button>

              {/* Navigation Arrows */}
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

              {/* Media Display */}
              <div className="relative w-full h-[380px] md:h-[480px] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10">
                {selectedItem.thumbnail ? (
                  <img
                    src={selectedItem.thumbnail}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-500 flex flex-col items-center gap-2">
                    {getIcon(selectedItem.category)}
                    <span className="text-sm">Preview placeholder</span>
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

                {selectedItem.fileUrl && (
                  <a
                    href={selectedItem.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0"
                  >
                    Open Source File <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
