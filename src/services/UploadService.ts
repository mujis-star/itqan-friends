import { adminStorage } from "@/lib/firebase/admin";
import { v4 as uuidv4 } from "uuid";

export class UploadService {
  /**
   * Uploads a file buffer to Firebase Storage and returns the public URL.
   * (Server-side only)
   */
  static async uploadFile(buffer: Buffer, originalFilename: string, mimeType: string): Promise<string> {
    if (!adminStorage) {
      console.warn("Firebase Admin Storage is not initialized. Using base64 data URI fallback.");
      const base64 = buffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }

    try {
      const bucket = adminStorage.bucket();
      const extension = originalFilename.split(".").pop() || "bin";
      const safeFilename = `uploads/${Date.now()}-${uuidv4()}.${extension}`;
      const file = bucket.file(safeFilename);

      await file.save(buffer, {
        metadata: {
          contentType: mimeType,
        },
      });

      try {
        await file.makePublic();
        return file.publicUrl();
      } catch (pubErr) {
        console.warn("makePublic failed on bucket file, using direct Firebase storage public url:", pubErr);
        const bucketName = bucket.name || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "zenith-artsfest.firebasestorage.app";
        return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(safeFilename)}?alt=media`;
      }
    } catch (error: any) {
      console.error("Firebase Storage Upload Error:", error);
      if (buffer.length < 10 * 1024 * 1024) {
        console.warn("Falling back to Base64 data URL to ensure cross-device persistence.");
        const base64 = buffer.toString("base64");
        return `data:${mimeType};base64,${base64}`;
      }
      throw new Error(`Failed to upload to storage: ${error.message}`);
    }
  }
}
