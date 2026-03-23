"use client";

import React from "react";
import { 
  Users,
  TrendUp,
  Briefcase,
  ShieldCheck,
  ChatCircle,
  ActivityIcon,
  ArrowClockwise,
  ArrowRight,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { useAuthStore } from "@/store/useAuthStore";
import { getDashboardStats, DashboardStats } from "@/lib/analytics";
import { getTransactionStats, TransactionStats } from "@/lib/transactions";
import { getSupportStats, SupportStats } from "@/lib/support";
import { toast } from "sonner";
import Link from "next/link";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [dashboardStats, setDashboardStats] = React.useState<DashboardStats | null>(null);
  const [txStats, setTxStats] = React.useState<TransactionStats | null>(null);
  const [supportStats, setSupportStats] = React.useState<SupportStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [dashboard, transactions, support] = await Promise.all([
        getDashboardStats(),
        getTransactionStats(),
        getSupportStats(),
      ]);
      setDashboardStats(dashboard);
      setTxStats(transactions);
      setSupportStats(support);
    } catch {
      toast.error("Couldn't load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchStats(); }, []);

  const stats = [
    { label: "Total Users", value: dashboardStats?.totalUsers || 0, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Active Jobs", value: dashboardStats?.activeJobs || 0, icon: TrendUp, color: "bg-green-50 text-green-600" },
    { label: "All-Time Jobs", value: dashboardStats?.totalJobs || 0, icon: Briefcase, color: "bg-primary/10 text-primary" },
    { label: "Pending KYC", value: dashboardStats?.pendingVerifications || 0, icon: ShieldCheck, color: "bg-amber-50 text-amber-600", warn: (dashboardStats?.pendingVerifications || 0) > 0 },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminHeader 
        title={`Hey, ${user?.firstName || 'Admin'}`} 
        description="Here's what's happening across the platform."
        action={
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 bg-white border border-black/5 px-4 py-2.5 rounded-xl font-bold text-xs text-black/40 hover:bg-black/[0.02] transition-colors"
          >
            <ArrowClockwise size={14} weight="bold" />
            Refresh
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-4 md:p-5 rounded-2xl border border-black/5 space-y-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon size={20} weight="duotone" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-primary">
                  {loading ? "—" : stat.value.toLocaleString()}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <p className="text-[10px] font-bold text-black/25">{stat.label}</p>
                  {stat.warn && <WarningCircle size={12} weight="fill" className="text-amber-500" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        {/* Support Tickets */}
        <div className="lg:col-span-3 bg-white p-5 md:p-6 rounded-2xl border border-black/5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ChatCircle size={20} weight="duotone" />
              </div>
              <div>
                <p className="text-sm font-black text-primary">Support Tickets</p>
                <p className="text-[10px] font-bold text-black/25">Live overview</p>
              </div>
            </div>
            <Link
              href="/support"
              className="flex items-center gap-1.5 text-xs font-bold text-black/30 hover:text-primary transition-colors"
            >
              View All <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total", value: supportStats?.total || 0, color: "text-primary" },
              { label: "Open", value: supportStats?.open || 0, color: "text-amber-600" },
              { label: "In Progress", value: supportStats?.inProgress || 0, color: "text-blue-600" },
              { label: "Resolved", value: supportStats?.resolved || 0, color: "text-green-600" },
            ].map((item, j) => (
              <div key={j} className="bg-black/[0.02] p-3 rounded-xl">
                <p className="text-[10px] font-bold text-black/25">{item.label}</p>
                <p className={`text-lg font-black mt-1 ${item.color}`}>
                  {loading ? "—" : item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Health */}
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl border border-black/5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <ActivityIcon size={20} weight="duotone" />
            </div>
            <div>
              <p className="text-sm font-black text-primary">Transactions</p>
              <p className="text-[10px] font-bold text-black/25">Completion rate</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <p className="text-3xl font-black text-primary">{txStats?.successRate || 0}%</p>
              <p className="text-[10px] font-bold text-black/25">Success Rate</p>
            </div>
            <div className="w-full bg-black/[0.04] rounded-full h-2 overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${txStats?.successRate || 0}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600">
              <CheckCircle size={12} weight="fill" />
              Processing normally
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-black/5">
        <p className="text-sm font-black text-primary mb-4">Quick Status</p>
        <div className="space-y-2">
          {[
            { label: "Registered users", value: loading ? "—" : (dashboardStats?.totalUsers || 0).toLocaleString() },
            { label: "Jobs in progress", value: loading ? "—" : (dashboardStats?.activeJobs || 0).toLocaleString() },
            { label: "Pending identity reviews", value: loading ? "—" : (dashboardStats?.pendingVerifications || 0).toString(), warn: (dashboardStats?.pendingVerifications || 0) > 0  },
          ].map((row, k) => (
            <div key={k} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-black/[0.01] transition-colors">
              <p className="text-xs font-medium text-black/40">{row.label}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-primary">{row.value}</p>
                {row.warn && <WarningCircle size={14} weight="fill" className="text-amber-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
