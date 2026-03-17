"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, Menu } from "lucide-react";
import { AdminText } from "./AdminText";

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
      logout(); // Clear any stale cookies to prevent middleware loops
      router.push("/login");
    }
  }, [mounted, _hasHydrated, accessToken, user, isAuthPage, isQueenPage, router, logout]);

  if (!mounted || !_hasHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-center px-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
        <AdminText variant="bold" size="lg">Initializing System...</AdminText>
        <AdminText color="secondary" size="xs" className="mt-2 text-muted">BeeSeek Hive Administration</AdminText>
      </div>
    );
  }

  // If it's the queen login or normal login, just show the page
  if (isAuthPage) {
    return <>{children}</>;
  }

  // If it's a queen dashboard/page, we don't show the standard sidebar
  if (isQueenPage) {
    return <main className="min-h-screen bg-surface">{children}</main>;
  }

  if (!accessToken || !user) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-center px-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <AdminText variant="medium">Verifying Session...</AdminText>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      {/* Mobile top bar with hamburger */}
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="lg:hidden sticky top-0 z-50 flex items-center gap-3 px-4 py-3 bg-background border-b border-border/50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-secondary hover:text-primary transition-colors"
          >
            <Menu size={22} />
          </button>
          <AdminText variant="bold" size="sm" className="text-secondary">BeeSeek Admin</AdminText>
        </div>
        <main className="flex-1 p-4 md:p-6 lg:p-10">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
