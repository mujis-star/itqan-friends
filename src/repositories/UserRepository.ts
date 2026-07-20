import { adminDb } from "@/lib/firebase/admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  wing?: string;
  createdAt: Date;
}

export class UserRepository {
  private static collection = "users";

  /**
   * Fetches a user profile by UID (Server-side)
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!adminDb) return null;

    try {
      const doc = await adminDb.collection(this.collection).doc(uid).get();
      if (!doc.exists) return null;
      
      const data = doc.data();
      return {
        uid,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
      } as UserProfile;
    } catch (error) {
      console.error("Error fetching user profile", error);
      return null;
    }
  }
}
