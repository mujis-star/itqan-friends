"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, IdTokenResult } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  wing?: string;
  admissionNo?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
}

const KNOWN_MEMBERS_MAP: Record<string, Partial<UserProfileData>> = {
  "hudaif@itqan.org": { uid: "m-733", displayName: "Sayed Hudaif", role: "Super Admin", wing: "Executive", admissionNo: "733" },
  "burhan@itqan.org": { uid: "m-725", displayName: "Sayed Burhan", role: "Administrator", wing: "Executive", admissionNo: "725" },
  "zidan@itqan.org": { uid: "m-707", displayName: "Zidan", role: "Administrator", wing: "Executive", admissionNo: "707" },
  "muhyudheen@itqan.org": { uid: "m-742", displayName: "Muhyudheen", role: "Editor", wing: "Executive", admissionNo: "742" },
  "mirsad@itqan.org": { uid: "m-717", displayName: "Mirsad", role: "Editor", wing: "Executive", admissionNo: "717" },
  "thanzeeh@itqan.org": { uid: "m-705", displayName: "Thanzeeh Moosa", role: "Editor", wing: "Executive", admissionNo: "705" },
  "shahzad@itqan.org": { uid: "m-714", displayName: "Shahzad", role: "Media", wing: "Media Wing", admissionNo: "714" },
  "vk.muhammed@itqan.org": { uid: "m-695", displayName: "Muhammed V.K", role: "Member", wing: "Urdu Wing", admissionNo: "695" },
  "hisham@itqan.org": { uid: "m-676", displayName: "Hisham", role: "Member", wing: "Urdu Wing", admissionNo: "676" },
  "mujeeb@itqan.org": { uid: "m-702", displayName: "Mujeeb Rahman", role: "Member", wing: "English Wing", admissionNo: "702" },
  "zameen@itqan.org": { uid: "m-699", displayName: "Zameen", role: "Member", wing: "English Wing", admissionNo: "699" },
  "naseem@itqan.org": { uid: "m-728", displayName: "Naseem", role: "Member", wing: "Arabic Wing", admissionNo: "728" },
  "razeen@itqan.org": { uid: "m-724", displayName: "Razeen", role: "Member", wing: "Arabic Wing", admissionNo: "724" },
  "rabeeh@itqan.org": { uid: "m-704", displayName: "Rabeeh", role: "Member", wing: "Malayalam Wing", admissionNo: "704" },
  "muzzammil@itqan.org": { uid: "m-716", displayName: "Muzzammil", role: "Member", wing: "Malayalam Wing", admissionNo: "716" },
  "muhammed.u@itqan.org": { uid: "m-719", displayName: "Muhammed U", role: "Member", wing: "Maths Wing", admissionNo: "719" },
  "muhammed.pp@itqan.org": { uid: "m-723", displayName: "Muhammed PP", role: "Member", wing: "Maths Wing", admissionNo: "723" },
  "shabeel@itqan.org": { uid: "m-718", displayName: "Shabeel", role: "Member", wing: "Science Wing", admissionNo: "718" },
  "muhaimin@itqan.org": { uid: "m-697", displayName: "Muhaimin", role: "Member", wing: "Science Wing", admissionNo: "697" },
  "sm.muhammed@itqan.org": { uid: "m-701", displayName: "Muhammed S.M", role: "Media", wing: "Media Wing", admissionNo: "701" },
  "zarhan@itqan.org": { uid: "m-722", displayName: "Zarhan", role: "Member", wing: "Malayalam Wing", admissionNo: "722" },
  "abdurahman@itqan.org": { uid: "m-715", displayName: "Abdu Rahman", role: "Member", wing: "Science Wing", admissionNo: "715" },
  "aslah@itqan.org": { uid: "m-720", displayName: "Aslah", role: "Member", wing: "Arabic Wing", admissionNo: "720" },
  "habeeb@itqan.org": { uid: "m-696", displayName: "Fuad Habeeb", role: "Member", wing: "Media Wing", admissionNo: "696" },
  "fuad@itqan.org": { uid: "m-732", displayName: "Fuad M.A", role: "Member", wing: "English Wing", admissionNo: "732" },
  "nuhman@itqan.org": { uid: "m-743", displayName: "Nuhman", role: "Member", wing: "Malayalam Wing", admissionNo: "743" },
  "minhaj@itqan.org": { uid: "m-677", displayName: "Minhaj", role: "Member", wing: "Publishing Bureau", admissionNo: "677" },
  "rashad@itqan.org": { uid: "m-710", displayName: "Rashad", role: "Member", wing: "Urdu Wing", admissionNo: "710" },
  "razin@itqan.org": { uid: "m-711", displayName: "Razin", role: "Member", wing: "Maths Wing", admissionNo: "711" },
  "fidyan@itqan.org": { uid: "m-712", displayName: "Fidyan", role: "Member", wing: "Malayalam Wing", admissionNo: "712" },
  "salah@itqan.org": { uid: "m-713", displayName: "Salah M.A", role: "Member", wing: "General", admissionNo: "713" },
  "zayin@itqan.org": { uid: "m-727", displayName: "Zayin", role: "Member", wing: "General", admissionNo: "727" },
};

