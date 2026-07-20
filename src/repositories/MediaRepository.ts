import { adminDb } from "@/lib/firebase/admin";

export class MediaRepository {
  /**
   * Saves metadata for a new upload into Firestore. (Server-side)
   */
  static async saveUpload(title: string, category: string, description: string, url: string, uploaderUid: string) {
    if (!adminDb) throw new Error("Firestore Admin SDK not initialized");

    const isGallery = category === "Photos" || category === "Videos";
    const collectionName = isGallery ? "gallery" : "magazines";

    const payload: any = {
      createdAt: new Date(),
      uploadedBy: uploaderUid,
    };

    if (isGallery) {
      payload.caption = title || "Untitled";
      payload.imageUrl = url;
    } else {
      payload.title = title;
      payload.type = category;
      payload.description = description;
      payload.coverUrl = url; // We'll use the same URL for cover if no PDF/thumbnail separation is provided yet
      payload.pdfUrl = url;
    }

    try {
      await adminDb.collection(collectionName).add(payload);
    } catch (error) {
      console.error("Failed to save media metadata to Firestore", error);
      throw error;
    }
  }
}
