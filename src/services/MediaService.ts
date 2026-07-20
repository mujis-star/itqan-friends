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
          thumbnail: data.coverUrl || "",
          description: data.description || "",
          fileUrl: data.pdfUrl,
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
          thumbnail: data.imageUrl,
          description: `Uploaded by ${data.uploadedBy || 'Admin'}`,
          fileUrl: data.imageUrl,
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
