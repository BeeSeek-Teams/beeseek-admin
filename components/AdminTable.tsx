"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const AdminTable: React.FC<AdminTableProps> = ({ 
  headers, 
  children, 
  className,
}) => {
  return (
    <div className={cn("w-full bg-white rounded-xl border border-black/5 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5">
              {headers.map((header, i) => (
                <th key={i} className="px-5 py-3">
                  <span className="text-[10px] font-bold text-black/25 uppercase tracking-wider">
                    {header}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
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
        "border-b border-black/[0.03] last:border-0 hover:bg-black/[0.01] transition-colors",
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
    <td colSpan={colSpan} className={cn("px-5 py-3.5", className)}>
      {children}
    </td>
  );
};
