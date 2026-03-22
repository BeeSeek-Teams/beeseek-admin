"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Siren,
  RefreshCcw,
  MapPin,
  Phone,
  Battery,
  CheckCircle2,
  Clock,
  ExternalLink,
  User as UserIcon,
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
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
      toast.error("Failed to fetch SOS alerts");
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

  return (
    <div className="space-y-8">
      <AdminHeader
        icon={Siren}
        title="SOS Alerts"
        subtitle="Emergency alerts triggered by users during active jobs"
      />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {(["ALL", "SENT", "RESOLVED"] as StatusFilter[]).map((f) => (
          <AdminButton
            key={f}
            variant={statusFilter === f ? "primary" : "ghost"}
            size="sm"
            onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
          >
            {f === "ALL" ? "All" : f === "SENT" ? "Active" : "Resolved"}
          </AdminButton>
        ))}
        <div className="ml-auto">
          <AdminButton variant="ghost" size="sm" onClick={() => fetchAlerts()} icon={RefreshCcw}>
            Refresh
          </AdminButton>
        </div>
      </div>

      {/* Table */}
      <AdminTable headers={["User", "Location", "Contact", "Battery", "Status", "When", "Actions"]}>
        {loading ? (
          <AdminTableRow>
            <AdminTableCell colSpan={7}>
              <div className="flex justify-center py-12">
                <RefreshCcw className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            </AdminTableCell>
          </AdminTableRow>
        ) : alerts.length === 0 ? (
          <AdminTableRow>
            <AdminTableCell colSpan={7}>
              <div className="text-center py-12">
                <Siren className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <AdminText color="secondary">No SOS alerts found</AdminText>
              </div>
            </AdminTableCell>
          </AdminTableRow>
        ) : (
          alerts.map((alert) => (
            <AdminTableRow key={alert.id}>
              {/* User */}
              <AdminTableCell>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <AdminText variant="bold" size="sm">{alert.userName}</AdminText>
                    <AdminText size="xs" color="secondary">
                      {alert.userRole} · {alert.userPhone || "No phone"}
                    </AdminText>
                  </div>
                </div>
              </AdminTableCell>

              {/* Location */}
              <AdminTableCell>
                <div className="max-w-[200px]">
                  <AdminText size="xs" color="secondary" className="truncate block">
                    {alert.address || "Unknown"}
                  </AdminText>
                  <a
                    href={`https://www.google.com/maps?q=${alert.lat},${alert.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                  >
                    <MapPin className="w-3 h-3" /> View Map <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </AdminTableCell>

              {/* Contact */}
              <AdminTableCell>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <AdminText size="sm">{alert.contactName || "—"}</AdminText>
                    <AdminText size="xs" color="secondary">{alert.contactPhone || "—"}</AdminText>
                  </div>
                </div>
              </AdminTableCell>

              {/* Battery */}
              <AdminTableCell>
                <div className="flex items-center gap-1.5">
                  <Battery className={`w-4 h-4 ${alert.batteryLevel <= 20 ? "text-red-500" : "text-green-500"}`} />
                  <AdminText size="sm">{alert.batteryLevel}%</AdminText>
                </div>
              </AdminTableCell>

              {/* Status */}
              <AdminTableCell>
                <AdminBadge variant={statusColor(alert.status) as any}>
                  {alert.status}
                </AdminBadge>
                {alert.resolvedByName && (
                  <AdminText size="xs" color="secondary" className="mt-1">
                    by {alert.resolvedByName}
                  </AdminText>
                )}
              </AdminTableCell>

              {/* When */}
              <AdminTableCell>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <AdminText size="xs">
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </AdminText>
                    <AdminText size="xs" color="secondary">
                      {format(new Date(alert.createdAt), "dd MMM yyyy, HH:mm")}
                    </AdminText>
                  </div>
                </div>
              </AdminTableCell>

              {/* Actions */}
              <AdminTableCell>
                {alert.status === "SENT" ? (
                  noteModalId === alert.id ? (
                    <div className="flex flex-col gap-2 min-w-[180px]">
                      <input
                        type="text"
                        placeholder="Admin note (optional)"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        className="text-xs border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <AdminButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleResolve(alert.id)}
                          loading={resolvingId === alert.id}
                          icon={CheckCircle2}
                        >
                          Confirm
                        </AdminButton>
                        <AdminButton
                          size="sm"
                          variant="ghost"
                          onClick={() => { setNoteModalId(null); setNoteInput(""); }}
                        >
                          Cancel
                        </AdminButton>
                      </div>
                    </div>
                  ) : (
                    <AdminButton
                      size="sm"
                      variant="primary"
                      onClick={() => setNoteModalId(alert.id)}
                      icon={CheckCircle2}
                    >
                      Resolve
                    </AdminButton>
                  )
                ) : (
                  <AdminText size="xs" color="secondary">
                    {alert.adminNote || "—"}
                  </AdminText>
                )}
              </AdminTableCell>
            </AdminTableRow>
          ))
        )}
      </AdminTable>

      {total > itemsPerPage && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={Math.ceil(total / itemsPerPage)}
          onPageChange={(page) => { setCurrentPage(page); fetchAlerts(page); }}
        />
      )}
    </div>
  );
}
