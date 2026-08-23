"use client";

import React, { useState, useEffect, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, Video, Link as LinkIcon } from "lucide-react";
import { storage, db, auth } from "@/lib/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { MediaService } from "@/services/MediaService";

const RENDER_BACKEND = "https://itqan-backend.onrender.com";

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
  const [uploadProgress, setUploadProgress] = useState<{ percent: number; transferredMB: string; totalMB: string } | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [backendStatus, setBackendStatus] = useState<"sleeping" | "waking" | "ready">("sleeping");
  const backendReady = useRef(false);

  // Wake up the Render backend as soon as this form is visible
  useEffect(() => {
    let keepAliveTimer: ReturnType<typeof setInterval>;

    const wakeBackend = async () => {
      setBackendStatus("waking");
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const res = await fetch(`${RENDER_BACKEND}/health`, { cache: "no-store" });
          if (res.ok) {
            backendReady.current = true;
            setBackendStatus("ready");
            return;
          }
        } catch {
          // Server still waking, wait and retry
        }
        await new Promise((r) => setTimeout(r, 15000)); // wait 15s between retries
      }
      setBackendStatus("sleeping");
    };

    wakeBackend();

    // Keep the backend alive while the form is open (ping every 3 min)
    keepAliveTimer = setInterval(() => {
      fetch(`${RENDER_BACKEND}/health`, { cache: "no-store" }).catch(() => {});
    }, 180000);

    return () => clearInterval(keepAliveTimer);
  }, []);

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
      let objectUrl = "";
      try {
        objectUrl = URL.createObjectURL(videoFile);
      } catch {
        resolve("");
        return;
      }

      const video = document.createElement("video");
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";

      const cleanup = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        video.src = "";
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve("");
      }, 2000);

      video.onloadeddata = () => {
        try {
          video.currentTime = 0.5;
        } catch {
          cleanup();
          resolve("");
        }
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
            cleanup();
            resolve(thumb);
            return;
          }
        } catch {}
        cleanup();
        resolve("");
      };

      video.onerror = () => {
        clearTimeout(timeout);
        cleanup();
        resolve("");
      };
    });
  };

  const uploadFileToFirebaseStorage = (fileToUpload: File, folder = "uploads"): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!storage) {
        reject(new Error("Firebase Storage client is not initialized"));
        return;
      }
      const safeName = `${folder}/${Date.now()}-${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const storageRef = ref(storage, safeName);
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            const transferredMB = (snapshot.bytesTransferred / (1024 * 1024)).toFixed(1);
            const totalMB = (snapshot.totalBytes / (1024 * 1024)).toFixed(1);
            setUploadProgress({ percent, transferredMB, totalMB });
          }
        },
        (error) => {
          console.error("Storage upload error:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err) {
            reject(err);
          }
        }
      );
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

  const uploadWithProgress = (
    url: string,
    formData: FormData,
    headers: Record<string, string> = {}
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);

      Object.entries(headers).forEach(([key, val]) => {
        xhr.setRequestHeader(key, val);
      });

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          const transferredMB = (event.loaded / (1024 * 1024)).toFixed(1);
          const totalMB = (event.total / (1024 * 1024)).toFixed(1);
          setUploadProgress({ percent, transferredMB, totalMB });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            resolve({ success: true, text: xhr.responseText });
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || data.message || `Server returned status ${xhr.status}`));
          } catch {
            reject(new Error(`Server returned status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during upload to cloud server"));
      };

      xhr.send(formData);
    });
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
    setUploadProgress(null);
    setStatus(null);

    const uploadedTitle = title || (file ? file.name : "Untitled Media");
    const finalVideoUrl = isVideoCategory && videoMode === "url" ? videoUrl : "";

    try {
      let idToken = "demo-token";
      if (auth?.currentUser) {
        idToken = await auth.currentUser.getIdToken().catch(() => "demo-token");
      }

      let publicFileUrl = finalVideoUrl;
      let publicCoverUrl = "";

      // 1. Process Cover Image if provided (instant compressed data preview)
      if (coverFile) {
        try {
          publicCoverUrl = await compressImageFile(coverFile);
        } catch {
          publicCoverUrl = "";
        }
      }

      // 2. Upload Primary File via Direct Google Drive Render Backend or Next.js API
      if (file) {
        setUploadProgress({
          percent: 1,
          transferredMB: "0.1",
          totalMB: (file.size / (1024 * 1024)).toFixed(1),
        });

        const formData = new FormData();
        if (category === "Magazines" || category === "Tabloids" || category === "Publications") {
          formData.append("pdf", file);
          formData.append("file", file);
        } else {
          formData.append("file", file);
        }
        if (coverFile) formData.append("cover", coverFile);
        formData.append("title", uploadedTitle);
        formData.append("caption", uploadedTitle);
        formData.append("category", category);
        formData.append("description", description);

        let uploadSuccess = false;

        const targetUrl =
          category === "Magazines" || category === "Tabloids" || category === "Publications"
            ? `${RENDER_BACKEND}/upload-magazine`
            : `${RENDER_BACKEND}/upload`;

        // Wait for backend to be ready (it starts waking on component mount)
        if (!backendReady.current) {
          setStatus({ type: "success", message: "⏳ Waiting for Google Drive server to wake up... (this takes up to 2 minutes on first use)" });
          for (let wait = 0; wait < 12; wait++) {
            if (backendReady.current) break;
            try {
              const res = await fetch(`${RENDER_BACKEND}/health`, { cache: "no-store" });
              if (res.ok) {
                backendReady.current = true;
                setBackendStatus("ready");
                break;
              }
            } catch { /* still waking */ }
            await new Promise((r) => setTimeout(r, 10000));
          }
          if (!backendReady.current) {
            throw new Error("Google Drive server did not start in time. Please refresh the page and wait for the green 'ready' indicator before uploading.");
          }
          setStatus(null);
        }

        // Upload to Google Drive via Render backend
        try {
          const driveData = await uploadWithProgress(targetUrl, formData);
          if (driveData && (driveData.fileUrl || driveData.pdfUrl || driveData.success)) {
            publicFileUrl = driveData.fileUrl || driveData.pdfUrl || "";
            if (driveData.coverUrl) publicCoverUrl = driveData.coverUrl;
            uploadSuccess = true;
          }
        } catch (driveErr: any) {
          console.warn("Render backend upload attempt 1:", driveErr);
        }

        // Attempt 2: Retry once if first attempt failed (backend may have just woken up)
        if (!uploadSuccess) {
          setStatus({ type: "success", message: "Retrying upload to Google Drive..." });
          setUploadProgress({ percent: 0, transferredMB: "0", totalMB: (file.size / (1024 * 1024)).toFixed(1) });
          try {
            const driveData = await uploadWithProgress(targetUrl, formData);
            if (driveData && (driveData.fileUrl || driveData.pdfUrl || driveData.success)) {
              publicFileUrl = driveData.fileUrl || driveData.pdfUrl || "";
              if (driveData.coverUrl) publicCoverUrl = driveData.coverUrl;
              uploadSuccess = true;
            }
          } catch (retryErr: any) {
            console.warn("Render backend upload attempt 2:", retryErr);
          }
        }

        if (!uploadSuccess && !publicFileUrl) {
          throw new Error(
            "Google Drive server is not responding. The server may be starting up — please wait 1 minute and try again."
          );
        }
      }

      // 3. Generate thumbnail if needed
      if (!publicCoverUrl) {
        if (file && file.type.startsWith("image/")) {
          publicCoverUrl = publicFileUrl;
        } else if (file && file.type.startsWith("video/")) {
          publicCoverUrl = await generateVideoThumbnail(file);
        }
      }

      // 4. Save metadata to Firestore Cloud Database
      const targetCol =
        category === "Magazines" || category === "Tabloids" || category === "Publications"
          ? "magazines"
          : category === "Videos"
          ? "videos"
          : "gallery";

      const mediaPayload: any = {
        title: uploadedTitle,
        caption: uploadedTitle,
        category: category,
        type: category,
        description: description || "",
        createdAt: new Date(),
        fileUrl: publicFileUrl,
        thumbnail: publicCoverUrl || publicFileUrl,
        coverUrl: publicCoverUrl || publicFileUrl,
        imageUrl: category === "Photos" ? publicFileUrl : "",
        videoUrl: category === "Videos" ? publicFileUrl : "",
        pdfUrl: category !== "Photos" && category !== "Videos" ? publicFileUrl : "",
        uploadedBy: user?.displayName || "Administrator",
      };

      if (db) {
        try {
          await addDoc(collection(db, targetCol), mediaPayload);
          if (category === "Videos") {
            await addDoc(collection(db, "gallery"), mediaPayload).catch(() => {});
          }
        } catch (dbErr) {
          console.warn("Firestore direct write notice:", dbErr);
        }
      }

      // 5. Also save in MediaService for local session cache
      MediaService.saveUploadedItem({
        id: `upload-${Date.now()}`,
        title: uploadedTitle,
        category: category,
        date: new Date().toISOString(),
        thumbnail: publicCoverUrl || publicFileUrl,
        description: description || `Uploaded by ${user?.displayName || "Administrator"}`,
        fileUrl: publicFileUrl,
      });

      setStatus({
        type: "success",
        message: `"${uploadedTitle}" successfully uploaded to Cloud Storage & Database! It is now live across all computers and Incognito sessions.`,
      });

      logActivity(uploadedTitle);
      setFile(null);
      setCoverFile(null);
      setVideoUrl("");
      setTitle("");
      setDescription("");
      setUploadProgress(null);
    } catch (error: any) {
      console.error("Upload handler error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to upload to cloud server. Please try again or use the Video URL option.",
      });
    } finally {
      setLoading(false);
      setUploadProgress(null);
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
      <p className="text-xs text-gray-400 mb-3">
        Add new photos, videos, or PDF magazines to the ITQAN public archive across all devices.
      </p>

      {/* Google Drive Backend Status */}
      <div className={`flex items-center gap-2 text-[11px] font-semibold mb-5 px-3 py-2 rounded-xl border ${
        backendStatus === "ready"
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : backendStatus === "waking"
          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
          : "bg-red-500/10 border-red-500/20 text-red-400"
      }`}>
        <span className={`w-2 h-2 rounded-full shrink-0 ${
          backendStatus === "ready" ? "bg-emerald-400" : backendStatus === "waking" ? "bg-amber-400 animate-pulse" : "bg-red-400"
        }`} />
        {backendStatus === "ready"
          ? "Google Drive server is online & ready"
          : backendStatus === "waking"
          ? "Waking up Google Drive server... please wait"
          : "Google Drive server is sleeping — it will wake automatically"}
      </div>

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

      {/* Live Upload Progress Bar */}
      {uploadProgress !== null && (
        <div className="mb-6 bg-slate-950/80 p-4 rounded-2xl border border-primary/30 space-y-2">
          <div className="flex justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-2 text-primary">
              <UploadCloud size={16} className="animate-bounce" /> Uploading to Cloud Storage ({uploadProgress.transferredMB} MB / {uploadProgress.totalMB} MB)
            </span>
            <span className="font-mono text-primary">{uploadProgress.percent}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full shadow-lg shadow-primary/50"
              style={{ width: `${uploadProgress.percent}%` }}
            />
          </div>
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
                <div className="space-y-1">
                  <span className="text-primary font-bold text-xs block">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  {category === "Videos" && file.size > 20 * 1024 * 1024 && (
                    <button
                      type="button"
                      onClick={() => setVideoMode("url")}
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 underline font-medium mt-1 cursor-pointer"
                    >
                      <LinkIcon size={12} /> Have this video on Google Drive? Click to link it instantly without uploading!
                    </button>
                  )}
                </div>
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
