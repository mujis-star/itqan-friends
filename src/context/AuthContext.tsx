"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, IdTokenResult } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth is not initialized. Please check your environment variables.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        try {
          // 1. Try to fetch custom claims to check for role
          const tokenResult: IdTokenResult = await firebaseUser.getIdTokenResult();
          let userRole = tokenResult.claims.role as string;
          
          // 2. If no custom claim, fallback to legacy Firestore users collection
          if (!userRole) {
            try {
              const { doc, getDoc } = await import("firebase/firestore");
              const userDocRef = doc(db, "users", firebaseUser.uid);
              const userDoc = await getDoc(userDocRef);
              
              if (userDoc.exists()) {
                const data = userDoc.data();
                // Map legacy 'admin' to 'Administrator' for RBAC compatibility
                if (data.role === 'admin') userRole = 'Administrator';
                else userRole = data.role || "Member";
              }
            } catch (fsError) {
              console.warn("Failed to fetch legacy role from Firestore", fsError);
            }
          }

          setRole(userRole || "Member"); // Default to member if neither exists
        } catch (error) {
          console.error("Failed to parse role", error);
          setRole("Member");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
