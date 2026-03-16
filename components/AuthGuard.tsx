"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { AdminText } from "./AdminText";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken, _hasHydrated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

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
    <div className="flex flex-col md:flex-row min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 w-full max-w-[100vw] overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto pt-14 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
