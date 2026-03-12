"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCcw,
  Briefcase,
  Star,
  Eye,
  TrendingUp,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Trash2,
  MoreHorizontal,
  DollarSign,
  BarChart3,
  Filter,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
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
  const [expandedBee, setExpandedBee] = useState<string | null>(null);

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
    } catch (error) {
      toast.error("Failed to fetch bees");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, activeFilter, currentPage]);

  const fetchStats = async () => {
    try {
      const data = await getBeeStats();
      setStats(data);
    } catch (error) {
      // Stats are non-critical, silent fail
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
      toast.success(`Bee "${bee.title}" is now ${updated.isActive ? 'active' : 'deactivated'}`);
      fetchStats();
    } catch (error) {
      toast.error("Failed to toggle bee status");
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
      toast.success(`Bee "${deleteTarget.title}" has been permanently removed.`);
      setDeleteTarget(null);
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete bee");
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
    <div className="space-y-8">
      <AdminConsentModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Bee Listing"
        description={`This will permanently delete "${deleteTarget?.title}" by ${deleteTarget?.agent?.firstName} ${deleteTarget?.agent?.lastName}. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="danger"
      />

      <AdminHeader
        title="Bee Registry"
        description={`Monitoring ${total} service listings across the platform.`}
        action={
          <AdminButton variant="outline" size="sm" className="gap-2" onClick={() => { fetchBees(); fetchStats(); }} disabled={loading}>
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </AdminButton>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-border/50 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Briefcase size={22} className="text-primary" />
            </div>
            <AdminBadge variant="primary">Total</AdminBadge>
          </div>
          {stats ? (
            <AdminText variant="bold" size="3xl">{stats.totalBees.toLocaleString()}</AdminText>
          ) : (
            <div className="h-9 w-20 bg-surface rounded-lg animate-pulse" />
          )}
          <AdminText size="xs" color="secondary" className="mt-1">Registered Bees</AdminText>
        </div>

        <div className="bg-white border border-border/50 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 size={22} className="text-success" />
            </div>
            <AdminBadge variant="success">Live</AdminBadge>
          </div>
          {stats ? (
            <AdminText variant="bold" size="3xl">{stats.activeBees.toLocaleString()}</AdminText>
          ) : (
            <div className="h-9 w-20 bg-surface rounded-lg animate-pulse" />
          )}
          <AdminText size="xs" color="secondary" className="mt-1">Active Listings</AdminText>
        </div>

        <div className="bg-white border border-border/50 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center">
              <DollarSign size={22} className="text-warning" />
            </div>
            <AdminBadge variant="warning">Revenue</AdminBadge>
          </div>
          {stats ? (
            <AdminText variant="bold" size="3xl">{formatCurrency(stats.totalRevenue)}</AdminText>
          ) : (
            <div className="h-9 w-20 bg-surface rounded-lg animate-pulse" />
          )}
          <AdminText size="xs" color="secondary" className="mt-1">Total Platform Revenue</AdminText>
        </div>

        <div className="bg-white border border-border/50 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center">
              <Star size={22} className="text-info" />
            </div>
            <AdminBadge variant="info">Quality</AdminBadge>
          </div>
          {stats ? (
            <AdminText variant="bold" size="3xl">{stats.avgRating}</AdminText>
          ) : (
            <div className="h-9 w-20 bg-surface rounded-lg animate-pulse" />
          )}
          <AdminText size="xs" color="secondary" className="mt-1">Average Rating</AdminText>
        </div>
      </div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <div className="bg-white border border-border/50 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <AdminText variant="bold" size="sm">Category Distribution</AdminText>
            <BarChart3 size={16} className="text-secondary" />
          </div>
          <div className="flex flex-wrap gap-2">
            {topCategories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => handleCategoryFilter(categoryFilter === cat.category ? "" : cat.category)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-plus-jakarta transition-all border ${
                  categoryFilter === cat.category
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-surface text-secondary border-border/50 hover:bg-white hover:border-primary/30"
                }`}
              >
                {cat.category} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-border/50 p-6 rounded-[24px] shadow-sm">
        <div className="w-full md:max-w-md">
          <AdminInput
            placeholder="Search by title, category, or agent name..."
            value={search}
            onChange={handleSearchChange}
            icon={<Search size={18} />}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <AdminButton
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => { fetchBees(); fetchStats(); }}
            disabled={loading}
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </AdminButton>
          <div className="flex border border-border/50 rounded-xl overflow-hidden bg-surface">
            <button
              onClick={() => handleActiveFilter("")}
              className={`px-4 py-2 text-xs font-bold font-plus-jakarta transition-colors ${activeFilter === '' ? 'bg-primary text-white' : 'text-secondary hover:bg-white'}`}
            >
              All
            </button>
            <button
              onClick={() => handleActiveFilter("true")}
              className={`px-4 py-2 text-xs font-bold font-plus-jakarta transition-colors border-l border-border/50 ${activeFilter === 'true' ? 'bg-success text-white' : 'text-secondary hover:bg-white'}`}
            >
              Active
            </button>
            <button
              onClick={() => handleActiveFilter("false")}
              className={`px-4 py-2 text-xs font-bold font-plus-jakarta transition-colors border-l border-border/50 ${activeFilter === 'false' ? 'bg-error text-white' : 'text-secondary hover:bg-white'}`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-border/50 overflow-hidden shadow-sm overflow-x-auto min-w-full">
        <div className="min-w-[1200px]">
          <AdminTable headers={["Service Listing", "Agent", "Metrics", "Pricing", "Status", "Controls"]}>
          {loading ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <RefreshCcw size={32} className="animate-spin text-primary/40" />
                  <AdminText color="secondary" size="sm">Loading Bee Registry...</AdminText>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : bees.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center text-secondary/20">
                    <Briefcase size={32} />
                  </div>
                  <div className="text-center">
                    <AdminText variant="bold">No bees found</AdminText>
                    <AdminText color="secondary" size="xs">Try adjusting your filters or search keywords.</AdminText>
                  </div>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : (
            bees.map((bee) => (
              <AdminTableRow key={bee.id} className="group">
                <AdminTableCell>
                  <div className="flex items-center gap-3 max-w-[280px]">
                    <div className="w-11 h-11 rounded-2xl bg-surface border border-border/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {bee.images && bee.images.length > 0 ? (
                        <img src={bee.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase size={18} className="text-primary/40" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <AdminText variant="bold" size="sm" className="truncate block">{bee.title}</AdminText>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <AdminBadge variant="info" className="text-[9px] px-1.5 py-0">{bee.category}</AdminBadge>
                        {bee.locationAddress && (
                          <div className="flex items-center gap-0.5 text-muted">
                            <MapPin size={10} />
                            <AdminText size="xs" color="secondary" className="truncate max-w-[100px]">{bee.locationAddress}</AdminText>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  {bee.agent ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface border border-border/20 flex items-center justify-center text-primary font-bold text-[10px] overflow-hidden flex-shrink-0">
                        {bee.agent.profileImage ? (
                          <img src={bee.agent.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          `${bee.agent.firstName?.[0] || ''}${bee.agent.lastName?.[0] || ''}`
                        )}
                      </div>
                      <div className="min-w-0">
                        <AdminText size="xs" variant="bold" className="truncate block">{bee.agent.firstName} {bee.agent.lastName}</AdminText>
                        <AdminText size="xs" color="secondary" className="truncate block max-w-[120px]">{bee.agent.email}</AdminText>
                      </div>
                    </div>
                  ) : (
                    <AdminText size="xs" color="secondary">N/A</AdminText>
                  )}
                </AdminTableCell>
                <AdminTableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1" title="Views">
                        <Eye size={12} className="text-muted" />
                        <AdminText size="xs">{bee.totalViews}</AdminText>
                      </div>
                      <div className="flex items-center gap-1" title="Hires">
                        <TrendingUp size={12} className="text-muted" />
                        <AdminText size="xs">{bee.totalHires}</AdminText>
                      </div>
                      <div className="flex items-center gap-1" title="Rating">
                        <Star size={12} className="text-warning" />
                        <AdminText size="xs" variant="bold">{Number(bee.rating).toFixed(1)}</AdminText>
                      </div>
                    </div>
                    <AdminText size="xs" color="secondary">{bee.jobsCompleted} jobs done</AdminText>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div>
                    <AdminText variant="bold" size="sm">{formatCurrency(Number(bee.price))}</AdminText>
                    {bee.offersInspection && (
                      <AdminText size="xs" color="secondary">Inspection: {bee.inspectionPrice ? formatCurrency(Number(bee.inspectionPrice)) : 'Free'}</AdminText>
                    )}
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="space-y-1.5">
                    <AdminBadge variant={bee.isActive ? 'success' : 'error'}>
                      {bee.isActive ? 'Active' : 'Inactive'}
                    </AdminBadge>
                    <AdminText size="xs" color="secondary">
                      {format(new Date(bee.createdAt), "MMM dd, yyyy")}
                    </AdminText>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    <AdminButton
                      variant={bee.isActive ? "secondary" : "success"}
                      size="sm"
                      className="h-8 py-0 gap-1.5"
                      onClick={() => handleToggleActive(bee)}
                      disabled={processingId === bee.id}
                      title={bee.isActive ? "Deactivate" : "Activate"}
                    >
                      {processingId === bee.id ? (
                        <RefreshCcw size={14} className="animate-spin" />
                      ) : bee.isActive ? (
                        <ToggleRight size={14} />
                      ) : (
                        <ToggleLeft size={14} />
                      )}
                      {bee.isActive ? "Deactivate" : "Activate"}
                    </AdminButton>
                    <AdminButton
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-error hover:bg-error/5 hover:border-error/30"
                      onClick={() => setDeleteTarget(bee)}
                      disabled={processingId === bee.id}
                      title="Delete Bee"
                    >
                      <Trash2 size={14} />
                    </AdminButton>
                  </div>
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
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
