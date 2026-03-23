"use client";

import React, { useState, useEffect } from "react";
import {
  UsersThree,
  Trash,
  Plus,
  ShieldCheck,
  Envelope,
  X,
  SignOut,
  Eye,
  EyeSlash,
  SpinnerGap
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
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
      addAlert("error", "Failed to load admin accounts.");
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
      addAlert("success", "Admin account created.");
    } catch (err) {
      addAlert("error", "Failed to create admin. Ensure email is unique.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const resp = await fetch(`/api/queen-proxy/users/admin/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Failed');
      fetchAdmins();
      addAlert("success", "Admin account removed.");
    } catch (err) {
      addAlert("error", "Failed to remove admin.");
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
              <ShieldCheck size={16} weight="fill" className="text-white/40" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Root Console</span>
            </div>
            <h1 className="text-3xl font-black text-white">Admin Accounts</h1>
            <p className="text-sm text-white/40 mt-1">Manage admin access and roles.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExitConsent(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/50 hover:bg-white/5 transition-colors"
            >
              <SignOut size={16} weight="bold" />
              Exit
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary rounded-xl text-xs font-bold text-white hover:opacity-90 transition-opacity"
            >
              <Plus size={16} weight="bold" />
              Add Account
            </button>
          </div>
        </div>

        <AdminTable 
          headers={["Administrator", "Role", "Email", "Status", "Actions"]}
          className="bg-[#021027] border-white/10"
        >
          {admins.map((admin) => (
            <AdminTableRow key={admin.id} className="hover:bg-white/5 border-white/5">
              <AdminTableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {admin.firstName?.[0]}
                  </div>
                  <span className="text-sm font-bold text-white">{admin.firstName} {admin.lastName}</span>
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <AdminBadge variant="primary" className="bg-primary/20 text-white border-primary/20">{admin.role}</AdminBadge>
              </AdminTableCell>
              <AdminTableCell>
                <button 
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(admin.email);
                    addAlert("success", "Email copied.");
                  }}
                >
                  <Envelope size={14} weight="bold" />
                  <span className="text-xs">{admin.email}</span>
                </button>
              </AdminTableCell>
              <AdminTableCell>
                <AdminBadge variant="success" className="bg-success/20 text-white border-success/20">Active</AdminBadge>
              </AdminTableCell>
              <AdminTableCell>
                <button
                  className="p-2 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setConsentModal({
                    isOpen: true,
                    adminId: admin.id,
                    adminName: `${admin.firstName} ${admin.lastName}`
                  })}
                >
                  <Trash size={16} weight="bold" />
                </button>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>

        {admins.length === 0 && !loading && (
          <div className="text-center py-24 bg-[#021027] rounded-2xl border border-white/10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
              <UsersThree size={32} weight="duotone" className="text-white/20" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">No admins yet</h3>
              <p className="text-sm text-white/30 mt-1">Add your first admin account to get started.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/50 hover:bg-white/5 transition-colors mt-2"
            >
              <Plus size={16} weight="bold" />
              Add First Admin
            </button>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#021027] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-white">Add Administrator</h2>
                <p className="text-xs text-white/30 mt-0.5">Create a new admin account.</p>
              </div>
              <button onClick={() => {
                setShowAddModal(false);
                setShowPassword(false);
              }} className="p-2 hover:bg-white/5 text-white/30 rounded-xl transition-colors">
                <X size={20} weight="bold" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput 
                  label="First Name" 
                  labelClassName="text-white"
                  required 
                  value={newAdmin.firstName}
                  onChange={e => setNewAdmin({...newAdmin, firstName: e.target.value})}
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/30"
                />
                <AdminInput 
                  label="Last Name" 
                  labelClassName="text-white"
                  required 
                  value={newAdmin.lastName}
                  onChange={e => setNewAdmin({...newAdmin, lastName: e.target.value})}
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <AdminInput 
                label="Email" 
                labelClassName="text-white"
                type="email" 
                required 
                value={newAdmin.email}
                onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                className="bg-white/10 border-white/10 text-white placeholder:text-white/30"
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 ml-1">Role</label>
                <select 
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-white appearance-none cursor-pointer"
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
                label="Password" 
                labelClassName="text-white"
                type={showPassword ? "text" : "password"} 
                placeholder="Leave blank for default"
                value={newAdmin.password}
                onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                className="bg-white/10 border-white/10 text-white placeholder:text-white/30"
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/30 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
                  </button>
                }
              />
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowPassword(false); }}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-sm font-bold text-white/40 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Consent Modal */}
      <AdminConsentModal 
        isOpen={consentModal.isOpen}
        title="Remove this admin?"
        description={`${consentModal.adminName} will permanently lose access to the admin panel. This cannot be undone.`}
        confirmLabel="Remove"
        cancelLabel="Keep"
        variant="danger"
        onClose={() => setConsentModal({...consentModal, isOpen: false})}
        onConfirm={() => handleDelete(consentModal.adminId)}
      />

      {/* Exit Consent Modal */}
      <AdminConsentModal 
        isOpen={showExitConsent}
        title="Exit root console?"
        description="Your session will end and you'll be returned to the login page."
        confirmLabel="Exit"
        cancelLabel="Stay"
        variant="danger"
        onClose={() => setShowExitConsent(false)}
        onConfirm={handleExit}
      />
    </div>
  );
}
