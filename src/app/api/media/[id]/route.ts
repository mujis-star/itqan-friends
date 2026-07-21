import { NextRequest, NextResponse } from "next/server";
import { MediaRepository } from "@/repositories/MediaRepository";
import { authMiddleware } from "@/lib/firebase/middleware";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authMiddleware(req, {
      requireAuth: true
    });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const collection = searchParams.get("collection"); // 'gallery' or 'magazines'

    if (!collection) {
      return NextResponse.json({ error: "Collection parameter missing" }, { status: 400 });
    }
    
    await MediaRepository.deleteMedia(collection, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
