import React from "react";
import { SpinnerGap } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "error" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const AdminButton: React.FC<AdminButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: "bg-primary text-white hover:opacity-90",
    secondary: "bg-secondary text-white hover:opacity-90",
    outline: "bg-white border border-black/10 text-primary hover:bg-black/[0.02]",
    ghost: "bg-transparent text-primary hover:bg-black/5 shadow-none",
    error: "bg-red-50 text-error hover:bg-red-100",
    success: "bg-green-50 text-success hover:bg-green-100",
  };

  const sizeClasses = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-2.5 text-xs",
    lg: "px-6 py-3 text-sm",
    icon: "p-2 aspect-square",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        fullWidth ? "w-full" : "w-fit",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <SpinnerGap className="animate-spin" size={18} weight="bold" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
