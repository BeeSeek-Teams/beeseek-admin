"use client";

import React from "react";
import { HardHat } from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";

export default function RevenuePage() {
  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <AdminHeader
        title="Revenue Analytics"
        description="Revenue breakdown, commission tracking, and projections."
      />

      <div className="bg-white border border-black/5 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-5">
          <HardHat size={32} weight="duotone" />
        </div>
        <h2 className="text-lg font-black mb-2">Coming Soon</h2>
        <p className="text-sm text-black/30 max-w-md">
          This page will display commission breakdowns, trends, and revenue projections with exportable charts.
        </p>
      </div>
    </div>
  );
}
