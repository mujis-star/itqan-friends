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
    
    // Extract ID from different Google Drive link formats
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      if (isThumbnail) {
        // High quality thumbnail API for google drive
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
      } else {
        // Standard view link
        return `https://drive.google.com/file/d/${fileId}/view`;
      }
    }
    return url;
  }

  /**
   * Fetches legacy and new media items from Firestore collections.
   */
  static async fetchAllMedia(): Promise<MediaItem[]> {
    if (!db) return [];

    try {
      const items: MediaItem[] = [];

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
          category: "Photos", // Default legacy category
          date: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          thumbnail: this.formatDriveUrl(data.imageUrl, true),
          description: `Uploaded by ${data.uploadedBy || 'Admin'}`,
          fileUrl: this.formatDriveUrl(data.imageUrl, false),
        });
      });

      // Sort combined by date descending
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return items;
    } catch (error) {
      console.error("Error fetching media from Firebase:", error);
      return [];
    }
  }
}
