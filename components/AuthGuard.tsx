"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { SpinnerGap, List } from "@phosphor-icons/react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken, _hasHydrated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/forgot-password") || pathname?.startsWith("/reset-password") || pathname?.startsWith("/queen/login");
  const isQueenPage = pathname?.startsWith("/queen");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && _hasHydrated && !isAuthPage && !isQueenPage && (!accessToken || !user)) {
      logout();
      router.push("/login");
    }
  }, [mounted, _hasHydrated, accessToken, user, isAuthPage, isQueenPage, router, logout]);

  if (!mounted || !_hasHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-center px-4">
        <SpinnerGap className="w-8 h-8 text-primary animate-spin mb-4" weight="bold" />
        <p className="text-sm font-bold text-primary">Loading...</p>
        <p className="text-[10px] font-bold text-black/20 mt-1">BeeSeek Admin</p>
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isQueenPage) {
    return <main className="min-h-screen bg-[#FAFAFA]">{children}</main>;
  }

  if (!accessToken || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-center px-4">
        <SpinnerGap className="w-6 h-6 text-primary animate-spin mb-3" weight="bold" />
        <p className="text-xs font-bold text-black/30">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-50 flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-xl border-b border-black/5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center text-black/40 hover:text-primary transition-colors"
          >
            <List size={20} weight="bold" />
          </button>
          <p className="text-sm font-black text-primary">BeeSeek</p>
        </div>
        <main className="flex-1 p-4 md:p-6 lg:p-10">
          <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
