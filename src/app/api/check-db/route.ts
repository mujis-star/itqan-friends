import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const magazines = await adminDb.collection("magazines").orderBy("createdAt", "desc").limit(5).get();
    const magData = magazines.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }));

    const gallery = await adminDb.collection("gallery").orderBy("createdAt", "desc").limit(5).get();
    const galData = gallery.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ magazines: magData, gallery: galData });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
