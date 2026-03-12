"use client";

import React, { useState } from "react";
import { 
  Bell, 
  Send, 
  Users, 
  User, 
  ShieldAlert, 
  Megaphone,
  CheckCircle2,
  RefreshCcw,
  AlertTriangle
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminInput } from "@/components/AdminInput";
import { AdminTextArea } from "@/components/AdminTextArea";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminConsentModal } from "@/components/AdminConsentModal";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "SYSTEM",
    targetType: "ALL", // ALL, ROLE, INDIVIDUAL
    targetRole: "CLIENT",
    targetUserId: ""
  });

  const handleSend = async () => {
    setLoading(true);
    try {
      const payload: any = {
        title: formData.title,
        message: formData.message,
        type: formData.type.toLowerCase(),
      };

      if (formData.targetType === "ROLE") {
        payload.target = { role: formData.targetRole };
      } else if (formData.targetType === "INDIVIDUAL") {
        payload.target = { userId: formData.targetUserId };
      }

      await api.post('/admin/notifications/send', payload);
      
      toast.success("Notification broadcast initiated successfully.");
      
      // Reset form title and message
      setFormData(prev => ({
        ...prev,
        title: "",
        message: ""
      }));
    } catch (error: any) {
      console.error("Failed to send notification:", error);
      toast.error(error.response?.data?.message || "Failed to transmit notification.");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const isFormValid = formData.title && formData.message && 
    (formData.targetType !== "INDIVIDUAL" || formData.targetUserId);

  return (
    <div className="space-y-8 pb-20">
      <AdminHeader
        title="Broadcast Center"
        description="Dispatch system-wide alerts and push notifications to the BeeSeek network."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-border/50 rounded-[32px] overflow-hidden shadow-sm p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Megaphone size={24} />
              </div>
              <div>
                <AdminText variant="bold" size="lg">Compose Message</AdminText>
                <AdminText size="xs" color="secondary">Define the payload for your network broadcast.</AdminText>
              </div>
            </div>

            <div className="space-y-6">
              <AdminInput 
                label="Notification Title" 
                placeholder="e.g. System Maintenance Scheduled"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <AdminTextArea 
                label="Message Content" 
                placeholder="Enter detailed message..."
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary ml-1">Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-surface border border-border/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-plus-jakarta text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="SYSTEM">System Alert</option>
                    <option value="PROMO">Promotional</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border/50 rounded-[32px] overflow-hidden shadow-sm p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                <Users size={24} />
              </div>
              <div>
                <AdminText variant="bold" size="lg">Targeting Resolution</AdminText>
                <AdminText size="xs" color="secondary">Specify which nodes in the hive should receive this pulse.</AdminText>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                {[
                  { id: "ALL", label: "Broadcast to All", icon: Megaphone },
                  { id: "ROLE", label: "Target Roles", icon: Users },
                  { id: "INDIVIDUAL", label: "Single Node", icon: User }
                ].map((target) => (
                  <button
                    key={target.id}
                    onClick={() => setFormData({ ...formData, targetType: target.id })}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all",
                      formData.targetType === target.id 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "bg-white border-border/50 text-secondary hover:bg-surface"
                    )}
                  >
                    <target.icon size={16} />
                    <AdminText variant="bold" size="xs" className={formData.targetType === target.id ? "text-white" : "text-secondary"}>
                      {target.label}
                    </AdminText>
                  </button>
                ))}
              </div>

              {formData.targetType === "ROLE" && (
                <div className="p-6 bg-surface rounded-[24px] border border-border/30 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-bold text-secondary mb-3 block">Select Target Group</label>
                  <div className="flex gap-3">
                    {["CLIENT", "AGENT", "MODERATOR", "ADMIN"].map((role) => (
                      <button
                        key={role}
                        onClick={() => setFormData({ ...formData, targetRole: role })}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          formData.targetRole === role 
                            ? "bg-secondary text-white" 
                            : "bg-white border border-border/50 text-secondary"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.targetType === "INDIVIDUAL" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <AdminInput 
                    label="Target User ID" 
                    placeholder="Enter unique UUID..."
                    value={formData.targetUserId}
                    onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                  />
                  <AdminText size="xs" color="secondary" className="mt-2 ml-1 opacity-60">
                    Individual targeting requires the precise UUID of the destination node.
                  </AdminText>
                </div>
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-border/30">
              <AdminButton 
                variant="primary" 
                fullWidth 
                className="gap-2 h-14 rounded-2xl"
                disabled={!isFormValid || loading}
                onClick={() => setShowConfirmModal(true)}
              >
                {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Send size={18} />}
                Initiate Broadcast
              </AdminButton>
            </div>
          </div>
        </div>

        {/* Info & Stats Sidebar */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white">
            <ShieldAlert size={40} className="text-primary mb-6" />
            <AdminText variant="bold" size="lg" className="text-white mb-2">Protocol Warning</AdminText>
            <AdminText size="sm" className="text-white/60 leading-relaxed">
              Broadcasting involves sending both **In-App Notifications** and **Push Notifications** (FCM). 
              Ensure the payload complies with network policies. This action is irreversible.
            </AdminText>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <CheckCircle2 size={16} className="text-success" />
                <AdminText size="xs" className="text-white/80">FCM Tokens Optimized</AdminText>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <CheckCircle2 size={16} className="text-success" />
                <AdminText size="xs" className="text-white/80">Database Persistence Ready</AdminText>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border/50 rounded-[32px] p-8">
            <AdminText variant="bold" className="mb-4">System Status</AdminText>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <AdminText size="xs" color="secondary">Network Relay</AdminText>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <AdminText size="xs" variant="bold" className="text-success">ACTIVE</AdminText>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <AdminText size="xs" color="secondary">FCM Service</AdminText>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <AdminText size="xs" variant="bold" className="text-success">ONLINE</AdminText>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdminConsentModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSend}
        title="Execute Network Broadcast?"
        description={`You are about to transmit a ${formData.type} notification to ${
          formData.targetType === "ALL" ? "every active node" : 
          formData.targetType === "ROLE" ? `all ${formData.targetRole} nodes` : 
          `node ${formData.targetUserId}`
        }. This will trigger simultaneous push and in-app alerts.`}
        confirmLabel="Confirm Dispatch"
        cancelLabel="Discard"
        variant="primary"
      />
    </div>
  );
}
