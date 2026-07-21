import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function authMiddleware(
  req: NextRequest,
  options: { requireAuth?: boolean; requiredRole?: string } = {}
) {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (options.requireAuth) return null;
    return null;
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    if (!adminAuth) {
      throw new Error("Admin Auth not initialized");
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    return decodedToken;
  } catch (error) {
    console.error("Auth middleware error validating token:", error);
    return null;
  }
}
