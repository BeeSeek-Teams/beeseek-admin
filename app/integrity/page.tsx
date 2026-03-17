"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  ShieldAlert, 
  RefreshCcw, 
  ShieldCheck, 
  User as UserIcon,
  MessageSquare,
  Star,
  ExternalLink,
  Trash2,
  CheckCircle2,
  MoreHorizontal,
  Copy
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminPagination } from "@/components/AdminPagination";
import { toast } from "sonner";
import { format } from "date-fns";
import { getFlaggedReviews, toggleReviewFlag, Review, getFraudLogs, FraudLog } from "@/lib/reviews";
import { getAdminInfractions, Job } from "@/lib/jobs";
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
      toast.error(`Failed to fetch ${activeTab}`);
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
    if (!window.confirm("Mark this review as SAFE? It will be visible to users and count towards ratings.")) return;
    
    try {
      setProcessingId(id);
      await toggleReviewFlag(id, false);
      toast.success("Review restored and marked as safe");
      fetchData();
    } catch (error) {
      toast.error("Failed to update review status");
    } finally {
      setProcessingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            size={12} 
            className={cn(s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200")} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <AdminHeader
        title="Integrity Care"
        description="Monitor automated fraud detection flags and manage platform veracity."
        action={
          <AdminButton variant="outline" size="sm" className="gap-2" onClick={() => fetchData()}>
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </AdminButton>
        }
      />

      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => handleTabChange("reviews")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all",
            activeTab === "reviews" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Flagged Reviews
        </button>
        <button 
          onClick={() => handleTabChange("infractions")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all",
            activeTab === "infractions" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Cancellation Infractions
        </button>
        <button 
          onClick={() => handleTabChange("fraud-logs")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all",
            activeTab === "fraud-logs" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Fraud Audit Log
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-6 flex gap-4">
        <div className="p-3 bg-white rounded-2xl border border-amber-100 shadow-sm text-amber-500">
          <ShieldAlert size={24} />
        </div>
        <div>
          <AdminText variant="bold" className="text-amber-900">Fraud Detection Active</AdminText>
          <AdminText size="sm" className="text-amber-800">
            System is currently triangulating Hardware IDs, IP addresses, and BVN matches. 
            Flagged reviews are hidden from agent profiles and <strong>not counted</strong> in their average rating.
          </AdminText>
        </div>
      </div>

      <div className="bg-white border border-border/50 rounded-[32px] overflow-hidden shadow-sm overflow-x-auto min-w-full">
        <div className="min-w-[1200px]">
          {activeTab === "reviews" && (
            <AdminTable headers={["Reviewer", "Reviewee", "Details", "Flag Reason", "Score", "Actions"]}>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <AdminTableRow key={i}>
                    <AdminTableCell colSpan={6}><div className="h-16 bg-slate-50 animate-pulse rounded-xl" /></AdminTableCell>
                  </AdminTableRow>
                ))
              ) : reviews.length === 0 ? (
                <AdminTableRow>
                  <AdminTableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <ShieldCheck size={48} className="text-success" />
                      <AdminText variant="bold" color="secondary">No flagged reviews detected</AdminText>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ) : (
                reviews.map((review) => (
                  <AdminTableRow key={review.id}>
                    <AdminTableCell>
                      <div className="flex flex-col">
                        <AdminText size="sm" variant="bold">{review.reviewer.firstName} {review.reviewer.lastName}</AdminText>
                        <AdminText size="xs" color="secondary" className="uppercase tracking-tighter text-[10px] font-bold">{review.reviewerRole}</AdminText>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminText size="sm" variant="bold">{review.reviewee.firstName} {review.reviewee.lastName}</AdminText>
                    </AdminTableCell>
                    <AdminTableCell className="max-w-xs">
                      <div className="flex flex-col gap-1">
                        <AdminText size="xs" className="italic text-slate-500 line-clamp-2">"{review.comment || "No comment"}"</AdminText>
                        <Link href={`/jobs/${review.id}`} className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                          <ExternalLink size={10} />
                          Job: {review.jobId.slice(0, 8)}
                        </Link>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge variant="error" className="text-[10px] py-0.5">
                        {review.flagReason || "Fraud Suspected"}
                      </AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell>
                      {renderStars(review.rating)}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleResolve(review.id)}
                          disabled={processingId === review.id}
                          className={cn(
                            "p-2 hover:bg-success/10 rounded-lg text-slate-400 hover:text-success transition-colors",
                            processingId === review.id && "animate-pulse"
                          )}
                          title="Mark as safe"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTable>
          )}

          {activeTab === "infractions" && (
            <AdminTable headers={["Agent (Breach)", "Client", "Job Details", "Reason / Category", "Retention", "Date"]}>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <AdminTableRow key={i}>
                    <AdminTableCell colSpan={6}><div className="h-16 bg-slate-50 animate-pulse rounded-xl" /></AdminTableCell>
                  </AdminTableRow>
                ))
              ) : infractions.length === 0 ? (
                <AdminTableRow>
                  <AdminTableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <ShieldCheck size={48} className="text-success" />
                      <AdminText variant="bold" color="secondary">No cancellation infractions found</AdminText>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ) : (
                infractions.map((job) => (
                  <AdminTableRow key={job.id}>
                    <AdminTableCell>
                      <div className="flex flex-col">
                        <AdminText size="sm" variant="bold">{job.contract.agent.firstName} {job.contract.agent.lastName}</AdminText>
                        <AdminText size="xs" color="error" className="uppercase tracking-tighter text-[10px] font-bold">RETAINED FARE</AdminText>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminText size="sm" variant="bold">{job.contract.client.firstName} {job.contract.client.lastName}</AdminText>
                    </AdminTableCell>
                    <AdminTableCell className="max-w-xs">
                      <div className="flex flex-col gap-1">
                        <AdminText size="xs" className="line-clamp-1">{job.contract.details}</AdminText>
                        <Link href={`/jobs/${job.id}`} className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                          <ExternalLink size={10} />
                          Job: {job.id.slice(0, 8)}
                        </Link>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-col gap-1">
                        <AdminBadge variant="error" className="text-[10px] py-0.5 w-fit uppercase">
                          {job.cancellationAudit?.category?.replace(/_/g, " ") || "No Category"}
                        </AdminBadge>
                        <AdminText size="xs" className="italic text-slate-500 line-clamp-1">
                          "{job.cancellationAudit?.reason}"
                        </AdminText>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminText variant="bold" size="sm" color="error">
                        ₦{job.cancellationAudit?.agentRetention?.toLocaleString()}
                      </AdminText>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminText size="xs" color="secondary">
                        {format(new Date(job.cancellationAudit?.createdAt || job.createdAt), "MMM d, HH:mm")}
                      </AdminText>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTable>
          )}

          {activeTab === "fraud-logs" && (
            <AdminTable headers={["Attempted By", "Target", "Reason", "Action", "Attempted Rating", "Date"]}>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <AdminTableRow key={i}>
                    <AdminTableCell colSpan={6}><div className="h-16 bg-slate-50 animate-pulse rounded-xl" /></AdminTableCell>
                  </AdminTableRow>
                ))
              ) : fraudLogs.length === 0 ? (
                <AdminTableRow>
                  <AdminTableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <ShieldCheck size={48} className="text-success" />
                      <AdminText variant="bold" color="secondary">No fraud events logged</AdminText>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ) : (
                fraudLogs.map((log) => (
                  <AdminTableRow key={log.id}>
                    <AdminTableCell>
                      <div className="flex flex-col gap-0.5">
                        <AdminText size="sm" variant="bold">{log.attemptedBy.firstName} {log.attemptedBy.lastName}</AdminText>
                        <AdminText size="xs" color="secondary" className="uppercase tracking-tighter text-[10px] font-bold">{log.attemptedRole || "—"}</AdminText>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(log.attemptedById); toast.success("User ID copied"); }}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-primary transition-colors w-fit mt-0.5"
                          title={log.attemptedById}
                        >
                          <Copy size={9} />
                          <span className="font-mono">{log.attemptedById.slice(0, 8)}</span>
                        </button>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-col gap-0.5">
                        <AdminText size="sm" variant="bold">{log.targetUser.firstName} {log.targetUser.lastName}</AdminText>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(log.targetUserId); toast.success("User ID copied"); }}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-primary transition-colors w-fit mt-0.5"
                          title={log.targetUserId}
                        >
                          <Copy size={9} />
                          <span className="font-mono">{log.targetUserId.slice(0, 8)}</span>
                        </button>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="max-w-xs">
                      <div className="flex flex-col gap-1">
                        <AdminBadge variant="error" className="text-[10px] py-0.5">
                          {log.reason}
                        </AdminBadge>
                        {log.attemptedComment && (
                          <AdminText size="xs" className="italic text-slate-500 line-clamp-2">"{log.attemptedComment}"</AdminText>
                        )}
                        {log.jobId && (
                          <Link href={`/jobs/${log.jobId}`} className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                            <ExternalLink size={10} />
                            Job: {log.jobId.slice(0, 8)}
                          </Link>
                        )}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge 
                        variant={log.action === "BLOCKED" ? "error" : "warning"} 
                        className="text-[10px] py-0.5 uppercase"
                      >
                        {log.action}
                      </AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell>
                      {log.attemptedRating ? renderStars(log.attemptedRating) : (
                        <AdminText size="xs" color="secondary">—</AdminText>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminText size="xs" color="secondary">
                        {format(new Date(log.createdAt), "MMM d, HH:mm")}
                      </AdminText>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTable>
          )}
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
