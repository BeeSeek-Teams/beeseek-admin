import React from "react";
import { AdminText } from "./AdminText";
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
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", className)}>
      <div className="flex items-center gap-4">
        {backAction}
        <div>
          <AdminText variant="bold" size="3xl" as="h1">
            {title}
          </AdminText>
          {description && (
            <AdminText color="secondary" size="sm" className="mt-1">
              {description}
            </AdminText>
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
