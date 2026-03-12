"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Calendar, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Package,
  Wrench,
  Navigation
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminBadge } from "@/components/AdminBadge";
import { toast } from "sonner";
import { getJob, Job, JobStatus, JobStep } from "@/lib/jobs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    } catch (err) {
      toast.error("Failed to load job details");
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
    { label: "Payment Escrowed", date: job?.paidAt, step: JobStep.ALL_SET },
    { label: "Materials Purchased", date: job?.materialsPurchasedAt, step: JobStep.MATERIALS_PURCHASED },
    { label: "Transit Started", date: job?.onTheWayAt, step: JobStep.ON_THE_WAY },
    { label: "Agent Arrived", date: job?.arrivedAt, step: JobStep.ARRIVED },
    { label: "Work Started", date: job?.startedAt, step: JobStep.STARTED },
    { label: "Work Finished", date: job?.finishedAt, step: JobStep.FINISHED },
    { label: "Agent Completed", date: job?.completedAt, step: JobStep.HOME_SAFE },
    { label: "Return Safe", date: job?.homeSafeAt, step: JobStep.HOME_SAFE },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-slate-50 rounded-[32px]" />
              <div className="h-96 bg-slate-50 rounded-[32px]" />
           </div>
           <div className="h-screen bg-slate-50 rounded-[32px]" />
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
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
             <AdminText variant="bold" size="xl">Job Details</AdminText>
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
          <AdminText size="xs" color="secondary">Case Ref: {job.id}</AdminText>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Contract Card */}
          <div className="bg-white border border-border/50 rounded-[32px] p-8 shadow-sm">
             <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/5 shadow-sm">
                      <Package size={32} />
                   </div>
                   <div>
                      <AdminText variant="bold" size="lg">{job.contract.details}</AdminText>
                      <div className="flex items-center gap-2">
                         <Calendar size={12} className="text-slate-400" />
                         <AdminText size="xs" color="secondary">{format(new Date(job.contract.workDate), "EEEE, MMM dd, yyyy")}</AdminText>
                         <AdminText size="xs" color="secondary" className="px-2 border-l border-slate-200">{job.contract.startTime}</AdminText>
                      </div>
                   </div>
                </div>
                <div className="text-right">
                   <AdminText size="xs" color="secondary" className="mb-1">Service Value</AdminText>
                   <AdminText variant="bold" size="xl" className="text-primary">{formatCurrency(displayTotal)}</AdminText>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8 mt-4">
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                       <MapPin size={16} className="text-primary" />
                       <AdminText variant="bold" size="sm">Service Location</AdminText>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:border-primary/20 transition-all">
                      <AdminText size="sm" className="mb-2 leading-relaxed">{job.contract.address}</AdminText>
                      <button className="flex items-center gap-1.5 text-primary text-[10px] uppercase font-bold tracking-wider">
                         <Navigation size={10} />
                         View Coordination Map
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                       <Info size={16} className="text-primary" />
                       <AdminText variant="bold" size="sm">Access Protocol</AdminText>
                   </div>
                   <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 shadow-lg shadow-slate-200">
                      <AdminText size="xs" className="text-white/60 mb-1">Arrival Code (Client Secure Pin)</AdminText>
                      <AdminText variant="bold" size="xl" className="text-white tracking-[0.5em] font-mono">{job.arrivalCode}</AdminText>
                   </div>
                </div>
             </div>
          </div>

          {/* Forensics / Timeline Section */}
          <div className="bg-white border border-border/50 rounded-[32px] p-8 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                <ShieldCheck size={200} />
             </div>
             <AdminText variant="bold" size="lg" className="mb-8 flex items-center gap-2">
                <ShieldCheck className="text-primary" />
                Legal Forensic Timeline
             </AdminText>
             
             <div className="space-y-0">
                {forensics.map((point, i) => {
                   const isCompleted = !!point.date;
                   return (
                      <div key={i} className="flex gap-6 pb-8 last:pb-0 relative group">
                         {i !== forensics.length - 1 && (
                            <div className={cn(
                               "absolute left-[13px] top-[26px] bottom-0 w-0.5",
                               isCompleted ? "bg-primary" : "bg-slate-100"
                            )} />
                         )}
                         <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500",
                            isCompleted ? "bg-primary border-primary text-white scale-110" : "bg-white border-slate-200 text-slate-300"
                         )}>
                            {isCompleted ? <CheckCircle2 size={14} /> : i + 1}
                         </div>
                         <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                               <AdminText variant="bold" size="sm" className={cn(isCompleted ? "text-slate-900" : "text-slate-400")}>
                                  {point.label}
                               </AdminText>
                               {point.date && (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                                     <Clock size={10} className="text-slate-400" />
                                     <AdminText size="xs" className="text-[10px] font-mono">{format(new Date(point.date), "HH:mm:ss")}</AdminText>
                                  </div>
                               )}
                            </div>
                            {point.date ? (
                               <AdminText size="xs" color="secondary">{format(new Date(point.date), "PPP")}</AdminText>
                            ) : (
                               <AdminText size="xs" className="text-slate-300 italic">Pending execution...</AdminText>
                            )}
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>

          {/* Cancellation Info (If applicable) */}
          {job.status === JobStatus.CANCELLED && job.cancellationAudit && (
             <div className="bg-red-50 border border-red-100 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-start gap-4">
                   <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                      <XCircle size={24} />
                   </div>
                   <div>
                      <AdminText variant="bold" size="lg" className="text-red-900 mb-1">Termination Audit</AdminText>
                      <AdminText size="sm" className="text-red-700/80 leading-relaxed mb-6">
                         This job was terminated before completion. All financial reversals have been logged.
                      </AdminText>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-1">
                            <AdminText size="xs" className="text-red-900/50 uppercase font-bold">Reason for Cancellation</AdminText>
                            <AdminText variant="bold" className="text-red-900">{job.cancellationAudit.reason}</AdminText>
                         </div>
                         <div className="space-y-1">
                            <AdminText size="xs" className="text-red-900/50 uppercase font-bold">Category</AdminText>
                            <AdminBadge variant="error">{job.cancellationAudit.category}</AdminBadge>
                         </div>
                         <div className="space-y-1">
                            <AdminText size="xs" className="text-red-900/50 uppercase font-bold">Terminated By</AdminText>
                            <AdminText variant="bold" className="text-red-900">{job.cancellationAudit.cancelledBy.firstName} {job.cancellationAudit.cancelledBy.lastName}</AdminText>
                         </div>
                         <div className="space-y-1">
                            <AdminText size="xs" className="text-red-900/50 uppercase font-bold">Timestamp</AdminText>
                            <AdminText variant="bold" className="text-red-900">{format(new Date(job.cancellationAudit.createdAt), "PPP p")}</AdminText>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Party Details */}
          <div className="bg-white border border-border/50 rounded-[32px] p-6 shadow-sm overflow-hidden min-h-fit">
             <AdminText variant="bold" className="mb-6 flex items-center gap-2">
                <User size={18} className="text-primary" />
                Involved Parties
             </AdminText>
             
             <div className="space-y-6">
                <div>
                   <AdminText size="xs" color="secondary" className="mb-3 uppercase font-bold tracking-widest text-[8px]">The Client</AdminText>
                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                         {job.contract.client.firstName[0]}{job.contract.client.lastName[0]}
                      </div>
                      <div className="flex-1">
                         <AdminText variant="bold" size="sm">{job.contract.client.firstName} {job.contract.client.lastName}</AdminText>
                         <div className="flex items-center gap-3 mt-1">
                            <Phone size={10} className="text-slate-400" />
                            <AdminText size="xs" className="text-[10px] text-slate-500">{job.contract.client.phoneNumber}</AdminText>
                         </div>
                      </div>
                      <button className="text-primary hover:scale-110 transition-transform">
                         <Mail size={16} />
                      </button>
                   </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                   <AdminText size="xs" color="secondary" className="mb-3 uppercase font-bold tracking-widest text-[8px]">The Appointed Agent</AdminText>
                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/5 flex items-center justify-center font-bold text-primary">
                         {job.contract.agent.firstName[0]}{job.contract.agent.lastName[0]}
                      </div>
                      <div className="flex-1">
                         <AdminText variant="bold" size="sm">{job.contract.agent.firstName} {job.contract.agent.lastName}</AdminText>
                         <div className="flex items-center gap-3 mt-1">
                            <Phone size={10} className="text-slate-400" />
                            <AdminText size="xs" className="text-[10px] text-slate-500">{job.contract.agent.phoneNumber}</AdminText>
                         </div>
                      </div>
                      <button className="text-primary hover:scale-110 transition-transform">
                         <Mail size={16} />
                      </button>
                   </div>
                </div>
             </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-slate-50 border border-border/50 rounded-[32px] p-6 shadow-sm overflow-hidden">
             <AdminText variant="bold" className="mb-6 flex items-center gap-2 text-slate-800">
                <DollarSign size={18} className="text-slate-800" />
                Node Unit Economics
             </AdminText>
             
             <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                   <AdminText size="xs" color="secondary">Base Workmanship</AdminText>
                   <AdminText size="sm" variant="bold">{formatCurrency(job.contract.workmanshipCost)}</AdminText>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                   <AdminText size="xs" color="secondary">Logistics / Transport</AdminText>
                   <AdminText size="sm" variant="bold">{formatCurrency(job.contract.transportFare)}</AdminText>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                   <AdminText size="xs" color="secondary">Service Fee (Platform)</AdminText>
                   <AdminText size="sm" variant="bold" className="text-primary">{formatCurrency(job.contract.serviceFee)}</AdminText>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                   <AdminText size="xs" color="secondary">Agent Commission</AdminText>
                   <AdminText size="sm" variant="bold" className="text-amber-600">-{formatCurrency(job.contract.commissionAmount)}</AdminText>
                </div>
                <div className="flex justify-between items-center py-4 bg-white px-4 rounded-xl border border-slate-200 mt-6 shadow-sm">
                   <AdminText variant="bold" size="sm">Net Settlement</AdminText>
                   <AdminText variant="bold" size="md" className="text-slate-900">{formatCurrency(displayTotal)}</AdminText>
                </div>
             </div>
          </div>

          {/* Material Procurement (If available) */}
          {job.contract.materials && job.contract.materials.length > 0 && (
             <div className="bg-white border border-border/50 rounded-[32px] p-6 shadow-sm">
                <AdminText variant="bold" className="mb-6 flex items-center gap-2">
                   <Wrench size={18} className="text-primary" />
                   Material Inventory
                </AdminText>
                <div className="space-y-3">
                   {job.contract.materials.map((m, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                         <AdminText size="xs" variant="bold" className="text-slate-600 uppercase tracking-tight">{m.item}</AdminText>
                         <AdminText size="xs" variant="bold">{formatCurrency(m.cost)}</AdminText>
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
