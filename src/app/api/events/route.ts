import { NextRequest, NextResponse } from "next/server";
import { EventRepository } from "@/repositories/EventRepository";
import { authMiddleware } from "@/lib/firebase/middleware";

export async function GET(req: NextRequest) {
  try {
    const events = await EventRepository.getEvents();
    return NextResponse.json({ events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req, {
      requireAuth: true
    });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const eventId = await EventRepository.createEvent({
      ...body,
      createdBy: user.uid
    });

    return NextResponse.json({ success: true, eventId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
