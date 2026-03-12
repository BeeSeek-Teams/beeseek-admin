"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
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
        setError("Access denied. You do not have administrative privileges.");
        setLoading(false);
        return;
      }

      setAuth(user, access_token);
      
      const from = searchParams.get("from") || "/";
      router.push(from);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md bg-background rounded-[32px] shadow-2xl p-12 border border-border/60">
        <div className="flex flex-col items-center mb-10">
          <AdminText variant="bold" size="3xl">BeeSeek Admin</AdminText>
          <AdminText color="secondary" size="sm" className="mt-2">Sign in to manage the hive</AdminText>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 text-error text-sm font-semibold rounded-2xl text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <AdminInput
            label="Email Address"
            type="email"
            required
            placeholder="admin@beeseek.site"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
          />

          <AdminInput
            label="Password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            endIcon={
              <button
                type="button"
                className="text-muted hover:text-primary transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <AdminButton
            type="submit"
            loading={loading}
            fullWidth
            className="py-4 text-lg"
          >
            Sign In
          </AdminButton>
        </form>

        <div className="mt-10 pt-10 border-t border-border/30 flex flex-col items-center gap-4">
          <button 
            onClick={() => router.push('/queen/login')}
            className="text-xs font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Queen Bee Authorization
          </button>
          
          <AdminText color="secondary" size="xs">
            © 2026 BeeSeek Technologies. All rights reserved.
          </AdminText>
        </div>
      </div>
    </div>
  );
}
