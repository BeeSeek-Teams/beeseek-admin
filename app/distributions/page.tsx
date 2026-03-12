"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { RefreshCcw, Crosshair } from "lucide-react";
import { getMapMarkers, MapMarker } from "@/lib/analytics";
import { NigeriaSpyMap } from "@/components/NigeriaSpyMap";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DistributionsPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const marks = await getMapMarkers();
      setMarkers(marks);
    } catch (err) {
      toast.error("Failed to load map data");
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
        <RefreshCcw className="animate-spin text-primary" size={32} />
        <AdminText color="secondary" size="sm">Synchronizing tactical map data...</AdminText>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Intelligence Distributions"
        description="Geospatial monitoring and analytical breakdown of platform nodes across Nigeria."
        action={
          <AdminButton variant="outline" size="sm" className="gap-2" onClick={fetchData} disabled={loading}>
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Resync Intelligence
          </AdminButton>
        }
      />

      <div className="grid grid-cols-1 gap-8">
        {/* Spy Map Container */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-6 py-2 bg-primary/10 border border-primary/20 rounded-xl w-fit">
            <Crosshair size={14} className="text-primary animate-pulse" />
            <AdminText size="xs" variant="bold" className="text-primary tracking-[0.2em] uppercase">Tactical_Geospatial_Overview</AdminText>
          </div>
          <NigeriaSpyMap markers={markers} />
        </div>
      </div>
    </div>
  );
}
