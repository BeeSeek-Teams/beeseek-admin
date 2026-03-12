"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { AdminText } from "./AdminText";

export type AlertType = "success" | "error" | "info" | "warning";

interface AdminAlertProps {
  type?: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: number;
  className?: string;
}

export const AdminAlert = ({
  type = "success",
  title,
  message,
  onClose,
  autoClose = 5000,
  className = "",
}: AdminAlertProps) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const variants = {
    success: {
      bg: "bg-success/10",
      border: "border-success/20",
      icon: <CheckCircle className="text-success" size={20} />,
      titleColor: "text-success",
    },
    error: {
      bg: "bg-error/10",
      border: "border-error/20",
      icon: <AlertCircle className="text-error" size={20} />,
      titleColor: "text-error",
    },
    warning: {
      bg: "bg-warning/10",
      border: "border-warning/20",
      icon: <AlertTriangle className="text-warning" size={20} />,
      titleColor: "text-warning",
    },
    info: {
      bg: "bg-primary/10",
      border: "border-primary/20",
      icon: <Info className="text-primary" size={20} />,
      titleColor: "text-primary",
    },
  };

  const current = variants[type];

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-2xl border ${current.bg} ${current.border} shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 ${className}`}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1">
        {title && (
          <AdminText variant="bold" size="sm" className={current.titleColor}>
            {title}
          </AdminText>
        )}
        <AdminText size="sm" className="text-white/80">
          {message}
        </AdminText>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/5 rounded-full transition-colors opacity-60 hover:opacity-100"
        >
          <X size={16} className="text-white" />
        </button>
      )}
    </div>
  );
};
