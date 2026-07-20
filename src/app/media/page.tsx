"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Video, FileText, BookOpen, Layers } from "lucide-react";

interface MediaItem {
  id: string;
  title: string;
  category: string;
  date: string;
  thumbnail: string;
  description: string;
  fileSize?: string;
  pages?: number;
  duration?: string;
  count?: number;
}

interface MediaData {
  categories: string[];
  items: MediaItem[];
}

export default function MediaArchive() {
  const [data, setData] = useState<MediaData | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("/data/media.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load media", err));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredItems = data.items.filter(
    (item) => activeCategory === "All" || item.category === activeCategory
  );

  const getIcon = (category: string) => {
    switch (category) {
      case "Photos": return <Image className="w-5 h-5" />;
      case "Videos": return <Video className="w-5 h-5" />;
      case "Magazines": return <BookOpen className="w-5 h-5" />;
      case "Tabloids": return <Layers className="w-5 h-5" />;
      case "Publications": return <FileText className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          ITQAN <span className="text-accent">Media Archive</span>
        </h1>
        <p className="text-xl text-gray-400">
          Explore our collection of magazines, event photos, cinematic videos, and organizational publications.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        {data.categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === category
                ? "bg-accent text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                : "glass text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={item.id}
              className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-accent/50 transition-colors"
            >
              <div className="relative h-48 bg-gray-800/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                {/* Fallback image style since actual images might not exist */}
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-accent/20 group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                  <div className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-accent">
                    {getIcon(item.category)}
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-4">
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-3">
                    {item.pages && <span>{item.pages} Pages</span>}
                    {item.duration && <span>{item.duration}</span>}
                    {item.count && <span>{item.count} Items</span>}
                    {item.fileSize && <span>{item.fileSize}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
