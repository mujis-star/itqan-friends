"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Search, Command } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

export default function PortalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (user && !authLoading) {
      router.push("/portal/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all required fields.");
      return;
    }
    
    setError("");
    setIsProcessing(true);
    
    try {
      if (!auth || !db) {
        throw new Error("Firebase is not initialized. Please check your environment variables.");
      }

      if (isSignUp) {
        // Register User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        // Set display name on Firebase Auth profile
        await updateProfile(newUser, { displayName: name });
        
        // Create user document in Firestore with 'Pending' role (Option B)
        await setDoc(doc(db, "users", newUser.uid), {
          email: newUser.email,
          displayName: name,
          role: "Pending",
          createdAt: new Date()
        });
        
      } else {
        // Login User
        await signInWithEmailAndPassword(auth, email, password);
      }
      // AuthContext will automatically pick up the change and redirect
    } catch (err: any) {
      console.error("Authentication failed:", err);
      setError(err.message || "Authentication failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 lg:py-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Auth UI */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              ITQAN <span className="text-accent">Digital Portal</span>
            </h1>
            <p className="text-xl text-gray-400">
              {isSignUp ? "Join the community. Start your journey." : "Welcome back. Manage. Create. Inspire."}
            </p>
          </div>

          <div className="glass p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-gray-600"
                    placeholder="Mujeeb Ur Rahman"
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-gray-600"
                  placeholder="admin@itqan.org"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-400">Password</label>
                  {!isSignUp && <a href="#" className="text-xs text-accent hover:underline">Forgot?</a>}
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
              </div>
              
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 mt-4 bg-gradient-to-r from-secondary to-accent hover:from-accent hover:to-secondary text-black font-bold rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Authenticating..." : (isSignUp ? "Create Account" : "Access Command Center")}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                    }} 
                    className="ml-2 text-accent font-semibold hover:underline"
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
          <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-accent/10 blur-3xl rounded-[3rem]"></div>
          
          <div className="glass border border-white/10 p-8 rounded-[2.5rem] relative z-10 bg-gradient-to-b from-white/[0.05] to-transparent">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">ITQAN AI Assistant</h3>
                <p className="text-xs text-accent">Coming Soon • Preview</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-gray-300">
                Hi! I am the ITQAN Assistant. When the portal fully launches, I'll be able to help you search archives, organize events, and generate union reports instantly.
              </div>
              <div className="flex justify-end">
                <div className="bg-accent/10 border border-accent/20 text-accent rounded-2xl p-4 text-sm max-w-[80%]">
                  Show me all academic programs conducted in 2025.
                </div>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-gray-300">
                <div className="flex items-center gap-2 mb-2 text-accent">
                  <Search size={14} /> Searching archives...
                </div>
                I found 42 academic programs in 2025. Would you like me to generate a summary PDF or filter them by Wing?
              </div>
            </div>

            <div className="relative">
              <input 
                type="text" 
                disabled
                className="w-full bg-black/50 border border-white/10 rounded-full pl-5 pr-12 py-4 text-sm text-gray-500 cursor-not-allowed"
                placeholder="Ask ITQAN AI..."
              />
              <button disabled className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                <Command size={16} />
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
