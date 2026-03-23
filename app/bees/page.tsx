"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlass,
  ArrowClockwise,
  Briefcase,
  Star,
  Eye,
  TrendUp,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Trash,
  CurrencyNgn,
  ChartBar,
  CheckCircle,
  SpinnerGap,
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminInput } from "@/components/AdminInput";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminPagination } from "@/components/AdminPagination";
import { AdminConsentModal } from "@/components/AdminConsentModal";
import { getBees, getBeeStats, toggleBeeActive, deleteBee, Bee, BeeStats } from "@/lib/bees";
import { toast } from "sonner";
import { format } from "date-fns";
import debounce from "lodash/debounce";

export default function BeesPage() {
  const [bees, setBees] = useState<Bee[]>([]);
  const [stats, setStats] = useState<BeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bee | null>(null);

  const fetchBees = useCallback(async (
    searchQuery = search,
    category = categoryFilter,
    isActive = activeFilter,
    page = currentPage,
  ) => {
    try {
      setLoading(true);
      const params: any = {
        search: searchQuery,
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
      };
      if (category) params.category = category;
      if (isActive) params.isActive = isActive;

      const data = await getBees(params);
      setBees(data.items);
      setTotal(data.total);
    } catch {
      toast.error("Couldn't load listings");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, activeFilter, currentPage]);

  const fetchStats = async () => {
    try {
      const data = await getBeeStats();
      setStats(data);
    } catch {
      // Stats are non-critical
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setCurrentPage(1);
      fetchBees(query, categoryFilter, activeFilter, 1);
    }, 500),
    [fetchBees, categoryFilter, activeFilter]
  );

  useEffect(() => {
    fetchBees();
    fetchStats();
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    debouncedSearch(query);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
    fetchBees(search, category, activeFilter, 1);
  };

  const handleActiveFilter = (status: string) => {
    setActiveFilter(status);
    setCurrentPage(1);
    fetchBees(search, categoryFilter, status, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBees(search, categoryFilter, activeFilter, page);
  };

  const handleToggleActive = async (bee: Bee) => {
    try {
      setProcessingId(bee.id);
      const updated = await toggleBeeActive(bee.id);
      setBees(prev => prev.map(b => b.id === bee.id ? { ...b, isActive: updated.isActive } : b));
      toast.success(`"${bee.title}" is now ${updated.isActive ? 'active' : 'inactive'}`);
      fetchStats();
    } catch {
      toast.error("Couldn't update status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setProcessingId(deleteTarget.id);
      await deleteBee(deleteTarget.id);
      setBees(prev => prev.filter(b => b.id !== deleteTarget.id));
      setTotal(prev => prev - 1);
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      fetchStats();
    } catch {
      toast.error("Couldn't delete listing");
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: any) => {
    const safeAmount = Number(amount || 0);
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(safeAmount);
  };

  const topCategories = stats?.categories?.slice(0, 6) || [];

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminConsentModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this listing?"
        description={`"${deleteTarget?.title}" by ${deleteTarget?.agent?.firstName} ${deleteTarget?.agent?.lastName} will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        loading={!!processingId}
      />

      <AdminHeader
        title="Service Listings"
        description={`${total} listings across the platform`}
        action={
          <button
            onClick={() => { fetchBees(); fetchStats(); }}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-black/5 px-4 py-2.5 rounded-xl font-bold text-xs text-black/40 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
          >
            <ArrowClockwise size={14} weight="bold" className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Total Listings", value: stats?.totalBees, icon: Briefcase, color: "bg-primary/10 text-primary" },
          { label: "Active", value: stats?.activeBees, icon: CheckCircle, color: "bg-green-50 text-green-600" },
          { label: "Revenue", value: stats ? formatCurrency(stats.totalRevenue) : null, icon: CurrencyNgn, color: "bg-amber-50 text-amber-600", isCurrency: true },
          { label: "Avg Rating", value: stats?.avgRating, icon: Star, color: "bg-blue-50 text-blue-600" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-4 md:p-5 rounded-2xl border border-black/5 space-y-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon size={20} weight="duotone" />
              </div>
              <div>
                {stat.value != null ? (
                  <p className="text-2xl font-black text-primary">
                    {stat.isCurrency ? stat.value : Number(stat.value).toLocaleString()}
                  </p>
                ) : (
                  <div className="h-8 w-16 bg-black/[0.03] rounded-lg animate-pulse" />
                )}
                <p className="text-[10px] font-bold text-black/25 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Chips */}
      {topCategories.length > 0 && (
        <div className="bg-white border border-black/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-black/30">Categories</p>
            <ChartBar size={14} weight="bold" className="text-black/15" />
          </div>
          <div className="flex flex-wrap gap-2">
            {topCategories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => handleCategoryFilter(categoryFilter === cat.category ? "" : cat.category)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === cat.category
                    ? "bg-primary text-white"
                    : "bg-black/[0.03] text-black/30 hover:bg-black/[0.06]"
                }`}
              >
                {cat.category} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-black/5 rounded-xl p-3 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/25" size={16} weight="bold" />
            <AdminInput
              placeholder="Search by title, category, or agent..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 h-10 bg-black/[0.02] border-none rounded-xl text-xs"
            />
          </div>
        </div>
        <div className="flex border border-black/5 rounded-xl overflow-hidden">
          {[
            { label: "All", value: "" },
            { label: "Active", value: "true" },
            { label: "Inactive", value: "false" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleActiveFilter(opt.value)}
              className={`px-3.5 py-2 text-[10px] font-bold transition-colors ${
                activeFilter === opt.value
                  ? "bg-primary text-white"
                  : "text-black/30 hover:bg-black/[0.02]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          <AdminTable headers={["Listing", "Agent", "Metrics", "Pricing", "Status", "Actions"]}>
            {loading ? (
              <AdminTableRow>
                <AdminTableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <SpinnerGap size={24} weight="bold" className="animate-spin text-black/15" />
                    <p className="text-xs font-bold text-black/20">Loading...</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : bees.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <Briefcase size={40} weight="duotone" className="text-black/10" />
                    <p className="text-sm font-bold text-black/30">No listings found</p>
                    <p className="text-xs text-black/20">Try adjusting your search or filters</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              bees.map((bee) => (
                <AdminTableRow key={bee.id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3 max-w-[260px]">
                      <div className="w-10 h-10 rounded-xl bg-black/[0.03] border border-black/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {bee.images && bee.images.length > 0 ? (
                          <img src={bee.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Briefcase size={16} weight="duotone" className="text-black/15" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-black/60 truncate">{bee.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <AdminBadge variant="info" className="text-[8px] px-1.5">{bee.category}</AdminBadge>
                          {bee.locationAddress && (
                            <div className="flex items-center gap-0.5 text-black/20">
                              <MapPin size={9} weight="bold" />
                              <span className="text-[9px] truncate max-w-[80px]">{bee.locationAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    {bee.agent ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/5 flex items-center justify-center text-primary font-bold text-[9px] overflow-hidden flex-shrink-0">
                          {bee.agent.profileImage ? (
                            <img src={bee.agent.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${bee.agent.firstName?.[0] || ''}${bee.agent.lastName?.[0] || ''}`
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-black/60 truncate">{bee.agent.firstName} {bee.agent.lastName}</p>
                          <p className="text-[10px] text-black/20 truncate max-w-[110px]">{bee.agent.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-black/20">—</p>
                    )}
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1" title="Views">
                          <Eye size={11} weight="bold" className="text-black/15" />
                          <span className="text-[10px] font-bold text-black/30">{bee.totalViews}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Hires">
                          <TrendUp size={11} weight="bold" className="text-black/15" />
                          <span className="text-[10px] font-bold text-black/30">{bee.totalHires}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Rating">
                          <Star size={11} weight="fill" className="text-amber-400" />
                          <span className="text-[10px] font-bold text-black/40">{Number(bee.rating).toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-black/20">{bee.jobsCompleted} jobs done</p>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div>
                      <p className="text-xs font-black text-primary">{formatCurrency(Number(bee.price))}</p>
                      {bee.offersInspection && (
                        <p className="text-[10px] text-black/20 mt-0.5">
                          Inspection: {bee.inspectionPrice ? formatCurrency(Number(bee.inspectionPrice)) : 'Free'}
                        </p>
                      )}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="space-y-1">
                      <AdminBadge variant={bee.isActive ? 'success' : 'error'}>
                        {bee.isActive ? 'Active' : 'Inactive'}
                      </AdminBadge>
                      <p className="text-[10px] text-black/15">
                        {format(new Date(bee.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleActive(bee)}
                        disabled={processingId === bee.id}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                          bee.isActive 
                            ? "text-black/25 hover:bg-amber-50 hover:text-amber-600" 
                            : "text-black/25 hover:bg-green-50 hover:text-green-600"
                        }`}
                        title={bee.isActive ? "Deactivate" : "Activate"}
                      >
                        {processingId === bee.id ? (
                          <SpinnerGap size={16} weight="bold" className="animate-spin" />
                        ) : bee.isActive ? (
                          <ToggleRight size={16} weight="fill" />
                        ) : (
                          <ToggleLeft size={16} weight="bold" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(bee)}
                        disabled={processingId === bee.id}
                        className="p-2 rounded-lg text-black/25 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTable>
        </div>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
