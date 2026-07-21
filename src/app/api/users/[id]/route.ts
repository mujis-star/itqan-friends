import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { UserRepository } from "@/repositories/UserRepository";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Verify requester is an Admin
    const requester = await UserRepository.getUserProfile(decodedToken.uid);
    if (!requester || (!requester.role.toLowerCase().includes("admin") && requester.role !== "Super Admin")) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id } = await params;
    
    // Prevent deleting oneself
    if (id === decodedToken.uid) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Delete user from Firebase Auth
    await adminAuth.deleteUser(id);
    
    // Delete user from Firestore
    if (adminDb) {
      await adminDb.collection("users").doc(id).delete();
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
