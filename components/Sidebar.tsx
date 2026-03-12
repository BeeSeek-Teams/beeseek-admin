"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  LogOut,
  ChevronRight,
  Fingerprint,
  Briefcase,
  PieChart,
  DollarSign,
  TrendingUp,
  Ticket,
  ClipboardList,
  Bell,
  Activity,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminText } from "./AdminText";
import { useAuthStore } from "@/store/useAuthStore";
import { AdminBadge } from "./AdminBadge";
import { AdminConsentModal } from "./AdminConsentModal";
import { useState } from "react";

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    href: "/",
    roles: ["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: ClipboardList, 
    label: "Job Control", 
    href: "/jobs",
    roles: ["MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: ShieldAlert, 
    label: "Integrity Care", 
    href: "/integrity",
    roles: ["MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: TrendingUp, 
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
    icon: PieChart, 
    label: "Distributions", 
    href: "/distributions",
    roles: ["MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: DollarSign, 
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
    icon: MessageSquare, 
    label: "Support", 
    href: "/support",
    roles: ["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: Bell, 
    label: "Notifications", 
    href: "/notifications",
    roles: ["ADMIN", "SUPER_ADMIN"]
  },
  { 
    icon: Activity, 
    label: "Infrastructure", 
    href: "/infrastructure",
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

export const Sidebar = () => {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role as string)
  );

  return (
    <div className="w-72 h-screen bg-background border-r border-border/50 flex flex-col sticky top-0 z-50">
      {/* Logo Section */}
      <div className="p-8 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div>
            <AdminText variant="bold" size="lg" className="leading-tight">BeeSeek</AdminText>
            <AdminBadge variant="primary" className="mt-0.5 px-1 py-0 text-[8px]">Proprietary</AdminBadge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-secondary hover:bg-surface"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-muted group-hover:text-primary transition-colors")} />
                <AdminText 
                  variant={isActive ? "bold" : "medium"} 
                  size="sm"
                  className={isActive ? "text-white" : "text-secondary"}
                >
                  {item.label}
                </AdminText>
              </div>
              {isActive && <ChevronRight size={16} className="text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 mt-auto">
        <div className="bg-surface rounded-3xl p-4 border border-border/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.firstName?.[0] || user?.email?.[0] || "A"}
            </div>
            <div className="overflow-hidden">
              <AdminText variant="bold" size="sm" className="truncate text-secondary">
                {user?.firstName || "Staff Member"}
              </AdminText>
              <AdminText size="xs" color="secondary" className="truncate opacity-70">
                {user?.role}
              </AdminText>
            </div>
          </div>
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-border/50 text-error rounded-2xl text-xs font-bold hover:bg-error/5 transition-colors shadow-sm"
          >
            <LogOut size={14} />
            Safe Logout
          </button>
        </div>
      </div>

      <AdminConsentModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
        title="Safe Logout"
        description="Are you sure you want to terminate your current session? You will need to re-authenticate to access the BeeSeek Hive Administration panel."
        confirmLabel="Logout Now"
        cancelLabel="Discard"
        variant="danger"
      />
    </div>
  );
};

export default Sidebar;
