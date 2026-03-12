import React from "react";
import { cn } from "@/lib/utils";

interface AdminTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const AdminTextArea = React.forwardRef<HTMLTextAreaElement, AdminTextAreaProps>(
  ({ label, error, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-2 w-full", containerClassName)}>
        {label && (
          <label className="text-sm font-semibold text-foreground ml-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full bg-surface border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 transition-all text-foreground placeholder:text-muted/60 min-h-[120px] resize-none",
            error 
              ? "border-error focus:ring-error/20 focus:border-error" 
              : "border-border focus:ring-primary/20 focus:border-primary",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs font-medium text-error ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

AdminTextArea.displayName = "AdminTextArea";
