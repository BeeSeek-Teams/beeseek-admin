"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type AdminBadgeVariant = "success" | "error" | "warning" | "info" | "primary" | "secondary";

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: AdminBadgeVariant;
  className?: string;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({ 
  children, 
  variant = "info", 
  className 
}) => {
  const variants = {
    success: "bg-green-50 text-green-600",
    error: "bg-red-50 text-red-500",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-blue-50 text-blue-600",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-black/5 text-black/40",
  };

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-lg text-[10px] font-bold",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
