"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseSimple,
  Users,
  ShieldCheck,
  ChatCircle,
  SignOut,
  CaretRight,
  Fingerprint,
  Briefcase,
  ChartPie,
  CurrencyDollar,
  TrendUp,
  Ticket,
  ClipboardText,
  Bell,
  Gear,
  ShieldWarning,
  Siren,
  Wrench,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { AdminConsentModal } from "./AdminConsentModal";

const menuItems = [
  { 
    icon: HouseSimple, 
    label: "Dashboard", 
    href: "/",
    roles: ["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: ClipboardText, 
    label: "Jobs", 
    href: "/jobs",
    roles: ["MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: ShieldWarning, 
    label: "Integrity", 
    href: "/integrity",
    roles: ["MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: TrendUp, 
    label: "Economics", 
    href: "/economics",
    roles: ["ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: Ticket, 
    label: "Promotions", 
    href: "/promotions",
    roles: ["ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: ChartPie, 
    label: "Distributions", 
    href: "/distributions",
    roles: ["MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: CurrencyDollar, 
    label: "Transactions", 
    href: "/transactions",
    roles: ["ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: ShieldCheck, 
    label: "NIN Reviews", 
    href: "/verifications",
    roles: ["MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: Fingerprint, 
    label: "Pending NIN", 
    href: "/verifications/pending-submission",
    roles: ["MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: ChatCircle, 
    label: "Support", 
    href: "/support",
    roles: ["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: Siren, 
    label: "SOS Alerts", 
    href: "/sos",
    roles: ["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: Bell, 
    label: "Notifications", 
    href: "/notifications",
    roles: ["ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: Gear, 
    label: "App Settings", 
    href: "/infrastructure",
    roles: ["ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: Wrench, 
    label: "Maintenance", 
    href: "/maintenance",
    roles: ["ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: Briefcase, 
    label: "Bee Registry", 
    href: "/bees",
    roles: ["MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: Users, 
    label: "User Control", 
    href: "/users",
    roles: ["ADMIN", "SUPER_ADMIN"]
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar = ({ mobileOpen, onMobileClose }: SidebarProps) => {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role as string)
  );

  useEffect(() => {
    onMobileClose?.();
  }, [pathname]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 lg:p-6 border-b border-black/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-black">B</span>
            </div> */}
            {/* <div>
              <img src="beeseek.png" alt="" />
            </div> */}
            <div>
              <p className="text-sm font-black text-primary leading-tight">BeeSeek</p>
              <p className="text-[9px] font-bold text-black/25">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black/30 hover:text-black/60 transition-colors"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-black/40 hover:bg-black/[0.03] hover:text-black/60"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={18} weight={isActive ? "duotone" : "regular"} />
                <span className={cn("text-xs font-bold", isActive ? "text-primary" : "")}>
                  {item.label}
                </span>
              </div>
              {isActive && <CaretRight size={12} weight="bold" className="text-primary/50" />}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 mt-auto border-t border-black/5">
        <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-black shrink-0">
            {user?.firstName?.[0] || user?.email?.[0] || "A"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-primary truncate">
              {user?.firstName || "Staff"}
            </p>
            <p className="text-[10px] font-bold text-black/25 truncate">
              {user?.role}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-black/30 hover:text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
        >
          <SignOut size={14} weight="bold" />
          Sign Out
        </button>
      </div>

      <AdminConsentModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
        title="Sign Out"
        description="You'll need to sign in again to access the admin panel."
        confirmLabel="Sign Out"
        cancelLabel="Go Back"
        variant="danger"
      />
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 h-screen bg-white border-r border-black/5 flex-col sticky top-0 z-50">
        {sidebarContent}
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[110]">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="absolute inset-y-0 left-0 w-64 max-w-[85vw] bg-white flex flex-col shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
