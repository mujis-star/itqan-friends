"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, Video, Link as LinkIcon } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { MediaService } from "@/services/MediaService";

export default function MediaUploadForm() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoMode, setVideoMode] = useState<"file" | "url">("file");
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
        return "video/*,video/mp4,video/webm,video/quicktime,video/x-matroska,video/avi";
      case "Magazines":
      case "Tabloids":
      case "Publications":
        return "application/pdf,image/*";
      default:
        return "image/*,video/*,application/pdf";
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setStatus(null);
    if (newCat === "Photos" && file && file.type === "application/pdf") {
      setFile(null);
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

  const compressImageFile = (fileToCompress: File, maxDim = 800, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve((e.target?.result as string) || "");
          }
        };
        img.onerror = () => resolve((e.target?.result as string) || "");
        img.src = (e.target?.result as string) || "";
      };
      reader.readAsDataURL(fileToCompress);
    });
  };

  const generateVideoThumbnail = (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(videoFile);
      const video = document.createElement("video");
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      const timeout = setTimeout(() => {
        resolve("");
      }, 3500);

      video.onloadeddata = () => {
        video.currentTime = 0.5;
      };

      video.onseeked = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement("canvas");
          canvas.width = Math.min(video.videoWidth || 640, 640);
          canvas.height = Math.min(video.videoHeight || 360, 360);
          const ctx = canvas.getContext("2d");
          if (ctx && canvas.width > 0 && canvas.height > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL("image/jpeg", 0.7);
            resolve(thumb);
          } else {
            resolve("");
          }
        } catch {
          resolve("");
        }
      };

      video.onerror = () => {
        clearTimeout(timeout);
        resolve("");
      };
    });
  };

  const processLocalMediaSave = async (fileToSave: File | null, itemTitle: string, directUrl?: string) => {
    let thumbnailDataUrl = "";
    let fileDataUrl = directUrl || "";

    // 1. Process Main File
    if (fileToSave) {
      if (fileToSave.type.startsWith("image/")) {
        thumbnailDataUrl = await compressImageFile(fileToSave);
        fileDataUrl = thumbnailDataUrl;
      } else if (fileToSave.type.startsWith("video/")) {
        fileDataUrl = URL.createObjectURL(fileToSave);
        thumbnailDataUrl = await generateVideoThumbnail(fileToSave);
      } else {
        if (fileToSave.size < 2 * 1024 * 1024) {
          fileDataUrl = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve((r.result as string) || "");
            r.readAsDataURL(fileToSave);
          });
        } else {
          fileDataUrl = URL.createObjectURL(fileToSave);
        }
      }
    }

    // 2. Cover image file if provided
    if (coverFile && coverFile.type.startsWith("image/")) {
      thumbnailDataUrl = await compressImageFile(coverFile);
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

    logActivity(itemTitle);
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

    const isVideoCategory = category === "Videos";
    if (isVideoCategory && videoMode === "url" && !videoUrl) {
      setStatus({ type: "error", message: "Please provide a valid Video URL." });
      return;
    }

    if (!file && !(isVideoCategory && videoMode === "url" && videoUrl)) {
      setStatus({ type: "error", message: "Please select a file to upload." });
      return;
    }

    if (category === "Photos" && file && file.type === "application/pdf") {
      setStatus({
        type: "error",
        message: "PDF files cannot be added to the Photos category. Please choose Magazines or Publications.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    const uploadedTitle = title || (file ? file.name : "Untitled Media");
    const currentFile = file;
    const finalVideoUrl = isVideoCategory && videoMode === "url" ? videoUrl : "";

    // Optimistic local save
    await processLocalMediaSave(currentFile, uploadedTitle, finalVideoUrl);

    // Prepare auth token
    let idToken = "demo-token";
    if (auth?.currentUser) {
      try {
        idToken = await auth.currentUser.getIdToken();
      } catch {
        idToken = "demo-token";
      }
    }

    const formData = new FormData();
    if (currentFile) formData.append("file", currentFile);
    if (coverFile) formData.append("cover", coverFile);
    if (finalVideoUrl) formData.append("videoUrl", finalVideoUrl);
    formData.append("title", uploadedTitle);
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

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: "success",
          message: `"${uploadedTitle}" successfully uploaded to Cloud Database! It is now live across all computers and in incognito mode.`,
        });
        logActivity(uploadedTitle);
        setFile(null);
        setCoverFile(null);
        setVideoUrl("");
        setTitle("");
        setDescription("");
      } else {
        const errorMsg = data.error || data.details || "Server upload failed.";
        setStatus({
          type: "error",
          message: `Failed to persist to cloud database: ${errorMsg}. (Saved to local browser cache only).`,
        });
      }
    } catch (error: any) {
      setStatus({
        type: "error",
        message: `Network error connecting to cloud server: ${error.message || "Failed to reach server"}.`,
      });
    } finally {
      setLoading(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("itqan-media-added"));
      }
    }
  };

  return (
    <div className="glass-card p-8 rounded-3xl max-w-xl mx-auto border border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-white">
        <UploadCloud className="text-primary" size={28} /> Upload Media & Publications
      </h2>
      <p className="text-xs text-gray-400 mb-6">
        Add new photos, videos, or PDF magazines to the ITQAN public archive across all devices.
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
            placeholder="e.g. ITQAN Annual Assembly Keynote Video"
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
            <option value="Videos">Videos (Video File or Link)</option>
            <option value="Magazines">Magazines (PDF Document)</option>
            <option value="Tabloids">Tabloids (PDF Document)</option>
            <option value="Publications">Publications (PDF Document)</option>
          </select>
        </div>

        {/* Video Mode Selector if Videos category */}
        {category === "Videos" && (
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setVideoMode("file")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                videoMode === "file"
                  ? "bg-primary text-slate-950 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Video size={14} /> Upload Video File (MP4/WebM)
            </button>
            <button
              type="button"
              onClick={() => setVideoMode("url")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                videoMode === "url"
                  ? "bg-primary text-slate-950 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LinkIcon size={14} /> Video URL / Embed
            </button>
          </div>
        )}

        {category === "Videos" && videoMode === "url" && (
          <div>
            <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">
              Video URL (YouTube, Vimeo, Google Drive, or MP4 URL)
            </label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or Drive URL"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white focus:outline-none focus:border-primary transition-all placeholder:text-gray-600"
            />
          </div>
        )}

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

        {/* Primary File Upload (if not in URL video mode) */}
        {!(category === "Videos" && videoMode === "url") && (
          <div>
            <label className="block text-gray-300 font-semibold mb-2 uppercase tracking-wider">
              Primary File ({category === "Photos" ? "Image File PNG/JPG" : category === "Videos" ? "Video File (MP4, WebM, MOV)" : "PDF Document"})
            </label>
            <div className="border-2 border-dashed border-white/15 rounded-2xl p-5 text-center hover:bg-white/5 transition-colors cursor-pointer relative bg-slate-950/40">
              <input
                type="file"
                required={!(category === "Videos" && videoMode === "url")}
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
                    : category === "Videos"
                    ? "Select Video File (MP4, WebM, MOV)"
                    : "Select PDF Document (Magazines / Publications)"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Optional Cover Page / Thumbnail Photo Upload */}
        {category !== "Photos" && (
          <div>
            <label className="block text-primary font-semibold mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={14} /> {category === "Videos" ? "Video Poster / Thumbnail (Optional)" : "Cover Page Image (Optional)"}
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
                <span className="text-gray-400">Attach cover photo thumbnail preview</span>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || (!file && !(category === "Videos" && videoMode === "url" && videoUrl))}
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
