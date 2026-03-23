"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Siren,
  ArrowClockwise,
  MapPin,
  Phone,
  BatteryFull,
  BatteryLow,
  CheckCircle,
  Clock,
  ArrowSquareOut,
  User,
  SpinnerGap
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminPagination } from "@/components/AdminPagination";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import api from "@/lib/api";

interface SosAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string | null;
  userRole: string | null;
  lat: number;
  lng: number;
  address: string;
  batteryLevel: number;
  contactPhone: string | null;
  contactName: string | null;
  status: "SENT" | "CANCELLED" | "RESOLVED";
  channel: string;
  adminNote: string | null;
  resolvedById: string | null;
  resolvedByName: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

type StatusFilter = "ALL" | "SENT" | "RESOLVED";

export default function SosPage() {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [noteModalId, setNoteModalId] = useState<string | null>(null);
  const itemsPerPage = 15;

  const fetchAlerts = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: itemsPerPage };
      if (statusFilter !== "ALL") params.status = statusFilter;

      const { data } = await api.get("/admin/sos", { params });
      setAlerts(data.items);
      setTotal(data.total);
    } catch {
      toast.error("Couldn't load SOS alerts");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleResolve = async (id: string) => {
    try {
      setResolvingId(id);
      await api.post(`/admin/sos/${id}/resolve`, { note: noteInput || undefined });
      toast.success("SOS alert resolved");
      setNoteModalId(null);
      setNoteInput("");
      fetchAlerts();
    } catch {
      toast.error("Failed to resolve SOS alert");
    } finally {
      setResolvingId(null);
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "SENT": return "warning";
      case "RESOLVED": return "success";
      case "CANCELLED": return "secondary";
      default: return "default";
    }
  };

  const filters: StatusFilter[] = ["ALL", "SENT", "RESOLVED"];

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <AdminHeader
        title="SOS Alerts"
        description="Emergency alerts triggered by users during active jobs."
      />

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === f
                ? "bg-primary text-white"
                : "bg-white border border-black/5 text-black/40 hover:bg-black/[0.02]"
            }`}
          >
            {f === "ALL" ? "All" : f === "SENT" ? "Active" : "Resolved"}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={() => fetchAlerts()}
            disabled={loading}
            className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
          >
            <ArrowClockwise size={16} weight="bold" className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/5 rounded-2xl overflow-hidden overflow-x-auto">
        <div className="min-w-[950px]">
          <AdminTable headers={["User", "Location", "Emergency Contact", "Battery", "Status", "When", "Actions"]}>
            {loading ? (
              <AdminTableRow>
                <AdminTableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <SpinnerGap size={24} weight="bold" className="animate-spin text-primary/30" />
                    <p className="text-sm text-black/25">Loading alerts...</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : alerts.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Siren size={32} weight="duotone" className="text-black/10" />
                    <p className="text-sm font-bold text-black/25">No SOS alerts found</p>
                    <p className="text-xs text-black/15">All clear for now.</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              alerts.map((alert) => (
                <AdminTableRow key={alert.id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-black/[0.03] border border-black/5 flex items-center justify-center">
                        <User size={14} weight="bold" className="text-black/20" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{alert.userName}</p>
                        <p className="text-[10px] text-black/20">{alert.userRole} · {alert.userPhone || "No phone"}</p>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="max-w-[200px]">
                      <p className="text-xs text-black/30 truncate">{alert.address || "Unknown"}</p>
                      <a
                        href={`https://www.google.com/maps?q=${alert.lat},${alert.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-primary font-bold hover:underline mt-0.5"
                      >
                        <MapPin size={10} weight="fill" /> View on Map <ArrowSquareOut size={10} weight="bold" />
                      </a>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} weight="fill" className="text-black/15" />
                      <div>
                        <p className="text-xs font-bold">{alert.contactName || "—"}</p>
                        <p className="text-[10px] text-black/20">{alert.contactPhone || "—"}</p>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-1.5">
                      {alert.batteryLevel <= 20 ? (
                        <BatteryLow size={16} weight="fill" className="text-error" />
                      ) : (
                        <BatteryFull size={16} weight="fill" className="text-success" />
                      )}
                      <span className="text-xs font-bold">{alert.batteryLevel}%</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge variant={statusColor(alert.status) as any}>
                      {alert.status}
                    </AdminBadge>
                    {alert.resolvedByName && (
                      <p className="text-[10px] text-black/20 mt-0.5">by {alert.resolvedByName}</p>
                    )}
                  </AdminTableCell>
                  <AdminTableCell>
                    <div>
                      <p className="text-xs font-bold">{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</p>
                      <p className="text-[10px] text-black/20">{format(new Date(alert.createdAt), "dd MMM yyyy, HH:mm")}</p>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    {alert.status === "SENT" ? (
                      noteModalId === alert.id ? (
                        <div className="flex flex-col gap-2 min-w-[180px]">
                          <input
                            type="text"
                            placeholder="Admin note (optional)"
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            className="text-xs border border-black/5 rounded-lg px-3 py-1.5 bg-black/[0.02] focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResolve(alert.id)}
                              disabled={resolvingId === alert.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {resolvingId === alert.id ? (
                                <SpinnerGap size={12} weight="bold" className="animate-spin" />
                              ) : (
                                <CheckCircle size={12} weight="bold" />
                              )}
                              Confirm
                            </button>
                            <button
                              onClick={() => { setNoteModalId(null); setNoteInput(""); }}
                              className="px-3 py-1.5 text-xs font-bold text-black/30 hover:bg-black/[0.02] rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setNoteModalId(alert.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                          <CheckCircle size={12} weight="bold" />
                          Resolve
                        </button>
                      )
                    ) : (
                      <p className="text-xs text-black/20">{alert.adminNote || "—"}</p>
                    )}
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTable>
        </div>

        {total > itemsPerPage && (
          <AdminPagination
            currentPage={currentPage}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => { setCurrentPage(page); fetchAlerts(page); }}
          />
        )}
      </div>
    </div>
  );
}
