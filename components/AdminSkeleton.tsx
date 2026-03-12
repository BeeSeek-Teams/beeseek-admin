import React from "react";
import { cn } from "@/lib/utils";

interface AdminSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const AdminSkeleton: React.FC<AdminSkeletonProps> = ({
  className,
  width,
  height,
  borderRadius = "12px",
}) => {
  return (
    <div
      className={cn("animate-pulse bg-muted/20", className)}
      style={{
        width: width ?? "100%",
        height: height ?? "20px",
        borderRadius: borderRadius,
      }}
    />
  );
};
