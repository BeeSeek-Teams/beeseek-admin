"use client";

import React, { useState, useEffect } from "react";
import {
  CurrencyNgn,
  TrendUp,
  ArrowClockwise,
  ShieldCheck,
  CreditCard,
  Briefcase,
  SpinnerGap
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { toast } from "sonner";
import { EconomicsStats, getEconomicsStats } from "@/lib/economics";
import { cn } from "@/lib/utils";

export default function EconomicsPage() {
  const [stats, setStats] = useState<EconomicsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getEconomicsStats();
      setStats(data);
    } catch (err) {
      toast.error("Couldn't load economics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amountKobo: any) => {
    const amount = Number(amountKobo || 0);
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount / 100);
  };

  const StatCard = ({ title, value, label, icon: Icon, negative }: any) => (
    <div className="bg-white border border-black/5 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          negative ? "bg-red-50 text-error" : "bg-primary/10 text-primary"
        )}>
          <Icon size={20} weight="duotone" />
        </div>
      </div>
      <p className="text-[10px] font-bold text-black/25 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-black tracking-tight mb-1">{value}</p>
      <p className="text-[10px] text-black/20">{label}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <SpinnerGap size={28} weight="bold" className="animate-spin text-primary/30" />
        <p className="text-sm text-black/25">Loading economics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminHeader
          title="Economics"
          description="Platform revenue, withdrawal costs, and net position."
        />
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
        >
          <ArrowClockwise size={16} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Revenue"
          value={stats ? formatCurrency(stats.revenue.total) : "₦0.00"}
          label="Service fees & commissions earned"
          icon={TrendUp}
        />
        <StatCard
          title="Withdrawal Profit"
          value={stats ? formatCurrency(stats.withdrawals.netWithdrawalProfit) : "₦0.00"}
          label="Fee income minus provider costs"
          icon={CreditCard}
          negative={stats && stats.withdrawals.netWithdrawalProfit < 0}
        />
        <StatCard
          title="Net Position"
          value={stats ? formatCurrency(stats.netPlatformPosition) : "₦0.00"}
          label="BeeSeek's total liquid position"
          icon={Briefcase}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Breakdown */}
        <div className="bg-white border border-black/5 rounded-2xl p-6">
          <h3 className="text-sm font-black mb-5">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-black/[0.02] rounded-xl border border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary border border-black/5">
                  <ShieldCheck size={20} weight="duotone" />
                </div>
                <div>
                  <p className="text-sm font-bold">Service Fees</p>
                  <p className="text-[10px] text-black/20">Flat platform fee from clients</p>
                </div>
              </div>
              <p className="text-lg font-black">
                {stats ? formatCurrency(stats.revenue.serviceFees) : "₦0.00"}
              </p>
            </div>

            <div className="flex justify-between items-center p-4 bg-black/[0.02] rounded-xl border border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 border border-black/5">
                  <CurrencyNgn size={20} weight="duotone" />
                </div>
                <div>
                  <p className="text-sm font-bold">Agent Commissions</p>
                  <p className="text-[10px] text-black/20">% based earnings from contracts</p>
                </div>
              </div>
              <p className="text-lg font-black">
                {stats ? formatCurrency(stats.revenue.commissions) : "₦0.00"}
              </p>
            </div>
          </div>
        </div>

        {/* Withdrawal Costs */}
        <div className="bg-white border border-black/5 rounded-2xl p-6">
          <h3 className="text-sm font-black mb-5">Withdrawal Costs</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-black/[0.02] rounded-xl border border-black/5">
              <div>
                <p className="text-sm font-bold">Fees Collected</p>
                <p className="text-[10px] text-black/20">Withdrawal fees paid by agents</p>
              </div>
              <p className="text-lg font-black text-success">
                +{stats ? formatCurrency(stats.withdrawals.feesCollected) : "₦0.00"}
              </p>
            </div>

            <div className="flex justify-between items-center p-4 bg-red-50/50 rounded-xl border border-red-100">
              <div>
                <p className="text-sm font-bold text-error">Provider Costs</p>
                <p className="text-[10px] text-black/20">Monnify fees borne by BeeSeek</p>
              </div>
              <p className="text-lg font-black text-error">
                -{stats ? formatCurrency(stats.withdrawals.costsBorne) : "₦0.00"}
              </p>
            </div>

            <div className="pt-3 border-t border-black/5 flex justify-between items-center">
              <p className="text-sm font-bold">Net Position</p>
              <div className={cn(
                "px-3 py-1.5 rounded-xl text-sm font-black",
                stats && stats.withdrawals.netWithdrawalProfit >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                {stats ? formatCurrency(stats.withdrawals.netWithdrawalProfit) : "₦0.00"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
