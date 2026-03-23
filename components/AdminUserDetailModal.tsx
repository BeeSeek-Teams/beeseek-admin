"use client";

import React from "react";
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
} from "@phosphor-icons/react";
import { AdminBadge } from "./AdminBadge";
import { AdminConsentModal } from "./AdminConsentModal";
import { User, toggleBlockUser, updateVerificationStatus } from "@/lib/users";
import { deleteBee } from "@/lib/bees";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface AdminUserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [loading, setLoading] = React.useState<string | null>(null);
  const [blockModal, setBlockModal] = React.useState(false);
  const [deleteModal, setDeleteModal] = React.useState<string | null>(null);

  if (!user) return null;

  const handleToggleBlock = async () => {
    try {
      setLoading('blocking');
      await toggleBlockUser(user.id);
      toast.success(`User ${user.status === 'ACTIVE' ? 'suspended' : 'reactivated'} successfully`);
      onUpdate?.();
      onClose();
    } catch (err) {
      toast.error("Failed to update user status");
    } finally {
      setLoading(null);
      setBlockModal(false);
    }
  };

  const handleRequestAudit = async () => {
    try {
      setLoading('audit');
      await updateVerificationStatus(user.id, 'PENDING');
      toast.success("Re-verification requested. User must submit fresh details.");
      onUpdate?.();
      onClose();
    } catch (err) {
      toast.error("Failed to request re-verification");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteBee = async (beeId: string) => {
    try {
      setLoading(`bee-${beeId}`);
      await deleteBee(beeId);
      toast.success("Service deleted successfully");
      onUpdate?.();
    } catch (err) {
      toast.error("Failed to delete service");
    } finally {
      setLoading(null);
      setDeleteModal(null);
    }
  };

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

            {/* Sidebar-style Modal Content */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-black/5"
            >
              {/* Header */}
              <div className="p-4 md:p-8 border-b border-black/5 flex justify-between items-start gap-3">
                <div className="flex items-center gap-3 md:gap-6 min-w-0">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-[#FAFAFA] border border-black/5 flex items-center justify-center text-primary overflow-hidden shrink-0">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={32} weight="duotone" className="md:hidden" />
                    )}
                    {!user.profileImage && <UserIcon size={40} weight="duotone" className="hidden md:block" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                      <h2 className="text-lg md:text-xl font-bold text-black truncate">{user.firstName} {user.lastName}</h2>
                      <AdminBadge variant={user.role === 'AGENT' ? 'primary' : 'info'}>{user.role}</AdminBadge>
                    </div>
                    <p className="text-xs text-black/30 font-mono">ID: {user.id}</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#FAFAFA] flex items-center justify-center text-black/30 hover:text-black transition-colors shrink-0">
                  <X size={20} weight="bold" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 md:space-y-10 custom-scrollbar">
                {/* Core Information Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-3">
                    <p className="text-[10px] font-medium text-black/30 uppercase tracking-widest pl-1">Contact</p>
                    <div className="bg-[#FAFAFA] rounded-2xl p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm"><EnvelopeSimple size={16} weight="duotone" /></div>
                        <div>
                          <p className="text-[10px] text-black/30">Email</p>
                          <p className="text-sm font-medium text-black">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm"><Phone size={16} weight="duotone" /></div>
                        <div>
                          <p className="text-[10px] text-black/30">Phone</p>
                          <p className="text-sm font-medium text-black">{user.phoneNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-medium text-black/30 uppercase tracking-widest pl-1">Account</p>
                    <div className="bg-[#FAFAFA] rounded-2xl p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm"><CalendarBlank size={16} weight="duotone" /></div>
                        <div>
                          <p className="text-[10px] text-black/30">Joined</p>
                          <p className="text-sm font-medium text-black">{format(new Date(user.createdAt), "MMMM dd, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm"><ShieldCheck size={16} weight="duotone" /></div>
                        <div>
                          <p className="text-[10px] text-black/30">Status</p>
                          <AdminBadge variant={user.status === 'ACTIVE' ? 'success' : 'error'}>{user.status}</AdminBadge>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Identity & Financials */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-3">
                    <p className="text-[10px] font-medium text-black/30 uppercase tracking-widest pl-1">Identity</p>
                    <div className="bg-[#FAFAFA] rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-black/40">NIN Status</p>
                        <AdminBadge variant={user.ninStatus === 'VERIFIED' ? 'success' : 'warning'}>{user.ninStatus}</AdminBadge>
                      </div>
                      {user.ninNumber && (
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-black/40">NIN Number</p>
                          <p className="text-xs font-bold font-mono text-black">
                            {"•••••••" + user.ninNumber.slice(-4)}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-black/40">Verified</p>
                        <p className="text-xs font-bold text-black">{user.isVerified ? 'YES' : 'NO'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-medium text-black/30 uppercase tracking-widest pl-1">Wallet</p>
                    <div className="bg-[#FAFAFA] rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Wallet size={14} weight="duotone" className="text-black/30" />
                          <p className="text-xs text-black/40">Balance</p>
                        </div>
                        <p className="text-sm font-bold text-black">₦{user.walletBalance?.toLocaleString() || '0.00'}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} weight="duotone" className="text-black/30" />
                          <p className="text-xs text-black/40">Escrow</p>
                        </div>
                        <p className="text-sm font-bold text-black/40">₦{user.lockedBalance?.toLocaleString() || '0.00'}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* About / Bio */}
                <section className="space-y-3 text-left">
                  <p className="text-[10px] font-medium text-black/30 uppercase tracking-widest pl-1">About</p>
                  <div className="bg-[#FAFAFA] rounded-2xl p-5 border border-black/[0.03]">
                     <p className="text-sm leading-relaxed italic text-black/40">
                        {user.bio || "No bio provided."}
                     </p>
                  </div>
                </section>

                {/* Agent Specific: Bees */}
                {user.role === 'AGENT' && (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between pl-1">
                      <p className="text-[10px] font-medium text-black/30 uppercase tracking-widest">Services</p>
                      <AdminBadge variant="primary">{user.bees?.length || 0} Listed</AdminBadge>
                    </div>
                    
                    {user.bees && user.bees.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user.bees.map((bee: any) => (
                          <div key={bee.id} className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm hover:border-primary/50 transition-colors group relative">
                            <button 
                              onClick={() => setDeleteModal(bee.id)}
                              disabled={loading === `bee-${bee.id}`}
                              className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-error/5 text-error opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-error hover:text-white"
                            >
                              {loading === `bee-${bee.id}` ? <SpinnerGap size={12} weight="bold" className="animate-spin" /> : <Trash size={12} weight="bold" />}
                            </button>
                            <div className="flex justify-between items-start mb-2 pr-6">
                              <p className="text-sm font-bold text-black group-hover:text-primary transition-colors">{bee.title}</p>
                              <p className="text-xs font-bold text-primary">₦{parseFloat(bee.price).toLocaleString()}</p>
                            </div>
                            <p className="text-xs text-black/40 line-clamp-2 mb-3">{bee.description}</p>
                            <div className="flex items-center gap-2">
                              <AdminBadge variant="info" className="text-[9px] py-0.5">{bee.category}</AdminBadge>
                              {bee.offersInspection && <AdminBadge variant="success" className="text-[9px] py-0.5">Inspection Available</AdminBadge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#FAFAFA] rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-black/10">
                        <Briefcase size={32} weight="duotone" className="text-black/15" />
                        <p className="text-xs text-black/30">No services listed yet.</p>
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 md:p-8 border-t border-black/5 bg-[#FAFAFA] flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-white transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={handleRequestAudit}
                  disabled={loading === 'audit'}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading === 'audit' ? <SpinnerGap size={16} weight="bold" className="animate-spin" /> : <Fingerprint size={16} weight="bold" />}
                  Re-verify
                </button>
                <button 
                  onClick={() => setBlockModal(true)}
                  disabled={loading === 'blocking'}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 ${user.status === 'ACTIVE' ? 'bg-error' : 'bg-success'}`}
                >
                  {loading === 'blocking' ? <SpinnerGap size={16} weight="bold" className="animate-spin" /> : <ShieldWarning size={16} weight="bold" />}
                  {user.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Block/Suspend Consent Modal */}
      <AdminConsentModal
        isOpen={blockModal}
        onClose={() => setBlockModal(false)}
        onConfirm={handleToggleBlock}
        title={user.status === 'ACTIVE' ? 'Suspend this user?' : 'Reactivate this user?'}
        description={`This will immediately ${user.status === 'ACTIVE' ? 'revoke' : 'restore'} access for ${user.firstName} ${user.lastName}.`}
        confirmLabel={user.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
        variant={user.status === 'ACTIVE' ? 'danger' : 'primary'}
        loading={loading === 'blocking'}
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
        loading={loading?.startsWith('bee-') || false}
      />
    </>
  );
};
