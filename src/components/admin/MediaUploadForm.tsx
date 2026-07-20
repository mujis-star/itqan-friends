"use client";
import React, { useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react";

export default function MediaUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Photos");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: "File uploaded successfully to Google Drive!" });
        setFile(null);
        setTitle("");
        setDescription("");
      } else {
        setStatus({ type: "error", message: data.error || "Upload failed." });
      }
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl max-w-xl mx-auto border border-white/5">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <UploadCloud className="text-accent" /> Upload Media
      </h2>

      {status && (
        <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {status.type === 'success' ? <CheckCircle /> : <AlertCircle />}
          {status.message}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Title / Caption</label>
          <input 
            type="text" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Category</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-white focus:outline-none focus:border-accent"
          >
            <option value="Photos">Photos (Gallery)</option>
            <option value="Magazines">Magazines</option>
            <option value="Tabloids">Tabloids</option>
            <option value="Publications">Publications</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Description</label>
          <textarea 
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">File (PDF or Image)</label>
          <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              required
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <span className="text-accent font-semibold">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            ) : (
              <span className="text-gray-400">Drag & Drop or Click to Select File</span>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !file}
          className="w-full py-4 rounded-xl bg-accent text-black font-bold hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <UploadCloud size={20} /> Upload to Drive
            </>
          )}
        </button>
      </form>
    </div>
  );
}
