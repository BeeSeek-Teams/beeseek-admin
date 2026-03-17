"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  Mail, 
  ArrowLeft,
  X,
  Check,
  LogOut,
  Eye,
  EyeOff
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminInput } from "@/components/AdminInput";
import { AdminTable, AdminTableRow, AdminTableCell } from "@/components/AdminTable";
import { AdminBadge } from "@/components/AdminBadge";
import { AdminAlert, AlertType } from "@/components/AdminAlert";
import { AdminConsentModal } from "@/components/AdminConsentModal";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function QueenDashboard() {
  const router = useRouter();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExitConsent, setShowExitConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alerts, setAlerts] = useState<{ id: number; type: AlertType; message: string }[]>([]);
  
  const [consentModal, setConsentModal] = useState({
    isOpen: false,
    adminId: "",
    adminName: ""
  });

  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "SUPPORT",
    password: ""
  });

  const addAlert = (type: AlertType, message: string) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, message }]);
  };

  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const fetchAdmins = async () => {
    try {
      const resp = await fetch('/api/queen-proxy/users/admin/list');
      if (!resp.ok) throw new Error('Failed');
      const data = await resp.json();
      setAdmins(data);
    } catch (err) {
      addAlert("error", "Failed to synchronize with hive relay.");
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async () => {
    try {
      await fetch('/api/queen-logout', { method: 'POST' });
    } catch {
      // Silent
    }
    Cookies.remove('queen_session');
    Cookies.remove('queen_key');
    router.push('/login');
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch('/api/queen-proxy/users/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });
      if (!resp.ok) throw new Error('Failed');
      setShowAddModal(false);
      setNewAdmin({ firstName: "", lastName: "", email: "", role: "SUPPORT", password: "" });
      fetchAdmins();
      addAlert("success", "Administrative node deployed successfully.");
    } catch (err) {
      addAlert("error", "Failed to deploy node. Ensure credentials are unique.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const resp = await fetch(`/api/queen-proxy/users/admin/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Failed');
      fetchAdmins();
      addAlert("success", "Node decommissioned from hive.");
    } catch (err) {
      addAlert("error", "Failed to decommissioning node.");
    }
  };

  return (
    <div className="min-h-screen bg-[#010816] p-4 md:p-6 lg:p-10 selection:bg-primary/20">
      {/* Notifications Layer */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 w-80">
        {alerts.map(alert => (
          <AdminAlert 
            key={alert.id}
            type={alert.type}
            message={alert.message}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-white" />
                <AdminText size="xs" variant="bold" color="white" className="uppercase tracking-widest">Root Console</AdminText>
            </div>
            <AdminText variant="bold" size="3xl" color="white">Queen Bee Dashboard</AdminText>
            <AdminText color="white" className="mt-1">Manage administrative nodes and access levels.</AdminText>
          </div>
          <div className="flex items-center gap-3">
            <AdminButton variant="outline" onClick={() => setShowExitConsent(true)} className="gap-2 px-6 border-white/20 text-white hover:bg-white/5">
              <LogOut size={18} className="text-white" />
              Exit Console
            </AdminButton>
            <AdminButton onClick={() => setShowAddModal(true)} className="gap-2 px-6 text-white">
              <Plus size={18} className="text-white" />
              Add Account
            </AdminButton>
          </div>
        </div>

        <AdminTable 
          headers={["Administrator", "Role", "Email", "Status", "Actions"]}
          className="bg-[#021027] border-white/10"
          headerColor="white"
        >
          {admins.map((admin) => (
            <AdminTableRow key={admin.id} className="hover:bg-white/5 border-white/5">
              <AdminTableCell>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                        {admin.firstName?.[0]}
                    </div>
                    <AdminText variant="bold" size="sm" color="white">{admin.firstName} {admin.lastName}</AdminText>
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <AdminBadge variant="primary" className="bg-primary/20 text-white border-primary/20">{admin.role}</AdminBadge>
              </AdminTableCell>
              <AdminTableCell>
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    navigator.clipboard.writeText(admin.email);
                    addAlert("success", "Email address stored in neural buffer (copied).");
                  }}
                >
                    <Mail size={14} className="text-white" />
                    <AdminText size="sm" color="white">{admin.email}</AdminText>
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <AdminBadge variant="success" className="bg-success/20 text-white border-success/20">Active</AdminBadge>
              </AdminTableCell>
              <AdminTableCell>
                <AdminButton 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
                    onClick={() => setConsentModal({
                      isOpen: true,
                      adminId: admin.id,
                      adminName: `${admin.firstName} ${admin.lastName}`
                    })}
                >
                  <Trash2 size={18} className="text-white" />
                </AdminButton>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>

        {admins.length === 0 && !loading && (
          <div className="text-center py-32 bg-[#021027] rounded-[48px] border border-white/10 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-white">
              <Users size={40} className="text-white" />
            </div>
            <div>
              <AdminText variant="bold" size="xl" color="white">No Hive Nodes Detected</AdminText>
              <AdminText color="white" className="mt-1">
                You haven't added any administrators yet. Deploy your first admin node to begin.
              </AdminText>
            </div>
            <AdminButton onClick={() => setShowAddModal(true)} variant="outline" className="border-white/20 text-white hover:bg-white/5 mt-2">
               <Plus size={18} className="text-white mr-2" />
               Add First Admin
            </AdminButton>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#021027] w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <AdminText variant="bold" size="xl" color="white">Add Administrator</AdminText>
                <AdminText size="xs" color="white">Deploy a new admin node with specific permissions.</AdminText>
              </div>
              <button onClick={() => {
                setShowAddModal(false);
                setShowPassword(false);
              }} className="p-2 hover:bg-white/5 text-white rounded-full transition-colors font-bold">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput 
                    label="First Name" 
                    labelClassName="text-white"
                    required 
                    value={newAdmin.firstName}
                    onChange={e => setNewAdmin({...newAdmin, firstName: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <AdminInput 
                    label="Last Name" 
                    labelClassName="text-white"
                    required 
                    value={newAdmin.lastName}
                    onChange={e => setNewAdmin({...newAdmin, lastName: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <AdminInput 
                label="Email" 
                labelClassName="text-white"
                type="email" 
                required 
                value={newAdmin.email}
                onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <div className="space-y-2">
                <label className="text-sm font-bold text-white ml-1">Access Level (Role)</label>
                <select 
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-plus-jakarta text-sm text-white appearance-none cursor-pointer"
                    value={newAdmin.role}
                    onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}
                >
                    <option value="SUPPORT" className="bg-[#021027]">SUPPORT</option>
                    <option value="MODERATOR" className="bg-[#021027]">MODERATOR</option>
                    <option value="ADMIN" className="bg-[#021027]">ADMIN</option>
                    <option value="SUPER_ADMIN" className="bg-[#021027]">SUPER_ADMIN</option>
                </select>
              </div>
              <AdminInput 
                label="Initial Password" 
                labelClassName="text-white"
                type={showPassword ? "text" : "password"} 
                placeholder="Leave blank for default"
                value={newAdmin.password}
                onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <div className="pt-4 flex gap-3">
                <AdminButton variant="outline" type="button" fullWidth onClick={() => {
                  setShowAddModal(false);
                  setShowPassword(false);
                }} className="border-white/20 text-white hover:bg-white/10">Cancel</AdminButton>
                <AdminButton type="submit" fullWidth className="text-white">Create Account</AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consent Modal */}
      <AdminConsentModal 
        isOpen={consentModal.isOpen}
        title="Sever Hive Link?"
        description={`This will permanently decommission ${consentModal.adminName}'s access to the Beeseek network. This action is recorded in the root logs and cannot be undone.`}
        confirmLabel="Decommission Node"
        cancelLabel="Keep Node"
        variant="danger"
        onClose={() => setConsentModal({...consentModal, isOpen: false})}
        onConfirm={() => handleDelete(consentModal.adminId)}
      />

      {/* Exit Consent Modal */}
      <AdminConsentModal 
        isOpen={showExitConsent}
        title="Exit Root Console?"
        description="This will terminate your secure session and return you to the public login interface. Neural buffer and session keys will be purged."
        confirmLabel="Confirm Exit"
        cancelLabel="Stay Logged In"
        variant="warning"
        onClose={() => setShowExitConsent(false)}
        onConfirm={handleExit}
      />
    </div>
  );
}
