"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, IdTokenResult } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | { uid: string; email: string; displayName?: string } | null;
  role: string | null;
  loading: boolean;
  isDemo?: boolean;
  loginAsDemo?: (role?: string) => void;
  logoutDemo?: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  isDemo: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check for demo user session
    const demoSession = typeof window !== "undefined" ? sessionStorage.getItem("itqan_demo_user") : null;
    if (demoSession) {
      try {
        const parsed = JSON.parse(demoSession);
        setUser(parsed.user);
        setRole(parsed.role || "Administrator");
        setIsDemo(true);
        setLoading(false);
        return;
      } catch (e) {
        sessionStorage.removeItem("itqan_demo_user");
      }
    }

    if (!auth) {
      console.warn("Firebase Auth is not initialized. Demo mode available.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsDemo(false);

        try {
          const tokenResult: IdTokenResult = await firebaseUser.getIdTokenResult();
          let userRole = tokenResult.claims.role as string;

          if (!userRole && db) {
            try {
              const { doc, getDoc } = await import("firebase/firestore");
              const userDocRef = doc(db, "users", firebaseUser.uid);
              const userDoc = await getDoc(userDocRef);

              if (userDoc.exists()) {
                const data = userDoc.data();
                if (data.role === "admin") userRole = "Administrator";
                else userRole = data.role || "Member";
              }
            } catch (fsError) {
              console.warn("Failed to fetch legacy role from Firestore", fsError);
            }
          }

          setRole(userRole || "Member");
        } catch (error) {
          console.error("Failed to parse role", error);
          setRole("Member");
        }
      } else {
        if (!sessionStorage.getItem("itqan_demo_user")) {
          setUser(null);
          setRole(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsDemo = (demoRole = "Administrator") => {
    const demoUser = {
      uid: "demo-admin-123",
      email: "admin@itqan.org",
      displayName: "Demo Administrator",
    };
    setUser(demoUser);
    setRole(demoRole);
    setIsDemo(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "itqan_demo_user",
        JSON.stringify({ user: demoUser, role: demoRole })
      );
    }
  };

  const logoutDemo = () => {
    setUser(null);
    setRole(null);
    setIsDemo(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("itqan_demo_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, isDemo, loginAsDemo, logoutDemo }}>
      {children}
    </AuthContext.Provider>
  );
};
