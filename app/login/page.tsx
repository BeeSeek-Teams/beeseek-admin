"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Lock, Envelope, EyeClosedIcon } from "@phosphor-icons/react";
import api from "@/lib/api";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { AdminInput } from "@/components/AdminInput";

const ALLOWED_ADMIN_ROLES: UserRole[] = ["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN"];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, access_token } = response.data;

      if (!ALLOWED_ADMIN_ROLES.includes(user.role)) {
        setError("Access denied. You don't have admin privileges.");
        setLoading(false);
        return;
      }

      setAuth(user, access_token);
      
      const from = searchParams.get("from") || "/";
      router.push(from);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 border border-black/5">
        <div className="flex flex-col items-center mb-8">
          {/* <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <span className="text-white font-black text-lg">B</span>
          </div> */}
          <h1 className="text-xl font-black text-primary">BeeSeek Admin</h1>
          <p className="text-xs text-black/30 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <AdminInput
            label="Email"
            type="email"
            required
            placeholder="admin@beeseek.site"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Envelope size={16} weight="bold" />}
          />

          <AdminInput
            label="Password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} weight="bold" />}
            endIcon={
              <button
                type="button"
                className="text-black/20 hover:text-primary transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeClosedIcon size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-black/5 flex flex-col items-center gap-3">
          <button 
            onClick={() => router.push('/queen/login')}
            className="text-[10px] font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-1.5"
          >
            <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
            Queen Bee Access
          </button>
          
          <p className="text-[10px] text-black/20">
            © 2026 BeeSeek Technologies
          </p>
        </div>
      </div>
    </div>
  );
}
