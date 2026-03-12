import React from "react";
import { cn } from "@/lib/utils";

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, icon, endIcon, containerClassName, labelClassName, className, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-2 w-full", containerClassName)}>
        {label && (
          <label className={cn("text-sm font-semibold text-foreground ml-1", labelClassName)}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-surface border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 transition-all text-foreground placeholder:text-muted/60",
              icon ? "pl-10" : "pl-4",
              endIcon ? "pr-10" : "pr-4",
              error 
                ? "border-error focus:ring-error/20 focus:border-error" 
                : "border-border focus:ring-primary/20 focus:border-primary",
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs font-medium text-error ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

AdminInput.displayName = "AdminInput";
