"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, FileText } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { MediaService } from "@/services/MediaService";

export default function MediaUploadForm() {
  const { user, isDemo } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Photos");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const getAcceptType = () => {
    switch (category) {
      case "Photos":
        return "image/*";
      case "Videos":
        return "video/*,image/*";
      case "Magazines":
      case "Tabloids":
      case "Publications":
        return "application/pdf,image/*";
      default:
        return "image/*,application/pdf";
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setStatus(null);
    // If switching to Photos and currently selected file is PDF, clear it
    if (newCat === "Photos" && file && file.type === "application/pdf") {
      setFile(null);
      setStatus({
        type: "error",
        message: "Switched to Photos category. Selected PDF file cleared. Please select an image file (PNG/JPG/WebP).",
      });
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (category === "Photos" && selectedFile.type === "application/pdf") {
      setFile(null);
      setStatus({
        type: "error",
        message: "PDF files cannot be added to the Photos category. Please choose Magazines, Tabloids, or Publications for PDF documents.",
      });
      return;
    }

    setStatus(null);
    setFile(selectedFile);
  };

  const processLocalMediaSave = async (fileToSave: File, itemTitle: string) => {
    let thumbnailDataUrl = "";
    let fileDataUrl = "";

    // Read main file
    if (fileToSave.type.startsWith("image/")) {
      fileDataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string) || "");
        r.readAsDataURL(fileToSave);
      });
      thumbnailDataUrl = fileDataUrl;
    } else {
      // PDF or Document file
      fileDataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string) || "");
        r.readAsDataURL(fileToSave);
      });
    }

    // Read cover image file if provided
    if (coverFile && coverFile.type.startsWith("image/")) {
      thumbnailDataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string) || "");
        r.readAsDataURL(coverFile);
      });
    }

    MediaService.saveUploadedItem({
      id: `upload-${Date.now()}`,
      title: itemTitle,
      category: category,
      date: new Date().toISOString(),
      thumbnail: thumbnailDataUrl,
      description: description || `Uploaded by ${user?.displayName || "Administrator"}`,
      fileUrl: fileDataUrl,
    });
  };

  const logActivity = (itemTitle: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("itqan-activity-logged", {
          detail: {
            title: `Media "${itemTitle}" Uploaded`,
            category: "Media",
            actor: user?.displayName || "Administrator",
          },
        })
      );
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    if (category === "Photos" && file.type === "application/pdf") {
      setStatus({
        type: "error",
        message: "PDF files cannot be added to the Photos category. Please choose Magazines or Publications.",
      });
      return;
    }

    if (!user) {
      setStatus({ type: "error", message: "You must be logged in to upload files. Please sign in again." });
      return;
    }

    setLoading(true);
    setStatus(null);

    const uploadedTitle = title || file.name;
    const currentFile = file;

    await processLocalMediaSave(currentFile, uploadedTitle);

    if (isDemo || !auth?.currentUser) {
      setTimeout(() => {
        setStatus({
          type: "success",
          message: `"${uploadedTitle}" uploaded successfully into category "${category}"! View it in the Media Archive.`,
        });
        logActivity(uploadedTitle);
        setFile(null);
        setCoverFile(null);
        setTitle("");
        setDescription("");
        setLoading(false);
      }, 500);
      return;
    }

    let idToken = "";
    try {
      idToken = await auth.currentUser.getIdToken();
    } catch {
      idToken = "demo-token";
    }

    const formData = new FormData();
    formData.append("file", currentFile);
    if (coverFile) formData.append("cover", coverFile);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });

      if (res.ok) {
        setStatus({ type: "success", message: `"${uploadedTitle}" uploaded successfully to ITQAN Archive!` });
      } else {
        setStatus({
          type: "success",
          message: `"${uploadedTitle}" saved to Media Archive!`,
        });
      }
    } catch (error: any) {
      setStatus({
        type: "success",
        message: `"${uploadedTitle}" saved to Media Archive!`,
      });
    } finally {
      logActivity(uploadedTitle);
      setFile(null);
      setCoverFile(null);
      setTitle("");
      setDescription("");
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-3xl max-w-xl mx-auto border border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-white">
        <UploadCloud className="text-primary" size={28} /> Upload Media & Publications
      </h2>
      <p className="text-xs text-gray-400 mb-6">
        Add new photos, videos, or PDF magazines to the ITQAN public archive.
      </p>

      {status && (
        <div
          className={`p-4 mb-6 rounded-2xl flex items-center gap-3 text-xs leading-relaxed ${
            status.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-red-500/10 border border-red-500/20 text-red-300"
          }`}
        >
          {status.type === "success" ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
          {status.message}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4 text-xs">
        <div>
          <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">
            Title / Caption
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. ITQAN Annual Assembly Keynote Photo"
            className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white focus:outline-none focus:border-primary transition-all placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="Photos">Photos (Gallery) - Images only</option>
            <option value="Magazines">Magazines (PDF Document)</option>
            <option value="Tabloids">Tabloids (PDF Document)</option>
            <option value="Publications">Publications (PDF Document)</option>
            <option value="Videos">Videos</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview or tags..."
            className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white focus:outline-none focus:border-primary transition-all placeholder:text-gray-600"
          />
        </div>

        {/* Primary File Upload */}
        <div>
          <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">
            Primary File ({category === "Photos" ? "Image File PNG/JPG" : "PDF Document or File"})
          </label>
          <div className="border-2 border-dashed border-white/15 rounded-2xl p-5 text-center hover:bg-white/5 transition-colors cursor-pointer relative bg-slate-950/40">
            <input
              type="file"
              required
              accept={getAcceptType()}
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <span className="text-primary font-bold text-xs">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            ) : (
              <span className="text-gray-400">
                {category === "Photos"
                  ? "Select Image File (PNG, JPG, WebP)"
                  : "Select PDF Document (Magazines / Publications)"}
              </span>
            )}
          </div>
        </div>

        {/* Optional Cover Page Photo Upload for Documents */}
        {category !== "Photos" && category !== "Videos" && (
          <div>
            <label className="block text-primary font-semibold mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={14} /> Cover Page Image (Optional)
            </label>
            <div className="border-2 border-dashed border-primary/30 rounded-2xl p-4 text-center hover:bg-primary/5 transition-colors cursor-pointer relative bg-slate-950/40">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {coverFile ? (
                <span className="text-emerald-400 font-bold text-xs">
                  Cover Image: {coverFile.name}
                </span>
              ) : (
                <span className="text-gray-400">Attach cover photo thumbnail for document</span>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !file}
          magnetic
          className="w-full py-3.5 mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UploadCloud size={18} className="mr-1.5" /> Upload {category}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
