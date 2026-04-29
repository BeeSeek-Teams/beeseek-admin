"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  ShieldWarning, 
  ArrowClockwise, 
  ShieldCheck, 
  Star,
  Copy,
  CheckCircle,
  Eye
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminPagination } from "@/components/AdminPagination";
import { AdminConsentModal } from "@/components/AdminConsentModal";
import { toast } from "sonner";
import { format } from "date-fns";
import { getFlaggedReviews, toggleReviewFlag, Review, getFraudLogs, FraudLog } from "@/lib/reviews";
import { getAdminInfractions, getAgentInfractionCount, Job, getJobFlowLabel } from "@/lib/jobs";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "reviews" | "infractions" | "fraud-logs";

export default function IntegrityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [infractions, setInfractions] = useState<Job[]>([]);
  const [fraudLogs, setFraudLogs] = useState<FraudLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [infractionCounts, setInfractionCounts] = useState<Record<string, number>>({});
  const [resolveModal, setResolveModal] = useState<string | null>(null);
  const itemsPerPage = 10;

  const fetchData = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      if (activeTab === "reviews") {
        const data = await getFlaggedReviews({ page, limit: itemsPerPage });
        setReviews(data.items);
        setTotal(data.meta.total);
      } else if (activeTab === "infractions") {
        const data = await getAdminInfractions({ page, limit: itemsPerPage });
        setInfractions(data.items);
        setTotal(data.meta.total);
      } else {
        const data = await getFraudLogs({ page, limit: itemsPerPage });
        setFraudLogs(data.items);
        setTotal(data.meta.total);
      }
    } catch (error) {
      toast.error(`Couldn't load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleResolve = async (id: string) => {
    try {
      setProcessingId(id);
      await toggleReviewFlag(id, false);
      toast.success("Review marked as safe");
      fetchData();
    } catch (error) {
      toast.error("Couldn't update review");
    } finally {
      setProcessingId(null);
      setResolveModal(null);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star 
          key={s} 
          size={12} 
          weight={s <= rating ? "fill" : "regular"}
          className={cn(s <= rating ? "text-amber-400" : "text-black/10")} 
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminConsentModal
        isOpen={!!resolveModal}
        onClose={() => setResolveModal(null)}
        onConfirm={() => resolveModal && handleResolve(resolveModal)}
        title="Mark this review as safe?"
        description="The review will become visible on the agent's profile and count towards their average rating."
        confirmLabel="Mark as Safe"
        variant="primary"
        loading={!!processingId}
      />

      <AdminHeader
        title="Integrity"
        description="Flagged reviews, cancellation infractions, and fraud detection logs."
        action={
          <button onClick={() => fetchData()} className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors">
            <ArrowClockwise size={16} weight="bold" className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      <div className="flex gap-1.5 bg-black/[0.04] p-1.5 rounded-xl w-fit">
        {([
          { key: "reviews" as Tab, label: "Flagged Reviews" },
          { key: "infractions" as Tab, label: "Infractions" },
          { key: "fraud-logs" as Tab, label: "Fraud Log" },
        ]).map((tab) => (
          <button 
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === tab.key ? "bg-white shadow-sm text-primary" : "text-black/30 hover:text-black/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
          <ShieldWarning size={18} weight="fill" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-900">Fraud detection is active</p>
          <p className="text-[10px] text-amber-700/60 mt-0.5">
            Flagged reviews are hidden from profiles and <strong>not counted</strong> in average ratings.
          </p>
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl overflow-hidden overflow-x-auto">
        <div className="min-w-[1000px]">
          {activeTab === "reviews" && (
            <AdminTable headers={["Reviewer", "Reviewee", "Details", "Flag Reason", "Score", "Actions"]}>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <AdminTableRow key={i}>
                    <AdminTableCell colSpan={6}><div className="h-14 bg-black/[0.02] animate-pulse rounded-lg" /></AdminTableCell>
                  </AdminTableRow>
                ))
              ) : reviews.length === 0 ? (
                <AdminTableRow>
                  <AdminTableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldCheck size={40} weight="duotone" className="text-black/10" />
                      <p className="text-sm font-bold text-black/30">No flagged reviews</p>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ) : (
                reviews.map((review) => (
                  <AdminTableRow key={review.id}>
                    <AdminTableCell>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold">{review.reviewer.firstName} {review.reviewer.lastName}</p>
                        <p className="text-[10px] font-bold text-black/25 uppercase">{review.reviewerRole}</p>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <p className="text-sm font-bold">{review.reviewee.firstName} {review.reviewee.lastName}</p>
                    </AdminTableCell>
                    <AdminTableCell className="max-w-xs">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs italic text-black/40 line-clamp-2">"{review.comment || "No comment"}"</p>
                        <Link href={`/jobs/${review.jobId}`} className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                          <Eye size={10} weight="bold" />
                          Job: {review.jobId.slice(0, 8)}
                        </Link>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge variant="error">
                        {review.flagReason || "Fraud Suspected"}
                      </AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell>
                      {renderStars(review.rating)}
                    </AdminTableCell>
                    <AdminTableCell>
                      <button 
                        onClick={() => setResolveModal(review.id)}
                        disabled={processingId === review.id}
                        className={cn(
                          "p-2 hover:bg-green-50 rounded-lg text-black/20 hover:text-success transition-colors",
                          processingId === review.id && "animate-pulse"
                        )}
                        title="Mark as safe"
                      >
                        <CheckCircle size={18} weight="bold" />
                      </button>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTable>
          )}

          {activeTab === "infractions" && (
            <AdminTable headers={["Agent", "Strikes", "Job Details", "Reason", "Refunded", "Date"]}>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <AdminTableRow key={i}>
                    <AdminTableCell colSpan={6}><div className="h-14 bg-black/[0.02] animate-pulse rounded-lg" /></AdminTableCell>
                  </AdminTableRow>
                ))
              ) : infractions.length === 0 ? (
                <AdminTableRow>
                  <AdminTableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldCheck size={40} weight="duotone" className="text-black/10" />
                      <p className="text-sm font-bold text-black/30">No infractions found</p>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ) : (
                infractions.map((job) => {
                  const agentId = job.contract?.agent?.id;
                  const count = agentId ? infractionCounts[agentId] : undefined;

                  if (agentId && count === undefined && !infractionCounts.hasOwnProperty(agentId)) {
                    setInfractionCounts(prev => ({ ...prev, [agentId]: -1 }));
                    getAgentInfractionCount(agentId)
                      .then(data => setInfractionCounts(prev => ({ ...prev, [agentId]: data.infractionCount })))
                      .catch(() => setInfractionCounts(prev => ({ ...prev, [agentId]: 0 })));
                  }

                  const strikes = count && count > 0 ? count : null;
                  const severityVariant = strikes && strikes >= 5 ? "error" : strikes && strikes >= 3 ? "warning" : "secondary";

                  return (
                    <AdminTableRow key={job.id}>
                      <AdminTableCell>
                        <div className="flex flex-col">
                          <p className="text-sm font-bold">{job.contract.agent.firstName} {job.contract.agent.lastName}</p>
                          <p className="text-[10px] font-bold text-error uppercase">Cancelled</p>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        {strikes ? (
                          <div className="flex flex-col items-start gap-1">
                            <AdminBadge variant={severityVariant as any}>
                              {strikes} {strikes === 1 ? 'Strike' : 'Strikes'}
                            </AdminBadge>
                            {strikes >= 3 && strikes < 5 && (
                              <p className="text-[10px] font-bold text-amber-600">Wallet freeze zone</p>
                            )}
                            {strikes >= 5 && (
                              <p className="text-[10px] font-bold text-red-600">Suspension risk</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-black/20">{count === -1 ? '...' : '—'}</p>
                        )}
                      </AdminTableCell>
                      <AdminTableCell className="max-w-xs">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-black/60 line-clamp-1">{job.contract.details}</p>
                          <div className="flex items-center gap-2">
                            <Link href={`/jobs/${job.id}`} className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                              <Eye size={10} weight="bold" />
                              {job.id.slice(0, 8)}
                            </Link>
                            <AdminBadge variant="secondary">
                              {getJobFlowLabel(job.contract?.details)}
                            </AdminBadge>
                            <span className="text-black/10">•</span>
                            <p className="text-[10px] text-black/30">{job.contract.client.firstName} {job.contract.client.lastName}</p>
                          </div>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <div className="flex flex-col gap-1">
                          <AdminBadge variant="error">
                            {job.cancellationAudit?.category?.replace(/_/g, " ") || "No Category"}
                          </AdminBadge>
                          <p className="text-[10px] italic text-black/30 line-clamp-1">
                            "{job.cancellationAudit?.reason}"
                          </p>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-bold text-error">
                            ₦{((job.cancellationAudit?.refundedAmount || 0) / 100).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-black/30">Refunded to client</p>
                          {(job.cancellationAudit?.agentRetention || 0) > 0 && (
                            <p className="text-[10px] text-amber-600">
                              Agent kept ₦{((job.cancellationAudit?.agentRetention || 0) / 100).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <p className="text-xs text-black/30">
                          {format(new Date(job.cancellationAudit?.createdAt || job.createdAt), "MMM d, HH:mm")}
                        </p>
                      </AdminTableCell>
                    </AdminTableRow>
                  );
                })
              )}
            </AdminTable>
          )}

          {activeTab === "fraud-logs" && (
            <AdminTable headers={["Attempted By", "Target", "Reason", "Action", "Rating", "Date"]}>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <AdminTableRow key={i}>
                    <AdminTableCell colSpan={6}><div className="h-14 bg-black/[0.02] animate-pulse rounded-lg" /></AdminTableCell>
                  </AdminTableRow>
                ))
              ) : fraudLogs.length === 0 ? (
                <AdminTableRow>
                  <AdminTableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldCheck size={40} weight="duotone" className="text-black/10" />
                      <p className="text-sm font-bold text-black/30">No fraud events logged</p>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ) : (
                fraudLogs.map((log) => (
                  <AdminTableRow key={log.id}>
                    <AdminTableCell>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold">{log.attemptedBy.firstName} {log.attemptedBy.lastName}</p>
                        <p className="text-[10px] font-bold text-black/25 uppercase">{log.attemptedRole || "—"}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(log.attemptedById); toast.success("Copied"); }}
                          className="flex items-center gap-1 text-[10px] text-black/20 hover:text-primary transition-colors w-fit mt-0.5"
                          title={log.attemptedById}
                        >
                          <Copy size={9} weight="bold" />
                          <span className="font-mono">{log.attemptedById.slice(0, 8)}</span>
                        </button>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold">{log.targetUser.firstName} {log.targetUser.lastName}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(log.targetUserId); toast.success("Copied"); }}
                          className="flex items-center gap-1 text-[10px] text-black/20 hover:text-primary transition-colors w-fit mt-0.5"
                          title={log.targetUserId}
                        >
                          <Copy size={9} weight="bold" />
                          <span className="font-mono">{log.targetUserId.slice(0, 8)}</span>
                        </button>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="max-w-xs">
                      <div className="flex flex-col gap-1">
                        <AdminBadge variant="error">
                          {log.reason}
                        </AdminBadge>
                        {log.attemptedComment && (
                          <p className="text-[10px] italic text-black/30 line-clamp-2">"{log.attemptedComment}"</p>
                        )}
                        {log.jobId && (
                          <Link href={`/jobs/${log.jobId}`} className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                            <Eye size={10} weight="bold" />
                            Job: {log.jobId.slice(0, 8)}
                          </Link>
                        )}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge 
                        variant={log.action === "BLOCKED" ? "error" : "warning"} 
                      >
                        {log.action}
                      </AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell>
                      {log.attemptedRating ? renderStars(log.attemptedRating) : (
                        <p className="text-xs text-black/20">—</p>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                      <p className="text-xs text-black/30">
                        {format(new Date(log.createdAt), "MMM d, HH:mm")}
                      </p>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTable>
          )}
        </div>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
