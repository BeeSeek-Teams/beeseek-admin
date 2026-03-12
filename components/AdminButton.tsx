import React from "react";
import { Loader2 } from "lucide-react";
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
    primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    outline: "bg-transparent border border-primary text-primary hover:bg-primary/5",
    ghost: "bg-transparent text-primary hover:bg-primary/5 shadow-none",
    error: "bg-error text-white hover:bg-error/90 shadow-lg shadow-error/20",
    success: "bg-success text-white hover:bg-success/90 shadow-lg shadow-success/20",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    icon: "p-2 aspect-square",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100",
        fullWidth ? "w-full" : "w-fit",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
