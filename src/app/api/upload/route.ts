import { NextRequest, NextResponse } from "next/server";
import { UploadService } from "@/services/UploadService";
import { MediaRepository } from "@/repositories/MediaRepository";
import { authMiddleware } from "@/lib/firebase/middleware";
import { mediaUploadSchema } from "@/validation/uploadSchema";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate & Authorize
    const user = await authMiddleware(req, {
      requireAuth: true,
      // For legacy compat, we might relax the 'Administrator' strictly in middleware, 
      // but let's check roles inside here if needed.
    });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. Validate Inputs
    const validation = mediaUploadSchema.safeParse({
      title: title,
      description: description,
      type: category,
      file: file,
    });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    // 4. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Upload to Google Drive via UploadService
    const publicUrl = await UploadService.uploadFile(buffer, file.name, file.type);

    // 6. Save Metadata to Firestore via MediaRepository
    await MediaRepository.saveUpload(title, category, description, publicUrl, user.uid);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: "File successfully uploaded to Google Drive and saved to Database."
    });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
