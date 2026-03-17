"use client";

import React, { useState, useEffect, useCallback } from "react";  
import { 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Ban,
  RefreshCcw,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminInput } from "@/components/AdminInput";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminPagination } from "@/components/AdminPagination";
import { getUsers, toggleBlockUser, getUserDetails, User } from "@/lib/users";
import { AdminUserDetailModal } from "@/components/AdminUserDetailModal";
import { toast } from "sonner";
import { format } from "date-fns";
import debounce from "lodash/debounce";

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
      toast.error("Failed to fetch users");
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

  const handleToggleBlock = async (userId: string, userName: string, currentStatus: string) => {
    const action = currentStatus === 'BLOCKED' ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} ${userName}?`)) return;
    
    try {
      setProcessingId(userId);
      const result = await toggleBlockUser(userId);
      toast.success(`User updated to ${result.newStatus}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: result.newStatus } : u));
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = async (userId: string) => {
    try {
      setProcessingId(userId); // Use this to show loading on the specific row if needed
      const details = await getUserDetails(userId);
      setSelectedUser(details);
      setShowDetailModal(true);
    } catch (error) {
      toast.error("Failed to fetch user details");
    } finally {
      setProcessingId(null);
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
        title="User Control Hive" 
        description={`Manage all ${total} registered BeeSeek users.`}
        action={
          <AdminButton className="gap-2" variant="primary">
            <UserPlus size={18} />
            Registration Log
          </AdminButton>
        }
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-border/50 p-6 rounded-[24px] shadow-sm">
        <div className="w-full md:max-w-md">
          <AdminInput
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={handleSearchChange}
            icon={<Search size={18} />}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <AdminButton 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => fetchUsers()}
            disabled={loading}
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </AdminButton>
          <div className="flex border border-border/50 rounded-xl overflow-hidden bg-surface">
            <button 
              onClick={() => handleRoleFilter("ALL")}
              className={`px-3 md:px-4 py-2 text-xs font-bold font-plus-jakarta transition-colors ${roleFilter === 'ALL' ? 'bg-primary text-white' : 'text-secondary hover:bg-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => handleRoleFilter("CLIENT")}
              className={`px-3 md:px-4 py-2 text-xs font-bold font-plus-jakarta transition-colors border-l border-border/50 ${roleFilter === 'CLIENT' ? 'bg-primary text-white' : 'text-secondary hover:bg-white'}`}
            >
              Clients
            </button>
            <button 
              onClick={() => handleRoleFilter("AGENT")}
              className={`px-3 md:px-4 py-2 text-xs font-bold font-plus-jakarta transition-colors border-l border-border/50 ${roleFilter === 'AGENT' ? 'bg-primary text-white' : 'text-secondary hover:bg-white'}`}
            >
              Agents
            </button>
          </div>

          <div className="flex border border-border/50 rounded-xl overflow-hidden bg-surface">
            <button 
              onClick={() => handleNinFilter("ALL")}
              className={`px-3 md:px-4 py-2 text-xs font-bold font-plus-jakarta transition-colors ${ninStatusFilter === 'ALL' ? 'bg-black text-white' : 'text-secondary hover:bg-white'}`}
            >
              Any NIN
            </button>
            <button 
              onClick={() => handleNinFilter("NOT_SUBMITTED")}
              title="Users without NIN submitted"
              className={`px-3 md:px-4 py-2 text-xs font-bold font-plus-jakarta transition-colors border-l border-border/50 ${ninStatusFilter === 'NOT_SUBMITTED' ? 'bg-error text-white' : 'text-secondary hover:bg-white'}`}
            >
              Missing NIN
            </button>
            <button 
              onClick={() => handleNinFilter("VERIFIED")}
              className={`px-3 md:px-4 py-2 text-xs font-bold font-plus-jakarta transition-colors border-l border-border/50 ${ninStatusFilter === 'VERIFIED' ? 'bg-success text-white' : 'text-secondary hover:bg-white'}`}
            >
              Verified
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-border/50 overflow-hidden">
        <AdminTable headers={["User Identity", "Professional Profile", "Core Statistics", "Entity Status", "Onboarding", "Hive Controls"]}>
          {loading ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <RefreshCcw size={32} className="animate-spin text-primary/40" />
                  <AdminText color="secondary" size="sm">Scanning the Hive...</AdminText>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ) : users.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center text-secondary/20">
                    <Search size={32} />
                  </div>
                  <div className="text-center">
                    <AdminText variant="bold">No users found</AdminText>
                    <AdminText color="secondary" size="xs">Try adjusting your filters or search keywords.</AdminText>
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
                    <div className="w-10 h-10 rounded-full bg-surface border border-border/20 flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        `${user.firstName[0]}${user.lastName[0]}`
                      )}
                    </div>
                    <div>
                      <AdminText variant="bold" size="sm">{user.firstName} {user.lastName}</AdminText>
                      <AdminText color="secondary" size="xs">UID: {user.id.slice(0, 8)}</AdminText>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-secondary">
                      <Mail size={12} className="text-primary/40" />
                      <AdminText size="xs" className="truncate max-w-[150px]">{user.email}</AdminText>
                    </div>
                    <div className="flex items-center gap-2 text-secondary">
                      <Phone size={12} className="text-primary/40" />
                      <AdminText size="xs">{user.phoneNumber}</AdminText>
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
                  <AdminText size="xs" color="secondary">
                    {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </AdminText>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    <AdminButton 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      title="User History"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={14} />
                    </AdminButton>
                    <AdminButton 
                      variant={user.status === 'BLOCKED' ? 'success' : 'secondary'} 
                      size="sm" 
                      className="h-8 py-0 gap-1.5"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleToggleBlock(user.id, `${user.firstName} ${user.lastName}`, user.status); }}
                      disabled={processingId === user.id}
                    >
                      {processingId === user.id ? (
                        <RefreshCcw size={14} className="animate-spin" />
                      ) : user.status === 'BLOCKED' ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Ban size={14} />
                      )}
                      {user.status === 'BLOCKED' ? 'Unblock' : 'Block'}
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
