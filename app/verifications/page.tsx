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
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Smartphone,
  Globe,
  Calendar,
  Hash,
  Mail,
  Shield,
  ShieldAlert,
  ShieldOff
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { getPendingVerifications, updateVerificationStatus, runBackgroundCheck, PendingVerification, BackgroundCheckResult, ScreeningMatch } from "@/lib/verifications";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bgCheckResults, setBgCheckResults] = useState<Record<string, BackgroundCheckResult>>({});
  const [bgCheckLoading, setBgCheckLoading] = useState<string | null>(null);
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

  const handleBackgroundCheck = async (userId: string) => {
    try {
      setBgCheckLoading(userId);
      const result = await runBackgroundCheck(userId);
      setBgCheckResults(prev => ({ ...prev, [userId]: result }));
      if (result.success) {
        toast.success(`Background check complete — ${result.nameMatch?.confidence}% name match`);
      } else {
        toast.error(`Background check failed: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Background check failed");
    } finally {
      setBgCheckLoading(null);
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
              <React.Fragment key={v.id}>
              <AdminTableRow onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}>
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
                      title={expandedId === v.id ? "Collapse" : "Expand Details"}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setExpandedId(expandedId === v.id ? null : v.id);
                      }}
                    >
                      {expandedId === v.id ? <ChevronUp size={14} /> : <Eye size={14} />}
                    </AdminButton>
                    <AdminButton 
                      variant="primary" 
                      size="sm" 
                      className="h-8 py-0 gap-1.5"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleUpdateStatus(v.id, 'VERIFIED'); }}
                      disabled={!!processingId}
                    >
                      {processingId === v.id ? <RefreshCcw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Approve
                    </AdminButton>
                    <AdminButton 
                      variant="secondary" 
                      size="sm" 
                      className="h-8 py-0 gap-1.5"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleUpdateStatus(v.id, 'REJECTED'); }}
                      disabled={!!processingId}
                    >
                      {processingId === v.id ? <RefreshCcw size={14} className="animate-spin" /> : <XCircle size={14} />}
                      Reject
                    </AdminButton>
                  </div>
                </AdminTableCell>
              </AdminTableRow>

              {/* Expanded Detail Row */}
              {expandedId === v.id && (
                <tr>
                  <td colSpan={5} className="px-6 py-0">
                    <div className="bg-surface/50 border border-border/30 rounded-2xl p-6 my-3 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Identity */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield size={16} className="text-primary" />
                            <AdminText variant="bold" size="sm">Identity</AdminText>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Hash size={14} className="text-secondary mt-0.5 shrink-0" />
                              <div>
                                <AdminText size="xs" color="secondary">Full NIN</AdminText>
                                <AdminText variant="bold" size="sm" className="font-mono">{v.ninNumber || 'N/A'}</AdminText>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <User size={14} className="text-secondary mt-0.5 shrink-0" />
                              <div>
                                <AdminText size="xs" color="secondary">Full Name</AdminText>
                                <AdminText variant="bold" size="sm">{v.firstName} {v.lastName}</AdminText>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Mail size={14} className="text-secondary mt-0.5 shrink-0" />
                              <div>
                                <AdminText size="xs" color="secondary">Email</AdminText>
                                <AdminText size="sm">{v.email}</AdminText>
                              </div>
                            </div>
                            {v.phone && (
                              <div className="flex items-start gap-3">
                                <Phone size={14} className="text-secondary mt-0.5 shrink-0" />
                                <div>
                                  <AdminText size="xs" color="secondary">Phone</AdminText>
                                  <AdminText size="sm">{v.phone}</AdminText>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Account Info */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <User size={16} className="text-primary" />
                            <AdminText variant="bold" size="sm">Account</AdminText>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <ShieldCheck size={14} className="text-secondary mt-0.5 shrink-0" />
                              <div>
                                <AdminText size="xs" color="secondary">Role</AdminText>
                                <AdminBadge variant={v.role === 'AGENT' ? 'info' : 'secondary'}>{v.role || 'N/A'}</AdminBadge>
                              </div>
                            </div>
                            {v.age && (
                              <div className="flex items-start gap-3">
                                <Calendar size={14} className="text-secondary mt-0.5 shrink-0" />
                                <div>
                                  <AdminText size="xs" color="secondary">Age</AdminText>
                                  <AdminText size="sm">{v.age}</AdminText>
                                </div>
                              </div>
                            )}
                            <div className="flex items-start gap-3">
                              <Calendar size={14} className="text-secondary mt-0.5 shrink-0" />
                              <div>
                                <AdminText size="xs" color="secondary">Submitted</AdminText>
                                <AdminText size="sm">{format(new Date(v.createdAt), 'PPpp')}</AdminText>
                              </div>
                            </div>
                            {v.lastLoginAt && (
                              <div className="flex items-start gap-3">
                                <Clock size={14} className="text-secondary mt-0.5 shrink-0" />
                                <div>
                                  <AdminText size="xs" color="secondary">Last Login</AdminText>
                                  <AdminText size="sm">{format(new Date(v.lastLoginAt), 'PPpp')}</AdminText>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Device Info */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Smartphone size={16} className="text-primary" />
                            <AdminText variant="bold" size="sm">Device</AdminText>
                          </div>
                          <div className="space-y-3">
                            {v.deviceType && (
                              <div className="flex items-start gap-3">
                                <Smartphone size={14} className="text-secondary mt-0.5 shrink-0" />
                                <div>
                                  <AdminText size="xs" color="secondary">Type</AdminText>
                                  <AdminText size="sm">{v.deviceType}</AdminText>
                                </div>
                              </div>
                            )}
                            {v.deviceModel && (
                              <div className="flex items-start gap-3">
                                <Smartphone size={14} className="text-secondary mt-0.5 shrink-0" />
                                <div>
                                  <AdminText size="xs" color="secondary">Model</AdminText>
                                  <AdminText size="sm">{v.deviceModel}</AdminText>
                                </div>
                              </div>
                            )}
                            {v.lastIpAddress && (
                              <div className="flex items-start gap-3">
                                <Globe size={14} className="text-secondary mt-0.5 shrink-0" />
                                <div>
                                  <AdminText size="xs" color="secondary">Last IP</AdminText>
                                  <AdminText size="sm" className="font-mono">{v.lastIpAddress}</AdminText>
                                </div>
                              </div>
                            )}
                            {!v.deviceType && !v.deviceModel && !v.lastIpAddress && (
                              <AdminText size="xs" color="secondary">No device info available</AdminText>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Background Check */}
                      <div className="mt-6 pt-4 border-t border-border/30">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Shield size={16} className="text-primary" />
                            <AdminText variant="bold" size="sm">AML / Criminal Screening</AdminText>
                          </div>
                          <AdminButton
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleBackgroundCheck(v.id); }}
                            disabled={!!bgCheckLoading}
                          >
                            {bgCheckLoading === v.id ? <RefreshCcw size={14} className="animate-spin" /> : <Shield size={14} />}
                            {bgCheckResults[v.id] ? 'Re-run Screening' : 'Run Screening'}
                          </AdminButton>
                        </div>

                        {bgCheckResults[v.id] && (
                          <div className={`rounded-xl border p-4 ${bgCheckResults[v.id].success ? (bgCheckResults[v.id].riskLevel === 'high' ? 'bg-error/5 border-error/20' : bgCheckResults[v.id].riskLevel === 'medium' ? 'bg-warning/5 border-warning/20' : 'bg-success/5 border-success/20') : 'bg-error/5 border-error/20'}`}>
                            {bgCheckResults[v.id].success ? (
                              <div className="space-y-4">
                                {/* Risk Level Header */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {bgCheckResults[v.id].riskLevel === 'high' ? (
                                      <ShieldAlert size={16} className="text-error" />
                                    ) : bgCheckResults[v.id].riskLevel === 'medium' ? (
                                      <ShieldAlert size={16} className="text-warning" />
                                    ) : (
                                      <ShieldCheck size={16} className="text-success" />
                                    )}
                                    <AdminText variant="bold" size="sm" className={bgCheckResults[v.id].riskLevel === 'high' ? 'text-error' : bgCheckResults[v.id].riskLevel === 'medium' ? 'text-warning' : 'text-success'}>
                                      {bgCheckResults[v.id].riskLevel === 'high' ? 'High Risk' : bgCheckResults[v.id].riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'} — Screening Complete
                                    </AdminText>
                                  </div>
                                  <AdminBadge variant={bgCheckResults[v.id].riskLevel === 'high' ? 'error' : bgCheckResults[v.id].riskLevel === 'medium' ? 'warning' : 'success'}>
                                    {(bgCheckResults[v.id].totalMatches || 0)} {bgCheckResults[v.id].totalMatches === 1 ? 'Match' : 'Matches'}
                                  </AdminBadge>
                                </div>

                                {/* Flags */}
                                <div className="flex flex-wrap gap-2">
                                  <AdminBadge variant={bgCheckResults[v.id].isPEP ? 'error' : 'success'}>
                                    {bgCheckResults[v.id].isPEP ? 'PEP Flagged' : 'Not PEP'}
                                  </AdminBadge>
                                  <AdminBadge variant={bgCheckResults[v.id].isSanctioned ? 'error' : 'success'}>
                                    {bgCheckResults[v.id].isSanctioned ? 'Sanctioned' : 'No Sanctions'}
                                  </AdminBadge>
                                  <AdminBadge variant={bgCheckResults[v.id].isWatchlisted ? 'error' : 'success'}>
                                    {bgCheckResults[v.id].isWatchlisted ? 'Watchlisted' : 'Not Watchlisted'}
                                  </AdminBadge>
                                </div>

                                {/* Matches */}
                                {bgCheckResults[v.id].matches && bgCheckResults[v.id].matches!.length > 0 && (
                                  <div className="space-y-2">
                                    <AdminText variant="bold" size="xs" color="secondary">Matches Found</AdminText>
                                    {bgCheckResults[v.id].matches!.map((match, idx) => (
                                      <div key={idx} className="rounded-lg border border-border/20 p-3 bg-background/50">
                                        <div className="flex items-center justify-between mb-1">
                                          <AdminText variant="bold" size="sm">{match.name}</AdminText>
                                          <AdminBadge variant={match.matchScore >= 80 ? 'error' : match.matchScore >= 50 ? 'warning' : 'secondary'}>
                                            {match.matchScore}% match
                                          </AdminBadge>
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                          <AdminBadge variant="secondary">{match.category}</AdminBadge>
                                          <AdminText size="xs" color="secondary">Source: {match.source}</AdminText>
                                        </div>
                                        {match.details && <AdminText size="xs" color="secondary" className="mt-1">{match.details}</AdminText>}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {bgCheckResults[v.id].reportId && (
                                  <AdminText size="xs" color="secondary">Report ID: {bgCheckResults[v.id].reportId}</AdminText>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <AlertCircle size={16} className="text-error shrink-0" />
                                <div>
                                  <AdminText variant="bold" size="sm" className="text-error">Screening Failed</AdminText>
                                  <AdminText size="xs" color="secondary">{bgCheckResults[v.id].error || 'Unknown error'}</AdminText>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-end gap-3">
                        <AdminButton 
                          variant="primary" 
                          size="sm" 
                          className="gap-1.5"
                          onClick={() => handleUpdateStatus(v.id, 'VERIFIED')}
                          disabled={!!processingId}
                        >
                          {processingId === v.id ? <RefreshCcw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Approve Verification
                        </AdminButton>
                        <AdminButton 
                          variant="secondary" 
                          size="sm" 
                          className="gap-1.5"
                          onClick={() => handleUpdateStatus(v.id, 'REJECTED')}
                          disabled={!!processingId}
                        >
                          {processingId === v.id ? <RefreshCcw size={14} className="animate-spin" /> : <XCircle size={14} />}
                          Reject Verification
                        </AdminButton>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))
          )}
        </AdminTable>
      </div>
    </div>
  );
}
