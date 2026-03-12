"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AdminText } from "./AdminText";

interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
  headerColor?: "default" | "secondary" | "white";
}

export const AdminTable: React.FC<AdminTableProps> = ({ 
  headers, 
  children, 
  className,
  headerColor = "secondary"
}) => {
  return (
    <div className={cn("w-full overflow-hidden rounded-[24px] border border-border/50 bg-background shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={cn(
              "border-b border-border/50",
              headerColor === "white" ? "bg-white/5" : "bg-surface"
            )}>
              {headers.map((header, i) => (
                <th key={i} className="px-6 py-4">
                  <AdminText variant="bold" size="xs" color={headerColor} className="uppercase tracking-widest">
                    {header}
                  </AdminText>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AdminTableRow: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ 
  children, 
  onClick,
  className 
}) => {
  return (
    <tr 
      onClick={onClick}
      className={cn(
        "hover:bg-surface/50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
};

export const AdminTableCell: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number }> = ({ 
  children, 
  className,
  colSpan
}) => {
  return (
    <td colSpan={colSpan} className={cn("px-6 py-4 items-center", className)}>
      {children}
    </td>
  );
};
