"use client";

import React from "react";
import { 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2,
  FileText,
  Briefcase,
  Activity,
  AlertCircle,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminText } from "@/components/AdminText";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminButton } from "@/components/AdminButton";
import { useAuthStore } from "@/store/useAuthStore";
import { getDashboardStats, DashboardStats } from "@/lib/analytics";
import { getTransactionStats, TransactionStats } from "@/lib/transactions";
import { toast } from "sonner";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [dashboardStats, setDashboardStats] = React.useState<DashboardStats | null>(null);
  const [txStats, setTxStats] = React.useState<TransactionStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [dashboard, transactions] = await Promise.all([
          getDashboardStats(),
          getTransactionStats(),
        ]);
        setDashboardStats(dashboard);
        setTxStats(transactions);
      } catch (err) {
        toast.error("Failed to fetch dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Calculate growth or status indicators
  const getStatusColor = (value: number, threshold: number = 0) => {
    return value > threshold ? 'text-success' : value === 0 ? 'text-slate-400' : 'text-warning';
  };

  const stats = [
    { 
      label: "Total Users", 
      value: loading ? "..." : dashboardStats?.totalUsers.toLocaleString() || "0", 
      icon: Users,
      color: "bg-blue-500",
      subtext: "All platform members"
    },
    { 
      label: "Active Jobs", 
      value: loading ? "..." : (dashboardStats?.activeJobs || 0).toLocaleString(), 
      icon: TrendingUp,
      color: "bg-primary",
      subtext: "Jobs in progress"
    },
    { 
      label: "Total Jobs", 
      value: loading ? "..." : (dashboardStats?.totalJobs || 0).toLocaleString(), 
      icon: Briefcase,
      color: "bg-orange-500",
      subtext: "All-time jobs"
    },
    { 
      label: "Pending Verifications", 
      value: loading ? "..." : (dashboardStats?.pendingVerifications || 0).toString(), 
      icon: ShieldCheck,
      color: "bg-amber-500",
      subtext: "Awaiting KYC",
      highlight: (dashboardStats?.pendingVerifications || 0) > 0
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminHeader 
        title={`Welcome back, ${user?.firstName || 'Admin'}`} 
        description="Here's a summary of the hive's activity today."
        action={
          <AdminButton variant="outline" size="sm" className="gap-2" onClick={() => window.location.reload()}>
            <RefreshCcw size={16} />
            Refresh
          </AdminButton>
        }
      />

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={cn(
              "bg-background border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group",
              stat.highlight && "border-amber-300/50 bg-amber-50/30"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl text-white transition-transform group-hover:scale-110", stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-4xl font-bold text-foreground mt-2">{stat.value}</h3>
              <p className="text-xs text-slate-500 mt-2">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Success Rate */}
        <div className="bg-background border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success/10 rounded-lg text-success">
              <Activity size={20} />
            </div>
            <div>
              <AdminText variant="bold" size="lg">Transaction Health</AdminText>
              <AdminText size="xs" color="secondary">Platform completion rate</AdminText>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <AdminText size="sm" variant="bold">Success Rate</AdminText>
                <AdminText size="sm" variant="bold" className="text-success">{txStats?.successRate || 0}%</AdminText>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-success to-success/70 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${txStats?.successRate || 0}%` }}
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-2">
              <CheckCircle2 size={12} />
              Transactions processing smoothly
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-background border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText size={20} />
            </div>
            <div>
              <AdminText variant="bold" size="lg">Platform Status</AdminText>
              <AdminText size="xs" color="secondary">Real-time overview</AdminText>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <AdminText size="sm">Active Users</AdminText>
              <AdminText size="sm" variant="bold" className={getStatusColor(dashboardStats?.totalUsers || 0, 1)}>
                {loading ? "—" : dashboardStats?.totalUsers || 0}
              </AdminText>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <AdminText size="sm">Jobs In Progress</AdminText>
              <AdminText size="sm" variant="bold" className={getStatusColor(dashboardStats?.activeJobs || 0)}>
                {loading ? "—" : dashboardStats?.activeJobs || 0}
              </AdminText>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <AdminText size="sm">Pending Reviews</AdminText>
              <div className="flex items-center gap-2">
                <AdminText size="sm" variant="bold" className={getStatusColor(dashboardStats?.pendingVerifications || 0, 1)}>
                  {loading ? "—" : dashboardStats?.pendingVerifications || 0}
                </AdminText>
                {(dashboardStats?.pendingVerifications || 0) > 0 && (
                  <AlertCircle size={14} className="text-amber-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
