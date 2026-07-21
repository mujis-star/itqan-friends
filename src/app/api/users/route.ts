import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { UserRepository } from "@/repositories/UserRepository";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Verify requester is an Admin
    const requester = await UserRepository.getUserProfile(decodedToken.uid);
    if (!requester || requester.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const users = await UserRepository.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Verify requester is an Admin
    const requester = await UserRepository.getUserProfile(decodedToken.uid);
    if (!requester || requester.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await request.json();
    const { targetUid, newRole } = body;

    if (!targetUid || !newRole) {
      return NextResponse.json({ error: "Missing targetUid or newRole" }, { status: 400 });
    }

    const success = await UserRepository.updateUserRole(targetUid, newRole);
    if (success) {
      return NextResponse.json({ message: "Role updated successfully" });
    } else {
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
