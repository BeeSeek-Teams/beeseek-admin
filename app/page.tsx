"use client";

import React from "react";
import { 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2,
  FileText,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminText } from "@/components/AdminText";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminButton } from "@/components/AdminButton";
import { useAuthStore } from "@/store/useAuthStore";
import { getDashboardStats, DashboardStats } from "@/lib/analytics";
import { toast } from "sonner";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [dashboardStats, setDashboardStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setDashboardStats(data);
      } catch (err) {
        toast.error("Failed to fetch dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { 
      label: "Total Users", 
      value: loading ? "..." : dashboardStats?.totalUsers.toLocaleString() || "0", 
      icon: Users,
      color: "bg-blue-500" 
    },
    { 
      label: "Total Jobs", 
      value: loading ? "..." : (dashboardStats?.totalJobs || 0).toLocaleString(), 
      icon: Briefcase,
      color: "bg-orange-500" 
    },
    { 
      label: "Active Jobs", 
      value: loading ? "..." : (dashboardStats?.activeJobs || 0).toLocaleString(), 
      icon: TrendingUp,
      color: "bg-primary" 
    },
    { 
      label: "Pending Verifications", 
      value: loading ? "..." : (dashboardStats?.pendingVerifications || 0).toString(), 
      icon: ShieldCheck,
      color: "bg-green-500" 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminHeader 
        title={`Welcome back, ${user?.firstName || 'Admin'}`} 
        description="Here's a summary of the hive's activity today."
        action={
          <AdminButton variant="outline" size="sm" className="gap-2">
            <FileText size={16} />
            Export Report
          </AdminButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl text-white", stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted">{stat.label}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
