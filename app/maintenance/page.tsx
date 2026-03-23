"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wrench,
  ArrowClockwise,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Warning,
  Trash,
  PencilSimple,
  HardDrives,
  CalendarBlank,
  X,
  SpinnerGap
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
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
      toast.error("Couldn't load maintenance windows");
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
      toast.error(editingWindow ? "Couldn't update" : "Couldn't create");
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
      toast.error("Couldn't delete");
    }
  };

  const handleQuickStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/status/maintenance/${id}`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchWindows();
    } catch {
      toast.error("Couldn't update status");
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

  const renderWindowRow = (w: MaintenanceWindow, showAllActions: boolean) => (
    <AdminTableRow key={w.id}>
      <AdminTableCell>
        <p className="text-sm font-bold">{w.title}</p>
        <p className="text-xs text-black/30 mt-0.5 max-w-[250px] truncate">{w.description}</p>
      </AdminTableCell>
      <AdminTableCell>
        <div className="flex items-center gap-1.5">
          <CalendarBlank size={11} weight="bold" className="text-black/15" />
          <p className="text-xs text-black/50">{format(new Date(w.scheduledStart), "MMM dd, HH:mm")}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Clock size={11} weight="bold" className="text-black/15" />
          <p className="text-xs text-black/30">→ {format(new Date(w.scheduledEnd), "MMM dd, HH:mm")}</p>
        </div>
      </AdminTableCell>
      <AdminTableCell>
        {w.affectedServices ? (
          <div className="flex items-center gap-1.5">
            <HardDrives size={11} weight="bold" className="text-black/15" />
            <p className="text-xs text-black/50">{w.affectedServices}</p>
          </div>
        ) : (
          <p className="text-xs text-black/15">—</p>
        )}
      </AdminTableCell>
      <AdminTableCell>{getStatusBadge(w.status)}</AdminTableCell>
      <AdminTableCell>
        <div className="flex items-center gap-1">
          {showAllActions && (
            <>
              {w.status === "Scheduled" && (
                <button className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors" onClick={() => handleQuickStatus(w.id, "In Progress")} title="Start">
                  <Warning size={14} weight="bold" />
                </button>
              )}
              {(w.status === "Scheduled" || w.status === "In Progress") && (
                <button className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition-colors" onClick={() => handleQuickStatus(w.id, "Completed")} title="Complete">
                  <CheckCircle size={14} weight="bold" />
                </button>
              )}
              {w.status === "Scheduled" && (
                <button className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" onClick={() => handleQuickStatus(w.id, "Cancelled")} title="Cancel">
                  <XCircle size={14} weight="bold" />
                </button>
              )}
              <button className="p-1.5 rounded-lg text-black/20 hover:bg-blue-50 hover:text-blue-500 transition-colors" onClick={() => openForm(w)} title="Edit">
                <PencilSimple size={14} weight="bold" />
              </button>
            </>
          )}
          <button className="p-1.5 rounded-lg text-black/20 hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => setDeleteTarget(w.id)} title="Delete">
            <Trash size={14} weight="bold" />
          </button>
        </div>
      </AdminTableCell>
    </AdminTableRow>
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-20 max-w-6xl">
      <AdminHeader
        title="Maintenance"
        description="Schedule planned downtime. These show on the BeeSeek Pulse status page."
      />

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button 
          onClick={fetchWindows} 
          disabled={loading}
          className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
        >
          <ArrowClockwise size={16} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
        <button 
          onClick={() => openForm()} 
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus size={14} weight="bold" />
          Schedule Maintenance
        </button>
      </div>

      {/* Active & Upcoming */}
      <div className="bg-white border border-black/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5 flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
            <Warning size={16} weight="fill" />
          </div>
          <div>
            <p className="text-sm font-bold">Active & Upcoming</p>
            <p className="text-[10px] text-black/25">{upcoming.length} window{upcoming.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <SpinnerGap size={24} weight="bold" className="animate-spin text-primary/30" />
            <p className="text-sm text-black/25">Loading...</p>
          </div>
        ) : upcoming.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <CheckCircle size={32} weight="duotone" className="text-black/10" />
            <p className="text-sm font-bold text-black/25">No upcoming maintenance</p>
            <p className="text-xs text-black/15">All systems operating normally.</p>
          </div>
        ) : (
          <AdminTable headers={["Window", "Schedule", "Services", "Status", "Actions"]}>
            {upcoming.map(w => renderWindowRow(w, true))}
          </AdminTable>
        )}
      </div>

      {/* Past Maintenance */}
      {past.length > 0 && (
        <div className="bg-white border border-black/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-black/5 flex items-center gap-3">
            <div className="p-2 bg-black/[0.03] rounded-xl text-black/30">
              <Clock size={16} weight="fill" />
            </div>
            <div>
              <p className="text-sm font-bold">Past Maintenance</p>
              <p className="text-[10px] text-black/25">{past.length} completed or cancelled</p>
            </div>
          </div>

          <AdminTable headers={["Window", "Schedule", "Services", "Status", "Actions"]}>
            {past.map(w => renderWindowRow(w, false))}
          </AdminTable>
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminConsentModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this window?"
        description="This will permanently remove this maintenance window from the status page."
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Create/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => !submitting && setIsFormOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <p className="text-lg font-black">
                {editingWindow ? "Edit Window" : "Schedule Maintenance"}
              </p>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-black/[0.03] rounded-xl text-black/20 hover:text-black/50 transition-colors"
                disabled={submitting}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-black/30 uppercase tracking-wider ml-1 mb-1 block">Title *</label>
                <AdminInput
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Database Migration"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-black/30 uppercase tracking-wider ml-1 mb-1 block">Description *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-black/[0.02] border border-black/5 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px] resize-none disabled:opacity-50"
                  placeholder="Brief description of what's being maintained"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-black/30 uppercase tracking-wider ml-1 mb-1 block">Start *</label>
                  <AdminInput type="datetime-local" value={scheduledStart} onChange={e => setScheduledStart(e.target.value)} required disabled={submitting} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-black/30 uppercase tracking-wider ml-1 mb-1 block">End *</label>
                  <AdminInput type="datetime-local" value={scheduledEnd} onChange={e => setScheduledEnd(e.target.value)} required disabled={submitting} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-black/30 uppercase tracking-wider ml-1 mb-1 block">Affected Services</label>
                <AdminInput
                  value={affectedServices}
                  onChange={e => setAffectedServices(e.target.value)}
                  placeholder="e.g. API, Payments, Chat"
                  disabled={submitting}
                />
              </div>

              {editingWindow && (
                <div>
                  <label className="text-[10px] font-bold text-black/30 uppercase tracking-wider ml-1 mb-1 block">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    disabled={submitting}
                    className="w-full h-11 bg-black/[0.02] border border-black/5 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} disabled={submitting} className="flex-1 py-2.5 border border-black/5 rounded-xl text-sm font-bold text-black/40 hover:bg-black/[0.02] transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <SpinnerGap size={14} weight="bold" className="animate-spin" />}
                  {editingWindow ? "Update" : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}