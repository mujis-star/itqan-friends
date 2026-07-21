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

  /**
   * Fetches all registered users (Server-side, Admin only)
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    if (!adminDb) return [];

    try {
      const snapshot = await adminDb.collection(this.collection).orderBy("createdAt", "desc").get();
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          uid: doc.id,
          ...data,
          createdAt: data?.createdAt?.toDate() || new Date(),
        } as UserProfile;
      });
    } catch (error) {
      console.error("Error fetching all users", error);
      return [];
    }
  }

  /**
   * Updates a user's role (Server-side, Admin only)
   */
  static async updateUserRole(uid: string, newRole: string): Promise<boolean> {
    if (!adminDb) return false;

    try {
      await adminDb.collection(this.collection).doc(uid).update({
        role: newRole,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error("Error updating user role", error);
      return false;
    }
  }
}
