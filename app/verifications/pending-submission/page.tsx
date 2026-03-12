"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye,
  ShieldAlert, 
  Mail, 
  Phone,
  Clock,
  RefreshCcw,
  Fingerprint,
  User as UserIcon
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminInput } from "@/components/AdminInput";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminPagination } from "@/components/AdminPagination";
import { getUsers, getUserDetails, User } from "@/lib/users";
import { AdminUserDetailModal } from "@/components/AdminUserDetailModal";
import { toast } from "sonner";
import { format } from "date-fns";
import debounce from "lodash/debounce";

export default function PendingSubmissionPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState<string | null>(null);

  const fetchUsers = useCallback(async (searchQuery = search, page = currentPage) => {
    try {
      setLoading(true);
      const data = await getUsers({ 
        search: searchQuery, 
        ninStatus: 'NOT_SUBMITTED',
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage
      });
      setUsers(data.items);
      setTotal(data.total);
    } catch (error) {
      toast.error("Failed to fetch unverified users");
    } finally {
      setLoading(false);
    }
  }, [search, currentPage]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setCurrentPage(1);
      fetchUsers(query, 1);
    }, 500),
    [fetchUsers]
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    debouncedSearch(query);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(search, page);
  };

  const handleViewDetails = async (userId: string) => {
    try {
      setFetchingDetails(userId);
      const details = await getUserDetails(userId);
      setSelectedUser(details);
      setShowDetailModal(true);
    } catch (error) {
      toast.error("Failed to fetch user details");
    } finally {
      setFetchingDetails(null);
    }
  };

  return (
    <div className="space-y-8">
      <AdminUserDetailModal 
        user={selectedUser} 
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)} 
        onUpdate={fetchUsers}
      />
      
      <AdminHeader 
        title="Unverified Identity Registry" 
        description="Monitoring entities who have not yet submitted their National Identification for verification."
        action={
          <div className="flex items-center gap-3">
             <AdminBadge variant="warning" className="px-4 py-2 text-sm font-bold">
                {total} Pending Submissions
             </AdminBadge>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-border/50 p-6 rounded-[24px] shadow-sm">
        <div className="w-full md:max-w-md">
          <AdminInput
            placeholder="Search pending users..."
            value={search}
            onChange={handleSearchChange}
            icon={<Search size={18} />}
          />
        </div>
        <div className="flex items-center gap-3">
          <AdminButton 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => fetchUsers()}
            disabled={loading}
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Refresh List
          </AdminButton>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-border/50 overflow-hidden shadow-sm">
        <AdminTable headers={["Entity Identity", "Contact Channels", "Role & Tier", "Days Since Joining", "Audit Status", "Risk Controls"]}>
          {loading ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <Fingerprint className="absolute inset-0 m-auto text-primary/40 animate-pulse" size={24} />
                  </div>
                  <AdminText color="secondary" size="sm" className="animate-pulse">Analyzing identity submission logs...</AdminText>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : users.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                  <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-primary/20">
                    <ShieldAlert size={40} />
                  </div>
                  <div className="max-w-xs">
                    <AdminText variant="bold" size="lg">Registry Clean</AdminText>
                    <AdminText color="secondary" size="xs">All active entities in this current filter have submitted their identification for review.</AdminText>
                  </div>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : (
            users.map((user) => (
              <AdminTableRow 
                key={user.id} 
                className="group cursor-pointer" 
                onClick={() => handleViewDetails(user.id)}
              >
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-surface border border-border/20 flex items-center justify-center text-primary font-bold overflow-hidden shadow-inner group-hover:border-primary/30 transition-colors">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs">{user.firstName[0]}{user.lastName[0]}</div>
                      )}
                    </div>
                    <div>
                      <AdminText variant="bold" size="sm" className="group-hover:text-primary transition-colors">{user.firstName} {user.lastName}</AdminText>
                      <AdminText color="secondary" size="xs" className="font-mono opacity-60">ID: {user.id.slice(0, 8)}</AdminText>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-secondary group-hover:text-primary transition-colors">
                      <Mail size={12} className="opacity-40" />
                      <AdminText size="xs" className="truncate max-w-[140px]">{user.email}</AdminText>
                    </div>
                    <div className="flex items-center gap-2 text-secondary">
                      <Phone size={12} className="opacity-40" />
                      <AdminText size="xs">{user.phoneNumber || 'No Phone'}</AdminText>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={user.role === 'AGENT' ? 'primary' : 'info'}>
                    {user.role}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-secondary opacity-40" />
                    <AdminText size="xs" color="secondary">
                       {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </AdminText>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                   <AdminBadge variant="warning" className="animate-pulse">NOT SUBMITTED</AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    <AdminButton 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-3 gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(user.id);
                      }}
                      loading={fetchingDetails === user.id}
                    >
                      <Eye size={14} />
                      Details
                    </AdminButton>
                    <AdminButton 
                      variant="secondary" 
                      size="sm" 
                      className="h-9 w-9 p-0"
                      title="Send Reminder"
                    >
                      <Mail size={14} />
                    </AdminButton>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))
          )}
        </AdminTable>
        <AdminPagination 
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
