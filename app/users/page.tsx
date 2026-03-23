"use client";

import React, { useState, useEffect, useCallback } from "react";  
import { 
  MagnifyingGlass, 
  Envelope, 
  Phone,
  Prohibit,
  ArrowClockwise,
  CheckCircle,
  Eye,
  SpinnerGap
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminInput } from "@/components/AdminInput";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminPagination } from "@/components/AdminPagination";
import { AdminConsentModal } from "@/components/AdminConsentModal";
import { getUsers, toggleBlockUser, getUserDetails, User } from "@/lib/users";
import { AdminUserDetailModal } from "@/components/AdminUserDetailModal";
import { toast } from "sonner";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [ninStatusFilter, setNinStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [blockModal, setBlockModal] = useState<{ userId: string; userName: string; currentStatus: string } | null>(null);

  const fetchUsers = useCallback(async (searchQuery = search, role = roleFilter, ninStatus = ninStatusFilter, page = currentPage) => {
    try {
      setLoading(true);
      const params: any = { 
        search: searchQuery,
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage
      };
      if (role !== "ALL") params.role = role;
      if (ninStatus !== "ALL") params.ninStatus = ninStatus;
      
      const data = await getUsers(params);
      setUsers(data.items);
      setTotal(data.total);
    } catch (error) {
      toast.error("Couldn't load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, ninStatusFilter]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setCurrentPage(1);
      fetchUsers(query, roleFilter, ninStatusFilter, 1);
    }, 500),
    [fetchUsers, roleFilter, ninStatusFilter]
  );

  useEffect(() => {
    fetchUsers();
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    debouncedSearch(query);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
    fetchUsers(search, role, ninStatusFilter, 1);
  };

  const handleNinFilter = (status: string) => {
    setNinStatusFilter(status);
    setCurrentPage(1);
    fetchUsers(search, roleFilter, status, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(search, roleFilter, ninStatusFilter, page);
  };

  const handleToggleBlock = async () => {
    if (!blockModal) return;
    const { userId, currentStatus } = blockModal;
    try {
      setProcessingId(userId);
      const result = await toggleBlockUser(userId);
      toast.success(`User ${result.newStatus === 'BLOCKED' ? 'blocked' : 'unblocked'}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: result.newStatus } : u));
    } catch (error) {
      toast.error("Couldn't update user");
    } finally {
      setProcessingId(null);
      setBlockModal(null);
    }
  };

  const handleViewDetails = async (userId: string) => {
    try {
      setProcessingId(userId);
      const details = await getUserDetails(userId);
      setSelectedUser(details);
      setShowDetailModal(true);
    } catch (error) {
      toast.error("Couldn't load user details");
    } finally {
      setProcessingId(null);
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

      <AdminConsentModal
        isOpen={!!blockModal}
        onClose={() => setBlockModal(null)}
        onConfirm={handleToggleBlock}
        title={blockModal?.currentStatus === 'BLOCKED' ? 'Unblock this user?' : 'Block this user?'}
        description={blockModal?.currentStatus === 'BLOCKED' 
          ? `${blockModal?.userName} will regain full access to their account.`
          : `${blockModal?.userName} will lose all access immediately. They won't be able to use the app.`
        }
        confirmLabel={blockModal?.currentStatus === 'BLOCKED' ? 'Unblock' : 'Block User'}
        variant={blockModal?.currentStatus === 'BLOCKED' ? 'primary' : 'danger'}
        loading={!!processingId}
      />

      <AdminHeader 
        title="Users" 
        description={`${total} registered users on BeeSeek.`}
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-black/5 p-4 md:p-5 rounded-2xl">
        <div className="w-full md:max-w-md">
          <AdminInput
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={handleSearchChange}
            icon={<MagnifyingGlass size={16} weight="bold" className="text-black/20" />}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => fetchUsers()}
            disabled={loading}
            className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
          >
            <ArrowClockwise size={16} weight="bold" className={loading ? "animate-spin" : ""} />
          </button>

          <div className="flex bg-black/[0.04] rounded-xl overflow-hidden">
            {["ALL", "CLIENT", "AGENT"].map((role) => (
              <button 
                key={role}
                onClick={() => handleRoleFilter(role)}
                className={cn(
                  "px-3 py-2 text-xs font-bold transition-colors",
                  roleFilter === role ? "bg-primary text-white" : "text-black/30 hover:text-black/50"
                )}
              >
                {role === "ALL" ? "All" : role === "CLIENT" ? "Clients" : "Agents"}
              </button>
            ))}
          </div>

          <div className="flex bg-black/[0.04] rounded-xl overflow-hidden">
            {([
              { key: "ALL", label: "Any NIN" },
              { key: "NOT_SUBMITTED", label: "Missing" },
              { key: "VERIFIED", label: "Verified" },
            ]).map(({ key, label }) => (
              <button 
                key={key}
                onClick={() => handleNinFilter(key)}
                className={cn(
                  "px-3 py-2 text-xs font-bold transition-colors",
                  ninStatusFilter === key 
                    ? (key === "NOT_SUBMITTED" ? "bg-error text-white" : key === "VERIFIED" ? "bg-success text-white" : "bg-black text-white")
                    : "text-black/30 hover:text-black/50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <AdminTable headers={["User", "Contact", "Role", "Status", "Joined", "Actions"]}>
          {loading ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <SpinnerGap size={24} weight="bold" className="animate-spin text-primary/30" />
                  <p className="text-sm text-black/30">Loading users...</p>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : users.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <MagnifyingGlass size={40} weight="duotone" className="text-black/10" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-black/30">No users found</p>
                    <p className="text-xs text-black/20 mt-1">Try different filters or search terms.</p>
                  </div>
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
                      <p className="text-xs text-black/40 truncate max-w-[150px]">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={11} weight="bold" className="text-black/15" />
                      <p className="text-xs text-black/40">{user.phoneNumber}</p>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={user.role === 'AGENT' ? 'primary' : 'info'}>
                    {user.role}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'BLOCKED' ? 'error' : 'warning'}>
                    {user.status}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <p className="text-xs text-black/30">
                    {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </p>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="p-2 rounded-lg text-black/20 hover:bg-black/[0.03] hover:text-primary transition-colors"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleViewDetails(user.id); }}
                      title="View details"
                    >
                      <Eye size={15} weight="bold" />
                    </button>
                    <button
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        user.status === 'BLOCKED' 
                          ? "text-black/20 hover:bg-green-50 hover:text-success" 
                          : "text-black/20 hover:bg-red-50 hover:text-error"
                      )}
                      onClick={(e: React.MouseEvent) => { 
                        e.stopPropagation(); 
                        setBlockModal({ userId: user.id, userName: `${user.firstName} ${user.lastName}`, currentStatus: user.status }); 
                      }}
                      disabled={processingId === user.id}
                      title={user.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                    >
                      {processingId === user.id ? (
                        <SpinnerGap size={15} weight="bold" className="animate-spin" />
                      ) : user.status === 'BLOCKED' ? (
                        <CheckCircle size={15} weight="bold" />
                      ) : (
                        <Prohibit size={15} weight="bold" />
                      )}
                    </button>
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
