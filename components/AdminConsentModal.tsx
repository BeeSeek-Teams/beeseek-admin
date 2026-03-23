"use client";

import React from "react";
import { X, Warning } from "@phosphor-icons/react";
import { AdminText } from "./AdminText";
import { AdminButton } from "./AdminButton";

interface AdminConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  loading?: boolean;
}

export const AdminConsentModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Go Back",
  variant = "danger",
  loading = false,
}: AdminConsentModalProps) => {
  if (!isOpen) return null;

  const iconColors = {
    danger: "text-error bg-red-50 border-red-100",
    warning: "text-warning bg-amber-50 border-amber-100",
    primary: "text-secondary bg-blue-50 border-blue-100",
  };

  const confirmColors = {
    danger: "bg-error hover:bg-red-600",
    warning: "bg-warning hover:bg-amber-600",
    primary: "bg-secondary hover:bg-blue-700",
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-0 flex justify-between items-start">
          <div className={`p-3 rounded-xl border ${iconColors[variant]}`}>
            <Warning weight="fill" size={22} />
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black/30 hover:text-black/60 hover:bg-black/10 transition-colors"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="p-6 space-y-1.5">
          <AdminText variant="black" size="lg">
            {title}
          </AdminText>
          <AdminText size="sm" className="text-black/40 leading-relaxed">
            {description}
          </AdminText>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs text-black/40 bg-black/5 hover:bg-black/10 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              if (!loading) onClose();
            }}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white transition-colors disabled:opacity-50 ${confirmColors[variant]}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
