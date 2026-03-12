"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  RefreshCcw,
  PieChart,
  ShieldCheck,
  CreditCard,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
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
      toast.error("Failed to load economics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amountKobo: any) => {
    const amount = Number(amountKobo || 0);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount / 100);
  };

  const StatCard = ({ title, value, label, icon: Icon, trend, trendValue, negative }: any) => (
    <div className="bg-white border border-border/50 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "p-4 rounded-2xl group-hover:scale-110 transition-transform",
          negative ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-900"
        )}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold",
            trend === 'up' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <AdminText size="sm" color="secondary" className="mb-1 font-medium">{title}</AdminText>
      <AdminText variant="bold" className="text-3xl tracking-tight mb-2">{value}</AdminText>
      <AdminText size="xs" color="secondary" className="opacity-60">{label}</AdminText>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-12 w-48 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 rounded-[32px]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <AdminHeader
        title="Organizational Economics"
        description="Monitor platform revenue, operational overhead, and net economic position."
        action={
          <AdminButton variant="outline" size="sm" className="gap-2" onClick={fetchStats}>
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Resync Data
          </AdminButton>
        }
      />

      {/* Main Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="Gross Platform Revenue" 
          value={stats ? formatCurrency(stats.revenue.total) : "₦0.00"} 
          label="Total service fees & commissions earned"
          icon={TrendingUp}
          trend="up"
          trendValue="Live"
        />
        <StatCard 
          title="Withdrawal Net Profit" 
          value={stats ? formatCurrency(stats.withdrawals.netWithdrawalProfit) : "₦0.00"} 
          label="Profit/Loss from agent withdrawal fees"
          icon={CreditCard}
          negative={stats && stats.withdrawals.netWithdrawalProfit < 0}
        />
        <StatCard 
          title="Net Org Position" 
          value={stats ? formatCurrency(stats.netPlatformPosition) : "₦0.00"} 
          label="Total liquid position for BeeSeek"
          icon={Briefcase}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown */}
        <div className="bg-white border border-border/50 rounded-[32px] p-10 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                   <PieChart size={160} />
             </div>
          <AdminText variant="bold" size="lg" className="mb-8">Revenue Stream Breakdown</AdminText>
          <div className="space-y-8">
            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-[24px]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div>
                   <AdminText variant="bold">Client Service Fees</AdminText>
                   <AdminText size="xs" color="secondary">Standard flat platform fee</AdminText>
                </div>
              </div>
              <AdminText variant="bold" className="text-xl">
                {stats ? formatCurrency(stats.revenue.serviceFees) : "₦0.00"}
              </AdminText>
            </div>

            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-[24px]">
               <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-amber-600">
                  <DollarSign size={24} />
                </div>
                <div>
                   <AdminText variant="bold">Agent Commissions</AdminText>
                   <AdminText size="xs" color="secondary">% based earnings from contracts</AdminText>
                </div>
              </div>
              <AdminText variant="bold" className="text-xl">
                {stats ? formatCurrency(stats.revenue.commissions) : "₦0.00"}
              </AdminText>
            </div>
          </div>
        </div>

        {/* Operational Overhead */}
        <div className="bg-white border border-border/50 rounded-[32px] p-10 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                   <AlertCircle size={160} />
             </div>
          <AdminText variant="bold" size="lg" className="mb-8">Withdrawal Cost Analysis</AdminText>
          <div className="space-y-8">
            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-[24px]">
              <div>
                 <AdminText variant="bold" className="text-slate-600">Fees Collected</AdminText>
                 <AdminText size="xs" color="secondary">Total withdrawal fees paid by agents</AdminText>
              </div>
              <AdminText variant="bold" className="text-success text-xl">
                +{stats ? formatCurrency(stats.withdrawals.feesCollected) : "₦0.00"}
              </AdminText>
            </div>

            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-[24px] border-l-4 border-red-400">
               <div>
                  <AdminText variant="bold" className="text-red-600">Disbursement Costs</AdminText>
                  <AdminText size="xs" color="secondary">Monnify/Provider fees borne by BeeSeek</AdminText>
               </div>
              <AdminText variant="bold" className="text-error text-xl">
                -{stats ? formatCurrency(stats.withdrawals.costsBorne) : "₦0.00"}
              </AdminText>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                 <AdminText variant="bold">Net Operational Position</AdminText>
                 <div className={cn(
                   "px-4 py-2 rounded-xl text-lg font-bold",
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
