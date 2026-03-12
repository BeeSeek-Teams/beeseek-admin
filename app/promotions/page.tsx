"use client";

import React, { useState, useEffect } from "react";
import { 
  Ticket, 
  Plus, 
  RefreshCcw, 
  Search, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  XCircle,
  Settings2,
  Calendar,
  Zap,
  X,
  Percent,
  DollarSign,
  Briefcase
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminInput } from "@/components/AdminInput";
import { AdminTextArea } from "@/components/AdminTextArea";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
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
      toast.error("Failed to load promotions");
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
      
      // Clean up conditions
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

      toast.success("Promotion rule created successfully");
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
      toast.error("Failed to create promotion. Please check all fields.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await deletePromotion(id);
      toast.success("Promotion deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete promotion");
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse text-center">
            <RefreshCcw className="animate-spin mx-auto text-primary" size={32} />
            <AdminText color="secondary">Loading promotion rules...</AdminText>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <AdminHeader
        title="Promotions & Discounts"
        description="Manage wallet fee waivers and discount rules for agents and clients."
        action={
          <div className="flex gap-3">
             <AdminButton variant="outline" size="sm" onClick={fetchData}>
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
             </AdminButton>
             <AdminButton 
               variant="primary" 
               size="sm" 
               className="gap-2"
               onClick={() => setShowCreateModal(true)}
             >
                <Plus size={16} />
                New Promotion
             </AdminButton>
          </div>
        }
      />

      {/* Promotional Inventory */}
      <div className="bg-white border border-border/50 rounded-[32px] overflow-hidden shadow-sm overflow-x-auto min-w-full">
        <div className="min-w-[1200px]">
          <div className="p-6 border-b border-border/50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Zap size={18} />
                 </div>
                 <AdminText variant="bold">Active Rules Engine</AdminText>
            </div>
            <div className="flex items-center gap-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      placeholder="Search rules..." 
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
                      className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                 </div>
            </div>
        </div>

        <AdminTable headers={["Promotion Details", "Type", "Conditions", "Priority", "Status", "Created", "Actions"]}>
          {promotions.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell colSpan={7} className="text-center py-20">
                 <Ticket size={48} className="mx-auto text-slate-200 mb-4" />
                 <AdminText color="secondary">No promotion rules defined yet.</AdminText>
              </AdminTableCell>
            </AdminTableRow>
          ) : filteredPromotions.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell colSpan={7} className="text-center py-20">
                 <AdminText color="secondary">No promotions match your search.</AdminText>
              </AdminTableCell>
            </AdminTableRow>
          ) : (
            filteredPromotions.map((promo) => (
              <AdminTableRow key={promo.id}>
                <AdminTableCell className="py-6">
                  <div className="flex flex-col gap-1">
                    <AdminText variant="bold" size="sm">{promo.name}</AdminText>
                    <AdminText size="xs" color="secondary" className="line-clamp-1">{promo.description}</AdminText>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                   <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl w-fit">
                      <AdminText size="xs" variant="bold" className="text-[10px] uppercase tracking-wider">
                        {promo.type?.replace('_', ' ') || 'UNKNOWN'}
                      </AdminText>
                   </div>
                </AdminTableCell>
                <AdminTableCell>
                   <div className="flex flex-col gap-1">
                      {Object.entries(promo.conditions || {}).map(([key, value]: any) => (
                        <div key={key} className="flex items-center gap-1.5">
                           <Settings2 size={10} className="text-slate-400" />
                           <AdminText size="xs" className="text-[10px] text-slate-600">
                             {key}: <span className="font-bold">{String(value)}</span>
                           </AdminText>
                        </div>
                      ))}
                      {(!promo.conditions || Object.keys(promo.conditions).length === 0) && (
                        <AdminText size="xs" color="secondary" className="italic text-[10px]">No conditions</AdminText>
                      )}
                   </div>
                </AdminTableCell>
                <AdminTableCell>
                    <AdminBadge variant="secondary" className="font-mono">{promo.priority}</AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={promo.isActive ? "success" : "secondary"} className="gap-1 px-3 py-1 rounded-full border-none">
                    {promo.isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {promo.isActive ? "Active" : "Paused"}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                   <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={12} />
                      <AdminText size="xs" className="text-[10px]">{format(new Date(promo.createdAt), "MMM dd, yyyy")}</AdminText>
                   </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(promo.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))
          )}
        </AdminTable>
        </div>
      </div>

       {/* Quick Setup Guide / Concept Alert */}
       <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                     <Settings2 size={32} className="text-white" />
                </div>
                <div className="flex-1">
                     <AdminText variant="bold" size="lg" className="text-white mb-1">How the Rules Engine Works</AdminText>
                     <AdminText size="sm" className="text-white/60">
                        The Promotion Rule Evaluator iterates through all active rules by priority. 
                        The first rule where all conditions match the user session is applied automatically.
                     </AdminText>
                </div>
                <div className="flex flex-wrap gap-2 max-w-xs justify-center md:justify-end">
                     <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-lg text-[10px] font-bold">dayOfWeek: 5 (Friday)</span>
                     <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-lg text-[10px] font-bold">minAmount: 50000</span>
                     <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-lg text-[10px] font-bold">minRating: 4.8</span>
                </div>
           </div>
       </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Ticket size={24} />
                  </div>
                  <div>
                    <AdminText variant="bold" size="lg">Create Promotion Rule</AdminText>
                    <AdminText size="xs" color="secondary">Configure a new loyalty or incentive rule.</AdminText>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white rounded-xl border border-slate-200 shadow-sm transition-all"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <AdminInput
                      label="Rule Name"
                      placeholder="e.g. Free Friday Service Fee"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <AdminTextArea
                      label="Public Description"
                      placeholder="Visible to agents and clients during checkout..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground ml-1">Reward Type</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="PERCENTAGE_DISCOUNT">Percentage Discount (%)</option>
                      <option value="FLAT_DISCOUNT">Flat Rebate (NGN)</option>
                      <option value="FEE_WAIVER">Complete Fee Waiver (Free)</option>
                    </select>
                  </div>

                  <AdminInput
                    label={formData.type === 'PERCENTAGE_DISCOUNT' ? "Discount (%)" : "Value (NGN or N/A)"}
                    type="number"
                    disabled={formData.type === 'FEE_WAIVER'}
                    icon={formData.type === 'PERCENTAGE_DISCOUNT' ? <Percent size={16} /> : <DollarSign size={16} />}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                  />

                  <div className="space-y-6 pt-4 border-t border-slate-100 md:col-span-2">
                    <div className="flex items-center gap-2">
                       <Settings2 size={16} className="text-primary" />
                       <AdminText variant="bold" size="sm">Rule Conditions (Optional)</AdminText>
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
                    label="Internal Priority (Weight)"
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
                        formData.isActive ? "bg-primary" : "bg-slate-200"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          formData.isActive ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                    <AdminText size="sm" variant="bold">Set Rule as Active</AdminText>
                  </div>
                </div>

                <div className="flex gap-4 pt-10">
                  <AdminButton
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </AdminButton>
                  <AdminButton
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    loading={isSaving}
                  >
                    Activate Rule
                  </AdminButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
