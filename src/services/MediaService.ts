import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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
  static saveUploadedItem(item: MediaItem) {
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
        // Strip heavy data URLs if quota exceeded to guarantee persistence
        const lightweightList = filtered.map((m, idx) => {
          if (idx > 0 && m.fileUrl && m.fileUrl.startsWith("data:video")) {
            return { ...m, fileUrl: undefined };
          }
          return m;
        });
        localStorage.setItem("itqan_user_media", JSON.stringify(lightweightList));
      }
      
      window.dispatchEvent(new CustomEvent("itqan-media-added", { detail: item }));
    } catch (e) {
      console.warn("Failed to save uploaded item to local storage", e);
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
   * Deletes an uploaded media item from local storage.
   */
  static deleteUploadedItem(id: string) {
    if (typeof window === "undefined") return;
    try {
      const existing = localStorage.getItem("itqan_user_media");
      if (!existing) return;
      const list: MediaItem[] = JSON.parse(existing);
      const filtered = list.filter((i) => i.id !== id);
      localStorage.setItem("itqan_user_media", JSON.stringify(filtered));
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
   * Fetches media items from Firestore + local session uploads.
   */
  static async fetchAllMedia(): Promise<MediaItem[]> {
    const localItems = this.getLocalUploadedItems();

    if (!db) return localItems;

    try {
      const items: MediaItem[] = [...localItems];

      // 1. Fetch Magazines/Publications
      const magSnap = await getDocs(query(collection(db, "magazines"), orderBy("createdAt", "desc")));
      magSnap.forEach((doc) => {
        const data = doc.data();
        const rawType = data.type || "Magazines";
        const normalizedCategory = rawType.charAt(0).toUpperCase() + rawType.slice(1);

        items.push({
          id: doc.id,
          title: data.title || "Untitled",
          category: normalizedCategory,
          date: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          thumbnail: this.formatDriveUrl(data.coverUrl || data.pdfUrl, true),
          description: data.description || "",
          fileUrl: this.formatDriveUrl(data.pdfUrl, false),
        });
      });

      // 2. Fetch Gallery items
      const galSnap = await getDocs(query(collection(db, "gallery"), orderBy("createdAt", "desc")));
      galSnap.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          title: data.caption || "Untitled Photo",
          category: "Photos",
          date: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          thumbnail: this.formatDriveUrl(data.imageUrl, true),
          description: `Uploaded by ${data.uploadedBy || "Admin"}`,
          fileUrl: this.formatDriveUrl(data.imageUrl, false),
        });
      });

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return items;
    } catch (error) {
      console.error("Error fetching media from Firebase:", error);
      return localItems;
    }
  }
}
