"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase/config";
import { Trash2, Image as ImageIcon, Calendar, Plus, FileText, Edit2, X, Sparkles } from "lucide-react";
import { MediaService, MediaItem } from "@/services/MediaService";
import { useToast } from "@/components/ui/Toast";

export default function MediaEventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"media" | "events">("media");

  // Media State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Photos");
  const [editDescription, setEditDescription] = useState("");

  // Events State
  const [events, setEvents] = useState<any[]>([
    {
      id: "evt-1",
      title: "ITQAN Annual Leadership Summit 2026",
      date: "August 25, 2026 at 10:00 AM",
      location: "Main Auditorium & Online Stream",
      description: "Bringing together all 32 members across 12 specialized wings for strategic planning.",
      status: "Published",
    },
    {
      id: "evt-2",
      title: "Innovation Hackathon 2026",
      date: "September 15, 2026 at 09:00 AM",
      location: "STEM & Tech Lab",
      description: "24-hour campus hackathon fostering technological innovation.",
      status: "Published",
    },
  ]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Event Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    status: "Published",
  });

  const fetchMedia = useCallback(async () => {
    setLoadingMedia(true);
    const items = await MediaService.fetchAllMedia();

    let jsonItems: MediaItem[] = [];
    try {
      const res = await fetch("/data/media.json");
      const json = await res.json();
      jsonItems = json.items || [];
    } catch (err) {
      console.error(err);
    }

    const combined = [...items, ...jsonItems];
    const uniqueMap = new Map<string, MediaItem>();
    combined.forEach((i) => uniqueMap.set(i.id, i));
    setMediaItems(Array.from(uniqueMap.values()));
    setLoadingMedia(false);
  }, []);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.events && Array.isArray(data.events) && data.events.length > 0) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Using local events dataset", err);
    }
    setLoadingEvents(false);
  };

  useEffect(() => {
    fetchMedia();
    fetchEvents();

    const handleMediaAdded = () => {
      fetchMedia();
    };

    window.addEventListener("itqan-media-added", handleMediaAdded);
    return () => window.removeEventListener("itqan-media-added", handleMediaAdded);
  }, [fetchMedia]);

  const handleDeleteMedia = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;
    const collectionName =
      item.category === "Magazines" || item.category === "Tabloids" || item.category === "Publications"
        ? "magazines"
        : item.category === "Videos"
        ? "videos"
        : "gallery";
    await MediaService.deleteUploadedItem(item.id, collectionName);
    setMediaItems((prev) => prev.filter((i) => i.id !== item.id));
    toast("Media Deleted", "Item removed from archive.", "info");
    fetchMedia();
  };

  const openEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category || "Photos");
    setEditDescription(item.description || "");
  };

  const handleSaveEditMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated: MediaItem = {
      ...editingItem,
      title: editTitle,
      category: editCategory,
      description: editDescription,
    };

    MediaService.updateUploadedItem(updated);
    setEditingItem(null);
    toast("Media Updated", `Updated details for "${editTitle}".`, "success");
    fetchMedia();
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast("Event Deleted", "Event removed from schedule.", "info");
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `evt-${Date.now()}`,
      ...newEvent,
    };
    setEvents((prev) => [created, ...prev]);
    setShowEventForm(false);
    setNewEvent({ title: "", date: "", location: "", description: "", status: "Published" });
    toast("Event Published", `"${created.title}" added to upcoming schedule.`, "success");
  };

  const galleryItems = mediaItems.filter(
    (i) => i.category === "Photos" || i.category === "Videos"
  );
  const publicationItems = mediaItems.filter(
    (i) => i.category !== "Photos" && i.category !== "Videos"
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between glass-card p-6 md:p-8 rounded-3xl border border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Media & Events</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage, edit, and publish public archive files and upcoming programs.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("media")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "media"
              ? "bg-primary text-slate-950 shadow-lg shadow-primary/20"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <ImageIcon size={18} /> Media Library ({mediaItems.length})
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "events"
              ? "bg-primary text-slate-950 shadow-lg shadow-primary/20"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Calendar size={18} /> Events Manager ({events.length})
        </button>
      </div>

      {/* Media Library Tab */}
      {activeTab === "media" && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Photo & Video Archive</h2>
          </div>

          {loadingMedia ? (
            <div className="text-gray-400 text-xs">Loading media archive...</div>
          ) : galleryItems.length === 0 ? (
            <div className="text-gray-400 text-xs italic p-8 text-center glass-card rounded-2xl border border-white/10">
              No gallery items uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="relative group glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-video bg-slate-900 flex items-center justify-center overflow-hidden relative">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <ImageIcon className="text-primary" size={32} />
                    )}
                    {item.id.startsWith("upload-") && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-slate-950 text-[9px] font-black uppercase">
                        New
                      </span>
                    )}
                  </div>
                  <div className="p-3 text-xs">
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.category}</p>
                  </div>
                  <div className="p-2 border-t border-white/5 flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-white/5 transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xl font-bold text-white mt-12 border-t border-white/10 pt-8">
            Magazines & Publications
          </h2>

          {loadingMedia ? (
            <div className="text-gray-400 text-xs">Loading publications...</div>
          ) : publicationItems.length === 0 ? (
            <div className="text-gray-400 text-xs italic p-8 text-center glass-card rounded-2xl border border-white/10">
              No publications uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {publicationItems.map((item) => (
                <div
                  key={item.id}
                  className="relative group glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-[3/4] bg-slate-900/60 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="object-cover w-full h-full" />
                    ) : (
                      <>
                        <FileText size={40} className="text-primary mb-2" />
                        <span className="text-[10px] text-gray-400 font-mono">DOCUMENT</span>
                      </>
                    )}
                  </div>
                  <div className="p-3 text-xs">
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.category}</p>
                  </div>
                  <div className="p-2 border-t border-white/5 flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-white/5 transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Media Modal */}
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
            <form onSubmit={handleSaveEditMedia} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1 uppercase tracking-wider">
                  Title / Caption
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Photos">Photos (Gallery)</option>
                  <option value="Videos">Videos</option>
                  <option value="Magazines">Magazines</option>
                  <option value="Tabloids">Tabloids</option>
                  <option value="Publications">Publications</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

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

      {/* Events Manager Tab */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Manage Events Schedule</h2>
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="bg-primary text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
            >
              <Plus size={16} /> {showEventForm ? "Cancel" : "Create Event"}
            </button>
          </div>

          {showEventForm && (
            <form
              onSubmit={handleCreateEvent}
              className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-4 text-xs"
            >
              <h3 className="text-lg font-bold text-white mb-2">New Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Event Title</label>
                  <input
                    required
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Date & Time</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. August 25, 2026 at 10:00 AM"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Location</label>
                  <input
                    required
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Status</label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:opacity-90 transition-opacity mt-2 cursor-pointer"
              >
                Save & Publish Event
              </button>
            </form>
          )}

          {loadingEvents ? (
            <div className="text-gray-400 text-xs">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-gray-500 italic p-8 text-center glass-card rounded-2xl border border-white/10 text-xs">
              No events found.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass-card rounded-2xl border border-white/10 text-xs space-y-4 md:space-y-0"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-base text-white">{event.title}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          event.status === "Published"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {event.date}
                      </span>
                      <span>•</span>
                      <span>{event.location}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed max-w-2xl">{event.description}</p>
                  </div>
                  <div className="md:ml-6 flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
