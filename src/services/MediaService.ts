import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/config";

export interface MediaItem {
  id: string;
  title: string;
  category: string;
  date: string;
  thumbnail: string;
  description: string;
  fileUrl?: string;
  fileSize?: string;
  pages?: number;
  duration?: string;
  count?: number;
}

export class MediaService {
  /**
   * Helper to fix Google Drive links for previews and viewing
   */
  static formatDriveUrl(url: string | undefined, isThumbnail: boolean = false): string {
    if (!url) return "";

    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      if (isThumbnail) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
      } else {
        return `https://drive.google.com/file/d/${fileId}/view`;
      }
    }
    return url;
  }

  /**
   * Saves a newly uploaded media item locally so it immediately appears in the Media Archive.
   * Handles browser localStorage 5MB quota gracefully.
   */
  static async saveUploadedItem(item: MediaItem) {
    if (typeof window === "undefined") return;
    try {
      const existing = localStorage.getItem("itqan_user_media");
      const list: MediaItem[] = existing ? JSON.parse(existing) : [];
      
      const filtered = list.filter((i) => i.id !== item.id);
      filtered.unshift(item);

      try {
        localStorage.setItem("itqan_user_media", JSON.stringify(filtered));
      } catch (quotaError) {
        console.warn("Storage quota limit reached. Pruning heavy payloads for quota safety.");
        const lightweightList = filtered.map((m, idx) => {
          if (idx > 0 && m.fileUrl && m.fileUrl.startsWith("data:video")) {
            return { ...m, fileUrl: undefined };
          }
          return m;
        });
        localStorage.setItem("itqan_user_media", JSON.stringify(lightweightList));
      }

      // Sync directly to Firestore Client DB so all computers and Incognito mode get it immediately
      if (db) {
        try {
          const { collection: fsCol, addDoc } = await import("firebase/firestore");
          const targetCol =
            item.category === "Magazines" || item.category === "Tabloids" || item.category === "Publications"
              ? "magazines"
              : item.category === "Videos"
              ? "videos"
              : "gallery";

          const payload: any = {
            title: item.title,
            caption: item.title,
            category: item.category,
            type: item.category,
            description: item.description || "",
            createdAt: new Date(),
            fileUrl: item.fileUrl || "",
            thumbnail: item.thumbnail || item.fileUrl || "",
            coverUrl: item.thumbnail || item.fileUrl || "",
            imageUrl: item.category === "Photos" ? item.fileUrl || item.thumbnail : "",
            videoUrl: item.category === "Videos" ? item.fileUrl : "",
            pdfUrl: item.category !== "Photos" && item.category !== "Videos" ? item.fileUrl : "",
            uploadedBy: "Admin",
          };

          await addDoc(fsCol(db, targetCol), payload);
          if (item.category === "Videos") {
            await addDoc(fsCol(db, "gallery"), payload).catch(() => {});
          }
        } catch (fsErr) {
          console.warn("Direct client Firestore sync failed:", fsErr);
        }
      }
      
      window.dispatchEvent(new CustomEvent("itqan-media-added", { detail: item }));
    } catch (e) {
      console.warn("Failed to save uploaded item", e);
    }
  }

  /**
   * Updates an existing uploaded media item in local storage.
   */
  static updateUploadedItem(updatedItem: MediaItem) {
    if (typeof window === "undefined") return;
    try {
      const existing = localStorage.getItem("itqan_user_media");
      const list: MediaItem[] = existing ? JSON.parse(existing) : [];
      const idx = list.findIndex((i) => i.id === updatedItem.id);
      if (idx !== -1) {
        list[idx] = updatedItem;
      } else {
        list.unshift(updatedItem);
      }
      localStorage.setItem("itqan_user_media", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("itqan-media-added", { detail: updatedItem }));
    } catch (e) {
      console.warn("Failed to update uploaded item", e);
    }
  }

  /**
   * Deletes an uploaded media item from local storage and optionally Firestore.
   */
  static async deleteUploadedItem(id: string, collectionName?: string) {
    if (typeof window === "undefined") return;
    try {
      const existing = localStorage.getItem("itqan_user_media");
      if (existing) {
        const list: MediaItem[] = JSON.parse(existing);
        const filtered = list.filter((i) => i.id !== id);
        localStorage.setItem("itqan_user_media", JSON.stringify(filtered));
      }

      // If this is a server item, request server deletion
      if (!id.startsWith("upload-")) {
        try {
          let idToken = "demo-token";
          if (auth?.currentUser) {
            idToken = await auth.currentUser.getIdToken().catch(() => "demo-token");
          }
          await fetch(`/api/media/${id}?collection=${collectionName || "gallery"}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
        } catch (serverErr) {
          console.warn("Could not delete from server API", serverErr);
        }
      }

      window.dispatchEvent(new CustomEvent("itqan-media-added", { detail: { id } }));
    } catch (e) {
      console.warn("Failed to delete uploaded item", e);
    }
  }

  /**
   * Retrieves locally saved uploaded items.
   */
  static getLocalUploadedItems(): MediaItem[] {
    if (typeof window === "undefined") return [];
    try {
      const existing = localStorage.getItem("itqan_user_media");
      return existing ? JSON.parse(existing) : [];
    } catch {
      return [];
    }
  }

  /**
   * Fetches media items from Cloud API (/api/media), Firestore client fallback, and local session uploads.
   * Ensures items are fully accessible in incognito mode and on other computers.
   */
  static async fetchAllMedia(): Promise<MediaItem[]> {
    const localItems = this.getLocalUploadedItems();
    const cloudItems: MediaItem[] = [];

    // 1. Fetch from Server-Side /api/media API (accessible across all computers & incognito)
    try {
      const res = await fetch("/api/media", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          // Process Magazines, Tabloids, Publications
          if (Array.isArray(json.magazines)) {
            json.magazines.forEach((doc: any) => {
              const rawType = doc.type || doc.category || "Magazines";
              const normalizedCategory = rawType.charAt(0).toUpperCase() + rawType.slice(1);
              cloudItems.push({
                id: doc.id,
                title: doc.title || "Untitled",
                category: normalizedCategory,
                date: doc.createdAt || new Date().toISOString(),
                thumbnail: this.formatDriveUrl(doc.coverUrl || doc.thumbnail || doc.pdfUrl || doc.fileUrl, true),
                description: doc.description || "",
                fileUrl: this.formatDriveUrl(doc.pdfUrl || doc.fileUrl, false),
                fileSize: doc.fileSize,
                pages: doc.pages,
              });
            });
          }

          // Process Gallery (Photos & Videos)
          if (Array.isArray(json.gallery)) {
            json.gallery.forEach((doc: any) => {
              const rawCat = doc.category || doc.type || (doc.videoUrl ? "Videos" : "Photos");
              const normalizedCategory = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
              cloudItems.push({
                id: doc.id,
                title: doc.caption || doc.title || (normalizedCategory === "Videos" ? "Untitled Video" : "Untitled Photo"),
                category: normalizedCategory,
                date: doc.createdAt || new Date().toISOString(),
                thumbnail: this.formatDriveUrl(doc.thumbnail || doc.coverUrl || doc.imageUrl || doc.videoUrl || doc.fileUrl, true),
                description: doc.description || `Uploaded by ${doc.uploadedBy || "Admin"}`,
                fileUrl: this.formatDriveUrl(doc.videoUrl || doc.imageUrl || doc.fileUrl, false),
                duration: doc.duration,
              });
            });
          }

          // Process dedicated Videos collection if available
          if (Array.isArray(json.videos)) {
            json.videos.forEach((doc: any) => {
              cloudItems.push({
                id: doc.id,
                title: doc.title || doc.caption || "Untitled Video",
                category: "Videos",
                date: doc.createdAt || new Date().toISOString(),
                thumbnail: this.formatDriveUrl(doc.thumbnail || doc.coverUrl || doc.videoUrl || doc.fileUrl, true),
                description: doc.description || "",
                fileUrl: this.formatDriveUrl(doc.videoUrl || doc.fileUrl, false),
                duration: doc.duration,
              });
            });
          }
        }
      }
    } catch (apiError) {
      console.warn("API /api/media fetch failed, falling back to direct Firebase client SDK", apiError);
    }

    // 2. Direct client SDK fallback if cloudItems is empty and db is available
    if (cloudItems.length === 0 && db) {
      try {
        const magSnap = await getDocs(query(collection(db, "magazines"), orderBy("createdAt", "desc")));
        magSnap.forEach((doc) => {
          const data = doc.data();
          const rawType = data.type || data.category || "Magazines";
          const normalizedCategory = rawType.charAt(0).toUpperCase() + rawType.slice(1);

          cloudItems.push({
            id: doc.id,
            title: data.title || "Untitled",
            category: normalizedCategory,
            date: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            thumbnail: this.formatDriveUrl(data.coverUrl || data.thumbnail || data.pdfUrl || data.fileUrl, true),
            description: data.description || "",
            fileUrl: this.formatDriveUrl(data.pdfUrl || data.fileUrl, false),
          });
        });

        const galSnap = await getDocs(query(collection(db, "gallery"), orderBy("createdAt", "desc")));
        galSnap.forEach((doc) => {
          const data = doc.data();
          const rawCat = data.category || data.type || (data.videoUrl ? "Videos" : "Photos");
          const normalizedCategory = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);

          cloudItems.push({
            id: doc.id,
            title: data.caption || data.title || (normalizedCategory === "Videos" ? "Untitled Video" : "Untitled Photo"),
            category: normalizedCategory,
            date: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            thumbnail: this.formatDriveUrl(data.thumbnail || data.coverUrl || data.imageUrl || data.videoUrl || data.fileUrl, true),
            description: data.description || `Uploaded by ${data.uploadedBy || "Admin"}`,
            fileUrl: this.formatDriveUrl(data.videoUrl || data.imageUrl || data.fileUrl, false),
          });
        });
      } catch (clientError) {
        console.warn("Client Firebase fetch failed", clientError);
      }
    }

    // 3. Fetch from Google Drive Render Backend (https://itqan-backend.onrender.com)
    try {
      const [galRes, magRes] = await Promise.all([
        fetch("https://itqan-backend.onrender.com/gallery", { cache: "no-store" }).catch(() => null),
        fetch("https://itqan-backend.onrender.com/magazines", { cache: "no-store" }).catch(() => null),
      ]);

      if (galRes && galRes.ok) {
        const renderGallery = await galRes.json().catch(() => []);
        if (Array.isArray(renderGallery)) {
          renderGallery.forEach((g: any) => {
            const itemTitle = g.caption || g.title || "";
            const alreadyExists = cloudItems.some(
              (ci) => ci.id === g.id || (itemTitle && ci.title.toLowerCase() === itemTitle.toLowerCase())
            );
            if (!alreadyExists) {
              const isVid = g.type === "video" || (g.mimeType && g.mimeType.startsWith("video/"));
              // For images: use the thumbnail URL directly (works in <img> tags)
              // For videos: use the Drive view URL (will be converted to /preview iframe by the player)
              const thumbUrl = g.thumbnail || (g.id ? `https://drive.google.com/thumbnail?id=${g.id}&sz=w1600` : "");
              const fileUrl = isVid
                ? (g.fileUrl || (g.id ? `https://drive.google.com/file/d/${g.id}/view` : ""))
                : (g.imageUrl || thumbUrl);
              cloudItems.push({
                id: g.id,
                title: itemTitle || (isVid ? "Untitled Video" : "Untitled Photo"),
                category: isVid ? "Videos" : "Photos",
                date: g.createdAt || new Date().toISOString(),
                thumbnail: thumbUrl,
                description: g.description || "",
                fileUrl: fileUrl,
              });
            }
          });
        }
      }

      if (magRes && magRes.ok) {
        const renderMags = await magRes.json().catch(() => []);
        if (Array.isArray(renderMags)) {
          renderMags.forEach((m: any) => {
            const magTitle = m.title || "";
            const alreadyExists = cloudItems.some(
              (ci) => ci.id === m.id || (magTitle && ci.title.toLowerCase() === magTitle.toLowerCase())
            );
            if (!alreadyExists) {
              const coverThumb = m.coverUrl || (m.id ? `https://drive.google.com/thumbnail?id=${m.id}&sz=w1600` : "");
              // For PDF URL: if pdfFileId is available, construct the view URL
              const pdfUrl = m.pdfUrl || (m.pdfFileId ? `https://drive.google.com/file/d/${m.pdfFileId}/view` : "");
              cloudItems.push({
                id: m.id,
                title: magTitle || "Untitled Publication",
                category: "Magazines",
                date: m.createdAt || new Date().toISOString(),
                thumbnail: coverThumb,
                description: m.description || "",
                fileUrl: pdfUrl,
              });
            }
          });
        }
      }
    } catch (renderErr) {
      console.warn("Render backend fetch notice:", renderErr);
    }

    // Combine local uploads with cloud items, de-duplicating by ID and title
    const combined = [...localItems, ...cloudItems];
    const uniqueMap = new Map<string, MediaItem>();
    const seenTitles = new Set<string>();
    combined.forEach((item) => {
      const titleKey = item.title.toLowerCase().trim();
      if (!uniqueMap.has(item.id) && !seenTitles.has(titleKey)) {
        uniqueMap.set(item.id, item);
        if (titleKey) seenTitles.add(titleKey);
      }
    });

    const finalItems = Array.from(uniqueMap.values());
    finalItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return finalItems;
  }
}
