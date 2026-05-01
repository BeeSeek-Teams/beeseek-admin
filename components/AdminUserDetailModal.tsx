"use client";

import React, { useState } from "react";
import {
  X,
  EnvelopeSimple,
  Phone,
  CalendarBlank,
  ShieldCheck,
  Wallet,
  Briefcase,
  User as UserIcon,
  ShieldWarning,
  Fingerprint,
  Trash,
  SpinnerGap,
  DeviceMobile,
  Star,
  Clock,
  Bell,
  FirstAidKit,
  Prohibit,
  CheckCircle,
} from "@phosphor-icons/react";
import { AdminBadge } from "./AdminBadge";
import { AdminConsentModal } from "./AdminConsentModal";
import { User, deleteUser, suspendUser, unsuspendUser } from "@/lib/users";
import { deleteBee } from "@/lib/bees";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface AdminUserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const InfoRow = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="flex justify-between items-start gap-4 py-2 border-b border-black/[0.03] last:border-0">
    <p className="text-[11px] text-black/35 shrink-0">{label}</p>
    <p className={`text-[11px] font-semibold text-black text-right ${mono ? "font-mono" : ""}`}>{value || <span className="text-black/20">&mdash;</span>}</p>
  </div>
);

const SectionHeader = ({ children, icon: Icon }: { children: string; icon?: React.ElementType }) => (
  <div className="flex items-center gap-2 mb-3">
    {Icon && <Icon size={14} weight="duotone" className="text-black/25" />}
    <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{children}</p>
  </div>
);

