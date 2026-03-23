"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  MagnifyingGlass, 
  Eye,
  ShieldWarning, 
  Envelope, 
  Phone,
  Clock,
  ArrowClockwise,
  Fingerprint,
  SpinnerGap
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
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
      toast.error("Couldn't load unverified users");
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
      toast.error("Couldn't load user details");
    } finally {
      setFetchingDetails(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminUserDetailModal 
        user={selectedUser} 
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)} 
        onUpdate={fetchUsers}
      />
      
      <AdminHeader 
        title="Pending NIN" 
        description={`${total} users haven't submitted their NIN yet.`}
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-black/5 p-4 md:p-5 rounded-2xl">
        <div className="w-full md:max-w-md">
          <AdminInput
            placeholder="Search by name, email..."
            value={search}
            onChange={handleSearchChange}
            icon={<MagnifyingGlass size={16} weight="bold" className="text-black/20" />}
          />
        </div>
        <button 
          onClick={() => fetchUsers()}
          disabled={loading}
          className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
        >
          <ArrowClockwise size={16} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <AdminTable headers={["User", "Contact", "Role", "Joined", "NIN Status", "Actions"]}>
          {loading ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <SpinnerGap size={24} weight="bold" className="animate-spin text-primary/30" />
                  <p className="text-sm text-black/25">Loading...</p>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : users.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <Fingerprint size={32} weight="duotone" className="text-black/10" />
                  <p className="text-sm font-bold text-black/25">All clear</p>
                  <p className="text-xs text-black/15">Everyone has submitted their NIN.</p>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : (
            users.map((user) => (
              <AdminTableRow 
                key={user.id} 
                className="cursor-pointer" 
                onClick={() => handleViewDetails(user.id)}
              >
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-black/[0.03] border border-black/5 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        `${user.firstName[0]}${user.lastName[0]}`
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{user.firstName} {user.lastName}</p>
                      <p className="text-[10px] text-black/20 font-mono">{user.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Envelope size={11} weight="bold" className="text-black/15" />
                      <p className="text-xs text-black/40 truncate max-w-[140px]">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={11} weight="bold" className="text-black/15" />
                      <p className="text-xs text-black/40">{user.phoneNumber || 'No phone'}</p>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={user.role === 'AGENT' ? 'primary' : 'info'}>
                    {user.role}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} weight="bold" className="text-black/15" />
                    <p className="text-xs text-black/30">{format(new Date(user.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant="warning">Not Submitted</AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-black/30 hover:bg-black/[0.03] hover:text-primary rounded-lg text-[11px] font-bold transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleViewDetails(user.id); }}
                    disabled={fetchingDetails === user.id}
                  >
                    {fetchingDetails === user.id ? (
                      <SpinnerGap size={13} weight="bold" className="animate-spin" />
                    ) : (
                      <Eye size={13} weight="bold" />
                    )}
                    View
                  </button>
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