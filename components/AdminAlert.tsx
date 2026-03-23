"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, WarningCircle, Info, Warning } from "@phosphor-icons/react";
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
      bg: "bg-green-50",
      border: "border-green-100",
      icon: <CheckCircle weight="fill" className="text-success" size={20} />,
      titleColor: "text-success",
      textColor: "text-green-700",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-100",
      icon: <WarningCircle weight="fill" className="text-error" size={20} />,
      titleColor: "text-error",
      textColor: "text-red-700",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      icon: <Warning weight="fill" className="text-warning" size={20} />,
      titleColor: "text-warning",
      textColor: "text-amber-700",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      icon: <Info weight="fill" className="text-secondary" size={20} />,
      titleColor: "text-secondary",
      textColor: "text-blue-700",
    },
  };

  const current = variants[type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${current.bg} ${current.border} ${className}`}
    >
      <div className="mt-0.5 shrink-0">{current.icon}</div>
      <div className="flex-1 min-w-0">
        {title && (
          <AdminText variant="bold" size="sm" className={current.titleColor}>
            {title}
          </AdminText>
        )}
        <AdminText size="sm" className={current.textColor}>
          {message}
        </AdminText>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-lg transition-colors shrink-0"
        >
          <X size={14} className="text-black/30" />
        </button>
      )}
    </div>
  );
};
