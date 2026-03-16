"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  RefreshCcw, 
  Filter, 
  ExternalLink, 
  Clock, 
  MapPin, 
  Briefcase,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminInput } from "@/components/AdminInput";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminPagination } from "@/components/AdminPagination";
import { toast } from "sonner";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import Link from "next/link";
import { getJobs, updateJobStatus, Job, JobStatus, JobStep } from "@/lib/jobs";
import { cn } from "@/lib/utils";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  const fetchJobs = useCallback(async (
    searchQuery = search,
    status = statusFilter,
    page = currentPage
  ) => {
    try {
      setLoading(true);
      const params: any = {
        search: searchQuery,
        limit: itemsPerPage,
        page: page,
      };
      if (status) params.status = status;

      const data = await getJobs(params);
      setJobs(data.items);
      setTotal(data.meta.total);
    } catch (error) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    fetchJobs();
    return () => {
      debouncedSearch.cancel();
    };
  }, [fetchJobs]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setCurrentPage(1);
      fetchJobs(query, statusFilter, 1);
    }, 500),
    [fetchJobs, statusFilter]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleEscalate = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to ESCALATE this job? This will notify both parties and freeze certain actions.")) return;

    try {
      setProcessingId(jobId);
      await updateJobStatus(jobId, JobStatus.ESCALATED);
      toast.success("Job escalated successfully");
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to escalate job");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const config = {
      [JobStatus.ACTIVE]: { color: "text-primary", icon: <RefreshCcw size={12} className="animate-spin-slow" /> },
      [JobStatus.COMPLETED]: { color: "text-success", icon: <CheckCircle2 size={12} /> },
      [JobStatus.CANCELLED]: { color: "text-error", icon: <XCircle size={12} /> },
      [JobStatus.ESCALATED]: { color: "text-amber-600", icon: <AlertCircle size={12} /> },
    };

    const style = config[status] || { color: "text-slate-500", icon: null };

    return (
      <div className={cn("flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider", style.color)}>
        {style.icon}
        {status}
      </div>
    );
  };

  const formatCurrency = (amountKobo: any) => {
    const amount = Number(amountKobo || 0);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount / 100);
  };

  return (
    <div className="space-y-8 pb-20">
      <AdminHeader
        title="Job Control Center"
        description="Monitor active service executions, verify forensics, and manage escalations."
        action={
          <AdminButton variant="outline" size="sm" className="gap-2" onClick={() => fetchJobs()}>
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Resync Jobs
          </AdminButton>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white border border-border/50 rounded-[32px] p-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px] md:min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900" size={18} />
          <AdminInput
            placeholder="Search by contract details, agent or client name..."
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
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value as JobStatus | "";
                setStatusFilter(val);
                setCurrentPage(1);
                fetchJobs(search, val, 1);
              }}
            >
              <option value="">All Statuses</option>
              {Object.values(JobStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white border border-border/50 rounded-[32px] overflow-hidden shadow-sm overflow-x-auto min-w-full">
        <div className="min-w-[1400px]">
          <AdminTable headers={["Job / Contract", "Client / Agent", "Progress", "Total Value", "Status", "Last Update", "Actions"]}>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <AdminTableRow key={i}>
                  <AdminTableCell colSpan={7}><div className="h-16 bg-slate-50 animate-pulse rounded-xl" /></AdminTableCell>
                </AdminTableRow>
              ))
            ) : jobs.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={7} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <Briefcase size={48} />
                    <AdminText variant="bold" color="secondary">No jobs matching filters</AdminText>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              jobs.map((job) => {
                const calculatedTotal = (
                  Number(job.contract.workmanshipCost || 0) + 
                  Number(job.contract.transportFare || 0) + 
                  Number(job.contract.serviceFee || 0) + 
                  (job.contract.materials?.reduce((sum, m) => sum + Number(m.cost || 0), 0) || 0)
                );
                const displayTotal = job.contract.totalAmount > 0 ? job.contract.totalAmount : calculatedTotal;

                return (
                  <AdminTableRow key={job.id}>
                    <AdminTableCell className="min-w-[300px] py-6">
                      <div className="flex flex-col gap-1">
                        <AdminText size="sm" variant="bold" className="line-clamp-1">{job.contract.details}</AdminText>
                        <div className="flex items-center gap-2">
                          <AdminText size="xs" color="secondary" className="text-[10px] font-mono">ID: {job.id.slice(0, 13)}...</AdminText>
                          <button onClick={() => { navigator.clipboard.writeText(job.id); toast.success("ID Copied"); }} className="text-primary hover:text-primary/70">
                            <ExternalLink size={10} />
                          </button>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="min-w-[250px]">
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                            <AdminBadge variant="secondary" className="text-[8px] px-1">CLIENT</AdminBadge>
                            <AdminText size="xs" variant="bold">{job.contract.client.firstName} {job.contract.client.lastName}</AdminText>
                         </div>
                         <div className="flex items-center gap-2">
                            <AdminBadge variant="primary" className="text-[8px] px-1">AGENT</AdminBadge>
                            <AdminText size="xs" variant="bold">{job.contract.agent.firstName} {job.contract.agent.lastName}</AdminText>
                         </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-col gap-1">
                         <AdminText size="xs" variant="bold" className="uppercase tracking-tighter text-slate-500">{job.currentStep.replace(/_/g, ' ')}</AdminText>
                         <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-500" 
                              style={{ 
                                width: `${
                                  job.currentStep === JobStep.HOME_SAFE ? 100 :
                                  job.currentStep === JobStep.FINISHED ? 85 :
                                  job.currentStep === JobStep.STARTED ? 71 :
                                  job.currentStep === JobStep.ARRIVED ? 57 :
                                  job.currentStep === JobStep.ON_THE_WAY ? 42 :
                                  job.currentStep === JobStep.MATERIALS_PURCHASED ? 28 : 14
                                }%` 
                              }} 
                            />
                         </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="min-w-[120px]">
                      <AdminText size="md" variant="bold" className="text-slate-900">{formatCurrency(displayTotal)}</AdminText>
                    </AdminTableCell>
                  <AdminTableCell className="min-w-[160px]">
                    {getStatusBadge(job.status)}
                  </AdminTableCell>
                  <AdminTableCell className="min-w-[140px]">
                    <div className="flex flex-col">
                      <AdminText size="xs" variant="bold">{format(new Date(job.updatedAt), "MMM dd, yyyy")}</AdminText>
                      <div className="flex items-center gap-1 opacity-50">
                        <Clock size={10} />
                        <AdminText size="xs" className="text-[10px]">{format(new Date(job.updatedAt), "HH:mm:ss")}</AdminText>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-2">
                        <Link href={`/jobs/${job.id}`}>
                          <button 
                            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </Link>
                        
                        {job.status !== JobStatus.ESCALATED && job.status !== JobStatus.COMPLETED && job.status !== JobStatus.CANCELLED && (
                          <button 
                            onClick={() => handleEscalate(job.id)}
                            disabled={processingId === job.id}
                            className={cn(
                              "p-2 hover:bg-amber-50 rounded-lg text-slate-400 hover:text-amber-600 transition-colors flex items-center gap-1",
                              processingId === job.id && "animate-pulse cursor-not-allowed"
                            )}
                            title="Escalate Job"
                          >
                            <AlertCircle size={16} />
                          </button>
                        )}

                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              );
            })
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
