import { NextRequest, NextResponse } from "next/server";
import { MediaRepository } from "@/repositories/MediaRepository";

export async function GET(req: NextRequest) {
  try {
    const media = await MediaRepository.getMedia();
    return NextResponse.json({ success: true, ...media });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
