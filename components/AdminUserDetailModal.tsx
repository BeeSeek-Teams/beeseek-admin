"use client";

import React from "react";
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Wallet, 
  Briefcase,
  User as UserIcon,
  Info,
  ShieldAlert,
  Fingerprint,
  Trash2,
  RefreshCcw
} from "lucide-react";
import { AdminText } from "./AdminText";
import { AdminButton } from "./AdminButton";
import { AdminBadge } from "./AdminBadge";
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

  if (!user) return null;

  const handleToggleBlock = async () => {
    const action = user.status === 'ACTIVE' ? 'suspend' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} ${user.firstName} ${user.lastName}? This will immediately affect their access.`)) return;
    
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
    }
  };

  const handleRequestAudit = async () => {
    try {
      setLoading('audit');
      // Set back to PENDING to force re-verification flow or REJECTED to force new upload
      // In this system, REJECTED forces them to see the error and retry
      await updateVerificationStatus(user.id, 'PENDING');
      toast.success("Identity audit requested. User must submit fresh verification details.");
      onUpdate?.();
      onClose();
    } catch (err) {
      toast.error("Failed to request identity audit");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteBee = async (beeId: string) => {
    if (!confirm("Are you sure you want to terminate this service listing? This action cannot be undone.")) return;
    
    try {
      setLoading(`bee-${beeId}`);
      await deleteBee(beeId);
      toast.success("Service listing terminated successfully");
      onUpdate?.();
      // We don't close the modal here, but we need to refresh the user data inside it
      // For now, let's just close it to be safe, or wait for the parent to refresh
    } catch (err) {
      toast.error("Failed to delete service listing");
    } finally {
      setLoading(null);
    }
  };

  return (
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
            className="relative w-full max-w-2xl h-full bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-border/50"
          >
            {/* Header */}
            <div className="p-8 border-b border-border/40 flex justify-between items-start">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-surface border border-border/20 flex items-center justify-center text-primary overflow-hidden shadow-inner">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={40} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <AdminText variant="bold" size="xl">{user.firstName} {user.lastName}</AdminText>
                    <AdminBadge variant={user.role === 'AGENT' ? 'primary' : 'info'}>{user.role}</AdminBadge>
                  </div>
                  <AdminText color="secondary" size="xs" className="font-mono">UUID: {user.id}</AdminText>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary hover:text-primary transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Core Information Grid */}
              <section className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <AdminText variant="bold" size="xs" color="secondary" className="uppercase tracking-widest pl-1">Primary Contact</AdminText>
                  <div className="bg-surface rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm"><Mail size={16} /></div>
                      <div>
                        <AdminText size="xs" color="secondary">Email Address</AdminText>
                        <AdminText variant="medium" size="sm">{user.email}</AdminText>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm"><Phone size={16} /></div>
                      <div>
                        <AdminText size="xs" color="secondary">Phone Number</AdminText>
                        <AdminText variant="medium" size="sm">{user.phoneNumber || 'Not provided'}</AdminText>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <AdminText variant="bold" size="xs" color="secondary" className="uppercase tracking-widest pl-1">Entity Status</AdminText>
                  <div className="bg-surface rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm"><Calendar size={16} /></div>
                      <div>
                        <AdminText size="xs" color="secondary">Joined On</AdminText>
                        <AdminText variant="medium" size="sm">{format(new Date(user.createdAt), "MMMM dd, yyyy")}</AdminText>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm"><ShieldCheck size={16} /></div>
                      <div>
                        <AdminText size="xs" color="secondary">Network Status</AdminText>
                        <AdminBadge variant={user.status === 'ACTIVE' ? 'success' : 'error'}>{user.status}</AdminBadge>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Identity & Financials */}
              <section className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <AdminText variant="bold" size="xs" color="secondary" className="uppercase tracking-widest pl-1">Identity Trust</AdminText>
                  <div className="bg-surface rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <AdminText size="xs" color="secondary">NIN Status</AdminText>
                      <AdminBadge variant={user.ninStatus === 'VERIFIED' ? 'success' : 'warning'}>{user.ninStatus}</AdminBadge>
                    </div>
                    {user.ninNumber && (
                      <div className="flex justify-between items-center">
                        <AdminText size="xs" color="secondary">NIN Number</AdminText>
                        <AdminText variant="bold" size="xs" className="font-mono">
                          {"•••••••" + user.ninNumber.slice(-4)}
                        </AdminText>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <AdminText size="xs" color="secondary">Biometrics Enabled</AdminText>
                      <AdminText variant="bold" size="xs">{user.isVerified ? 'YES' : 'NO'}</AdminText>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <AdminText variant="bold" size="xs" color="secondary" className="uppercase tracking-widest pl-1">Financial Hive</AdminText>
                  <div className="bg-surface rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Wallet size={14} className="text-secondary" />
                        <AdminText size="xs" color="secondary">Liquid Balance</AdminText>
                      </div>
                      <AdminText variant="bold" size="sm">₦{user.walletBalance?.toLocaleString() || '0.00'}</AdminText>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-secondary" />
                        <AdminText size="xs" color="secondary">Locked Escrow</AdminText>
                      </div>
                      <AdminText variant="bold" size="sm" color="secondary">₦{user.lockedBalance?.toLocaleString() || '0.00'}</AdminText>
                    </div>
                  </div>
                </div>
              </section>

              {/* About / Bio */}
              <section className="space-y-4 text-left">
                <AdminText variant="bold" size="xs" color="secondary" className="uppercase tracking-widest pl-1">Biography / About</AdminText>
                <div className="bg-surface rounded-2xl p-5 border border-border/20">
                   <AdminText size="sm" className="leading-relaxed italic text-secondary">
                      {user.bio || "No professional biography has been registered for this entity."}
                   </AdminText>
                </div>
              </section>

              {/* Agent Specific: Bees */}
              {user.role === 'AGENT' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between pl-1">
                    <AdminText variant="bold" size="xs" color="secondary" className="uppercase tracking-widest">Active Services (Bees)</AdminText>
                    <AdminBadge variant="primary">{user.bees?.length || 0} Listed</AdminBadge>
                  </div>
                  
                  {user.bees && user.bees.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {user.bees.map((bee: any) => (
                        <div key={bee.id} className="bg-white border border-border/40 rounded-2xl p-4 shadow-sm hover:border-primary/50 transition-colors group relative">
                          <button 
                            onClick={() => handleDeleteBee(bee.id)}
                            disabled={loading === `bee-${bee.id}`}
                            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-error/5 text-error opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-error hover:text-white"
                          >
                            {loading === `bee-${bee.id}` ? <RefreshCcw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                          <div className="flex justify-between items-start mb-2 pr-6">
                            <AdminText variant="bold" size="sm" className="group-hover:text-primary transition-colors">{bee.title}</AdminText>
                            <AdminText variant="bold" size="xs" className="text-primary">₦{parseFloat(bee.price).toLocaleString()}</AdminText>
                          </div>
                          <AdminText color="secondary" size="xs" className="line-clamp-2 mb-3">{bee.description}</AdminText>
                          <div className="flex items-center gap-2">
                            <AdminBadge variant="info" className="text-[9px] py-0.5">{bee.category}</AdminBadge>
                            {bee.offersInspection && <AdminBadge variant="success" className="text-[9px] py-0.5">Inspection Available</AdminBadge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-surface rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 opacity-60 border border-dashed border-border/50">
                      <Briefcase size={32} className="text-secondary/40" />
                      <AdminText color="secondary" size="xs">This agent has not deployed any 'Bees' (services) to the hive yet.</AdminText>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-border/40 bg-surface flex gap-4">
              <AdminButton 
                variant="outline" 
                fullWidth 
                onClick={onClose}
              >
                Close Overview
              </AdminButton>
              <AdminButton 
                variant="secondary" 
                fullWidth
                onClick={handleRequestAudit}
                loading={loading === 'audit'}
                icon={<Fingerprint size={16} />}
              >
                Identity Audit
              </AdminButton>
              <AdminButton 
                variant={user.status === 'ACTIVE' ? 'error' : 'success'} 
                fullWidth
                onClick={handleToggleBlock}
                loading={loading === 'blocking'}
                icon={<ShieldAlert size={16} />}
              >
                {user.status === 'ACTIVE' ? 'Force Termination' : 'Restore Account'}
              </AdminButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
