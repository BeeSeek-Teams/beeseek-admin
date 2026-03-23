"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlass,
  ArrowClockwise,
  CurrencyNgn,
  TrendUp,
  Funnel,
  ArrowCircleDown,
  ArrowCircleUp,
  Lock,
  ShieldCheck,
  CreditCard,
  DownloadSimple,
  Clock,
  CheckCircle,
  Copy,
  SpinnerGap
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
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

  const fetchTransactions = useCallback(async (
    searchQuery = search,
    type = typeFilter,
    status = statusFilter,
    page = currentPage,
  ) => {
    try {
      setLoading(true);
      const params: any = { search: searchQuery, limit: itemsPerPage, page };
      if (type) params.type = type;
      if (status) params.status = status;

      const data = await getTransactions(params);
      setTransactions(data.items);
      setTotal(data.meta.total);
    } catch (error) {
      toast.error("Couldn't load transactions");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, currentPage]);

  const fetchStats = async () => {
    try {
      const data = await getTransactionStats();
      setStats(data);
    } catch (error) { /* non-critical */ }
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
    return () => { debouncedSearch.cancel(); };
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
    link.setAttribute("download", `transactions_${format(new Date(), "yyyy_MM_dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    debouncedSearch(val);
  };

  const formatCurrency = (amountKobo: any) => {
    const amount = Number(amountKobo || 0);
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount / 100);
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
      case TransactionType.CREDIT: return "Credit";
      case TransactionType.DEBIT: return "Debit";
      case TransactionType.LOCKED: return "Locked";
      case TransactionType.ESCROW: return "Escrow";
      case TransactionType.REVENUE: return "Revenue";
    }
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.CREDIT: return <ArrowCircleDown size={14} weight="fill" className="text-success" />;
      case TransactionType.DEBIT: return <ArrowCircleUp size={14} weight="fill" className="text-error" />;
      case TransactionType.LOCKED: return <Lock size={14} weight="fill" className="text-amber-500" />;
      case TransactionType.ESCROW: return <ShieldCheck size={14} weight="fill" className="text-blue-500" />;
      case TransactionType.REVENUE: return <TrendUp size={14} weight="fill" className="text-primary" />;
    }
  };

  const StatCard = ({ title, value, label, icon: Icon }: any) => (
    <div className="bg-white border border-black/5 rounded-2xl p-5">
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={20} weight="duotone" />
        </div>
      </div>
      <p className="text-[10px] font-bold text-black/25 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-xl font-black">{value}</p>
      <p className="text-[10px] text-black/20 mt-1">{label}</p>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <AdminHeader
        title="Transactions"
        description="All platform payments, escrow holds, and revenue."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Revenue" 
          value={stats ? formatCurrency((Number(stats.revenue?.totalServiceFees) || 0) + (Number(stats.revenue?.totalCommissions) || 0)) : "₦0.00"} 
          label="Service fees & commissions"
          icon={CurrencyNgn}
        />
        <StatCard 
          title="Escrow" 
          value={stats ? formatCurrency(Number(stats.byType.find(t => t.type === TransactionType.ESCROW)?.total) || 0) : "₦0.00"} 
          label="Funds held in escrow"
          icon={ShieldCheck}
        />
        <StatCard 
          title="Total Inflow" 
          value={stats ? formatCurrency(Number(stats.byType.find(t => t.type === TransactionType.CREDIT)?.total) || 0) : "₦0.00"} 
          label="All credits processed"
          icon={TrendUp}
        />
        <StatCard 
          title="Success Rate" 
          value={stats ? `${stats.successRate}%` : "—"} 
          label="Completed transactions"
          icon={CheckCircle}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-black/5 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[250px]">
          <AdminInput
            placeholder="Search by reference, description or user..."
            value={search}
            onChange={handleSearchChange}
            icon={<MagnifyingGlass size={16} weight="bold" className="text-black/20" />}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-black/[0.02] rounded-xl border border-black/5">
            <Funnel size={12} weight="bold" className="text-black/20" />
            <select 
              className="bg-transparent text-xs font-bold outline-none cursor-pointer text-black/50"
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

          <div className="flex items-center gap-1.5 px-3 py-2 bg-black/[0.02] rounded-xl border border-black/5">
            <Clock size={12} weight="bold" className="text-black/20" />
            <select 
              className="bg-transparent text-xs font-bold outline-none cursor-pointer text-black/50"
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

          <button 
            onClick={() => { fetchTransactions(); fetchStats(); }}
            disabled={loading}
            className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
          >
            <ArrowClockwise size={16} weight="bold" className={loading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-black/5 rounded-xl text-xs font-bold text-black/40 hover:bg-black/[0.02] transition-colors"
          >
            <DownloadSimple size={14} weight="bold" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/5 rounded-2xl overflow-hidden overflow-x-auto">
        <div className="min-w-[1100px]">
          <AdminTable headers={["Transaction", "User", "Type", "Amount", "Reference", "Status", "Date"]}>
            {loading && transactions.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <SpinnerGap size={24} weight="bold" className="animate-spin text-primary/30" />
                    <p className="text-sm text-black/25">Loading transactions...</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : transactions.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <CurrencyNgn size={32} weight="duotone" className="text-black/10" />
                    <p className="text-sm font-bold text-black/25">No transactions found</p>
                    <p className="text-xs text-black/15">Try different filters or search terms.</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              transactions.map((tx) => (
                <AdminTableRow key={tx.id}>
                  <AdminTableCell>
                    <div>
                      <p className="text-sm font-bold line-clamp-1">{tx.description || "System"}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[10px] font-mono text-black/20">{tx.id.slice(0, 12)}…</p>
                        <button onClick={() => { navigator.clipboard.writeText(tx.id); toast.success("Copied"); }} className="text-black/15 hover:text-primary transition-colors">
                          <Copy size={10} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    {tx.user ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-black/[0.03] border border-black/5 flex items-center justify-center text-primary font-bold text-[10px]">
                          {tx.user.firstName[0]}{tx.user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold">{tx.user.firstName} {tx.user.lastName}</p>
                          <p className="text-[10px] text-black/20">{tx.user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <ShieldCheck size={14} weight="fill" />
                        </div>
                        <p className="text-xs font-bold text-black/30">Platform</p>
                      </div>
                    )}
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-black/[0.02] rounded-lg w-fit border border-black/5">
                      {getTypeIcon(tx.type)}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">{getTypeLabel(tx.type)}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <p className={cn(
                      "text-sm font-bold",
                      tx.type === TransactionType.CREDIT ? "text-success" : 
                      tx.type === TransactionType.DEBIT ? "text-error" : ""
                    )}>
                      {tx.type === TransactionType.DEBIT ? '-' : '+'}{formatCurrency(tx.amount)}
                    </p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <code className="text-[10px] bg-black/[0.02] px-2 py-1 rounded-md text-black/40 font-mono border border-black/5">
                      {tx.monnifyReference || "INTERNAL"}
                    </code>
                    {tx.contractId && (
                      <p className="text-[9px] text-black/15 mt-0.5">Contract: {tx.contractId.slice(0,8)}</p>
                    )}
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge variant={getStatusBadgeVariant(tx.status)}>
                      {tx.status}
                    </AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell>
                    <p className="text-xs font-bold">{format(new Date(tx.createdAt), "MMM dd, yyyy")}</p>
                    <p className="text-[10px] text-black/20">{format(new Date(tx.createdAt), "HH:mm:ss")}</p>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTable>
        </div>
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