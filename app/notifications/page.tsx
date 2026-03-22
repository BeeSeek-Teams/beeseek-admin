"use client";

import React, { useState } from "react";
import { 
  Send, 
  Users, 
  User, 
  AlertTriangle,
  Megaphone,
  RefreshCcw,
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminInput } from "@/components/AdminInput";
import { AdminTextArea } from "@/components/AdminTextArea";
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
    targetType: "ALL",
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
      
      toast.success("Notification sent successfully!");
      
      setFormData(prev => ({
        ...prev,
        title: "",
        message: ""
      }));
    } catch (error: any) {
      console.error("Failed to send notification:", error);
      toast.error(error.response?.data?.message || "Failed to send notification.");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const isFormValid = formData.title && formData.message && 
    (formData.targetType !== "INDIVIDUAL" || formData.targetUserId);

  const targetLabel = formData.targetType === "ALL" 
    ? "all users" 
    : formData.targetType === "ROLE" 
      ? `all ${formData.targetRole.toLowerCase()}s` 
      : `user ${formData.targetUserId}`;

  return (
    <div className="space-y-8 pb-20 max-w-4xl">
      <AdminHeader
        title="Send Notification"
        description="Send push notifications and in-app alerts to users."
      />

      {/* Compose */}
      <div className="bg-white border border-border/50 rounded-[32px] overflow-hidden shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Megaphone size={24} />
          </div>
          <div>
            <AdminText variant="bold" size="lg">Write Your Message</AdminText>
            <AdminText size="xs" color="secondary">This will be sent as both a push notification and an in-app alert.</AdminText>
          </div>
        </div>

        <div className="space-y-6">
          <AdminInput 
            label="Title" 
            placeholder="e.g. Important Update"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <AdminTextArea 
            label="Message" 
            placeholder="Write your message here..."
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />

          <div className="space-y-2">
            <label className="text-sm font-bold text-secondary ml-1">Notification Type</label>
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

      {/* Who to send to */}
      <div className="bg-white border border-border/50 rounded-[32px] overflow-hidden shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
            <Users size={24} />
          </div>
          <div>
            <AdminText variant="bold" size="lg">Who should receive this?</AdminText>
            <AdminText size="xs" color="secondary">Choose who gets the notification.</AdminText>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            {[
              { id: "ALL", label: "Everyone", icon: Megaphone },
              { id: "ROLE", label: "By Role", icon: Users },
              { id: "INDIVIDUAL", label: "One User", icon: User }
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
              <label className="text-sm font-bold text-secondary mb-3 block">Pick a role</label>
              <div className="flex gap-3">
                {["CLIENT", "AGENT"].map((role) => (
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
                    {role === "CLIENT" ? "Clients" : "Agents"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {formData.targetType === "INDIVIDUAL" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <AdminInput 
                label="User ID" 
                placeholder="Paste the user's ID here..."
                value={formData.targetUserId}
                onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
              />
              <AdminText size="xs" color="secondary" className="mt-2 ml-1">
                You can find user IDs on the Users page.
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
            Send Notification
          </AdminButton>
        </div>
      </div>

      {/* Warning */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
        <AdminText size="xs" color="secondary">
          <strong>Heads up:</strong> This sends a real push notification to real users. It cannot be undone. 
          Double-check your message and audience before sending.
        </AdminText>
      </div>

      <AdminConsentModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSend}
        title="Send this notification?"
        description={`You're about to send a ${formData.type === "SYSTEM" ? "system alert" : "promotional"} notification to ${targetLabel}. This will send both a push notification and an in-app alert. This cannot be undone.`}
        confirmLabel="Yes, Send It"
        cancelLabel="Cancel"
        variant="primary"
      />
    </div>
  );
}
