"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase/config";
import { Trash2, Image as ImageIcon, Calendar, Plus, FileText } from "lucide-react";

export default function MediaEventsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"media" | "events">("media");
  
  // Media State
  const [gallery, setGallery] = useState<any[]>([]);
  const [magazines, setMagazines] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);

  // Events State
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Event Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    status: "Published"
  });

  useEffect(() => {
    fetchMedia();
    fetchEvents();
  }, []);

  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (data.success) {
        setGallery(data.gallery || []);
        setMagazines(data.magazines || []);
      }
    } catch (err) {
      console.error("Failed to fetch media", err);
    }
    setLoadingMedia(false);
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
    setLoadingEvents(false);
  };

  const handleDeleteMedia = async (id: string, collection: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      const res = await fetch(`/api/media/${id}?collection=${collection}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (res.ok) {
        fetchMedia(); // Refresh list
      } else {
        alert("Failed to delete media.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (res.ok) {
        fetchEvents();
      } else {
        alert("Failed to delete event.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}` 
        },
        body: JSON.stringify(newEvent)
      });
      
      if (res.ok) {
        setShowEventForm(false);
        setNewEvent({ title: "", date: "", location: "", description: "", status: "Published" });
        fetchEvents();
      } else {
        alert("Failed to create event.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between bg-black/30 p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Media & Events</h1>
          <p className="text-gray-400 text-sm">Manage public archive files and upcoming programs.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab("media")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === "media" ? "bg-accent/20 text-accent" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
        >
          <ImageIcon size={18} /> Media Library
        </button>
        <button 
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === "events" ? "bg-accent/20 text-accent" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
        >
          <Calendar size={18} /> Events Manager
        </button>
      </div>

      {/* Media Library Tab */}
      {activeTab === "media" && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Photo & Video Archive</h2>
          </div>
          {loadingMedia ? (
            <div className="text-gray-400">Loading media...</div>
          ) : gallery.length === 0 ? (
            <div className="text-gray-500 italic p-8 text-center bg-white/5 rounded-2xl border border-white/10">No gallery items uploaded yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map(item => (
                <div key={item.id} className="relative group bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {/* Just displaying the URL if it's an image, or a placeholder if it's a PDF */}
                    <img src={item.imageUrl} alt={item.caption} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold truncate">{item.caption}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteMedia(item.id, item.collection)}
                    className="absolute top-2 right-2 bg-red-500/80 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xl font-bold mt-12 border-t border-white/10 pt-8">Magazines & Publications</h2>
          {loadingMedia ? (
            <div className="text-gray-400">Loading publications...</div>
          ) : magazines.length === 0 ? (
            <div className="text-gray-500 italic p-8 text-center bg-white/5 rounded-2xl border border-white/10">No magazines uploaded yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazines.map(item => (
                <div key={item.id} className="relative group bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="aspect-[3/4] bg-black/50 flex flex-col items-center justify-center p-4">
                    <FileText size={48} className="text-accent mb-4 opacity-50" />
                    <a href={item.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">View PDF</a>
                  </div>
                  <div className="p-4 bg-white/5 border-t border-white/10">
                    <p className="text-sm font-bold truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.type}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteMedia(item.id, item.collection)}
                    className="absolute top-2 right-2 bg-red-500/80 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Events Manager Tab */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Manage Events</h2>
            <button 
              onClick={() => setShowEventForm(!showEventForm)}
              className="bg-accent text-black px-4 py-2 rounded-xl font-bold hover:bg-accent/80 transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> {showEventForm ? "Cancel" : "Create Event"}
            </button>
          </div>

          {showEventForm && (
            <form onSubmit={handleCreateEvent} className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold mb-4">New Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Event Title</label>
                  <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date & Time</label>
                  <input required type="text" placeholder="e.g. August 25, 2026 at 10:00 AM" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location</label>
                  <input required type="text" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select value={newEvent.status} onChange={e => setNewEvent({...newEvent, status: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea required rows={3} value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2"></textarea>
              </div>
              <button type="submit" className="bg-white text-black font-bold px-6 py-2 rounded-xl mt-4">Save Event</button>
            </form>
          )}

          {loadingEvents ? (
            <div className="text-gray-400">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-gray-500 italic p-8 text-center bg-white/5 rounded-2xl border border-white/10">No events found.</div>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-white">{event.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${event.status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {event.date}</span>
                      <span>•</span>
                      <span>{event.location}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-3 line-clamp-2">{event.description}</p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex items-center gap-2">
                    <button onClick={() => handleDeleteEvent(event.id)} className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                      <Trash2 size={16} /> Delete
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
