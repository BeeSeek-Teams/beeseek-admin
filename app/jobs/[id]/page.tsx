"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  CalendarBlank, 
  ShieldCheck, 
  CheckCircle,
  XCircle,
  WarningCircle,
  Phone,
  CurrencyDollar,
  Package,
  Wrench,
  Copy,
} from "@phosphor-icons/react";
import { useRouter, useParams } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminBadge } from "@/components/AdminBadge";
import { toast } from "sonner";
import { getJob, Job, JobStatus, JobStep } from "@/lib/jobs";
import { format } from "date-fns";

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const data = await getJob(id as string);
      setJob(data);
    } catch {
      toast.error("Couldn't load job details");
      router.push("/jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const formatCurrency = (amountKobo: any) => {
    const amount = Number(amountKobo || 0);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount / 100);
  };

  const forensics = [
    { label: "Payment Held", date: job?.paidAt, step: JobStep.ALL_SET },
    { label: "Materials Bought", date: job?.materialsPurchasedAt, step: JobStep.MATERIALS_PURCHASED },
    { label: "On the Way", date: job?.onTheWayAt, step: JobStep.ON_THE_WAY },
    { label: "Arrived", date: job?.arrivedAt, step: JobStep.ARRIVED },
    { label: "Work Started", date: job?.startedAt, step: JobStep.STARTED },
    { label: "Work Done", date: job?.finishedAt, step: JobStep.FINISHED },
    { label: "Job Completed", date: job?.completedAt, step: JobStep.HOME_SAFE },
    { label: "Home Safe", date: job?.homeSafeAt, step: JobStep.HOME_SAFE },
  ];

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

  if (!job) return null;

  const calculatedTotal = (
    Number(job.contract.workmanshipCost || 0) + 
    Number(job.contract.transportFare || 0) + 
    Number(job.contract.serviceFee || 0) + 
    (job.contract.materials?.reduce((sum, m) => sum + Number(m.cost || 0), 0) || 0)
  );
  const displayTotal = job.contract.totalAmount > 0 ? job.contract.totalAmount : calculatedTotal;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-black/[0.03] rounded-xl transition-colors">
          <ArrowLeft size={18} weight="bold" className="text-black/40" />
        </button>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-black text-primary">Job Details</h1>
            <AdminBadge variant={
              job.status === JobStatus.COMPLETED ? "success" : 
              job.status === JobStatus.CANCELLED ? "error" : 
              job.status === JobStatus.ESCALATED ? "error" :
              job.status === JobStatus.ACTIVE ? "primary" :
              "secondary"
            }>
              {job.status}
            </AdminBadge>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-[10px] font-mono text-black/25">{job.id}</p>
            <button onClick={() => { navigator.clipboard.writeText(job.id); toast.success("Copied"); }} className="text-black/20 hover:text-primary transition-colors">
              <Copy size={10} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Contract Card */}
          <div className="bg-white border border-black/5 rounded-2xl p-5 md:p-6 space-y-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package size={24} weight="duotone" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">{job.contract.details}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarBlank size={12} weight="bold" className="text-black/20" />
                    <p className="text-[10px] font-bold text-black/25">{format(new Date(job.contract.workDate), "EEEE, MMM dd, yyyy")}</p>
                    <span className="text-black/10">·</span>
                    <p className="text-[10px] font-bold text-black/25">{job.contract.startTime}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-black/25">TOTAL VALUE</p>
                <p className="text-xl font-black text-primary">{formatCurrency(displayTotal)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-black/[0.03] pt-5">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} weight="bold" className="text-primary" />
                  <p className="text-xs font-bold text-black/40">Location</p>
                </div>
                <div className="p-3 bg-black/[0.02] rounded-xl">
                  <p className="text-xs text-black/40 leading-relaxed">{job.contract.address}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-black/40">Arrival Code</p>
                <div className="p-3 bg-primary rounded-xl">
                  <p className="text-lg font-black text-white tracking-[0.4em] font-mono text-center">{job.arrivalCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-black/5 rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} weight="duotone" className="text-primary" />
              <p className="text-sm font-black text-primary">Job Timeline</p>
            </div>
             
            <div className="space-y-0">
              {forensics.map((point, i) => {
                const isCompleted = !!point.date;
                return (
                  <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                    {i !== forensics.length - 1 && (
                      <div className={`absolute left-[11px] top-[24px] bottom-0 w-px ${isCompleted ? "bg-primary/30" : "bg-black/[0.04]"}`} />
                    )}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 text-[10px] font-bold shrink-0 ${
                      isCompleted 
                        ? "bg-primary text-white" 
                        : "bg-black/[0.04] text-black/20"
                    }`}>
                      {isCompleted ? <CheckCircle size={14} weight="fill" /> : i + 1}
                    </div>
                    <div className="flex-1 flex items-center justify-between min-h-[24px]">
                      <p className={`text-xs font-bold ${isCompleted ? "text-black/60" : "text-black/20"}`}>
                        {point.label}
                      </p>
                      {point.date && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} weight="bold" className="text-black/15" />
                          <p className="text-[10px] font-mono text-black/25">{format(new Date(point.date), "HH:mm · MMM dd")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cancellation Info */}
          {job.status === JobStatus.CANCELLED && job.cancellationAudit && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-red-100 rounded-xl text-red-600">
                  <XCircle size={20} weight="fill" />
                </div>
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-sm font-black text-red-900">Job Cancelled</p>
                    <p className="text-xs text-red-700/60 mt-1">All payments have been reversed.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white/60 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-red-900/40">REASON</p>
                      <p className="text-xs font-bold text-red-900 mt-1">{job.cancellationAudit.reason}</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-red-900/40">CATEGORY</p>
                      <div className="mt-1"><AdminBadge variant="error">{job.cancellationAudit.category}</AdminBadge></div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-red-900/40">CANCELLED BY</p>
                      <p className="text-xs font-bold text-red-900 mt-1">{job.cancellationAudit.cancelledBy.firstName} {job.cancellationAudit.cancelledBy.lastName}</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-red-900/40">WHEN</p>
                      <p className="text-xs font-bold text-red-900 mt-1">{format(new Date(job.cancellationAudit.createdAt), "PPP p")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* People */}
          <div className="bg-white border border-black/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <User size={16} weight="duotone" className="text-primary" />
              <p className="text-sm font-black text-primary">People</p>
            </div>
             
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-black/25 mb-2">CLIENT</p>
                <div className="flex items-center gap-3 bg-black/[0.02] p-3 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-xs font-black text-black/30">
                    {job.contract.client.firstName[0]}{job.contract.client.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-black/60">{job.contract.client.firstName} {job.contract.client.lastName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone size={10} weight="bold" className="text-black/15" />
                      <p className="text-[10px] text-black/25">{job.contract.client.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-black/25 mb-2">AGENT</p>
                <div className="flex items-center gap-3 bg-primary/[0.04] p-3 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/5 flex items-center justify-center text-xs font-black text-primary">
                    {job.contract.agent.firstName[0]}{job.contract.agent.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-black/60">{job.contract.agent.firstName} {job.contract.agent.lastName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone size={10} weight="bold" className="text-black/15" />
                      <p className="text-[10px] text-black/25">{job.contract.agent.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white border border-black/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CurrencyDollar size={16} weight="duotone" className="text-primary" />
              <p className="text-sm font-black text-primary">Payment Breakdown</p>
            </div>
             
            <div className="space-y-0">
              {[
                { label: "Workmanship", value: formatCurrency(job.contract.workmanshipCost) },
                { label: "Transport", value: formatCurrency(job.contract.transportFare) },
                { label: "Service Fee", value: formatCurrency(job.contract.serviceFee), highlight: true },
                { label: "Commission", value: `-${formatCurrency(job.contract.commissionAmount)}`, warn: true },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-black/[0.03] last:border-0">
                  <p className="text-xs text-black/30">{row.label}</p>
                  <p className={`text-xs font-bold ${row.highlight ? "text-primary" : row.warn ? "text-amber-600" : "text-black/60"}`}>{row.value}</p>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 bg-black/[0.02] px-3 rounded-xl mt-3">
                <p className="text-xs font-black text-black/40">Total</p>
                <p className="text-sm font-black text-primary">{formatCurrency(displayTotal)}</p>
              </div>
            </div>
          </div>

          {/* Materials */}
          {job.contract.materials && job.contract.materials.length > 0 && (
            <div className="bg-white border border-black/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wrench size={16} weight="duotone" className="text-primary" />
                <p className="text-sm font-black text-primary">Materials</p>
              </div>
              <div className="space-y-2">
                {job.contract.materials.map((m, i) => (
                  <div key={i} className="flex justify-between items-center py-2 px-3 bg-black/[0.02] rounded-xl">
                    <p className="text-xs font-bold text-black/40">{m.item}</p>
                    <p className="text-xs font-bold text-black/60">{formatCurrency(m.cost)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
