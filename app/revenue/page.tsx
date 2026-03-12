"use client";

import React from "react";
import { TrendingUp, Construction } from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";

export default function RevenuePage() {
  return (
    <div className="space-y-8">
      <AdminHeader
        title="Revenue Analytics"
        description="Platform revenue breakdown, commission tracking, and financial projections."
      />

      <div className="bg-white border border-border/50 rounded-[32px] p-16 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
          <Construction size={40} />
        </div>
        <AdminText variant="bold" size="xl" className="mb-2">
          Coming Soon
        </AdminText>
        <AdminText color="secondary" size="sm" className="max-w-md leading-relaxed">
          Revenue analytics module is under development. This page will display commission breakdowns, monthly/quarterly trends, and revenue projections with exportable charts.
        </AdminText>
        <div className="flex items-center gap-4 mt-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl border border-border/50">
            <TrendingUp size={16} className="text-secondary" />
            <AdminText size="xs" variant="bold" color="secondary">Revenue Charts</AdminText>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl border border-border/50">
            <TrendingUp size={16} className="text-secondary" />
            <AdminText size="xs" variant="bold" color="secondary">Commission Tracker</AdminText>
          </div>
        </div>
      </div>
    </div>
  );
}
