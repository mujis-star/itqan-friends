import { adminStorage } from "@/lib/firebase/admin";
import { v4 as uuidv4 } from "uuid";

export class UploadService {
  /**
   * Uploads a file buffer to Firebase Storage and returns the public URL.
   * (Server-side only)
   */
  static async uploadFile(buffer: Buffer, originalFilename: string, mimeType: string): Promise<string> {
    if (!adminStorage) {
      throw new Error("Firebase Admin Storage is not initialized.");
    }

    try {
      const bucket = adminStorage.bucket();
      
      const extension = originalFilename.split(".").pop();
      const safeFilename = `uploads/${Date.now()}-${uuidv4()}.${extension}`;

      const file = bucket.file(safeFilename);

      await file.save(buffer, {
        metadata: {
          contentType: mimeType,
        },
      });

      await file.makePublic();
      
      return file.publicUrl();
    } catch (error) {
      console.error("Firebase Storage Upload Error:", error);
      throw new Error("Failed to upload to storage.");
    }
  }
}