const formatKobo = (kobo: number | undefined) => {
  if (!kobo && kobo !== 0) return "\u2014";
  return `\u20A6${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
};

export const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleteUserModal, setDeleteUserModal] = useState(false);

  // Suspension state
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState<"indefinite" | "custom">("indefinite");
  const [suspendDays, setSuspendDays] = useState("7");

  // Unsuspend modal
  const [unsuspendModal, setUnsuspendModal] = useState(false);

  if (!user) return null;

  const isSuspended = user.status === "SUSPENDED";
  const isDeactivated = user.status === "DEACTIVATED";

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }
    try {
      setLoading("suspending");
      const days = suspendDuration === "custom" ? parseInt(suspendDays) : undefined;
      await suspendUser(user.id, suspendReason.trim(), days);
      toast.success(`${user.firstName} has been suspended`);
      setShowSuspendForm(false);
      setSuspendReason("");
      onUpdate?.();
      onClose();
    } catch {
      toast.error("Failed to suspend user");
    } finally {
      setLoading(null);
    }
  };

  const handleUnsuspend = async () => {
    try {
      setLoading("unsuspending");
      await unsuspendUser(user.id);
      toast.success(`${user.firstName}'s suspension has been lifted`);
      onUpdate?.();
      onClose();
    } catch {
      toast.error("Failed to unsuspend user");
    } finally {
      setLoading(null);
      setUnsuspendModal(false);
    }
  };

  const handleDeleteBee = async (beeId: string) => {
    try {
      setLoading(`bee-${beeId}`);
      await deleteBee(beeId);
      toast.success("Service deleted successfully");
      onUpdate?.();
    } catch {
      toast.error("Failed to delete service");
    } finally {
      setLoading(null);
      setDeleteModal(null);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading("deleting-user");
      await deleteUser(user.id);
      toast.success(`${user.firstName} has been deactivated`);
      setDeleteUserModal(false);
      onUpdate?.();
      onClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to delete user";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setLoading(null);
    }
  };

  const statusVariant = isSuspended ? "error" : isDeactivated ? "warning" : "success";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 md:p-6 lg:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Sidebar Modal */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-black/5"
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-black/5 flex justify-between items-start gap-3">
                <div className="flex items-center gap-3 md:gap-5 min-w-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#FAFAFA] border border-black/5 flex items-center justify-center text-primary overflow-hidden shrink-0">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={28} weight="duotone" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-base md:text-lg font-bold text-black truncate">{user.firstName} {user.lastName}</h2>
                      <AdminBadge variant={user.role === "AGENT" ? "primary" : "info"}>{user.role}</AdminBadge>
                      <AdminBadge variant={statusVariant}>{user.status}</AdminBadge>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-[10px] text-black/25 font-mono">{user.id}</p>
                      {user.slug && <p className="text-[10px] text-primary/60 font-medium">@{user.slug}</p>}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="w-9 h-9 rounded-xl bg-[#FAFAFA] flex items-center justify-center text-black/30 hover:text-black transition-colors shrink-0">
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Suspension Banner */}
              {isSuspended && (
                <div className="mx-4 md:mx-6 mt-4 bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Prohibit size={18} weight="fill" className="text-red-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-red-700 mb-1">Account Suspended</p>
                      {user.suspensionReason && (
                        <p className="text-[11px] text-red-600/80 mb-2">{user.suspensionReason}</p>
                      )}
                      <div className="flex items-center gap-4 flex-wrap">
                        {user.suspendedAt && (
                          <p className="text-[10px] text-red-400">Since {format(new Date(user.suspendedAt), "MMM dd, yyyy")}</p>
                        )}
                        {user.suspensionExpiresAt ? (
                          <p className="text-[10px] text-red-400">Expires {format(new Date(user.suspensionExpiresAt), "MMM dd, yyyy 'at' HH:mm")}</p>
                        ) : (
                          <AdminBadge variant="error" className="text-[9px]">Indefinite</AdminBadge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                {/* Contact & Account */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#FAFAFA] rounded-xl p-4">
                    <SectionHeader icon={EnvelopeSimple}>Contact</SectionHeader>
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="Phone" value={user.phoneNumber || user.phone} />
                    {user.linkedAccountId && <InfoRow label="Linked Account" value={user.linkedAccountId} mono />}
                  </div>
                  <div className="bg-[#FAFAFA] rounded-xl p-4">
                    <SectionHeader icon={CalendarBlank}>Account</SectionHeader>
                    <InfoRow label="Joined" value={format(new Date(user.createdAt), "MMM dd, yyyy")} />
                    <InfoRow label="Age" value={user.age} />
                    <InfoRow label="Status" value={<AdminBadge variant={statusVariant}>{user.status}</AdminBadge>} />
                    {user.deactivatedAt && <InfoRow label="Deactivated" value={format(new Date(user.deactivatedAt), "MMM dd, yyyy")} />}
                  </div>
                </section>

                {/* Identity & Wallet */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#FAFAFA] rounded-xl p-4">
                    <SectionHeader icon={Fingerprint}>Identity</SectionHeader>
                    <InfoRow
                      label="NIN Status"
                      value={
                        <AdminBadge variant={user.ninStatus === "VERIFIED" ? "success" : user.ninStatus === "REJECTED" ? "error" : user.ninStatus === "PENDING" ? "warning" : "secondary"}>
                          {user.ninStatus || "NOT_SUBMITTED"}
                        </AdminBadge>
                      }
                    />
                    {user.ninNumber && <InfoRow label="NIN" value={"•••••••" + user.ninNumber.slice(-4)} mono />}
                    {user.ninRegistryName && <InfoRow label="Registry Name" value={user.ninRegistryName} />}
                    {user.ninVerifiedAt && <InfoRow label="Verified At" value={format(new Date(user.ninVerifiedAt), "MMM dd, yyyy")} />}
                    {user.ninNameMatchConfidence != null && <InfoRow label="Name Match" value={`${user.ninNameMatchConfidence}%`} />}
                    <InfoRow label="Email Verified" value={user.isVerified ? "Yes" : "No"} />
                  </div>
                  <div className="bg-[#FAFAFA] rounded-xl p-4">
                    <SectionHeader icon={Wallet}>Wallet</SectionHeader>
                    <InfoRow label="Balance" value={formatKobo(user.walletBalance)} />
                    <InfoRow label="Locked (Escrow)" value={formatKobo(user.lockedBalance)} />
                    {user.monnifyNUBAN && <InfoRow label="NUBAN" value={user.monnifyNUBAN} mono />}
                    {user.monnifyBankName && <InfoRow label="Bank" value={user.monnifyBankName} />}
                    {user.monnifyAccountName && <InfoRow label="Account Name" value={user.monnifyAccountName} />}
                    {user.monnifyBVN && <InfoRow label="BVN" value={"•••••" + user.monnifyBVN.slice(-4)} mono />}
                  </div>
                </section>

                {/* Activity & Device */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#FAFAFA] rounded-xl p-4">
                    <SectionHeader icon={Clock}>Activity</SectionHeader>
                    <InfoRow label="Last Login" value={user.lastLoginAt ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true }) : null} />
                    {user.lastClientLoginAt && <InfoRow label="Last Client Login" value={formatDistanceToNow(new Date(user.lastClientLoginAt), { addSuffix: true })} />}
                    {user.lastAgentLoginAt && <InfoRow label="Last Agent Login" value={formatDistanceToNow(new Date(user.lastAgentLoginAt), { addSuffix: true })} />}
                    <InfoRow label="Online" value={user.isActive ? "Yes" : "No"} />
                    <InfoRow label="Available" value={user.isAvailable ? "Yes" : "No"} />
                    <InfoRow label="Booked" value={user.isBooked ? "Yes" : "No"} />
                    {user.isBooked && user.bookedDate && <InfoRow label="Booked For" value={`${user.bookedDate} ${user.bookedTime || ""}`} />}
                  </div>
                  <div className="bg-[#FAFAFA] rounded-xl p-4">
                    <SectionHeader icon={DeviceMobile}>Device & Location</SectionHeader>
                    <InfoRow label="Device" value={user.deviceModel} />
                    <InfoRow label="Platform" value={user.deviceType} />
                    <InfoRow label="Device ID" value={user.deviceId ? `${user.deviceId.slice(0, 8)}...` : null} mono />
                    <InfoRow label="Last IP" value={user.lastIpAddress} mono />
                    {(user.latitude && user.longitude) ? (
                      <InfoRow
                        label="Location"
                        value={
                          <a
                            href={`https://maps.google.com/?q=${user.latitude},${user.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}
                          </a>
                        }
                      />
                    ) : null}
                  </div>
                </section>

                {/* Ratings & Emergency */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#FAFAFA] rounded-xl p-4">
                    <SectionHeader icon={Star}>Ratings & Achievements</SectionHeader>
                    <InfoRow label="Rating" value={user.rating ? `${user.rating.toFixed(1)} \u2605` : null} />
                    <InfoRow label="Reviews" value={user.totalReviews} />
                    <InfoRow label="Early Access" value={user.earlyAccessAchievement ? <AdminBadge variant="primary">Earned</AdminBadge> : "No"} />
                    <InfoRow label="Top Rated" value={user.topRatedAchievement ? <AdminBadge variant="success">Earned</AdminBadge> : "No"} />
                    <InfoRow label="Golden Badge" value={user.goldenBadgeAchievement ? <AdminBadge variant="warning">Earned</AdminBadge> : "No"} />
                  </div>
                  <div className="bg-[#FAFAFA] rounded-xl p-4">
                    <SectionHeader icon={FirstAidKit}>Emergency Contact</SectionHeader>
                    <InfoRow label="Name" value={user.emergencyContactName} />
                    <InfoRow label="Phone" value={user.emergencyContactPhone} />
                    <InfoRow label="Relationship" value={user.emergencyContactRelationship} />
                    <div className="mt-3 pt-3 border-t border-black/[0.05]">
                      <SectionHeader icon={Bell}>Preferences</SectionHeader>
                      <InfoRow label="Push Notifications" value={user.pushNotificationsEnabled ? "Enabled" : "Disabled"} />
                      <InfoRow label="Biometrics" value={user.useBiometrics ? "Enabled" : "Disabled"} />
                    </div>
                  </div>
                </section>

                {/* Bio */}
                {user.bio && (
                  <section>
                    <SectionHeader icon={UserIcon}>Bio</SectionHeader>
                    <div className="bg-[#FAFAFA] rounded-xl p-4 border border-black/[0.03]">
                      <p className="text-xs leading-relaxed text-black/50 italic">{user.bio}</p>
                    </div>
                  </section>
                )}

                {/* Background Check */}
                {user.ninBackgroundCheck && (
                  <section>
                    <SectionHeader icon={ShieldWarning}>Background Check</SectionHeader>
                    <div className="bg-[#FAFAFA] rounded-xl p-4 border border-black/[0.03]">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="text-center">
                          <p className="text-[10px] text-black/30 mb-1">Risk Level</p>
                          <AdminBadge variant={user.ninBackgroundCheck.riskLevel === "high" ? "error" : user.ninBackgroundCheck.riskLevel === "medium" ? "warning" : "success"}>
                            {user.ninBackgroundCheck.riskLevel || "unknown"}
                          </AdminBadge>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-black/30 mb-1">PEP</p>
                          <AdminBadge variant={user.ninBackgroundCheck.isPEP ? "error" : "success"}>
                            {user.ninBackgroundCheck.isPEP ? "Yes" : "No"}
                          </AdminBadge>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-black/30 mb-1">Sanctioned</p>
                          <AdminBadge variant={user.ninBackgroundCheck.isSanctioned ? "error" : "success"}>
                            {user.ninBackgroundCheck.isSanctioned ? "Yes" : "No"}
                          </AdminBadge>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-black/30 mb-1">Matches</p>
                          <p className="text-xs font-bold text-black">{user.ninBackgroundCheck.totalMatches ?? 0}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Agent Bees */}
                {user.role === "AGENT" && (
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <SectionHeader icon={Briefcase}>Services</SectionHeader>
                      <AdminBadge variant="primary">{user.bees?.length || 0} Listed</AdminBadge>
                    </div>
                    {user.bees && user.bees.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.bees.map((bee: any) => (
                          <div key={bee.id} className="bg-white border border-black/5 rounded-xl p-3.5 shadow-sm hover:border-primary/50 transition-colors group relative">
                            <button
                              onClick={() => setDeleteModal(bee.id)}
                              disabled={loading === `bee-${bee.id}`}
                              className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-error/5 text-error opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-error hover:text-white"
                            >
                              {loading === `bee-${bee.id}` ? <SpinnerGap size={10} weight="bold" className="animate-spin" /> : <Trash size={10} weight="bold" />}
                            </button>
                            <div className="flex justify-between items-start mb-1.5 pr-6">
                              <p className="text-xs font-bold text-black group-hover:text-primary transition-colors">{bee.title}</p>
                              <p className="text-[11px] font-bold text-primary">{"\u20A6"}{parseFloat(bee.price).toLocaleString()}</p>
                            </div>
                            <p className="text-[10px] text-black/40 line-clamp-2 mb-2">{bee.description}</p>
                            <div className="flex items-center gap-1.5">
                              <AdminBadge variant="info" className="text-[9px] py-0.5">{bee.category}</AdminBadge>
                              {bee.offersInspection && <AdminBadge variant="success" className="text-[9px] py-0.5">Inspection</AdminBadge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#FAFAFA] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-black/10">
                        <Briefcase size={28} weight="duotone" className="text-black/15" />
                        <p className="text-[10px] text-black/30">No services listed.</p>
                      </div>
                    )}
                  </section>
                )}

                {/* Suspension Form (inline) */}
                {showSuspendForm && (
                  <section>
                    <SectionHeader icon={ShieldWarning}>Suspend User</SectionHeader>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-4">
                      <div>
                        <label className="text-[11px] font-semibold text-red-700 block mb-1.5">Reason *</label>
                        <textarea
                          value={suspendReason}
                          onChange={(e) => setSuspendReason(e.target.value)}
                          placeholder="Explain why this account is being suspended..."
                          className="w-full text-xs bg-white border border-red-200 rounded-lg p-3 text-black placeholder:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-red-700 block mb-1.5">Duration</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSuspendDuration("indefinite")}
                            className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-colors ${
                              suspendDuration === "indefinite"
                                ? "bg-red-600 text-white"
                                : "bg-white border border-red-200 text-red-600 hover:bg-red-50"
                            }`}
                          >
                            Indefinite
                          </button>
                          <button
                            onClick={() => setSuspendDuration("custom")}
                            className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-colors ${
                              suspendDuration === "custom"
                                ? "bg-red-600 text-white"
                                : "bg-white border border-red-200 text-red-600 hover:bg-red-50"
                            }`}
                          >
                            Custom Duration
                          </button>
                        </div>
                        {suspendDuration === "custom" && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="365"
                              value={suspendDays}
                              onChange={(e) => setSuspendDays(e.target.value)}
                              className="w-20 text-xs bg-white border border-red-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                            <span className="text-[11px] text-red-600">days</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            setShowSuspendForm(false);
                            setSuspendReason("");
                          }}
                          className="flex-1 py-2.5 rounded-lg text-[11px] font-bold text-black/40 bg-white border border-black/10 hover:bg-black/5 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSuspend}
                          disabled={loading === "suspending" || !suspendReason.trim()}
                          className="flex-1 py-2.5 rounded-lg text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {loading === "suspending" ? (
                            <SpinnerGap size={14} weight="bold" className="animate-spin" />
                          ) : (
                            <ShieldWarning size={14} weight="bold" />
                          )}
                          Confirm Suspension
                        </button>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 md:p-6 border-t border-black/5 bg-[#FAFAFA]">
                <div className="flex gap-2">
                  {isSuspended ? (
                    <button
                      onClick={() => setUnsuspendModal(true)}
                      disabled={loading === "unsuspending"}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading === "unsuspending" ? <SpinnerGap size={16} weight="bold" className="animate-spin" /> : <CheckCircle size={16} weight="bold" />}
                      Lift Suspension
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSuspendForm(!showSuspendForm)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldWarning size={16} weight="bold" />
                      {showSuspendForm ? "Hide Suspension Form" : "Suspend User"}
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteUserModal(true)}
                    disabled={loading === "deleting-user"}
                    className="px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-black/85 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading === "deleting-user" ? (
                      <SpinnerGap size={16} weight="bold" className="animate-spin" />
                    ) : (
                      <Trash size={16} weight="bold" />
                    )}
                    Delete User
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unsuspend Consent Modal */}
      <AdminConsentModal
        isOpen={unsuspendModal}
        onClose={() => setUnsuspendModal(false)}
        onConfirm={handleUnsuspend}
        title="Lift suspension?"
        description={`This will immediately restore full access for ${user.firstName} ${user.lastName}. They will be notified via email.`}
        confirmLabel="Lift Suspension"
        variant="primary"
        loading={loading === "unsuspending"}
      />

      {/* Delete Service Consent Modal */}
      <AdminConsentModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={() => deleteModal && handleDeleteBee(deleteModal)}
        title="Delete this service?"
        description="This service listing will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={loading?.startsWith("bee-") || false}
      />

      <AdminConsentModal
        isOpen={deleteUserModal}
        onClose={() => setDeleteUserModal(false)}
        onConfirm={handleDeleteUser}
        title="Delete this user?"
        description="This will deactivate the user account from admin. User must have no active contracts/errands and zero wallet/escrow balance."
        confirmLabel="Delete User"
        variant="danger"
        loading={loading === "deleting-user"}
      />
    </>
  );
};
