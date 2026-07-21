import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    let deletedCount = 0;
    
    // Clean Magazines
    const mags = await adminDb.collection("magazines").get();
    for (const doc of mags.docs) {
      const data = doc.data();
      if (!data.pdfUrl || !data.pdfUrl.startsWith("http")) {
        await doc.ref.delete();
        deletedCount++;
      }
    }

    // Clean Gallery
    const gallery = await adminDb.collection("gallery").get();
    for (const doc of gallery.docs) {
      const data = doc.data();
      if (!data.imageUrl || !data.imageUrl.startsWith("http")) {
        await doc.ref.delete();
        deletedCount++;
      }
    }

    return NextResponse.json({ success: true, deletedCount });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
