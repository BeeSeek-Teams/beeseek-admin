"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { ArrowClockwise, SpinnerGap } from "@phosphor-icons/react";
import { getMapMarkers, MapMarker } from "@/lib/analytics";
import { NigeriaSpyMap } from "@/components/NigeriaSpyMap";
import { toast } from "sonner";

export default function DistributionsPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const marks = await getMapMarkers();
      setMarkers(marks);
    } catch (err) {
      toast.error("Couldn't load map data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <SpinnerGap size={28} weight="bold" className="animate-spin text-primary/30" />
        <p className="text-sm text-black/25">Loading map data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminHeader
          title="Distributions"
          description="User distribution across Nigeria."
        />
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
        >
          <ArrowClockwise size={16} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <NigeriaSpyMap markers={markers} />
    </div>
  );
}
