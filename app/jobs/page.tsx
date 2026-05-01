"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  MagnifyingGlass, 
  ArrowClockwise, 
  Funnel, 
  Copy, 
  Clock, 
  Briefcase,
  WarningCircle,
  CheckCircle,
  XCircle,
  Eye,
  SpinnerGap,
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminInput } from "@/components/AdminInput";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminPagination } from "@/components/AdminPagination";
import { toast } from "sonner";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getJobs, updateJobStatus, adminCancelJob, Job, JobStatus, JobStep, getJobFlowLabel, isErrandDetails, stripErrandMeta } from "@/lib/jobs";
import { AdminConsentModal } from "@/components/AdminConsentModal";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{ jobId: string; details: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelAsInfraction, setCancelAsInfraction] = useState(false);
  const [escalateModal, setEscalateModal] = useState<string | null>(null);
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
    } catch {
      toast.error("Couldn't load jobs");
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
    try {
      setProcessingId(jobId);
      await updateJobStatus(jobId, JobStatus.ESCALATED);
      toast.success("Job escalated");
      setEscalateModal(null);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Couldn't escalate job");
    } finally {
      setProcessingId(null);
    }
  };

  const handleForceCancel = async () => {
    if (!cancelModal || !cancelReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    try {
      setProcessingId(cancelModal.jobId);
      await adminCancelJob(cancelModal.jobId, cancelReason.trim(), cancelAsInfraction);
      toast.success(`Job cancelled${cancelAsInfraction ? " — infraction recorded" : ""}`);
      setCancelModal(null);
      setCancelReason("");
      setCancelAsInfraction(false);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Couldn't cancel job");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      [JobStatus.ACTIVE]: { color: "text-blue-600", icon: <SpinnerGap size={12} weight="bold" className="animate-spin" /> },
      [JobStatus.COMPLETED]: { color: "text-green-600", icon: <CheckCircle size={12} weight="fill" /> },
      [JobStatus.CANCELLED]: { color: "text-red-600", icon: <XCircle size={12} weight="fill" /> },
      [JobStatus.ESCALATED]: { color: "text-amber-600", icon: <WarningCircle size={12} weight="fill" /> },
    };

    const style = config[status] || { color: "text-black/30", icon: null };

    return (
      <div className={`flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider ${style.color}`}>
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

  const getStepProgress = (step: string, details?: string) => {
    const isErrand = isErrandDetails(details);
    if (isErrand) {
      const errandSteps: Record<string, number> = {
        [JobStep.FINISHED]: 100,
        [JobStep.STARTED]: 75,
        [JobStep.ARRIVED]: 50,
        [JobStep.ON_THE_WAY]: 35,
        [JobStep.MATERIALS_PURCHASED]: 20,
      };
      return errandSteps[step] || 10;
    }
    const steps: Record<string, number> = {
      [JobStep.HOME_SAFE]: 100,
      [JobStep.FINISHED]: 85,
      [JobStep.STARTED]: 71,
      [JobStep.ARRIVED]: 57,
      [JobStep.ON_THE_WAY]: 42,
      [JobStep.MATERIALS_PURCHASED]: 28,
    };
    return steps[step] || 14;
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminHeader
        title="Jobs"
        description="Track and manage all active and completed service jobs."
        action={
          <button
            onClick={() => fetchJobs()}
            className="flex items-center gap-2 bg-white border border-black/5 px-4 py-2.5 rounded-xl font-bold text-xs text-black/40 hover:bg-black/[0.02] transition-colors"
          >
            <ArrowClockwise size={14} weight="bold" className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white border border-black/5 rounded-xl p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/25" size={16} weight="bold" />
          <AdminInput
            placeholder="Search by job details, agent or client name..."
            className="pl-10 h-10 bg-black/[0.02] border-none rounded-xl text-xs"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-black/[0.02] rounded-xl">
          <Funnel size={14} weight="bold" className="text-black/25" />
          <select 
            className="bg-transparent text-xs font-bold text-black/40 outline-none cursor-pointer"
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

      {/* Jobs Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <AdminTable headers={["Job Details", "People", "Progress", "Value", "Status", "Updated", "Actions"]}>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <AdminTableRow key={i}>
                  <AdminTableCell colSpan={7}><div className="h-12 bg-black/[0.02] animate-pulse rounded-lg" /></AdminTableCell>
                </AdminTableRow>
              ))
            ) : jobs.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2">
                    <Briefcase size={40} weight="duotone" className="text-black/10" />
                    <p className="text-sm font-bold text-black/30">No jobs found</p>
                    <p className="text-xs text-black/20">Try adjusting your search or filters</p>
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
                  <AdminTableRow key={job.id} onClick={() => router.push(`/jobs/${job.id}`)}>
                    <AdminTableCell className="min-w-[260px]">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-primary line-clamp-1">
                          {stripErrandMeta(job.contract.details) || "Service details"}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] font-mono text-black/25">{job.id.slice(0, 13)}…</p>
                          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(job.id); toast.success("Copied"); }} className="text-black/20 hover:text-primary transition-colors">
                            <Copy size={10} weight="bold" />
                          </button>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="min-w-[200px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <AdminBadge variant="secondary" className="text-[8px] px-1.5">CLIENT</AdminBadge>
                          <p className="text-xs font-bold text-black/60">{job.contract.client.firstName} {job.contract.client.lastName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <AdminBadge variant="primary" className="text-[8px] px-1.5">AGENT</AdminBadge>
                          <p className="text-xs font-bold text-black/60">{job.contract.agent.firstName} {job.contract.agent.lastName}</p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-black/25 uppercase">
                            {getJobFlowLabel(job.contract?.details)} · {job.currentStep.replace(/_/g, ' ')}
                          </p>
                        <div className="w-20 h-1 bg-black/[0.04] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500" 
                              style={{ width: `${getStepProgress(job.currentStep, job.contract?.details)}%` }} 
                          />
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="min-w-[100px]">
                      <p className="text-sm font-black text-primary">{formatCurrency(displayTotal)}</p>
                    </AdminTableCell>
                    <AdminTableCell className="min-w-[130px]">
                      {getStatusBadge(job.status)}
                    </AdminTableCell>
                    <AdminTableCell className="min-w-[120px]">
                      <div>
                        <p className="text-xs font-bold text-black/40">{format(new Date(job.updatedAt), "MMM dd, yyyy")}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} weight="bold" className="text-black/15" />
                          <p className="text-[10px] text-black/20">{format(new Date(job.updatedAt), "HH:mm")}</p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/jobs/${job.id}`}>
                          <button className="p-2 hover:bg-black/[0.03] rounded-lg text-black/25 hover:text-primary transition-colors" title="View">
                            <Eye size={16} weight="bold" />
                          </button>
                        </Link>
                        
                        {job.status !== JobStatus.ESCALATED && job.status !== JobStatus.COMPLETED && job.status !== JobStatus.CANCELLED && (
                          <button 
                            onClick={() => setEscalateModal(job.id)}
                            disabled={processingId === job.id}
                            className="p-2 hover:bg-amber-50 rounded-lg text-black/25 hover:text-amber-600 transition-colors disabled:opacity-50"
                            title="Escalate"
                          >
                            <WarningCircle size={16} weight="bold" />
                          </button>
                        )}

                        {(job.status === JobStatus.ACTIVE || job.status === JobStatus.ESCALATED) && (
                          <button 
                            onClick={() => {
                              setCancelReason("");
                              setCancelAsInfraction(job.status === JobStatus.ESCALATED);
                              setCancelModal({
                                jobId: job.id,
                                details: stripErrandMeta(job.contract.details) || "Service details",
                              });
                            }}
                            disabled={processingId === job.id}
                            className="p-2 hover:bg-red-50 rounded-lg text-black/25 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Force Cancel"
                          >
                            <XCircle size={16} weight="bold" />
                          </button>
                        )}
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTable>
        </div>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Escalate Consent Modal */}
      <AdminConsentModal
        isOpen={!!escalateModal}
        onClose={() => setEscalateModal(null)}
        onConfirm={() => escalateModal && handleEscalate(escalateModal)}
        title="Escalate this job?"
        description="Both the client and agent will be notified. Some actions will be frozen until resolved."
        confirmLabel="Escalate"
        loading={!!processingId}
      />

      {/* Force Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCancelModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-4">
            <div>
              <p className="text-sm font-black text-primary">Cancel this job?</p>
              <p className="text-xs text-black/40 mt-1">This will reverse all payments and return funds to the client.</p>
            </div>
            
            <div className="bg-black/[0.02] p-3 rounded-xl">
              <p className="text-[10px] font-bold text-black/25 mb-1">JOB DETAILS</p>
              <p className="text-xs text-black/40 line-clamp-2 italic">&ldquo;{cancelModal.details}&rdquo;</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-black/25 mb-2">REASON *</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Why is this job being cancelled?"
                className="w-full border border-black/5 rounded-xl p-3 text-xs resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
              />
            </div>

            <label className="flex items-center gap-3 p-3 bg-red-50 rounded-xl cursor-pointer">
              <input 
                type="checkbox" 
                checked={cancelAsInfraction} 
                onChange={(e) => setCancelAsInfraction(e.target.checked)}
                className="w-4 h-4 accent-red-600"
              />
              <div>
                <p className="text-xs font-bold text-red-600">Count as agent infraction</p>
                <p className="text-[10px] text-black/30">Service fee returned to client. Counts as a strike.</p>
              </div>
            </label>

            <div className="flex gap-2 pt-1">
              <button 
                className="flex-1 px-4 py-2.5 bg-black/[0.03] rounded-xl text-xs font-bold text-black/40 hover:bg-black/[0.06] transition-colors"
                onClick={() => setCancelModal(null)}
              >
                Go Back
              </button>
              <button 
                className="flex-1 px-4 py-2.5 bg-red-600 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                onClick={handleForceCancel}
                disabled={!cancelReason.trim() || processingId === cancelModal.jobId}
              >
                {processingId === cancelModal.jobId ? "Cancelling..." : "Cancel Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
