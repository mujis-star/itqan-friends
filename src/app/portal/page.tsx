"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Search, Command, ShieldCheck, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";

export default function PortalPage() {
  const { user, loading: authLoading, loginAsDemo } = useAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@itqan.org");
  const [password, setPassword] = useState("••••••••");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/portal/dashboard");
    }
  }, [user, authLoading, router]);

  const handleDemoAccess = () => {
    if (loginAsDemo) {
      loginAsDemo("Administrator");
      router.push("/portal/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    // If Firebase is not configured or offline, verify password & log in as member profile
    if (!auth || !db) {
      const { verifyAccountPassword } = await import("@/context/AuthContext");
      const isValid = verifyAccountPassword(email || "admin@itqan.org", password);

      if (!isValid) {
        setError(`Incorrect password for ${email}. Default password is 'itqan123' unless changed in My Profile.`);
        setIsProcessing(false);
        return;
      }

      setTimeout(() => {
        if (loginAsDemo) {
          loginAsDemo(email || "admin@itqan.org");
          router.push("/portal/dashboard");
        }
      }, 300);
      return;
    }

    try {
      if (isSignUp) {
        if (!email || !password || !name) {
          setError("Please fill in all required fields.");
          setIsProcessing(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        await updateProfile(newUser, { displayName: name });

        await setDoc(doc(db, "users", newUser.uid), {
          email: newUser.email,
          displayName: name,
          role: "Pending",
          createdAt: new Date(),
        });
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (firebaseErr: any) {
          // If Firebase Auth rejects (e.g. account not created yet in cloud Firebase Auth),
          // check if password matches the member password or default 'itqan123'/'password123'
          const { verifyAccountPassword } = await import("@/context/AuthContext");
          const isValid =
            verifyAccountPassword(email, password) ||
            password === "itqan123" ||
            password === "password123";

          if (isValid && loginAsDemo) {
            loginAsDemo(email);
            router.push("/portal/dashboard");
            return;
          }

          throw firebaseErr;
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(
        err.message ||
          "Authentication failed. Please verify your credentials or click 'Sign Up' to create an account."
      );
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const firebaseMissing = !auth || !db;

  return (
    <div className="container mx-auto px-6 py-12 lg:py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Auth UI */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight text-white">
              ITQAN <span className="gradient-text">Digital Portal</span>
            </h1>
            <p className="text-lg text-gray-300">
              {isSignUp ? "Join the community. Start your journey." : "Welcome back. Manage. Create. Inspire."}
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs leading-relaxed">
                  {error}
                </div>
              )}

              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all placeholder:text-gray-600"
                    placeholder="Mujeeb Ur Rahman"
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all placeholder:text-gray-600"
                  placeholder="admin@itqan.org"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Password
                  </label>
                  {!isSignUp && (
                    <a href="#" className="text-xs text-primary hover:underline">
                      Forgot?
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={isProcessing}
                  magnetic
                  className="w-full py-3.5 text-sm"
                >
                  {isProcessing
                    ? "Authenticating..."
                    : isSignUp
                    ? "Create Account"
                    : "Access Command Center"}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                    }}
                    className="ml-2 text-primary font-semibold hover:underline"
                  >
                    {isSignUp ? "Log In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Right Side: AI Assistant Preview */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 blur-3xl rounded-[3rem] pointer-events-none"></div>

          <div className="glass-card border border-white/10 p-8 rounded-[2.5rem] relative z-10 bg-gradient-to-b from-white/[0.05] to-transparent">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">ITQAN AI Assistant</h3>
                <p className="text-xs text-primary font-semibold">Coming Soon • Preview</p>
              </div>
            </div>

            <div className="space-y-4 mb-8 text-xs">
              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 text-gray-300 leading-relaxed">
                Hi! I am the ITQAN Assistant. When the portal fully launches, I&apos;ll be able to help you search archives, organize events, and generate union reports instantly.
              </div>
              <div className="flex justify-end">
                <div className="bg-primary/10 border border-primary/20 text-primary rounded-2xl p-4 max-w-[80%]">
                  Show me all academic programs conducted in 2025.
                </div>
              </div>
              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 text-gray-300 leading-relaxed">
                <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                  <Search size={14} /> Searching archives...
                </div>
                I found 42 academic programs in 2025. Would you like me to generate a summary PDF or filter them by Wing?
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                disabled
                className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-5 pr-12 py-3.5 text-xs text-gray-500 cursor-not-allowed"
                placeholder="Ask ITQAN AI..."
              />
              <button
                disabled
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500"
              >
                <Command size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
