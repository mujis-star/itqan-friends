import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/firebase/middleware";
import { UploadService } from "@/services/UploadService";
import { MediaRepository } from "@/repositories/MediaRepository";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req, { requireAuth: true });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const fileId = formData.get("fileId") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string, 10);
    const totalChunks = parseInt(formData.get("totalChunks") as string, 10);
    const filename = (formData.get("filename") as string) || "upload.mp4";
    const mimeType = (formData.get("mimeType") as string) || "video/mp4";
    const title = (formData.get("title") as string) || filename;
    const category = (formData.get("category") as string) || "Videos";
    const description = (formData.get("description") as string) || "";
    const chunkFile = formData.get("chunk") as File;

    if (!fileId || isNaN(chunkIndex) || !chunkFile) {
      return NextResponse.json({ error: "Invalid chunk payload" }, { status: 400 });
    }

    const tmpDir = path.join(os.tmpdir(), "itqan_uploads");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const tempFilePath = path.join(tmpDir, `${fileId}_part_${chunkIndex}`);
    const arrayBuffer = await chunkFile.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));

    // If this is the final chunk, assemble all parts and process
    if (chunkIndex === totalChunks - 1) {
      const finalBufferList: Buffer[] = [];
      for (let i = 0; i < totalChunks; i++) {
        const partPath = path.join(tmpDir, `${fileId}_part_${i}`);
        if (fs.existsSync(partPath)) {
          finalBufferList.push(fs.readFileSync(partPath));
          try {
            fs.unlinkSync(partPath);
          } catch {}
        } else {
          return NextResponse.json(
            { error: `Missing chunk part ${i} during assembly` },
            { status: 400 }
          );
        }
      }

      const completeBuffer = Buffer.concat(finalBufferList);

      // Upload complete buffer via UploadService (Google Drive / Firebase Storage Admin)
      let publicUrl = "";
      try {
        publicUrl = await UploadService.uploadFile(
          completeBuffer,
          filename,
          mimeType,
          {
            kind: category === "Videos" ? "videos" : category === "Photos" ? "gallery" : "magazines",
            caption: title,
            category: category,
          }
        );
      } catch (uploadErr: any) {
        console.error("Chunk assembly upload error:", uploadErr);
        throw new Error(uploadErr.message || "Failed to persist assembled file");
      }

      // Save metadata to database
      await MediaRepository.saveUpload(
        title,
        category,
        description,
        publicUrl,
        user.uid || "Administrator",
        publicUrl
      );

      return NextResponse.json({
        success: true,
        url: publicUrl,
        message: "File fully assembled and uploaded successfully",
      });
    }

    return NextResponse.json({
      success: true,
      chunkIndex,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} received`,
    });
  } catch (error: any) {
    console.error("Chunk upload route error:", error);
    return NextResponse.json(
      { error: error.message || "Chunk upload failed" },
      { status: 500 }
    );
  }
}
