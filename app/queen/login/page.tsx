"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeSlash, SpinnerGap } from "@phosphor-icons/react";
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
      <div className="w-full max-w-md bg-[#021027] rounded-2xl shadow-2xl p-10 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -ml-16 -mb-16" />

        <div className="flex flex-col items-center mb-10 relative z-10">
          <h1 className="text-3xl font-black text-white">Queen Bee</h1>
          <p className="text-xs font-bold text-white/40 mt-2 uppercase tracking-widest">Root Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 text-error text-sm font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <AdminInput
            label="Password"
            labelClassName="text-white"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} weight="bold" className="text-white/40" />}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-primary focus:border-primary"
            endIcon={
              <button
                type="button"
                className="text-white/40 hover:text-white transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-xl text-sm font-black hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <SpinnerGap size={18} weight="bold" className="animate-spin" />}
            Sign In
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4 relative z-10">
          <button 
            type="button"
            onClick={() => router.push('/login')}
            className="text-xs font-bold text-white/40 hover:text-primary transition-colors underline underline-offset-4"
          >
            Back to normal login
          </button>
        </div>
      </div>
    </div>
  );
}
