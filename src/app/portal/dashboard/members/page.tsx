"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, ShieldAlert, CheckCircle2, Trash2, Shield } from "lucide-react";
import { auth } from "@/lib/firebase/config";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  wing?: string;
  createdAt: string | Date;
}

const ROLES = ["Pending", "Member", "Media", "Editor", "Admin"];

export default function MembersPage() {
  const { user: currentUser, role: currentUserRole } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!auth?.currentUser) return;
    
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: string) => {
    if (!auth?.currentUser) return;
    
    // Optimistic update
    const previousUsers = [...users];
    setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    setUpdating(uid);
    
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUid: uid, newRole })
      });
      
      if (!res.ok) {
        throw new Error("Failed to update role");
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setUsers(previousUsers);
      alert("Failed to update role. Ensure you have Admin privileges.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!auth?.currentUser) return;
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;

    setUpdating(uid);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/users/${uid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete user");
      }
      
      // Update local state
      setUsers(users.filter(u => u.uid !== uid));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user. Ensure you have Admin privileges.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUserRole?.toLowerCase().includes("admin") && currentUserRole !== "Super Admin") {
    return (
      <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center">
        <ShieldAlert className="text-red-400 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-400">Only administrators can manage member roles.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Member Directory</h1>
        <p className="text-gray-400 mt-2">Approve, assign roles, and manage ITQAN members.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-sm text-gray-400">
                <th className="p-4 font-medium">Member</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                        {user.displayName?.charAt(0) || <User size={18} />}
                      </div>
                      <div>
                        <p className="font-semibold">{user.displayName || "Unknown User"}</p>
                        {user.uid === currentUser?.uid && (
                          <span className="text-[10px] uppercase tracking-wider bg-accent/20 text-accent px-2 py-0.5 rounded-full inline-block mt-1">You</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{user.email}</td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                      disabled={updating === user.uid || user.uid === currentUser?.uid}
                      className={`text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 outline-none focus:border-accent transition-colors ${
                        user.uid === currentUser?.uid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    {user.uid !== currentUser?.uid && (
                      <button 
                        onClick={() => handleDeleteUser(user.uid)}
                        disabled={updating === user.uid}
                        className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
