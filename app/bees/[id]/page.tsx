"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Star,
  Eye,
  TrendUp,
  CalendarBlank,
  Clock,
  CurrencyNgn,
  Copy,
  ToggleLeft,
  ToggleRight,
  Trash,
  SpinnerGap,
  CheckCircle,
  User,
  Envelope,
  ShieldCheck,
  Images,
  ClipboardText,
  Lightning,
  Flag,
  Warning,
} from "@phosphor-icons/react";
import { useRouter, useParams } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminConsentModal } from "@/components/AdminConsentModal";
import { getBeeDetails, toggleBeeActive, deleteBee, flagBee, Bee } from "@/lib/bees";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BeeDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [bee, setBee] = useState<Bee | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bee | null>(null);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const adminUser = useAuthStore((s) => s.user);

  const fetchBee = async () => {
    try {
      setLoading(true);
      const data = await getBeeDetails(id as string);
      setBee(data);
    } catch {
      toast.error("Couldn't load listing details");
      router.push("/bees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBee();
  }, [id]);

  const formatCurrency = (amount: any) => {
    const safeAmount = Number(amount || 0);
    if (safeAmount === 0) return "Negotiable";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(safeAmount);
  };

  const handleToggleActive = async () => {
    setShowToggleModal(true);
  };

  const confirmToggleActive = async () => {
    if (!bee) return;
    try {
      setProcessingId(bee.id);
      const updated = await toggleBeeActive(bee.id);
      setBee((prev) => (prev ? { ...prev, isActive: updated.isActive } : prev));
      toast.success(`Listing is now ${updated.isActive ? "active" : "inactive"}`);
    } catch {
      toast.error("Couldn't update status");
    } finally {
      setProcessingId(null);
      setShowToggleModal(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setProcessingId(deleteTarget.id);
      await deleteBee(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" deleted`);
      router.push("/bees");
    } catch {
      toast.error("Couldn't delete listing");
    } finally {
      setProcessingId(null);
    }
  };

  const handleFlag = async () => {
    if (!bee || !flagReason.trim()) return;
    try {
      setProcessingId(bee.id);
      const result = await flagBee(bee.id, flagReason.trim(), adminUser?.id || "admin");
      setBee((prev) =>
        prev
          ? {
              ...prev,
              flagCount: result.flagCount,
              isFlagged: result.isFlagged,
              lastFlagReason: result.lastFlagReason,
              lastFlaggedAt: result.lastFlaggedAt,
              isActive: result.isActive,
            }
          : prev,
      );
      const consequenceMessages: Record<string, string> = {
        WARNING: "Listing flagged — warning sent to agent",
        DEACTIVATED: "Listing flagged and deactivated — agent notified",
        SUSPENDED: "Listing flagged, deactivated, and agent suspended for 7 days",
      };
      toast.success(consequenceMessages[result.consequence] || "Listing flagged");
    } catch {
      toast.error("Couldn't flag listing");
    } finally {
      setProcessingId(null);
      setShowFlagModal(false);
      setFlagReason("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-black/[0.04] rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-52 bg-black/[0.02] rounded-2xl" />
            <div className="h-80 bg-black/[0.02] rounded-2xl" />
          </div>
          <div className="h-96 bg-black/[0.02] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!bee) return null;

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminConsentModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this listing?"
        description={`"${deleteTarget?.title}" will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        loading={!!processingId}
      />

      <AdminConsentModal
        isOpen={showToggleModal}
        onClose={() => setShowToggleModal(false)}
        onConfirm={confirmToggleActive}
        title={bee?.isActive ? "Deactivate this listing?" : "Activate this listing?"}
        description={bee?.isActive
          ? `"${bee?.title}" will be hidden from search results and the agent will be notified by email.`
          : `"${bee?.title}" will be visible in search results again.`
        }
        confirmLabel={bee?.isActive ? "Deactivate" : "Activate"}
        variant={bee?.isActive ? "danger" : "primary"}
        loading={!!processingId}
      />

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowFlagModal(false); setFlagReason(""); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Flag size={20} weight="fill" className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-primary">Flag this listing</h3>
                <p className="text-[10px] text-black/30 mt-0.5">
                  Flag #{(bee?.flagCount || 0) + 1} — {(bee?.flagCount || 0) === 0 ? "Warning will be sent" : (bee?.flagCount || 0) === 1 ? "Listing will be deactivated" : "Agent account will be suspended"}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-black/40 block mb-2">Reason for flagging</label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Describe the issue with this listing..."
                className="w-full h-24 px-4 py-3 text-xs border border-black/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-black/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowFlagModal(false); setFlagReason(""); }}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-black/40 bg-black/[0.03] rounded-xl hover:bg-black/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFlag}
                disabled={!flagReason.trim() || !!processingId}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingId ? <SpinnerGap size={14} weight="bold" className="animate-spin" /> : <Flag size={14} weight="bold" />}
                Flag Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back + Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-black/[0.03] rounded-xl transition-colors"
          >
            <ArrowLeft size={18} weight="bold" className="text-black/40" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-black text-primary">{bee.title}</h1>
              <AdminBadge variant={bee.isActive ? "success" : "error"}>
                {bee.isActive ? "Active" : "Inactive"}
              </AdminBadge>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] font-mono text-black/25">{bee.id}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(bee.id);
                  toast.success("Copied");
                }}
                className="text-black/20 hover:text-primary transition-colors"
              >
                <Copy size={10} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFlagModal(true)}
            disabled={!!processingId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            <Flag size={14} weight="bold" />
            Flag {bee.flagCount > 0 ? `(${bee.flagCount})` : ""}
          </button>
          <button
            onClick={handleToggleActive}
            disabled={!!processingId}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border disabled:opacity-50 ${
              bee.isActive
                ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
            }`}
          >
            {processingId ? (
              <SpinnerGap size={14} weight="bold" className="animate-spin" />
            ) : bee.isActive ? (
              <ToggleRight size={14} weight="fill" />
            ) : (
              <ToggleLeft size={14} weight="bold" />
            )}
            {bee.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={() => setDeleteTarget(bee)}
            disabled={!!processingId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash size={14} weight="bold" />
            Delete
          </button>
        </div>
      </div>

      {/* Flag Banner */}
      {bee.isFlagged && bee.flagCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <Warning size={20} weight="fill" className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-orange-800">
              This listing has been flagged {bee.flagCount} time{bee.flagCount > 1 ? "s" : ""}
            </p>
            {bee.lastFlagReason && (
              <p className="text-[11px] text-orange-700/70 mt-1">Last reason: {bee.lastFlagReason}</p>
            )}
            {bee.lastFlaggedAt && (
              <p className="text-[10px] text-orange-600/50 mt-1">
                Last flagged: {format(new Date(bee.lastFlaggedAt), "MMM dd, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Listing Overview */}
          <div className="bg-white border border-black/5 rounded-2xl p-5 md:p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 overflow-hidden">
                {bee.images && bee.images.length > 0 ? (
                  <img
                    src={bee.images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Briefcase size={28} weight="duotone" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-black text-primary">{bee.title}</h2>
                <div className="flex items-center flex-wrap gap-2 mt-1.5">
                  <AdminBadge variant="info">{bee.category}</AdminBadge>
                  {bee.locationAddress && (
                    <div className="flex items-center gap-1 text-black/25">
                      <MapPin size={11} weight="bold" />
                      <span className="text-[10px] font-bold">{bee.locationAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {bee.description && (
              <div className="border-t border-black/[0.03] pt-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <ClipboardText size={14} weight="bold" className="text-primary" />
                  <p className="text-xs font-bold text-black/40">Description</p>
                </div>
                <p className="text-xs text-black/40 leading-relaxed">{bee.description}</p>
              </div>
            )}

            {bee.clientRequirements && (
              <div className="border-t border-black/[0.03] pt-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightning size={14} weight="bold" className="text-primary" />
                  <p className="text-xs font-bold text-black/40">Client Requirements</p>
                </div>
                <p className="text-xs text-black/40 leading-relaxed">{bee.clientRequirements}</p>
              </div>
            )}
          </div>

          {/* Images Gallery */}
          {bee.images && bee.images.length > 0 && (
            <div className="bg-white border border-black/5 rounded-2xl p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Images size={16} weight="duotone" className="text-primary" />
                <p className="text-sm font-black text-primary">
                  Gallery ({bee.images.length})
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {bee.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className="aspect-video rounded-xl overflow-hidden border border-black/5 hover:border-primary/20 transition-colors cursor-pointer group"
                  >
                    <img
                      src={img}
                      alt={`${bee.title} - ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Views", value: bee.totalViews, icon: Eye, color: "bg-blue-50 text-blue-600" },
              { label: "Hires", value: bee.totalHires, icon: TrendUp, color: "bg-green-50 text-green-600" },
              { label: "Jobs Done", value: bee.jobsCompleted, icon: CheckCircle, color: "bg-primary/10 text-primary" },
              { label: "Rating", value: Number(bee.rating).toFixed(1), icon: Star, color: "bg-amber-50 text-amber-600" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-white border border-black/5 rounded-2xl p-4 space-y-2"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}
                  >
                    <Icon size={18} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-primary">{stat.value}</p>
                    <p className="text-[10px] font-bold text-black/25 mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6">
          {/* Agent Card */}
          {bee.agent && (
            <div className="bg-white border border-black/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} weight="duotone" className="text-primary" />
                <p className="text-sm font-black text-primary">Agent</p>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/5 flex items-center justify-center text-primary font-bold text-sm overflow-hidden flex-shrink-0">
                  {bee.agent.profileImage ? (
                    <img
                      src={bee.agent.profileImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    `${bee.agent.firstName?.[0] || ""}${bee.agent.lastName?.[0] || ""}`
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary truncate">
                    {bee.agent.firstName} {bee.agent.lastName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Envelope size={10} weight="bold" className="text-black/20" />
                    <p className="text-[10px] text-black/25 truncate">{bee.agent.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-black/[0.02] rounded-xl">
                  <p className="text-[10px] font-bold text-black/30">NIN Status</p>
                  <AdminBadge variant={bee.agent.isNinVerified ? "success" : "warning"}>
                    {bee.agent.ninStatus || (bee.agent.isNinVerified ? "Verified" : "Pending")}
                  </AdminBadge>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/[0.02] rounded-xl">
                  <p className="text-[10px] font-bold text-black/30">Account Status</p>
                  <AdminBadge
                    variant={bee.agent.status === "ACTIVE" ? "success" : "warning"}
                  >
                    {bee.agent.status}
                  </AdminBadge>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Card */}
          <div className="bg-white border border-black/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CurrencyNgn size={16} weight="duotone" className="text-primary" />
              <p className="text-sm font-black text-primary">Pricing</p>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-primary/5 rounded-xl">
                <p className="text-[10px] font-bold text-black/25">{Number(bee.price) > 0 ? 'BASE PRICE' : 'PRICING'}</p>
                <p className="text-2xl font-black text-primary mt-1">
                  {formatCurrency(Number(bee.price))}
                </p>
              </div>
              {bee.offersInspection && (
                <div className="p-3 bg-black/[0.02] rounded-xl flex items-center justify-between">
                  <p className="text-[10px] font-bold text-black/30">Inspection</p>
                  <p className="text-xs font-black text-primary">
                    {bee.inspectionPrice
                      ? formatCurrency(Number(bee.inspectionPrice))
                      : "Free"}
                  </p>
                </div>
              )}
              <div className="p-3 bg-black/[0.02] rounded-xl flex items-center justify-between">
                <p className="text-[10px] font-bold text-black/30">Total Revenue</p>
                <p className="text-xs font-black text-primary">
                  {formatCurrency(bee.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white border border-black/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} weight="duotone" className="text-primary" />
              <p className="text-sm font-black text-primary">Details</p>
            </div>
            <div className="space-y-2">
              {bee.workHours && (
                <div className="flex items-center justify-between p-3 bg-black/[0.02] rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} weight="bold" className="text-black/20" />
                    <p className="text-[10px] font-bold text-black/30">Work Hours</p>
                  </div>
                  <p className="text-[10px] font-bold text-black/50">{bee.workHours}</p>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-black/[0.02] rounded-xl">
                <div className="flex items-center gap-1.5">
                  <CalendarBlank size={12} weight="bold" className="text-black/20" />
                  <p className="text-[10px] font-bold text-black/30">Created</p>
                </div>
                <p className="text-[10px] font-bold text-black/50">
                  {format(new Date(bee.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/[0.02] rounded-xl">
                <div className="flex items-center gap-1.5">
                  <CalendarBlank size={12} weight="bold" className="text-black/20" />
                  <p className="text-[10px] font-bold text-black/30">Updated</p>
                </div>
                <p className="text-[10px] font-bold text-black/50">
                  {format(new Date(bee.updatedAt), "MMM dd, yyyy")}
                </p>
              </div>
              {bee.offersInspection && (
                <div className="flex items-center justify-between p-3 bg-black/[0.02] rounded-xl">
                  <p className="text-[10px] font-bold text-black/30">Offers Inspection</p>
                  <AdminBadge variant="success">Yes</AdminBadge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh]">
            <img
              src={selectedImage}
              alt=""
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
