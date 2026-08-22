import { adminDb } from "@/lib/firebase/admin";

export class MediaRepository {
  /**
   * Saves metadata for a new upload into Firestore. (Server-side)
   */
  static async saveUpload(
    title: string,
    category: string,
    description: string,
    url: string,
    uploaderUid: string,
    coverUrl?: string,
    extraMeta?: { duration?: string; pages?: number; fileSize?: string }
  ) {
    if (!adminDb) {
      console.warn("Firestore Admin SDK not initialized; skipping server-side Firestore write.");
      return;
    }

    const payload: any = {
      title: title || "Untitled",
      category: category,
      type: category,
      description: description || "",
      createdAt: new Date(),
      uploadedBy: uploaderUid || "Administrator",
    };

    if (extraMeta?.duration) payload.duration = extraMeta.duration;
    if (extraMeta?.pages) payload.pages = extraMeta.pages;
    if (extraMeta?.fileSize) payload.fileSize = extraMeta.fileSize;

    try {
      if (category === "Videos") {
        payload.caption = title;
        payload.videoUrl = url;
        payload.fileUrl = url;
        payload.thumbnail = coverUrl || url;
        payload.coverUrl = coverUrl || url;

        // Save to 'videos' and 'gallery' for backward compatibility
        await Promise.all([
          adminDb.collection("videos").add(payload),
          adminDb.collection("gallery").add(payload),
        ]);
      } else if (category === "Photos") {
        payload.caption = title;
        payload.imageUrl = url;
        payload.fileUrl = url;
        payload.thumbnail = coverUrl || url;
        payload.coverUrl = coverUrl || url;

        await adminDb.collection("gallery").add(payload);
      } else {
        // Magazines, Tabloids, Publications
        payload.pdfUrl = url;
        payload.fileUrl = url;
        payload.coverUrl = coverUrl || url;
        payload.thumbnail = coverUrl || url;

        await adminDb.collection("magazines").add(payload);
      }
    } catch (error) {
      console.error("Failed to save media metadata to Firestore", error);
      throw error;
    }
  }

  static async getMedia() {
    if (!adminDb) return { gallery: [], magazines: [], videos: [] };

    try {
      const [gallerySnap, magazinesSnap, videosSnap] = await Promise.all([
        adminDb.collection("gallery").orderBy("createdAt", "desc").get().catch(() => ({ docs: [] })),
        adminDb.collection("magazines").orderBy("createdAt", "desc").get().catch(() => ({ docs: [] })),
        adminDb.collection("videos").orderBy("createdAt", "desc").get().catch(() => ({ docs: [] })),
      ]);

      const gallery = gallerySnap.docs.map((doc: any) => ({
        id: doc.id,
        collection: "gallery",
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : (doc.data().createdAt || null),
      }));

      const magazines = magazinesSnap.docs.map((doc: any) => ({
        id: doc.id,
        collection: "magazines",
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : (doc.data().createdAt || null),
      }));

      const videos = videosSnap.docs.map((doc: any) => ({
        id: doc.id,
        collection: "videos",
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : (doc.data().createdAt || null),
      }));

      return { gallery, magazines, videos };
    } catch (error) {
      console.error("Error fetching media from Firestore Admin:", error);
      return { gallery: [], magazines: [], videos: [] };
    }
  }

  static async deleteMedia(collection: string, id: string) {
    if (!adminDb) throw new Error("Firestore Admin SDK not initialized");
    if (collection !== "gallery" && collection !== "magazines" && collection !== "videos") {
      throw new Error("Invalid collection");
    }

    await adminDb.collection(collection).doc(id).delete();
  }
}
