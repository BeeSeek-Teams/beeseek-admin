"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UserMinus,
  EnvelopeSimple,
  Trash,
  XCircle,
  SpinnerGap,
  ArrowClockwise,
  Clock,
  CheckCircle,
  Warning,
  Eye,
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge, AdminBadgeVariant } from "@/components/AdminBadge";
import { AdminPagination } from "@/components/AdminPagination";
import { AdminConsentModal } from "@/components/AdminConsentModal";
import {
  getDeletionRequests,
  sendConfirmationEmail,
  initiateDeletion,
  rejectDeletionRequest,
  DeletionRequest,
} from "@/lib/deletion-requests";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; variant: AdminBadgeVariant; icon: React.ElementType }> = {
  PENDING: { label: "Pending", variant: "warning", icon: Clock },
  CONFIRMATION_SENT: { label: "Email Sent", variant: "info", icon: EnvelopeSimple },
  CONFIRMED: { label: "Confirmed", variant: "primary", icon: CheckCircle },
  PROCESSING: { label: "Processing", variant: "info", icon: SpinnerGap },
  COMPLETED: { label: "Completed", variant: "success", icon: CheckCircle },
  REJECTED: { label: "Rejected", variant: "error", icon: XCircle },
};

const statusFilters = ["ALL", "PENDING", "CONFIRMATION_SENT", "CONFIRMED", "COMPLETED", "REJECTED"];

