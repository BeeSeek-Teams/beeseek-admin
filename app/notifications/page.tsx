"use client";

import React, { useState } from "react";
import {
  PaperPlaneTilt,
  UsersThree,
  User,
  Warning,
  Megaphone,
  SpinnerGap
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
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
      toast.success("Notification sent!");
      setFormData(prev => ({ ...prev, title: "", message: "" }));
    } catch (error: any) {
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
    <div className="space-y-6 md:space-y-8 pb-12 max-w-4xl">
      <AdminHeader
        title="Notifications"
        description="Send push notifications and in-app alerts to users."
      />

      {/* Compose */}
      <div className="bg-white border border-black/5 rounded-2xl p-6">
        <h3 className="text-sm font-black mb-5">Message</h3>

        <div className="space-y-5">
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
            <label className="text-xs font-bold text-black/40 ml-1">Type</label>
            <select
              className="w-full px-4 py-3 bg-black/[0.02] border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="SYSTEM">System Alert</option>
              <option value="PROMO">Promotional</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audience */}
      <div className="bg-white border border-black/5 rounded-2xl p-6">
        <h3 className="text-sm font-black mb-5">Audience</h3>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            {[
              { id: "ALL", label: "Everyone", Icon: Megaphone },
              { id: "ROLE", label: "By Role", Icon: UsersThree },
              { id: "INDIVIDUAL", label: "One User", Icon: User }
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setFormData({ ...formData, targetType: id })}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold transition-all",
                  formData.targetType === id
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-black/5 text-black/40 hover:bg-black/[0.02]"
                )}
              >
                <Icon size={16} weight="bold" />
                {label}
              </button>
            ))}
          </div>

          {formData.targetType === "ROLE" && (
            <div className="p-4 bg-black/[0.02] rounded-xl border border-black/5">
              <label className="text-xs font-bold text-black/40 mb-2 block">Pick a role</label>
              <div className="flex gap-2">
                {["CLIENT", "AGENT"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setFormData({ ...formData, targetRole: role })}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                      formData.targetRole === role
                        ? "bg-secondary text-white"
                        : "bg-white border border-black/5 text-black/40"
                    )}
                  >
                    {role === "CLIENT" ? "Clients" : "Agents"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {formData.targetType === "INDIVIDUAL" && (
            <div>
              <AdminInput
                label="User ID"
                placeholder="Paste the user's ID here..."
                value={formData.targetUserId}
                onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
              />
              <p className="text-[10px] text-black/20 mt-1.5 ml-1">You can find user IDs on the Users page.</p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-black/5">
          <button
            disabled={!isFormValid || loading}
            onClick={() => setShowConfirmModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <SpinnerGap size={18} weight="bold" className="animate-spin" /> : <PaperPlaneTilt size={18} weight="bold" />}
            Send Notification
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
        <Warning size={18} weight="fill" className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-black/40">
          <strong>Heads up:</strong> This sends a real push notification to real users. It cannot be undone.
          Double-check your message and audience before sending.
        </p>
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
        loading={loading}
      />
    </div>
  );
}
