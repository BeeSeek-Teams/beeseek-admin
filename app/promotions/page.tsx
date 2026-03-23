"use client";

import React, { useState, useEffect } from "react";
import {
  Ticket,
  Plus,
  ArrowClockwise,
  MagnifyingGlass,
  Trash,
  PencilSimple,
  CheckCircle,
  XCircle,
  GearSix,
  CalendarBlank,
  X,
  Percent,
  CurrencyNgn,
  SpinnerGap
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminInput } from "@/components/AdminInput";
import { AdminTextArea } from "@/components/AdminTextArea";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminConsentModal } from "@/components/AdminConsentModal";
import { toast } from "sonner";
import { Promotion, getPromotions, deletePromotion, createPromotion } from "@/lib/economics";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "PERCENTAGE_DISCOUNT" as Promotion['type'],
    value: 0,
    priority: 1,
    isActive: true,
    conditions: {
      dayOfWeek: "",
      minAmount: "",
      minRating: ""
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getPromotions();
      setPromotions(data);
      setFilteredPromotions(data);
    } catch (err) {
      toast.error("Couldn't load promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const conditions: any = {};
      if (formData.conditions.dayOfWeek) conditions.dayOfWeek = parseInt(formData.conditions.dayOfWeek);
      if (formData.conditions.minAmount) conditions.minAmount = parseInt(formData.conditions.minAmount);
      if (formData.conditions.minRating) conditions.minRating = parseFloat(formData.conditions.minRating);

      await createPromotion({
        ...formData,
        value: Number(formData.value),
        priority: Number(formData.priority),
        conditions
      });

      toast.success("Promotion created");
      setShowCreateModal(false);
      setFormData({
        name: "",
        description: "",
        type: "PERCENTAGE_DISCOUNT",
        value: 0,
        priority: 1,
        isActive: true,
        conditions: { dayOfWeek: "", minAmount: "", minRating: "" }
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to create promotion");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePromotion(deleteModal.id);
      toast.success("Promotion deleted");
      setDeleteModal({ open: false, id: "" });
      fetchData();
    } catch (err) {
      toast.error("Failed to delete promotion");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <SpinnerGap size={28} weight="bold" className="animate-spin text-primary/30" />
        <p className="text-sm text-black/25">Loading promotions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <AdminHeader
        title="Promotions"
        description="Manage fee waivers and discount rules for agents and clients."
      />

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] max-w-sm">
          <AdminInput
            placeholder="Search promotions..."
            value={searchQuery}
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              setSearchQuery(q);
              if (!q) {
                setFilteredPromotions(promotions);
              } else {
                setFilteredPromotions(promotions.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)));
              }
            }}
            icon={<MagnifyingGlass size={16} weight="bold" className="text-black/20" />}
          />
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
        >
          <ArrowClockwise size={16} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} weight="bold" />
          New Promotion
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/5 rounded-2xl overflow-hidden overflow-x-auto">
        <div className="min-w-[900px]">
          <AdminTable headers={["Promotion", "Type", "Conditions", "Priority", "Status", "Created", "Actions"]}>
            {promotions.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Ticket size={32} weight="duotone" className="text-black/10" />
                    <p className="text-sm font-bold text-black/25">No promotions yet</p>
                    <p className="text-xs text-black/15">Create one to get started.</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : filteredPromotions.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <MagnifyingGlass size={24} weight="duotone" className="text-black/10" />
                    <p className="text-sm text-black/25">No promotions match your search.</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              filteredPromotions.map((promo) => (
                <AdminTableRow key={promo.id}>
                  <AdminTableCell>
                    <div>
                      <p className="text-sm font-bold">{promo.name}</p>
                      <p className="text-[10px] text-black/20 line-clamp-1">{promo.description}</p>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="bg-black/[0.02] border border-black/5 px-2.5 py-1 rounded-lg w-fit">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">
                        {promo.type?.replace('_', ' ') || 'UNKNOWN'}
                      </span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex flex-col gap-0.5">
                      {Object.entries(promo.conditions || {}).map(([key, value]: any) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <GearSix size={10} weight="fill" className="text-black/15" />
                          <span className="text-[10px] text-black/30">
                            {key}: <span className="font-bold text-black/50">{String(value)}</span>
                          </span>
                        </div>
                      ))}
                      {(!promo.conditions || Object.keys(promo.conditions).length === 0) && (
                        <span className="text-[10px] italic text-black/15">No conditions</span>
                      )}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge variant="secondary">{promo.priority}</AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge variant={promo.isActive ? "success" : "secondary"}>
                      {promo.isActive ? "Active" : "Paused"}
                    </AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-1.5 text-black/20">
                      <CalendarBlank size={12} weight="fill" />
                      <span className="text-[10px]">{format(new Date(promo.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDeleteModal({ open: true, id: promo.id })}
                        className="p-2 hover:bg-red-50 rounded-lg text-black/20 hover:text-red-500 transition-colors"
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTable>
        </div>
      </div>

      {/* Delete Consent Modal */}
      <AdminConsentModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: "" })}
        onConfirm={handleDelete}
        title="Delete promotion?"
        description="This promotion will be permanently removed and can't be recovered."
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">New Promotion</h2>
                  <p className="text-xs text-black/30 mt-0.5">Set up a discount or fee waiver rule.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-black/[0.02] rounded-xl transition-colors"
                >
                  <X size={20} weight="bold" className="text-black/20" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <AdminInput
                      label="Name"
                      placeholder="e.g. Free Friday Service Fee"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <AdminTextArea
                      label="Description"
                      placeholder="Visible to agents and clients during checkout..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-black/40 ml-1">Type</label>
                    <select
                      className="w-full bg-black/[0.02] border border-black/5 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="PERCENTAGE_DISCOUNT">Percentage Discount (%)</option>
                      <option value="FLAT_DISCOUNT">Flat Discount (NGN)</option>
                      <option value="FEE_WAIVER">Full Fee Waiver</option>
                    </select>
                  </div>

                  <AdminInput
                    label={formData.type === 'PERCENTAGE_DISCOUNT' ? "Discount (%)" : "Value (NGN or N/A)"}
                    type="number"
                    disabled={formData.type === 'FEE_WAIVER'}
                    icon={formData.type === 'PERCENTAGE_DISCOUNT' ? <Percent size={16} weight="bold" className="text-black/20" /> : <CurrencyNgn size={16} weight="bold" className="text-black/20" />}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                  />

                  <div className="space-y-4 pt-4 border-t border-black/5 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <GearSix size={16} weight="fill" className="text-primary" />
                      <span className="text-sm font-bold">Conditions (Optional)</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <AdminInput
                        label="Day of Week (0-6)"
                        placeholder="5 for Friday"
                        type="number"
                        min="0"
                        max="6"
                        value={formData.conditions.dayOfWeek}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          conditions: { ...formData.conditions, dayOfWeek: e.target.value } 
                        })}
                      />
                      <AdminInput
                        label="Min Job Amount (NGN)"
                        placeholder="5000"
                        type="number"
                        value={formData.conditions.minAmount}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          conditions: { ...formData.conditions, minAmount: e.target.value } 
                        })}
                      />
                      <AdminInput
                        label="Min User Rating"
                        placeholder="4.5"
                        type="number"
                        step="0.1"
                        value={formData.conditions.minRating}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          conditions: { ...formData.conditions, minRating: e.target.value } 
                        })}
                      />
                    </div>
                  </div>

                  <AdminInput
                    label="Priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    required
                  />

                  <div className="flex items-center gap-3 pt-8">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.isActive}
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        formData.isActive ? "bg-primary" : "bg-black/10"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          formData.isActive ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                    <span className="text-sm font-bold">Active on creation</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-8">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border border-black/5 rounded-xl text-sm font-bold text-black/40 hover:bg-black/[0.02] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving && <SpinnerGap size={16} weight="bold" className="animate-spin" />}
                    Create Promotion
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
