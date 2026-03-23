"use client";

import React from "react";
import { CaretLeft, CaretRight, DotsThree } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

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
    const pages: (number | string)[] = [];
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

  const from = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 pt-4", className)}>
      <p className="text-[10px] font-bold text-black/25">
        {from}–{to} of {totalItems}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-black/5 text-black/30 hover:text-primary disabled:opacity-30 transition-colors"
        >
          <CaretLeft size={14} weight="bold" />
        </button>

        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <div className="w-8 h-8 flex items-center justify-center text-black/20">
                <DotsThree size={16} weight="bold" />
              </div>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg font-bold text-[10px] transition-all",
                  currentPage === page
                    ? "bg-primary text-white"
                    : "text-black/30 hover:bg-black/5"
                )}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-black/5 text-black/30 hover:text-primary disabled:opacity-30 transition-colors"
        >
          <CaretRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
};
