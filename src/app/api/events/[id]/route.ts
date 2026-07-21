import { NextRequest, NextResponse } from "next/server";
import { EventRepository } from "@/repositories/EventRepository";
import { authMiddleware } from "@/lib/firebase/middleware";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authMiddleware(req, {
      requireAuth: true
    });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // The params is a promise in Next 15 App router sometimes, but usually fine synchronously if typed properly. Wait, in Next 15, dynamic route params must be awaited.
    const { id } = await params;
    
    await EventRepository.deleteEvent(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
