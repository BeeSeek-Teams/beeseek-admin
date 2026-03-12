"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminInput } from "@/components/AdminInput";

export default function QueenLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/queen-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        // Both queen_session and queen_key cookies are set by the API (httpOnly)
        router.push('/queen/dashboard');
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010816] px-4">
      <div className="w-full max-w-md bg-[#021027] rounded-[32px] shadow-2xl p-10 border border-primary/20 relative overflow-hidden">
        {/* Animated Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -ml-16 -mb-16" />

        <div className="flex flex-col items-center mb-10 relative z-10">
          <AdminText variant="bold" size="3xl" color="white">Queen Bee</AdminText>
          <AdminText size="sm" color="white" className="mt-2 font-bold uppercase tracking-widest">Restricted Console</AdminText>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 text-error text-sm font-semibold rounded-2xl text-center">
              {error}
            </div>
          )}

          <AdminInput
            label="Security Key"
            labelClassName="text-white"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} className="text-white" />}
            className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-primary focus:border-primary"
            endIcon={
              <button
                type="button"
                className="text-white/50 hover:text-white transition-colors focus:outline-none"
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
            className="py-4 text-lg bg-primary hover:bg-primary/90 text-white font-black"
          >
            Authorize Entry
          </AdminButton>
        </form>

        <div className="mt-12 flex flex-col items-center gap-6 relative z-10">
          <button 
            type="button"
            onClick={() => router.push('/login')}
            className="text-xs font-bold text-white hover:text-primary transition-colors underline underline-offset-4"
          >
            Back to normal login
          </button>

          <AdminText size="xs" color="white" className="opacity-60 tracking-tight">
            Root Level Access • Encryption Active
          </AdminText>
        </div>
      </div>
    </div>
  );
}
