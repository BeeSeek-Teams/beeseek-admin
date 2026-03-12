"use client";

import React, { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock,
  AlertCircle,
  ShieldCheck,
  RefreshCcw,
  Search
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { getPendingVerifications, updateVerificationStatus, PendingVerification } from "@/lib/verifications";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const data = await getPendingVerifications();
      setVerifications(data);
      setFilteredVerifications(data);
    } catch (error) {
      toast.error("Failed to fetch pending verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleUpdateStatus = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      setProcessingId(userId);
      await updateVerificationStatus(userId, status);
      toast.success(`User ${status === 'VERIFIED' ? 'approved' : 'rejected'} successfully`);
      // Remove from list
      setVerifications(prev => prev.filter(v => v.id !== userId));
      setFilteredVerifications(prev => prev.filter(v => v.id !== userId));
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(e.target.value);
    if (!query) {
      setFilteredVerifications(verifications);
    } else {
      setFilteredVerifications(
        verifications.filter(
          (v) =>
            v.firstName?.toLowerCase().includes(query) ||
            v.lastName?.toLowerCase().includes(query) ||
            v.ninNumber?.toLowerCase().includes(query)
        )
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <AdminHeader 
          title="Verification Queue" 
          description="Review and approve identity verification requests from users."
        />
        <AdminButton 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={fetchVerifications}
          disabled={loading}
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </AdminButton>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border/50 p-6 rounded-[24px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div className="flex items-center gap-3">
            <AdminText variant="bold" size="xl">{filteredVerifications.length}</AdminText>
            <AdminText color="secondary" size="xs">Pending Review</AdminText>
          </div>
        </div>
        <div className="bg-white border border-border/50 p-6 rounded-[24px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
             <ShieldCheck size={24} />
          </div>
          <div>
            <AdminText variant="bold" size="xl">Real-time</AdminText>
            <AdminText color="secondary" size="xs">Live Verification Hive</AdminText>
          </div>
        </div>
        <div className="bg-white border border-border/50 p-6 rounded-[24px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-error/10 text-error rounded-2xl flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <AdminText variant="bold" size="xl">Strict</AdminText>
            <AdminText color="secondary" size="xs">Compliance Enforced</AdminText>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/40 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input 
              type="text" 
              placeholder="Search by name or NIN..." 
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-surface border-none rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <AdminTable headers={["Date Submitted", "User Information", "Document No.", "Status", "Actions"]}>
          {loading ? (
            <AdminTableRow>
              <AdminTableCell colSpan={5}>
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <RefreshCcw size={32} className="animate-spin text-primary/40" />
                  <AdminText color="secondary" size="sm">Fetching verifications...</AdminText>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : filteredVerifications.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell colSpan={5}>
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-secondary/40">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <AdminText variant="bold">All Caught Up!</AdminText>
                    <AdminText color="secondary" size="xs">There are no pending identity verifications at the moment.</AdminText>
                  </div>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : (
            filteredVerifications.map((v) => (
              <AdminTableRow key={v.id}>
                <AdminTableCell>
                  <AdminText size="xs" color="secondary">
                    {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                  </AdminText>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface border border-border/20 overflow-hidden flex items-center justify-center">
                      {v.profileImage ? (
                        <img src={v.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <AdminText variant="bold" size="xs">{v.firstName[0]}{v.lastName[0]}</AdminText>
                      )}
                    </div>
                    <div>
                      <AdminText variant="bold" size="sm">{v.firstName} {v.lastName}</AdminText>
                      <AdminText color="secondary" size="xs">{v.email}</AdminText>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-surface rounded text-[10px] font-mono border border-border/40">
                      NIN: •••••••{v.ninNumber?.slice(-4) || '****'}
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant="warning">{v.ninStatus}</AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    <AdminButton 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </AdminButton>
                    <AdminButton 
                      variant="primary" 
                      size="sm" 
                      className="h-8 py-0 gap-1.5"
                      onClick={() => handleUpdateStatus(v.id, 'VERIFIED')}
                      disabled={!!processingId}
                    >
                      {processingId === v.id ? <RefreshCcw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Approve
                    </AdminButton>
                    <AdminButton 
                      variant="secondary" 
                      size="sm" 
                      className="h-8 py-0 gap-1.5"
                      onClick={() => handleUpdateStatus(v.id, 'REJECTED')}
                      disabled={!!processingId}
                    >
                      {processingId === v.id ? <RefreshCcw size={14} className="animate-spin" /> : <XCircle size={14} />}
                      Reject
                    </AdminButton>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))
          )}
        </AdminTable>
      </div>
    </div>
  );
}
