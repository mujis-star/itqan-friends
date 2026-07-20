import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  try {
    const email = "admin@itqan.org";
    const password = "password123";
    let userRecord;

    if (!adminAuth || !adminDb) {
      throw new Error("Admin SDK not initialized");
    }

    // 1. Check if user already exists
    try {
      userRecord = await adminAuth.getUserByEmail(email);
      // Update password just in case
      await adminAuth.updateUser(userRecord.uid, { password });
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        // Create new user
        userRecord = await adminAuth.createUser({
          email,
          password,
          displayName: "ITQAN Admin",
        });
      } else {
        throw e;
      }
    }

    // 2. Ensure they are marked as admin in the legacy users collection
    await adminDb.collection("users").doc(userRecord.uid).set({
      name: "ITQAN Admin",
      username: "admin",
      role: "admin",
      createdAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Test Admin created successfully! You can now log in.",
      credentials: {
        email,
        password
      }
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
