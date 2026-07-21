import { adminDb } from "@/lib/firebase/admin";

export class EventRepository {
  private static collection = "events";

  static async createEvent(data: {
    title: string;
    description: string;
    date: string;
    location: string;
    status: string;
    createdBy: string;
  }) {
    if (!adminDb) throw new Error("Firestore Admin SDK not initialized");
    
    const payload = {
      ...data,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection(this.collection).add(payload);
    return docRef.id;
  }

  static async getEvents() {
    if (!adminDb) return [];
    
    const snapshot = await adminDb.collection(this.collection).orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || null
    }));
  }

  static async updateEvent(id: string, data: any) {
    if (!adminDb) throw new Error("Firestore Admin SDK not initialized");
    
    await adminDb.collection(this.collection).doc(id).update({
      ...data,
      updatedAt: new Date()
    });
  }

  static async deleteEvent(id: string) {
    if (!adminDb) throw new Error("Firestore Admin SDK not initialized");
    
    await adminDb.collection(this.collection).doc(id).delete();
  }
}
