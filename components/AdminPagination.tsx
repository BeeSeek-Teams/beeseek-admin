"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminText } from "./AdminText";

interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-t border-border/40", className)}>
      <AdminText size="xs" color="secondary">
        Showing <span className="font-bold text-primary">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to {" "}
        <span className="font-bold text-primary">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of {" "}
        <span className="font-bold text-primary">{totalItems}</span> entities
      </AdminText>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-border/50 text-secondary hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:hover:text-secondary disabled:hover:border-border/50 transition-all shadow-sm"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <div className="w-10 h-10 flex items-center justify-center text-secondary">
                  <MoreHorizontal size={14} />
                </div>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-xl font-bold font-plus-jakarta text-xs transition-all",
                    currentPage === page
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10"
                      : "bg-surface text-secondary hover:text-primary border border-border/50 hover:border-primary/20"
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-border/50 text-secondary hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:hover:text-secondary disabled:hover:border-border/50 transition-all shadow-sm"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
