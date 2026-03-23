import React from "react";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  backAction?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  description,
  actions,
  action,
  className,
  backAction,
}) => {
  const headerActions = actions || action;

  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-3">
        {backAction}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-black/40 font-medium mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {headerActions && (
        <div className="flex items-center gap-3">
          {headerActions}
        </div>
      )}
    </div>
  );
};
