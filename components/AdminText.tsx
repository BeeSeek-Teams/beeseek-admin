import React from "react";
import { cn } from "@/lib/utils";

interface AdminTextProps {
  children: React.ReactNode;
  variant?: "regular" | "medium" | "semibold" | "bold" | "black";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  color?: "default" | "secondary" | "primary" | "error" | "success" | "warning" | "white";
  align?: "left" | "center" | "right";
  className?: string;
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "div";
}

export const AdminText: React.FC<AdminTextProps> = ({
  children,
  variant = "regular",
  size = "md",
  color = "default",
  align = "left",
  className,
  as: Component = "p",
}) => {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
  };

  const weightClasses = {
    regular: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    black: "font-black",
  };

  const colorClasses = {
    default: "text-foreground",
    secondary: "text-muted",
    primary: "text-primary",
    error: "text-error",
    success: "text-success",
    warning: "text-warning",
    white: "text-white",
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[variant],
        colorClasses[color],
        alignClasses[align],
        className
      )}
    >
      {children}
    </Component>
  );
};
