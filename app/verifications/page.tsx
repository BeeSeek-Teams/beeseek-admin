"use client";

import React, { useEffect, useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  WarningCircle,
  ShieldCheck,
  ArrowClockwise,
  MagnifyingGlass,
  CaretUp,
  User,
  Phone,
  DeviceMobile,
  Globe,
  CalendarBlank,
  Hash,
  Envelope,
  Shield,
  ShieldWarning,
  SpinnerGap
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
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
      toast.error("Couldn't load verifications");
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
      toast.success(`User ${status === 'VERIFIED' ? 'approved' : 'rejected'}`);
      setVerifications(prev => prev.filter(v => v.id !== userId));
      setFilteredVerifications(prev => prev.filter(v => v.id !== userId));
    } catch (error) {
      toast.error("Couldn't update status");
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
        toast.success(`Screening done — Risk: ${result.riskLevel || 'unknown'}, ${result.totalMatches || 0} matches`);
      } else {
        toast.error(`Screening failed: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Screening failed");
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

  const DetailField = ({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) => (
    <div className="flex items-start gap-2.5">
      <Icon size={13} weight="bold" className="text-black/15 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-black/25">{label}</p>
        <p className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminHeader 
        title="Verifications" 
        description="Review and approve identity verification requests."
      />

      {/* Summary Row */}
      <div className="flex flex-wrap items-center gap-3">
        <button 
          onClick={fetchVerifications} 
          disabled={loading}
          className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
        >
          <ArrowClockwise size={16} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
        <div className="bg-white border border-black/5 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <Clock size={18} weight="fill" />
          </div>
          <div>
            <p className="text-lg font-black">{filteredVerifications.length}</p>
            <p className="text-[10px] text-black/25">Pending</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        {/* Search */}
        <div className="px-5 py-3 border-b border-black/5">
          <div className="relative max-w-sm">
            <MagnifyingGlass size={14} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-black/15" />
            <input 
              type="text" 
              placeholder="Search by name or NIN..." 
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-black/[0.02] border border-black/5 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <AdminTable headers={["Submitted", "User", "Document", "Status", "Actions"]}>
          {loading ? (
            <AdminTableRow>
              <AdminTableCell colSpan={5}>
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <SpinnerGap size={24} weight="bold" className="animate-spin text-primary/30" />
                  <p className="text-sm text-black/25">Loading verifications...</p>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : filteredVerifications.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell colSpan={5}>
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <CheckCircle size={32} weight="duotone" className="text-black/10" />
                  <p className="text-sm font-bold text-black/25">All caught up!</p>
                  <p className="text-xs text-black/15">No pending verifications right now.</p>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : (
            filteredVerifications.map((v) => (
              <React.Fragment key={v.id}>
              <AdminTableRow className="cursor-pointer" onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}>
                <AdminTableCell>
                  <p className="text-xs text-black/30">
                    {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                  </p>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black/[0.03] border border-black/5 overflow-hidden flex items-center justify-center text-primary font-bold text-[10px]">
                      {v.profileImage ? (
                        <img src={v.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        `${v.firstName[0]}${v.lastName[0]}`
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{v.firstName} {v.lastName}</p>
                      <p className="text-[10px] text-black/20">{v.email}</p>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="px-2 py-1 bg-black/[0.02] rounded-md text-[10px] font-mono border border-black/5">
                    NIN: •••••••{v.ninNumber?.slice(-4) || '****'}
                  </span>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant="warning">{v.ninStatus}</AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="p-2 rounded-lg text-black/20 hover:bg-black/[0.03] hover:text-primary transition-colors"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setExpandedId(expandedId === v.id ? null : v.id); }}
                      title={expandedId === v.id ? "Collapse" : "Expand"}
                    >
                      {expandedId === v.id ? <CaretUp size={14} weight="bold" /> : <Eye size={14} weight="bold" />}
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleUpdateStatus(v.id, 'VERIFIED'); }}
                      disabled={!!processingId}
                    >
                      {processingId === v.id ? <SpinnerGap size={12} weight="bold" className="animate-spin" /> : <CheckCircle size={12} weight="bold" />}
                      Approve
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-error text-[11px] font-bold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-40"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleUpdateStatus(v.id, 'REJECTED'); }}
                      disabled={!!processingId}
                    >
                      <XCircle size={12} weight="bold" />
                      Reject
                    </button>
                  </div>
                </AdminTableCell>
              </AdminTableRow>

              {/* Expanded Detail Row */}
              {expandedId === v.id && (
                <tr>
                  <td colSpan={5} className="px-5 py-0">
                    <div className="bg-black/[0.01] border border-black/5 rounded-2xl p-5 my-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Identity */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield size={14} weight="fill" className="text-primary" />
                            <p className="text-xs font-bold">Identity</p>
                          </div>
                          <DetailField icon={Hash} label="Full NIN" value={v.ninNumber || 'N/A'} mono />
                          <DetailField icon={User} label="Full Name" value={`${v.firstName} ${v.lastName}`} />
                          <DetailField icon={Envelope} label="Email" value={v.email} />
                          {v.phone && <DetailField icon={Phone} label="Phone" value={v.phone} />}
                        </div>

                        {/* Account */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <User size={14} weight="fill" className="text-primary" />
                            <p className="text-xs font-bold">Account</p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <ShieldCheck size={13} weight="bold" className="text-black/15 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] text-black/25">Role</p>
                              <AdminBadge variant={v.role === 'AGENT' ? 'info' : 'secondary'}>{v.role || 'N/A'}</AdminBadge>
                            </div>
                          </div>
                          {v.age && <DetailField icon={CalendarBlank} label="Age" value={String(v.age)} />}
                          <DetailField icon={CalendarBlank} label="Submitted" value={format(new Date(v.createdAt), 'PPpp')} />
                          {v.lastLoginAt && <DetailField icon={Clock} label="Last Login" value={format(new Date(v.lastLoginAt), 'PPpp')} />}
                        </div>

                        {/* Device */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <DeviceMobile size={14} weight="fill" className="text-primary" />
                            <p className="text-xs font-bold">Device</p>
                          </div>
                          {v.deviceType && <DetailField icon={DeviceMobile} label="Type" value={v.deviceType} />}
                          {v.deviceModel && <DetailField icon={DeviceMobile} label="Model" value={v.deviceModel} />}
                          {v.lastIpAddress && <DetailField icon={Globe} label="Last IP" value={v.lastIpAddress} mono />}
                          {!v.deviceType && !v.deviceModel && !v.lastIpAddress && (
                            <p className="text-xs text-black/20">No device info available</p>
                          )}
                        </div>
                      </div>

                      {/* Background Check */}
                      <div className="mt-5 pt-4 border-t border-black/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Shield size={14} weight="fill" className="text-primary" />
                            <p className="text-xs font-bold">AML / Criminal Screening</p>
                          </div>
                          <button
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/5 rounded-lg text-[11px] font-bold text-black/40 hover:bg-black/[0.02] transition-colors disabled:opacity-40"
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleBackgroundCheck(v.id); }}
                            disabled={!!bgCheckLoading}
                          >
                            {bgCheckLoading === v.id ? <SpinnerGap size={12} weight="bold" className="animate-spin" /> : <Shield size={12} weight="bold" />}
                            {bgCheckResults[v.id] ? 'Re-run' : 'Run Screening'}
                          </button>
                        </div>

                        {bgCheckResults[v.id] && (
                          <div className={`rounded-xl border p-4 ${bgCheckResults[v.id].success ? (bgCheckResults[v.id].riskLevel === 'high' ? 'bg-red-50 border-red-100' : bgCheckResults[v.id].riskLevel === 'medium' ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100') : 'bg-red-50 border-red-100'}`}>
                            {bgCheckResults[v.id].success ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {bgCheckResults[v.id].riskLevel === 'high' ? (
                                      <ShieldWarning size={16} weight="fill" className="text-error" />
                                    ) : bgCheckResults[v.id].riskLevel === 'medium' ? (
                                      <ShieldWarning size={16} weight="fill" className="text-amber-500" />
                                    ) : (
                                      <ShieldCheck size={16} weight="fill" className="text-success" />
                                    )}
                                    <p className={`text-sm font-bold ${bgCheckResults[v.id].riskLevel === 'high' ? 'text-error' : bgCheckResults[v.id].riskLevel === 'medium' ? 'text-amber-600' : 'text-success'}`}>
                                      {bgCheckResults[v.id].riskLevel === 'high' ? 'High Risk' : bgCheckResults[v.id].riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
                                    </p>
                                  </div>
                                  <AdminBadge variant={bgCheckResults[v.id].riskLevel === 'high' ? 'error' : bgCheckResults[v.id].riskLevel === 'medium' ? 'warning' : 'success'}>
                                    {(bgCheckResults[v.id].totalMatches || 0)} {bgCheckResults[v.id].totalMatches === 1 ? 'Match' : 'Matches'}
                                  </AdminBadge>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
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

                                {bgCheckResults[v.id].matches && bgCheckResults[v.id].matches!.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-black/25 uppercase">Matches</p>
                                    {bgCheckResults[v.id].matches!.map((match, idx) => (
                                      <div key={idx} className="rounded-lg border border-black/5 p-3 bg-white/60">
                                        <div className="flex items-center justify-between mb-1">
                                          <p className="text-sm font-bold">{match.name}</p>
                                          <AdminBadge variant={match.matchScore >= 80 ? 'error' : match.matchScore >= 50 ? 'warning' : 'secondary'}>
                                            {match.matchScore}% match
                                          </AdminBadge>
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                          <AdminBadge variant="secondary">{match.category}</AdminBadge>
                                          <span className="text-black/20">Source: {match.source}</span>
                                        </div>
                                        {match.details && <p className="text-xs text-black/30 mt-1">{match.details}</p>}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {bgCheckResults[v.id].reportId && (
                                  <p className="text-[10px] text-black/20">Report: {bgCheckResults[v.id].reportId}</p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <WarningCircle size={16} weight="fill" className="text-error shrink-0" />
                                <div>
                                  <p className="text-sm font-bold text-error">Screening Failed</p>
                                  <p className="text-xs text-black/30">{bgCheckResults[v.id].error || 'Unknown error'}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-end gap-2">
                        <button
                          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
                          onClick={() => handleUpdateStatus(v.id, 'VERIFIED')}
                          disabled={!!processingId}
                        >
                          {processingId === v.id ? <SpinnerGap size={13} weight="bold" className="animate-spin" /> : <CheckCircle size={13} weight="bold" />}
                          Approve
                        </button>
                        <button
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-error text-xs font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-40"
                          onClick={() => handleUpdateStatus(v.id, 'REJECTED')}
                          disabled={!!processingId}
                        >
                          <XCircle size={13} weight="bold" />
                          Reject
                        </button>
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