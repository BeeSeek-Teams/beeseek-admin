"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Trophy,
  Rocket,
  Star,
  Crown,
  Upload,
  ArrowClockwise,
  SpinnerGap,
  CheckCircle,
  XCircle,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminButton } from "@/components/AdminButton";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import {
  getAchievementsLeaderboard,
  checkEarlyAccessEmails,
  grantEarlyAccessBulk,
  grantAchievement,
  refreshTopRated,
} from "@/lib/users";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LeaderboardAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  earlyAccessAchievement: boolean;
  topRatedAchievement: boolean;
  goldenBadgeAchievement: boolean;
}

interface MatchedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  earlyAccessAchievement: boolean;
}

export default function AchievementsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshingTopRated, setRefreshingTopRated] = useState(false);

  // Early Access CSV Modal
  const [showEarlyAccessModal, setShowEarlyAccessModal] = useState(false);
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [unmatchedEmails, setUnmatchedEmails] = useState<string[]>([]);
  const [csvChecking, setCsvChecking] = useState(false);
  const [csvGranting, setCsvGranting] = useState(false);
  const [selectedForGrant, setSelectedForGrant] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Golden badge processing
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getAchievementsLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleRefreshTopRated = async () => {
    try {
      setRefreshingTopRated(true);
      const result = await refreshTopRated();
      if (result.newlyAwarded.length > 0) {
        toast.success(
          `${result.newlyAwarded.length} new Top Rated badge(s) awarded`
        );
      } else {
        toast.info(
          `No new qualifiers. ${result.alreadyAwarded} agent(s) already have the badge.`
        );
      }
      await fetchLeaderboard();
    } catch (err) {
      toast.error("Failed to refresh Top Rated");
    } finally {
      setRefreshingTopRated(false);
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCsvChecking(true);
      setShowEarlyAccessModal(true);

      const text = await file.text();
      const lines = text.trim().split("\n");
      // Skip header row, extract emails (3rd column, index 2)
      const emails: string[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const email = cols[2]?.trim();
        if (email && email.includes("@")) {
          emails.push(email);
        }
      }

      if (emails.length === 0) {
        toast.error("No valid emails found in CSV");
        setShowEarlyAccessModal(false);
        return;
      }

      const result = await checkEarlyAccessEmails(emails);
      setMatchedUsers(result.matched);
      setUnmatchedEmails(result.unmatched);

      // Pre-select users who do not already have the achievement
      const toSelect = new Set(
        result.matched
          .filter((u) => !u.earlyAccessAchievement)
          .map((u) => u.id)
      );
      setSelectedForGrant(toSelect);
    } catch (err) {
      toast.error("Failed to process CSV");
      setShowEarlyAccessModal(false);
    } finally {
      setCsvChecking(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGrantEarlyAccess = async () => {
    const ids = Array.from(selectedForGrant);
    if (ids.length === 0) {
      toast.error("No users selected");
      return;
    }

    try {
      setCsvGranting(true);
      const result = await grantEarlyAccessBulk(ids);
      toast.success(
        `Granted: ${result.granted.length}, Skipped: ${result.skipped.length}, Failed: ${result.failed.length}`
      );
      setShowEarlyAccessModal(false);
      setMatchedUsers([]);
      setUnmatchedEmails([]);
      setSelectedForGrant(new Set());
      await fetchLeaderboard();
    } catch (err) {
      toast.error("Failed to grant Early Access badges");
    } finally {
      setCsvGranting(false);
    }
  };

  const handleGrantGoldenBadge = async (userId: string) => {
    try {
      setProcessingId(userId);
      const result = await grantAchievement(userId, "goldenBadge");
      toast.success(result.message);
      await fetchLeaderboard();
    } catch (err) {
      toast.error("Failed to grant Golden Badge");
    } finally {
      setProcessingId(null);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedForGrant((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = leaderboard.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.firstName.toLowerCase().includes(q) ||
      a.lastName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q)
    );
  });

  const totalBadges = leaderboard.reduce(
    (acc, a) => ({
      earlyAccess: acc.earlyAccess + (a.earlyAccessAchievement ? 1 : 0),
      topRated: acc.topRated + (a.topRatedAchievement ? 1 : 0),
      goldenBadge: acc.goldenBadge + (a.goldenBadgeAchievement ? 1 : 0),
    }),
    { earlyAccess: 0, topRated: 0, goldenBadge: 0 }
  );

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Achievements"
        description="Manage agent achievement badges and view the leaderboard."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-black/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Rocket weight="fill" className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-black/25 uppercase tracking-wider">Early Access</p>
            <p className="text-2xl font-bold text-primary">{totalBadges.earlyAccess}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-black/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
            <Star weight="fill" className="text-yellow-500" size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-black/25 uppercase tracking-wider">Top Rated</p>
            <p className="text-2xl font-bold text-primary">{totalBadges.topRated}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-black/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <Crown weight="fill" className="text-amber-500" size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-black/25 uppercase tracking-wider">Golden Badge</p>
            <p className="text-2xl font-bold text-primary">{totalBadges.goldenBadge}</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[360px]">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/25"
          />
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-black/25"
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          className="hidden"
        />
        <AdminButton
          variant="outline"
          size="sm"
          icon={<Upload size={16} />}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Early Access CSV
        </AdminButton>

        <AdminButton
          variant="outline"
          size="sm"
          icon={<ArrowClockwise size={16} />}
          loading={refreshingTopRated}
          onClick={handleRefreshTopRated}
        >
          Refresh Top Rated
        </AdminButton>

        <AdminButton
          variant="ghost"
          size="sm"
          icon={<ArrowClockwise size={16} />}
          onClick={fetchLeaderboard}
        >
          Reload
        </AdminButton>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <SpinnerGap size={32} className="animate-spin text-black/20" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-black/30 text-sm">
          {search ? "No agents match your search." : "No agents found."}
        </div>
      ) : (
        <AdminTable
          headers={["#", "Agent", "Rating", "Reviews", "Jobs", "Badges", "Actions"]}
        >
          {filtered.map((agent, i) => (
            <AdminTableRow key={agent.id}>
              <AdminTableCell className="w-10 text-black/30 text-sm font-medium">
                {i + 1}
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex items-center gap-3">
                  {agent.profileImage ? (
                    <img
                      src={agent.profileImage}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {agent.firstName?.[0]}
                      {agent.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {agent.firstName} {agent.lastName}
                    </p>
                    <p className="text-xs text-black/40">{agent.email}</p>
                  </div>
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-sm font-semibold text-primary">
                  {agent.rating?.toFixed(1) || "0.0"}
                </span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-sm text-black/60">{agent.totalReviews}</span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-sm text-black/60">{agent.completedJobs}</span>
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex items-center gap-1.5">
                  {agent.earlyAccessAchievement && (
                    <span title="Early Access" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50">
                      <Rocket weight="fill" size={14} className="text-blue-500" />
                    </span>
                  )}
                  {agent.topRatedAchievement && (
                    <span title="Top Rated" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-50">
                      <Star weight="fill" size={14} className="text-yellow-500" />
                    </span>
                  )}
                  {agent.goldenBadgeAchievement && (
                    <span title="Golden Badge" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50">
                      <Crown weight="fill" size={14} className="text-amber-500" />
                    </span>
                  )}
                  {!agent.earlyAccessAchievement && !agent.topRatedAchievement && !agent.goldenBadgeAchievement && (
                    <span className="text-xs text-black/20">None</span>
                  )}
                </div>
              </AdminTableCell>
              <AdminTableCell>
                {!agent.goldenBadgeAchievement ? (
                  <AdminButton
                    variant="outline"
                    size="sm"
                    loading={processingId === agent.id}
                    icon={<Crown size={14} />}
                    onClick={() => handleGrantGoldenBadge(agent.id)}
                  >
                    Golden Badge
                  </AdminButton>
                ) : (
                  <span className="text-xs text-black/25">Awarded</span>
                )}
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}

      {/* Early Access CSV Modal */}
      {showEarlyAccessModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Rocket weight="fill" size={20} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary">Early Access CSV Results</h2>
                  <p className="text-xs text-black/40">
                    {matchedUsers.length} matched, {unmatchedEmails.length} unmatched
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEarlyAccessModal(false);
                  setMatchedUsers([]);
                  setUnmatchedEmails([]);
                  setSelectedForGrant(new Set());
                }}
                className="text-black/30 hover:text-black/60 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {csvChecking ? (
                <div className="flex items-center justify-center py-12">
                  <SpinnerGap size={28} className="animate-spin text-black/20" />
                  <span className="ml-3 text-sm text-black/40">Checking emails...</span>
                </div>
              ) : (
                <>
                  {/* Matched Users */}
                  {matchedUsers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-primary mb-2">
                        Matched Users ({matchedUsers.length})
                      </h3>
                      <div className="space-y-2">
                        {matchedUsers.map((u) => (
                          <label
                            key={u.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer",
                              u.earlyAccessAchievement
                                ? "border-green-200 bg-green-50/50 opacity-60"
                                : selectedForGrant.has(u.id)
                                ? "border-blue-200 bg-blue-50/50"
                                : "border-black/5 hover:border-black/10"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={selectedForGrant.has(u.id)}
                              disabled={u.earlyAccessAchievement}
                              onChange={() => toggleSelection(u.id)}
                              className="w-4 h-4 rounded border-black/20 text-primary focus:ring-primary/30"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-primary truncate">
                                {u.firstName} {u.lastName}
                              </p>
                              <p className="text-xs text-black/40 truncate">{u.email}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <AdminBadge variant={u.role === "AGENT" ? "primary" : "secondary"}>
                                {u.role}
                              </AdminBadge>
                              {u.earlyAccessAchievement && (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                  <CheckCircle weight="fill" size={14} />
                                  Already awarded
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unmatched Emails */}
                  {unmatchedEmails.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-black/40 mb-2">
                        Unmatched Emails ({unmatchedEmails.length})
                      </h3>
                      <div className="space-y-1">
                        {unmatchedEmails.map((email) => (
                          <div
                            key={email}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50/50 text-sm"
                          >
                            <XCircle weight="fill" size={14} className="text-red-400" />
                            <span className="text-black/50">{email}</span>
                            <span className="text-xs text-red-400 ml-auto">Not registered</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!csvChecking && matchedUsers.length > 0 && (
              <div className="px-6 py-4 border-t border-black/5 flex items-center justify-between">
                <p className="text-xs text-black/40">
                  {selectedForGrant.size} user(s) selected for Early Access badge
                </p>
                <div className="flex items-center gap-3">
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEarlyAccessModal(false);
                      setMatchedUsers([]);
                      setUnmatchedEmails([]);
                      setSelectedForGrant(new Set());
                    }}
                  >
                    Cancel
                  </AdminButton>
                  <AdminButton
                    variant="primary"
                    size="sm"
                    loading={csvGranting}
                    disabled={selectedForGrant.size === 0}
                    icon={<Rocket size={16} />}
                    onClick={handleGrantEarlyAccess}
                  >
                    Grant Early Access ({selectedForGrant.size})
                  </AdminButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
