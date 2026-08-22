import { google } from "googleapis";
import { Readable } from "stream";

export class GoogleDriveService {
  private static driveClient: any = null;

  static normalizeFolderId(value?: string): string {
    const raw = (value || "").trim();
    if (!raw) return "";
    const match = raw.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    return raw.split("?")[0].split("&")[0].trim();
  }

  static getDriveFolderId(): string {
    return this.normalizeFolderId(process.env.GOOGLE_DRIVE_FOLDER_ID);
  }

  static isDriveConfigured(): boolean {
    const folderId = this.getDriveFolderId();
    const hasOAuth = Boolean(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
    );
    const hasServiceAccount = Boolean(
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
      process.env.FIREBASE_SERVICE_ACCOUNT ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS
    );

    return Boolean(folderId && (hasOAuth || hasServiceAccount));
  }

  static getDriveClient() {
    if (this.driveClient) return this.driveClient;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken) {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      this.driveClient = google.drive({ version: "v3", auth: oauth2Client });
      return this.driveClient;
    }

    const serviceAccountStr =
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountStr) {
      try {
        const credentials = JSON.parse(serviceAccountStr);
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ["https://www.googleapis.com/auth/drive"],
        });
        this.driveClient = google.drive({ version: "v3", auth });
        return this.driveClient;
      } catch (e) {
        console.error("GoogleDriveService: Error parsing service account credentials", e);
      }
    }

    return null;
  }

  /**
   * Uploads a file buffer directly to Google Drive folder.
   */
  static async uploadToDrive(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    appProperties?: Record<string, string>
  ) {
    const drive = this.getDriveClient();
    const folderId = this.getDriveFolderId();

    if (!drive) {
      throw new Error("Google Drive client is not initialized.");
    }

    const fileMetadata: any = {
      name: filename,
      appProperties: appProperties || {},
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType,
      body: Readable.from(buffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, mimeType, createdTime, appProperties, webViewLink, webContentLink",
    });

    const fileId = response.data.id;

    // Grant public read permission to anyone
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
    } catch (permErr) {
      console.warn("GoogleDriveService: Could not set public permission on file:", permErr);
    }

    return {
      fileId,
      viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    };
  }

  /**
   * Lists items from Google Drive folder with optional appProperties filter.
   */
  static async listDriveItems(kind?: string) {
    const drive = this.getDriveClient();
    const folderId = this.getDriveFolderId();

    if (!drive) return [];

    let query = "trashed = false";
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }
    if (kind) {
      query += ` and appProperties has { key='kind' and value='${kind}' }`;
    }

    try {
      const res = await drive.files.list({
        q: query,
        fields: "files(id, name, mimeType, createdTime, appProperties, webViewLink, thumbnailLink)",
        orderBy: "createdTime desc",
        pageSize: 100,
      });

      return (res.data.files || []).map((f: any) => ({
        id: f.id,
        title: f.appProperties?.caption || f.appProperties?.title || f.name,
        category: f.appProperties?.category || (kind === "gallery" ? "Photos" : kind === "videos" ? "Videos" : "Magazines"),
        date: f.createdTime,
        thumbnail: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1600`,
        fileUrl: `https://drive.google.com/file/d/${f.id}/view`,
        description: f.appProperties?.description || "",
      }));
    } catch (err) {
      console.error("GoogleDriveService: list error:", err);
      return [];
    }
  }

  /**
   * Deletes a file from Google Drive.
   */
  static async deleteDriveFile(fileId: string) {
    const drive = this.getDriveClient();
    if (!drive) return;
    try {
      await drive.files.delete({ fileId });
    } catch (err) {
      console.error("GoogleDriveService: delete error:", err);
    }
  }
}
