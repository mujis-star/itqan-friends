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
    });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const cover = formData.get("cover") as File | null;
    const title = (formData.get("title") as string) || "";
    const category = (formData.get("category") as string) || "Photos";
    const description = (formData.get("description") as string) || "";
    const videoUrl = (formData.get("videoUrl") as string) || "";

    if (!file && !videoUrl) {
      return NextResponse.json({ error: "No file or video URL provided" }, { status: 400 });
    }

    // 3. Validate Inputs
    const validation = mediaUploadSchema.safeParse({
      title: title || (file ? file.name : "Untitled Media"),
      description: description,
      type: category,
      videoUrl: videoUrl,
      file: file,
    });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    let publicUrl = videoUrl;
    let coverUrl = "";

    // 4. Upload Cover Image if provided
    if (cover && cover.size > 0) {
      try {
        const coverArrayBuffer = await cover.arrayBuffer();
        const coverBuffer = Buffer.from(coverArrayBuffer);
        coverUrl = await UploadService.uploadFile(coverBuffer, cover.name, cover.type || "image/jpeg");
      } catch (coverErr) {
        console.warn("Cover image upload failed, continuing with main file", coverErr);
      }
    }

    // 5. Upload Main File if provided
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      publicUrl = await UploadService.uploadFile(buffer, file.name, file.type || "application/octet-stream");
      if (!coverUrl && file.type.startsWith("image/")) {
        coverUrl = publicUrl;
      }
    }

    // 6. Save Metadata to Firestore via MediaRepository
    await MediaRepository.saveUpload(
      title || (file ? file.name : "Untitled Media"),
      category,
      description,
      publicUrl,
      user.uid || "Administrator",
      coverUrl
    );

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      coverUrl: coverUrl,
      message: "Media successfully uploaded to Cloud Storage and saved to Database."
    });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
