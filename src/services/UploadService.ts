import { google } from 'googleapis';
import { Readable } from 'stream';
import { v4 as uuidv4 } from "uuid";

export class UploadService {
  /**
   * Uploads a file buffer to Google Drive using the Service Account and returns the webViewLink.
   * (Server-side only)
   */
  static async uploadFile(buffer: Buffer, originalFilename: string, mimeType: string): Promise<string> {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error("Service Account JSON not provided in environment variables.");
    }

    let credentials;
    try {
      credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
    } catch (e) {
      throw new Error("Invalid Service Account JSON format.");
    }

    // Authenticate with Google API
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const extension = originalFilename.split(".").pop();
    const safeFilename = `${Date.now()}-${uuidv4()}.${extension}`;

    // Convert Buffer to Readable Stream for googleapis
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // Note: You can specify a parent folder ID if needed by adding parents: ['FOLDER_ID']
    const fileMetadata = {
      name: safeFilename,
      // parents: ['YOUR_FOLDER_ID'],
    };

    const media = {
      mimeType,
      body: stream,
    };

    try {
      // 1. Upload to Drive
      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
      });

      const fileId = file.data.id;

      if (!fileId) throw new Error("Upload failed, no file ID returned.");

      // 2. Make it publicly readable
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // 3. Refetch to guarantee we get the webViewLink
      const refetchedFile = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink'
      });

      // Return the direct download or view link
      return refetchedFile.data.webViewLink || file.data.webViewLink || "";
    } catch (error) {
      console.error("Google Drive API Error:", error);
      throw new Error("Failed to upload to Google Drive");
    }
  }
}
