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
    success: "bg-success/10 text-success border-success/20",
    error: "bg-error/10 text-error border-error/20",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-surface text-secondary border-border/50",
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
