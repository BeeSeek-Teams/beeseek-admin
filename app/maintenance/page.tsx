"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wrench,
  RefreshCcw,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Pencil,
  Server,
  Calendar,
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminInput } from "@/components/AdminInput";
import { AdminConsentModal } from "@/components/AdminConsentModal";
import { toast } from "sonner";
import { format } from "date-fns";
import api from "@/lib/api";

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  scheduledStart: string;
  scheduledEnd: string;
  affectedServices: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = ["Scheduled", "In Progress", "Completed", "Cancelled"] as const;

export default function MaintenancePage() {
  const [windows, setWindows] = useState<MaintenanceWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWindow, setEditingWindow] = useState<MaintenanceWindow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [affectedServices, setAffectedServices] = useState("");
  const [status, setStatus] = useState<string>("Scheduled");

  const fetchWindows = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/status/maintenance");
      setWindows(res.data);
    } catch {
      toast.error("Failed to load maintenance windows");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWindows();
  }, [fetchWindows]);

  const openForm = (w?: MaintenanceWindow) => {
    if (w) {
      setEditingWindow(w);
      setTitle(w.title);
      setDescription(w.description);
      setScheduledStart(format(new Date(w.scheduledStart), "yyyy-MM-dd'T'HH:mm"));
      setScheduledEnd(format(new Date(w.scheduledEnd), "yyyy-MM-dd'T'HH:mm"));
      setAffectedServices(w.affectedServices || "");
      setStatus(w.status);
    } else {
      setEditingWindow(null);
      setTitle("");
      setDescription("");
      setScheduledStart("");
      setScheduledEnd("");
      setAffectedServices("");
      setStatus("Scheduled");
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !scheduledStart || !scheduledEnd) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(scheduledEnd) <= new Date(scheduledStart)) {
      toast.error("End time must be after start time");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        scheduledStart,
        scheduledEnd,
        affectedServices: affectedServices || undefined,
        ...(editingWindow ? { status } : {}),
      };

      if (editingWindow) {
        await api.patch(`/status/maintenance/${editingWindow.id}`, payload);
        toast.success("Maintenance window updated");
      } else {
        await api.post("/status/maintenance", payload);
        toast.success("Maintenance window scheduled");
      }

      setIsFormOpen(false);
      fetchWindows();
    } catch {
      toast.error(editingWindow ? "Failed to update" : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/status/maintenance/${deleteTarget}`);
      toast.success("Maintenance window deleted");
      setDeleteTarget(null);
      fetchWindows();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleQuickStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/status/maintenance/${id}`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchWindows();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "Scheduled":    return <AdminBadge variant="secondary">{s}</AdminBadge>;
      case "In Progress":  return <AdminBadge variant="warning">{s}</AdminBadge>;
      case "Completed":    return <AdminBadge variant="success">{s}</AdminBadge>;
      case "Cancelled":    return <AdminBadge variant="error">{s}</AdminBadge>;
      default:             return <AdminBadge>{s}</AdminBadge>;
    }
  };

  const upcoming = windows.filter(w => w.status === "Scheduled" || w.status === "In Progress");
  const past = windows.filter(w => w.status === "Completed" || w.status === "Cancelled");

  return (
    <div className="space-y-8 pb-20 max-w-6xl">
      <AdminHeader
        title="Maintenance Windows"
        description="Schedule planned downtime and service disruptions. These are displayed on the BeeSeek Pulse status page."
        action={
          <div className="flex gap-3">
            <AdminButton variant="outline" onClick={fetchWindows} disabled={loading}>
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            </AdminButton>
            <AdminButton variant="primary" onClick={() => openForm()} className="gap-2">
              <Plus size={16} /> Schedule Maintenance
            </AdminButton>
          </div>
        }
      />

      {/* Active / Upcoming */}
      <div className="bg-white border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border/50 flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
            <AlertTriangle size={18} />
          </div>
          <div>
            <AdminText variant="bold">Active & Upcoming</AdminText>
            <AdminText size="xs" color="secondary">{upcoming.length} window{upcoming.length !== 1 ? "s" : ""}</AdminText>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <RefreshCcw size={24} className="animate-spin text-slate-300" />
          </div>
        ) : upcoming.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 size={36} className="text-green-300 mx-auto mb-3" />
            <AdminText variant="bold">No Upcoming Maintenance</AdminText>
            <AdminText size="xs" color="secondary">All systems operating normally.</AdminText>
          </div>
        ) : (
          <AdminTable headers={["Window", "Schedule", "Services", "Status", "Actions"]}>
            {upcoming.map(w => (
              <AdminTableRow key={w.id}>
                <AdminTableCell>
                  <AdminText variant="bold" size="sm">{w.title}</AdminText>
                  <AdminText size="xs" color="secondary" className="mt-0.5 max-w-[250px] truncate">{w.description}</AdminText>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar size={12} className="text-slate-400" />
                    <AdminText size="xs">{format(new Date(w.scheduledStart), "MMM dd, HH:mm")}</AdminText>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs mt-1">
                    <Clock size={12} className="text-slate-400" />
                    <AdminText size="xs" color="secondary">→ {format(new Date(w.scheduledEnd), "MMM dd, HH:mm")}</AdminText>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  {w.affectedServices ? (
                    <div className="flex items-center gap-1.5">
                      <Server size={12} className="text-slate-400" />
                      <AdminText size="xs">{w.affectedServices}</AdminText>
                    </div>
                  ) : (
                    <AdminText size="xs" color="secondary">—</AdminText>
                  )}
                </AdminTableCell>
                <AdminTableCell>{getStatusBadge(w.status)}</AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5">
                    {w.status === "Scheduled" && (
                      <AdminButton variant="outline" size="sm" className="h-7 w-7 p-0 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => handleQuickStatus(w.id, "In Progress")} title="Start">
                        <AlertTriangle size={13} />
                      </AdminButton>
                    )}
                    {(w.status === "Scheduled" || w.status === "In Progress") && (
                      <AdminButton variant="outline" size="sm" className="h-7 w-7 p-0 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleQuickStatus(w.id, "Completed")} title="Complete">
                        <CheckCircle2 size={13} />
                      </AdminButton>
                    )}
                    {w.status === "Scheduled" && (
                      <AdminButton variant="outline" size="sm" className="h-7 w-7 p-0 text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleQuickStatus(w.id, "Cancelled")} title="Cancel">
                        <XCircle size={13} />
                      </AdminButton>
                    )}
                    <AdminButton variant="outline" size="sm" className="h-7 w-7 p-0 text-blue-600 border-blue-200 hover:bg-blue-50 ml-1" onClick={() => openForm(w)} title="Edit">
                      <Pencil size={13} />
                    </AdminButton>
                    <AdminButton variant="outline" size="sm" className="h-7 w-7 p-0 text-red-500 border-red-200 hover:bg-red-50" onClick={() => setDeleteTarget(w.id)} title="Delete">
                      <Trash2 size={13} />
                    </AdminButton>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        )}
      </div>

      {/* Past Maintenance */}
      {past.length > 0 && (
        <div className="bg-white border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border/50 flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-xl text-slate-500">
              <Clock size={18} />
            </div>
            <div>
              <AdminText variant="bold">Past Maintenance</AdminText>
              <AdminText size="xs" color="secondary">{past.length} completed or cancelled</AdminText>
            </div>
          </div>

          <AdminTable headers={["Window", "Schedule", "Services", "Status", "Actions"]}>
            {past.map(w => (
              <AdminTableRow key={w.id}>
                <AdminTableCell>
                  <AdminText variant="bold" size="sm">{w.title}</AdminText>
                  <AdminText size="xs" color="secondary" className="mt-0.5 max-w-[250px] truncate">{w.description}</AdminText>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar size={12} className="text-slate-400" />
                    <AdminText size="xs">{format(new Date(w.scheduledStart), "MMM dd, HH:mm")}</AdminText>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs mt-1">
                    <Clock size={12} className="text-slate-400" />
                    <AdminText size="xs" color="secondary">→ {format(new Date(w.scheduledEnd), "MMM dd, HH:mm")}</AdminText>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  {w.affectedServices ? (
                    <div className="flex items-center gap-1.5">
                      <Server size={12} className="text-slate-400" />
                      <AdminText size="xs">{w.affectedServices}</AdminText>
                    </div>
                  ) : (
                    <AdminText size="xs" color="secondary">—</AdminText>
                  )}
                </AdminTableCell>
                <AdminTableCell>{getStatusBadge(w.status)}</AdminTableCell>
                <AdminTableCell>
                  <AdminButton variant="outline" size="sm" className="h-7 w-7 p-0 text-red-500 border-red-200 hover:bg-red-50" onClick={() => setDeleteTarget(w.id)} title="Delete">
                    <Trash2 size={13} />
                  </AdminButton>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminConsentModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Maintenance Window"
        description="This will permanently remove this maintenance window from the status page. This cannot be undone."
      />

      {/* Create/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <AdminText variant="bold" size="xl">
                {editingWindow ? "Edit Maintenance Window" : "Schedule Maintenance"}
              </AdminText>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors"
                disabled={submitting}
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <AdminText size="xs" variant="bold" className="ml-1 mb-1 uppercase text-slate-500 tracking-wider">Title *</AdminText>
                <AdminInput
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Database Migration"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <AdminText size="xs" variant="bold" className="ml-1 mb-1 uppercase text-slate-500 tracking-wider">Description *</AdminText>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px] resize-none disabled:opacity-50"
                  placeholder="Brief description of what's being maintained and expected impact"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <AdminText size="xs" variant="bold" className="ml-1 mb-1 uppercase text-slate-500 tracking-wider">Start Time *</AdminText>
                  <AdminInput
                    type="datetime-local"
                    value={scheduledStart}
                    onChange={e => setScheduledStart(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <AdminText size="xs" variant="bold" className="ml-1 mb-1 uppercase text-slate-500 tracking-wider">End Time *</AdminText>
                  <AdminInput
                    type="datetime-local"
                    value={scheduledEnd}
                    onChange={e => setScheduledEnd(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <AdminText size="xs" variant="bold" className="ml-1 mb-1 uppercase text-slate-500 tracking-wider">Affected Services</AdminText>
                <AdminInput
                  value={affectedServices}
                  onChange={e => setAffectedServices(e.target.value)}
                  placeholder="e.g. API, Payments, Chat (comma-separated)"
                  disabled={submitting}
                />
              </div>

              {editingWindow && (
                <div>
                  <AdminText size="xs" variant="bold" className="ml-1 mb-1 uppercase text-slate-500 tracking-wider">Status</AdminText>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    disabled={submitting}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <AdminButton variant="outline" className="flex-1" type="button" onClick={() => setIsFormOpen(false)} disabled={submitting}>
                  Cancel
                </AdminButton>
                <AdminButton variant="primary" className="flex-1" type="submit" loading={submitting}>
                  {editingWindow ? "Update" : "Schedule"}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
