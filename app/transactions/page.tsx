"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCcw,
  DollarSign,
  TrendingUp,
  Filter,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  ShieldCheck,
  CreditCard,
  Download,
  Calendar,
  User,
  ExternalLink,
  ChevronDown,
  Info,
  Clock,
  Briefcase,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  MoreHorizontal
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminInput } from "@/components/AdminInput";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminPagination } from "@/components/AdminPagination";
import { 
  getTransactions, 
  getTransactionStats, 
  Transaction, 
  TransactionStats, 
  TransactionType, 
  TransactionStatus 
} from "@/lib/transactions";
import { toast } from "sonner";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "">("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async (
    searchQuery = search,
    type = typeFilter,
    status = statusFilter,
    page = currentPage,
  ) => {
    try {
      setLoading(true);
      const params: any = {
        search: searchQuery,
        limit: itemsPerPage,
        page: page,
      };
      if (type) params.type = type;
      if (status) params.status = status;

      const data = await getTransactions(params);
      setTransactions(data.items);
      setTotal(data.meta.total);
    } catch (error) {
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, currentPage]);

  const fetchStats = async () => {
    try {
      const data = await getTransactionStats();
      setStats(data);
    } catch (error) {
      // Stats are non-critical
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setCurrentPage(1);
      fetchTransactions(query, typeFilter, statusFilter, 1);
    }, 500),
    [fetchTransactions, typeFilter, statusFilter]
  );

  useEffect(() => {
    fetchTransactions();
    fetchStats();
    return () => {
      debouncedSearch.cancel();
    };
  }, [fetchTransactions]);

  const handleExport = () => {
    if (transactions.length === 0) return;
    
    const headers = ["ID", "Description", "User", "Email", "Type", "Amount", "Reference", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...transactions.map(tx => [
        tx.id,
        `"${tx.description || 'System'}"`,
        `"${tx.user ? `${tx.user.firstName} ${tx.user.lastName}` : 'Platform'}"`,
        tx.user?.email || "N/A",
        tx.type,
        tx.amount / 100,
        tx.monnifyReference || "INTERNAL",
        tx.status,
        format(new Date(tx.createdAt), "yyyy-MM-dd HH:mm:ss")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `beeseek_ledger_${format(new Date(), "yyyy_MM_dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Ledger exported successfully");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    debouncedSearch(val);
  };

  const formatCurrency = (amountKobo: any) => {
    const amount = Number(amountKobo || 0);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount / 100);
  };

  const getStatusBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.SUCCESS: return "success";
      case TransactionStatus.PENDING: return "warning";
      case TransactionStatus.FAILED: return "error";
      default: return "info";
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.CREDIT: return "Deposit / Inflow";
      case TransactionType.DEBIT: return "Withdrawal / Outflow";
      case TransactionType.LOCKED: return "Security Hold";
      case TransactionType.ESCROW: return "Vulnerable Fund";
      case TransactionType.REVENUE: return "Service Earnings";
    }
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.CREDIT: return <ArrowDownCircle size={14} className="text-success" />;
      case TransactionType.DEBIT: return <ArrowUpCircle size={14} className="text-error" />;
      case TransactionType.LOCKED: return <Lock size={14} className="text-amber-500" />;
      case TransactionType.ESCROW: return <ShieldCheck size={14} className="text-blue-500" />;
      case TransactionType.REVENUE: return <TrendingUp size={14} className="text-primary" />;
    }
  };

  const StatCard = ({ title, value, label, icon: Icon, trend }: any) => (
    <div className="bg-white border border-border/50 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={24} />
        </div>
        {trend && (
          <div className="bg-success/10 text-success px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
            <TrendingUp size={10} />
            {trend}
          </div>
        )}
      </div>
      <AdminText size="xs" color="secondary" variant="bold" className="uppercase tracking-widest mb-1">{title}</AdminText>
      <div className="flex items-baseline gap-2">
        <AdminText size="2xl" variant="bold">{value}</AdminText>
      </div>
      <AdminText size="xs" color="secondary" className="mt-2">{label}</AdminText>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <AdminHeader
        title="Financial Intelligence"
        description="Comprehensive management of platform flow, workmanship fees, and revenue distribution."
        action={
          <AdminButton variant="outline" size="sm" className="gap-2" onClick={() => { fetchTransactions(); fetchStats(); }}>
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Resync Data
          </AdminButton>
        }
      />

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Platform Revenue" 
          value={stats ? formatCurrency((Number(stats.revenue?.totalServiceFees) || 0) + (Number(stats.revenue?.totalCommissions) || 0)) : "₦0.00"} 
          label="Total service fees & commissions"
          icon={DollarSign}
        />
        <StatCard 
          title="Escrow Volume" 
          value={stats ? formatCurrency(Number(stats.byType.find(t => t.type === TransactionType.ESCROW)?.total) || 0) : "₦0.00"} 
          label="Funds currently in active safe-lock"
          icon={ShieldCheck}
        />
        <StatCard 
          title="Circulating Value" 
          value={stats ? formatCurrency(Number(stats.byType.find(t => t.type === TransactionType.CREDIT)?.total) || 0) : "₦0.00"} 
          label="Total funds flowing through platform"
          icon={TrendingUp}
        />
        <StatCard 
          title="Success Rate" 
          value={stats ? `${stats.successRate}%` : "—"} 
          label="Transaction completion efficiency"
          icon={CheckCircle2}
        />
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white border border-border/50 rounded-[32px] p-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
          <AdminInput
            placeholder="Search by reference, description or user name..."
            className="pl-12 h-12 bg-slate-50 border-none rounded-2xl"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <Filter size={14} className="text-black" />
            <select 
              className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              value={typeFilter}
              onChange={(e) => {
                const val = e.target.value as TransactionType | "";
                setTypeFilter(val);
                setCurrentPage(1);
                fetchTransactions(search, val, statusFilter, 1);
              }}
            >
              <option value="">All Types</option>
              <option value={TransactionType.CREDIT}>Credit</option>
              <option value={TransactionType.DEBIT}>Debit</option>
              <option value={TransactionType.ESCROW}>Escrow</option>
              <option value={TransactionType.LOCKED}>Locked</option>
              <option value={TransactionType.REVENUE}>Revenue</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <Clock size={14} className="text-slate-400" />
            <select 
              className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value as TransactionStatus | "";
                setStatusFilter(val);
                setCurrentPage(1);
                fetchTransactions(search, typeFilter, val, 1);
              }}
            >
              <option value="">All Statuses</option>
              <option value={TransactionStatus.SUCCESS}>Success</option>
              <option value={TransactionStatus.PENDING}>Pending</option>
              <option value={TransactionStatus.FAILED}>Failed</option>
            </select>
          </div>

          <AdminButton 
            variant="outline" 
            size="sm" 
            className="rounded-2xl h-10 px-4 hover:bg-primary/5 border-primary/20 text-primary"
            onClick={handleExport}
          >
            <Download size={16} className="mr-2" />
            Export Ledger
          </AdminButton>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-border/50 rounded-[40px] overflow-hidden shadow-sm overflow-x-auto">
        <div className="min-w-[1400px]">
          <AdminTable
            headers={["Transaction", "User / Entity", "Nature", "Amount", "Reference", "Status", "Date", "Actions"]}
          >
            {loading && transactions.length === 0 ? (
              Array(5).fill(0).map((_, i) => (
                <AdminTableRow key={i}>
                  <AdminTableCell colSpan={8} className="py-12 text-center">
                    <RefreshCcw className="animate-spin text-primary inline-block mr-2" size={20} />
                    <AdminText color="secondary">Loading ledger data...</AdminText>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            ) : transactions.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={8} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                    <FileText size={48} />
                    <AdminText variant="bold" color="secondary">No transactions found</AdminText>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              transactions.map((tx) => (
                <AdminTableRow key={tx.id}>
                  <AdminTableCell className="min-w-[250px] py-6">
                    <div className="flex flex-col gap-1">
                      <AdminText size="sm" variant="bold" className="line-clamp-1">{tx.description || "System Transaction"}</AdminText>
                      <div className="flex items-center gap-2">
                         <AdminText size="xs" color="secondary" className="text-[10px] font-mono">ID: {tx.id.slice(0, 13)}...</AdminText>
                         <button onClick={() => { navigator.clipboard.writeText(tx.id); toast.success("ID Copied"); }} className="text-primary hover:text-primary/70">
                            <ExternalLink size={10} />
                         </button>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="min-w-[200px]">
                    {tx.user ? (
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm border border-white shadow-sm">
                          {tx.user.firstName[0]}{tx.user.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <AdminText size="xs" variant="bold">{tx.user.firstName} {tx.user.lastName}</AdminText>
                          <AdminText size="xs" color="secondary" className="text-[10px] opacity-70">{tx.user.email}</AdminText>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/5 shadow-sm">
                          <ShieldCheck size={16} />
                        </div>
                        <AdminText size="xs" variant="bold" color="secondary">Platform Reserve</AdminText>
                      </div>
                    )}
                  </AdminTableCell>
                  <AdminTableCell className="min-w-[150px]">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl w-fit border border-slate-100">
                      {getTypeIcon(tx.type)}
                      <AdminText size="xs" variant="bold" className="uppercase tracking-wider text-[10px]">{getTypeLabel(tx.type)}</AdminText>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="min-w-[150px]">
                    <div className="flex flex-col">
                      <AdminText size="md" variant="bold" className={cn(
                        tx.type === TransactionType.CREDIT ? "text-success" : 
                        tx.type === TransactionType.DEBIT ? "text-error" : 
                        "text-slate-900"
                      )}>
                        {tx.type === TransactionType.DEBIT ? '-' : '+'}{formatCurrency(tx.amount)}
                      </AdminText>
                      <AdminText size="xs" color="secondary" className="text-[10px]">Settled Amount</AdminText>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="min-w-[160px]">
                    <div className="flex flex-col">
                       <code className="text-[10px] bg-slate-50 px-2.5 py-1 rounded-lg text-slate-600 font-mono w-fit border border-slate-100">
                        {tx.monnifyReference || "INTERNAL"}
                      </code>
                      {tx.contractId && (
                         <AdminText size="xs" color="secondary" className="text-[9px] mt-1">Contract: {tx.contractId.slice(0,8)}</AdminText>
                      )}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="min-w-[120px]">
                    <AdminBadge variant={getStatusBadgeVariant(tx.status)} className="px-4 py-1.5 rounded-xl border-none">
                      {tx.status}
                    </AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell className="min-w-[140px]">
                    <div className="flex flex-col">
                      <AdminText size="xs" variant="bold" className="text-slate-700">{format(new Date(tx.createdAt), "MMM dd, yyyy")}</AdminText>
                      <div className="flex items-center gap-1 opacity-50">
                        <Clock size={10} />
                        <AdminText size="xs" className="text-[10px]">{format(new Date(tx.createdAt), "HH:mm:ss")}</AdminText>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
                        <FileText size={16} />
                      </button>
                      <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTable>
        </div>
      </div>
      
      <div className="bg-white border border-border/50 rounded-[32px] p-6 shadow-sm">
        <AdminPagination
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