export default function DeletionRequestsPage() {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal states
  const [actionModal, setActionModal] = useState<{
    type: "confirm" | "delete" | "reject";
    request: DeletionRequest;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailRequest, setDetailRequest] = useState<DeletionRequest | null>(null);

  const fetchRequests = useCallback(
    async (status = statusFilter, page = currentPage) => {
      try {
        setLoading(true);
        const params: Record<string, any> = {
          take: itemsPerPage,
          skip: (page - 1) * itemsPerPage,
        };
        if (status !== "ALL") params.status = status;

        const data = await getDeletionRequests(params);
        setRequests(data.items);
        setTotal(data.total);
      } catch {
        toast.error("Couldn't load deletion requests");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, currentPage]
  );

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchRequests(status, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRequests(statusFilter, page);
  };

  const handleSendConfirmation = async () => {
    if (!actionModal || actionModal.type !== "confirm") return;
    setActionLoading(true);
    try {
      await sendConfirmationEmail(actionModal.request.id);
      toast.success("Confirmation email sent successfully");
      setActionModal(null);
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send confirmation email");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInitiateDeletion = async () => {
    if (!actionModal || actionModal.type !== "delete") return;
    setActionLoading(true);
    try {
      const result = await initiateDeletion(actionModal.request.id);
      toast.success(result.message || "Deletion initiated");
      setActionModal(null);
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to initiate deletion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!actionModal || actionModal.type !== "reject") return;
    setActionLoading(true);
    try {
      await rejectDeletionRequest(actionModal.request.id);
      toast.success("Request rejected");
      setActionModal(null);
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  const getModalProps = () => {
    if (!actionModal) return null;
    switch (actionModal.type) {
      case "confirm":
        return {
          title: "Send Confirmation Email",
          description: `Send a confirmation email to ${actionModal.request.email} asking them to confirm their account deletion request.`,
          confirmLabel: "Send Email",
          variant: "primary" as const,
          onConfirm: handleSendConfirmation,
        };
      case "delete":
        return {
          title: "Initiate Account Deletion",
          description: `This will deactivate the account for ${actionModal.request.email}. Their personal data will be permanently scrubbed after 30 days. This cannot be undone.`,
          confirmLabel: "Initiate Deletion",
          variant: "danger" as const,
          onConfirm: handleInitiateDeletion,
        };
      case "reject":
        return {
          title: "Reject Request",
          description: `Reject the deletion request from ${actionModal.request.email}. The request will be marked as rejected.`,
          confirmLabel: "Reject",
          variant: "warning" as const,
          onConfirm: handleReject,
        };
      default:
        return null;
    }
  };

  const modalProps = getModalProps();

  return (
    <>
      <AdminHeader
        title="Deletion Requests"
        description="Manage user account deletion requests"
        actions={
          <button
            onClick={() => fetchRequests()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 text-black/40 hover:text-primary hover:bg-primary/10 text-xs font-bold transition-all"
          >
            <ArrowClockwise size={14} weight="bold" />
            Refresh
          </button>
        }
      />

      {/* Status filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {statusFilters.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusFilter(status)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
              statusFilter === status
                ? "bg-primary text-white shadow-lg shadow-primary/15"
                : "bg-white text-black/40 hover:bg-black/5 border border-black/5"
            )}
          >
            {status === "ALL" ? "All" : statusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-black/5">
          <SpinnerGap size={24} weight="bold" className="animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-black/5">
          <UserMinus size={40} weight="duotone" className="text-black/10 mb-3" />
          <p className="text-sm font-bold text-black/25">No deletion requests found</p>
          <p className="text-[11px] text-black/15 mt-1">Requests will appear here when users submit them</p>
        </div>
      ) : (
        <>
          <AdminTable headers={["User", "Email", "Status", "Submitted", "Actions"]}>
            {requests.map((req) => {
              const config = statusConfig[req.status] || statusConfig.PENDING;
              const StatusIcon = config.icon;
              return (
                <AdminTableRow key={req.id}>
                  <AdminTableCell>
                    <div>
                      <p className="text-xs font-bold text-primary">{req.fullName}</p>
                      {req.reason && (
                        <p className="text-[10px] text-black/30 mt-0.5 truncate max-w-[200px]">
                          {req.reason}
                        </p>
                      )}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <p className="text-xs text-black/50 font-medium">{req.email}</p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge variant={config.variant}>
                      <span className="flex items-center gap-1">
                        <StatusIcon size={12} weight="bold" />
                        {config.label}
                      </span>
                    </AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div>
                      <p className="text-[11px] text-black/40 font-medium">
                        {format(new Date(req.createdAt), "MMM d, yyyy")}
                      </p>
                      <p className="text-[10px] text-black/20">
                        {format(new Date(req.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-1.5">
                      {/* View detail */}
                      <button
                        onClick={() => setDetailRequest(req)}
                        className="p-2 rounded-lg bg-black/[0.03] text-black/30 hover:text-primary hover:bg-primary/10 transition-all"
                        title="View details"
                      >
                        <Eye size={14} weight="bold" />
                      </button>

                      {/* Send confirmation email (only for PENDING) */}
                      {req.status === "PENDING" && (
                        <button
                          onClick={() => setActionModal({ type: "confirm", request: req })}
                          className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"
                          title="Send confirmation email"
                        >
                          <EnvelopeSimple size={14} weight="bold" />
                        </button>
                      )}

                      {/* Initiate deletion (for CONFIRMATION_SENT or CONFIRMED) */}
                      {(req.status === "CONFIRMATION_SENT" || req.status === "CONFIRMED") && (
                        <button
                          onClick={() => setActionModal({ type: "delete", request: req })}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                          title="Initiate deletion"
                        >
                          <Trash size={14} weight="bold" />
                        </button>
                      )}

                      {/* Reject (for any non-completed status) */}
                      {req.status !== "COMPLETED" && req.status !== "REJECTED" && (
                        <button
                          onClick={() => setActionModal({ type: "reject", request: req })}
                          className="p-2 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 transition-all"
                          title="Reject request"
                        >
                          <XCircle size={14} weight="bold" />
                        </button>
                      )}
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}
          </AdminTable>

          <AdminPagination
            currentPage={currentPage}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Action confirmation modal */}
      {modalProps && (
        <AdminConsentModal
          isOpen={!!actionModal}
          onClose={() => setActionModal(null)}
          onConfirm={modalProps.onConfirm}
          title={modalProps.title}
          description={modalProps.description}
          confirmLabel={modalProps.confirmLabel}
          variant={modalProps.variant}
          loading={actionLoading}
        />
      )}

      {/* Detail side panel */}
      {detailRequest && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex justify-end"
          onClick={() => setDetailRequest(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-black text-primary">Request Details</h2>
                <p className="text-[10px] text-black/25 font-bold mt-0.5">ID: {detailRequest.id.slice(0, 8)}</p>
              </div>
              <button
                onClick={() => setDetailRequest(null)}
                className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black/30 hover:text-black/60 transition-colors"
              >
                <XCircle size={16} weight="bold" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <DetailRow label="Full Name" value={detailRequest.fullName} />
                <DetailRow label="Email" value={detailRequest.email} />
                <DetailRow
                  label="Status"
                  value={
                    <AdminBadge variant={statusConfig[detailRequest.status]?.variant || "secondary"}>
                      {statusConfig[detailRequest.status]?.label || detailRequest.status}
                    </AdminBadge>
                  }
                />
                <DetailRow
                  label="Submitted"
                  value={format(new Date(detailRequest.createdAt), "MMM d, yyyy 'at' h:mm a")}
                />
                {detailRequest.reason && <DetailRow label="Reason" value={detailRequest.reason} />}
                {detailRequest.confirmationSentAt && (
                  <DetailRow
                    label="Confirmation Sent"
                    value={format(new Date(detailRequest.confirmationSentAt), "MMM d, yyyy 'at' h:mm a")}
                  />
                )}
                {detailRequest.completedAt && (
                  <DetailRow
                    label="Completed"
                    value={format(new Date(detailRequest.completedAt), "MMM d, yyyy 'at' h:mm a")}
                  />
                )}
                {detailRequest.processedBy && (
                  <DetailRow label="Processed By" value={detailRequest.processedBy.slice(0, 8)} />
                )}
                {detailRequest.adminNotes && (
                  <DetailRow label="Admin Notes" value={detailRequest.adminNotes} />
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-black/5">
                {detailRequest.status === "PENDING" && (
                  <button
                    onClick={() => {
                      setDetailRequest(null);
                      setActionModal({ type: "confirm", request: detailRequest });
                    }}
                    className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <EnvelopeSimple size={16} weight="bold" />
                    Send Confirmation Email
                  </button>
                )}
                {(detailRequest.status === "CONFIRMATION_SENT" || detailRequest.status === "CONFIRMED") && (
                  <button
                    onClick={() => {
                      setDetailRequest(null);
                      setActionModal({ type: "delete", request: detailRequest });
                    }}
                    className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash size={16} weight="bold" />
                    Initiate Deletion
                  </button>
                )}
                {detailRequest.status !== "COMPLETED" && detailRequest.status !== "REJECTED" && (
                  <button
                    onClick={() => {
                      setDetailRequest(null);
                      setActionModal({ type: "reject", request: detailRequest });
                    }}
                    className="w-full py-3 rounded-xl bg-black/5 hover:bg-amber-50 text-black/40 hover:text-amber-600 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle size={16} weight="bold" />
                    Reject Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-black/25 uppercase tracking-wider mb-1">{label}</p>
      {typeof value === "string" ? (
        <p className="text-sm text-primary font-medium">{value}</p>
      ) : (
        value
      )}
    </div>
  );
}
