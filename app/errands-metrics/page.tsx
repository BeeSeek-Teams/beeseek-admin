"use client";

import React, { useEffect, useState } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { getErrandPushMetrics, ErrandPushMetricsResponse } from "@/lib/errands";
import { ArrowClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function ErrandsMetricsPage() {
  const [data, setData] = useState<ErrandPushMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchData = async (targetDays = days) => {
    try {
      setLoading(true);
      const response = await getErrandPushMetrics(targetDays);
      setData(response);
    } catch {
      toast.error("Couldn't load errand push metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(7);
  }, []);

  const totals = data?.totals;
  const sentRate = totals?.matched_radius_total
    ? Math.round((totals.sent_total / Math.max(1, totals.matched_radius_total)) * 100)
    : 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <AdminHeader
          title="Errand Push Metrics"
          description="Nearby errand push delivery and anti-spam telemetry."
        />
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-black/60"
          >
            <option value={1}>Today</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button
            onClick={() => fetchData(days)}
            disabled={loading}
            className="h-10 rounded-xl border border-black/10 bg-white px-4 text-xs font-bold text-black/50 hover:bg-black/[0.02] transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <ArrowClockwise size={14} weight="bold" className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Errands Posted", value: totals?.requests_total || 0 },
          { label: "Agents Matched", value: totals?.matched_radius_total || 0 },
          { label: "Push Sent", value: totals?.sent_total || 0 },
          { label: "Send Rate", value: `${sentRate}%` },
        ].map((item) => (
          <div key={item.label} className="bg-white p-4 rounded-2xl border border-black/5">
            <p className="text-[11px] font-bold text-black/35">{item.label}</p>
            <p className="text-2xl font-black text-primary mt-1">
              {loading ? "—" : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-black/5 rounded-2xl p-5">
        <p className="text-sm font-black text-primary mb-4">Skip Reasons (Window Totals)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            ["Cooldown", totals?.skipped_cooldown || 0],
            ["Per-request dedup", totals?.skipped_dedup || 0],
            ["Out of radius", totals?.skipped_out_of_radius || 0],
            ["No token", totals?.skipped_no_token || 0],
            ["Push disabled", totals?.skipped_push_disabled || 0],
            ["No coordinates", totals?.skipped_no_coords || 0],
            ["Linked/Self", totals?.skipped_linked_or_self || 0],
            ["Invalid stop", totals?.skipped_invalid_stop || 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-black/[0.02] rounded-xl px-3 py-2.5">
              <p className="text-[11px] font-bold text-black/35">{label}</p>
              <p className="text-lg font-black text-primary">{loading ? "—" : String(value)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl p-5 overflow-auto">
        <p className="text-sm font-black text-primary mb-3">Daily Trend</p>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-black/40 text-xs">
              <th className="py-2 pr-3">Day</th>
              <th className="py-2 pr-3">Posted</th>
              <th className="py-2 pr-3">Candidates</th>
              <th className="py-2 pr-3">Matched</th>
              <th className="py-2 pr-3">Sent</th>
              <th className="py-2 pr-3">Cooldown</th>
              <th className="py-2 pr-3">Dedup</th>
              <th className="py-2 pr-3">No token</th>
            </tr>
          </thead>
          <tbody>
            {(data?.byDay || []).map((row) => (
              <tr key={row.day} className="border-t border-black/5">
                <td className="py-2 pr-3 font-semibold text-black/65">{row.day}</td>
                <td className="py-2 pr-3">{row.requests_total}</td>
                <td className="py-2 pr-3">{row.candidates_total}</td>
                <td className="py-2 pr-3">{row.matched_radius_total}</td>
                <td className="py-2 pr-3">{row.sent_total}</td>
                <td className="py-2 pr-3">{row.skipped_cooldown}</td>
                <td className="py-2 pr-3">{row.skipped_dedup}</td>
                <td className="py-2 pr-3">{row.skipped_no_token}</td>
              </tr>
            ))}
            {!loading && (!data?.byDay || data.byDay.length === 0) && (
              <tr>
                <td colSpan={8} className="py-5 text-center text-black/35">
                  No data in selected window.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

