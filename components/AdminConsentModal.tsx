"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";
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
}

export const AdminConsentModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm Action",
  cancelLabel = "Cancel",
  variant = "danger",
}: AdminConsentModalProps) => {
  if (!isOpen) return null;

  const variantColors = {
    danger: "text-danger bg-danger/10 border-danger/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    primary: "text-primary bg-primary/10 border-primary/20",
  };

  const buttonVariants = {
    danger: "bg-danger hover:bg-danger-dark",
    warning: "bg-warning hover:bg-warning-dark",
    primary: "bg-primary hover:bg-primary-dark",
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="bg-[#021027] w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 pb-0 flex justify-between items-start">
          <div className={`p-3 rounded-2xl border ${variantColors[variant]}`}>
            <AlertTriangle size={24} />
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 text-white/50 hover:text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-2">
          <AdminText variant="bold" size="xl" color="white">
            {title}
          </AdminText>
          <AdminText size="sm" color="white" className="opacity-60 leading-relaxed">
            {description}
          </AdminText>
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-3">
          <AdminButton 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 border-white/10 text-white hover:bg-white/5"
          >
            {cancelLabel}
          </AdminButton>
          <AdminButton 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 text-white border-0 ${variant === 'danger' ? 'bg-[#ff3b3b] hover:bg-[#e63535]' : ''}`}
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
};