export function getAccountPassword(email: string): string {
  if (typeof window === "undefined" || !email) return "itqan123";
  try {
    const passwordsStr = localStorage.getItem("itqan_user_passwords");
    if (passwordsStr) {
      const parsed = JSON.parse(passwordsStr);
      if (parsed[email.toLowerCase()]) return parsed[email.toLowerCase()];
    }
  } catch (e) {
    console.error(e);
  }
  return "itqan123";
}

export function setAccountPassword(email: string, newPass: string): void {
  if (typeof window === "undefined" || !email || !newPass) return;
  try {
    const passwordsStr = localStorage.getItem("itqan_user_passwords");
    const passwords = passwordsStr ? JSON.parse(passwordsStr) : {};
    passwords[email.toLowerCase()] = newPass;
    localStorage.setItem("itqan_user_passwords", JSON.stringify(passwords));
  } catch (e) {
    console.error(e);
  }
}

export function verifyAccountPassword(email: string, passAttempt: string): boolean {
  const currentPass = getAccountPassword(email);
  return passAttempt === currentPass;
}

interface AuthContextType {
  user: User | UserProfileData | null;
  role: string | null;
  loading: boolean;
  isDemo?: boolean;
  loginAsDemo?: (emailOrRole?: string) => void;
  logoutDemo?: () => void;
  updateCurrentUserProfile?: (updated: Partial<UserProfileData>) => void;
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
    // Check for demo or local session
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
      console.warn("Firebase Auth is not initialized. Portal session mode available.");
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

  const loginAsDemo = (emailOrRole = "admin@itqan.org") => {
    let targetEmail = emailOrRole.includes("@") ? emailOrRole.toLowerCase() : "admin@itqan.org";

    // Check if custom member list was updated by Admin in localStorage
    let customMember: UserProfileData | undefined;
    if (typeof window !== "undefined") {
      const savedMembersStr = localStorage.getItem("itqan_custom_members");
      if (savedMembersStr) {
        try {
          const membersList = JSON.parse(savedMembersStr);
          customMember = membersList.find((m: any) => m.email?.toLowerCase() === targetEmail);
        } catch (e) {
          console.error(e);
        }
      }
    }

    const matched = customMember || KNOWN_MEMBERS_MAP[targetEmail];

    let sessionUser: UserProfileData;
    let targetRole: string;

    if (matched) {
      sessionUser = {
        uid: matched.uid || `user-${Date.now()}`,
        email: targetEmail,
        displayName: matched.displayName || "ITQAN Member",
        role: matched.role || "Member",
        wing: matched.wing || "Executive",
        admissionNo: matched.admissionNo || "700",
        bio: matched.bio,
        avatarUrl: matched.avatarUrl,
      };
      targetRole = matched.role || "Member";
    } else {
      targetRole = emailOrRole.includes("@") ? "Member" : emailOrRole;
      sessionUser = {
        uid: "demo-admin-123",
        email: targetEmail,
        displayName: targetEmail.startsWith("admin") ? "Demo Administrator" : targetEmail.split("@")[0],
        role: targetRole,
        wing: "Executive Committee",
        admissionNo: "733",
      };
    }

    setUser(sessionUser);
    setRole(targetRole);
    setIsDemo(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "itqan_demo_user",
        JSON.stringify({ user: sessionUser, role: targetRole })
      );
    }
  };

  const updateCurrentUserProfile = (updated: Partial<UserProfileData>) => {
    if (!user) return;
    const newUserData = { ...user, ...updated };
    setUser(newUserData);
    if (updated.role) setRole(updated.role);

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "itqan_demo_user",
        JSON.stringify({ user: newUserData, role: updated.role || role })
      );

      // Also sync to custom members list in localStorage
      const savedMembersStr = localStorage.getItem("itqan_custom_members");
      if (savedMembersStr) {
        try {
          const list = JSON.parse(savedMembersStr);
          const updatedList = list.map((m: any) =>
            m.email?.toLowerCase() === user.email?.toLowerCase() ? { ...m, ...updated } : m
          );
          localStorage.setItem("itqan_custom_members", JSON.stringify(updatedList));
        } catch (e) {
          console.error(e);
        }
      }
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
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isDemo,
        loginAsDemo,
        logoutDemo,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
