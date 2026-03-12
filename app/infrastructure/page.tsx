"use client";

import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  ShieldAlert, 
  Save, 
  RefreshCcw, 
  Zap, 
  Activity,
  Globe,
  HardDrive
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminInput } from "@/components/AdminInput";
import { toast } from "sonner";
import { getSystemConfig, updateSystemConfig } from "@/lib/system-config";
import { cn } from "@/lib/utils";

export default function InfrastructurePage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await getSystemConfig();
      // Logic for flattening the object for the form
      setConfig({
        clientVersion: data.client.latest,
        clientMinVersion: data.client.min,
        clientIosUrl: data.client.iosUrl || "",
        clientAndroidUrl: data.client.androidUrl || "",
        agentVersion: data.agent.latest,
        agentMinVersion: data.agent.min,
        agentIosUrl: data.agent.iosUrl || "",
        agentAndroidUrl: data.agent.androidUrl || "",
        updateMessage: data.message || "",
        maintenanceMode: data.maintenance ? "true" : "false"
      });
    } catch (err) {
      toast.error("Failed to load system configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSystemConfig(config);
      toast.success("Infrastructure settings updated and cache refreshed");
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 animate-pulse space-y-4">
      <div className="h-12 w-64 bg-slate-100 rounded-xl" />
      <div className="h-64 bg-slate-50 rounded-[32px]" />
    </div>;
  }

  if (!config) {
    return (
      <div className="p-8 text-center space-y-4">
        <AdminText variant="bold" color="error">Critical System Error</AdminText>
        <AdminText size="sm">Unable to retrieve system configuration from the Hive.</AdminText>
        <AdminButton onClick={fetchConfig} variant="outline" className="mt-4">
          <RefreshCcw size={16} className="mr-2" />
          Retry Connection
        </AdminButton>
      </div>
    );
  }

  const ConfigSection = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white border border-border/50 rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-50 rounded-2xl text-slate-900 shadow-sm border border-slate-100">
           <Icon size={20} />
        </div>
        <AdminText variant="bold" size="lg">{title}</AdminText>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 max-w-6xl">
      <AdminHeader
        title="Infrastructure & Orchestration"
        description="Control global application state, versioning requirements, and maintenance windows."
        action={
          <div className="flex gap-3">
             <AdminButton variant="outline" onClick={fetchConfig} disabled={saving}>
                <RefreshCcw size={16} className={saving ? "animate-spin" : ""} />
             </AdminButton>
             <AdminButton onClick={handleSave} loading={saving} className="gap-2">
                <Save size={16} />
                Deploy Configuration
             </AdminButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-8">
        {/* Version Control */}
        <ConfigSection title="Mobile Version Control" icon={Smartphone}>
          <div className="space-y-4">
            <AdminText variant="bold" size="sm">BeeSeek Client (iOS/Android)</AdminText>
            <div className="grid grid-cols-2 gap-4">
               <AdminInput 
                 label="Latest Version" 
                 value={config.clientVersion} 
                 onChange={(e) => setConfig({...config, clientVersion: e.target.value})}
               />
               <AdminInput 
                 label="Minimum Version" 
                 value={config.clientMinVersion} 
                 onChange={(e) => setConfig({...config, clientMinVersion: e.target.value})}
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <AdminInput 
                 label="App Store URL (iOS)" 
                 value={config.clientIosUrl} 
                 onChange={(e) => setConfig({...config, clientIosUrl: e.target.value})}
               />
               <AdminInput 
                 label="Play Store URL (Android)" 
                 value={config.clientAndroidUrl} 
                 onChange={(e) => setConfig({...config, clientAndroidUrl: e.target.value})}
               />
            </div>
          </div>

          <div className="space-y-4">
            <AdminText variant="bold" size="sm">BeeSeek Agent (iOS/Android)</AdminText>
            <div className="grid grid-cols-2 gap-4">
               <AdminInput 
                 label="Latest Version" 
                 value={config.agentVersion} 
                 onChange={(e) => setConfig({...config, agentVersion: e.target.value})}
               />
               <AdminInput 
                 label="Minimum Version" 
                 value={config.agentMinVersion} 
                 onChange={(e) => setConfig({...config, agentMinVersion: e.target.value})}
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <AdminInput 
                 label="App Store URL (iOS)" 
                 value={config.agentIosUrl} 
                 onChange={(e) => setConfig({...config, agentIosUrl: e.target.value})}
               />
               <AdminInput 
                 label="Play Store URL (Android)" 
                 value={config.agentAndroidUrl} 
                 onChange={(e) => setConfig({...config, agentAndroidUrl: e.target.value})}
               />
            </div>
          </div>
        </ConfigSection>

        {/* Global Overrides */}
        <ConfigSection title="Global Overrides" icon={Zap}>
          <div className="space-y-4 md:col-span-2">
            <AdminInput 
               label="Update Modal Message" 
               placeholder="A new version of BeeSeek is available with critical security updates..."
               value={config.updateMessage} 
               onChange={(e) => setConfig({...config, updateMessage: e.target.value})}
            />
          </div>
          
          <div className="p-6 rounded-2xl border border-red-100 bg-red-50/30 flex items-center justify-between">
             <div className="flex gap-4 items-center">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                   <ShieldAlert size={20} />
                </div>
                <div>
                   <AdminText variant="bold" color="error">Maintenance Mode</AdminText>
                   <AdminText size="xs" color="secondary">Blocks all app traffic with a service notice</AdminText>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <AdminButton 
                  size="sm" 
                  variant={config.maintenanceMode === "true" ? "primary" : "outline"}
                  onClick={() => {
                    const newValue = config.maintenanceMode === "true" ? "false" : "true";
                    if (newValue === "true") {
                      if (!confirm("WARNING: Enabling maintenance mode will block ALL app traffic. Are you sure?")) return;
                    }
                    setConfig({...config, maintenanceMode: newValue});
                  }}
                >
                   {config.maintenanceMode === "true" ? "Active" : "Disabled"}
                </AdminButton>
             </div>
          </div>

          <div className="p-6 rounded-2xl border border-blue-100 bg-blue-50/30 flex items-center justify-between">
             <div className="flex gap-4 items-center">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                   <Globe size={20} />
                </div>
                <div>
                   <AdminText variant="bold" className="text-blue-700">Cache Strategy</AdminText>
                   <AdminText size="xs" color="secondary">Currently utilizing high-perf Redis cache</AdminText>
                </div>
             </div>
             <AdminButton size="sm" variant="outline" className="text-blue-700 border-blue-200">
                Purge L2 Cache
             </AdminButton>
          </div>
        </ConfigSection>

        {/* System Health Summary — populated from backend health endpoint */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Activity size={80} />
              </div>
              <AdminText color="white" className="mb-2 opacity-80">DB Connectivity</AdminText>
              <AdminText variant="bold" size="xl" color="white">—</AdminText>
              <AdminText color="white" size="xs" className="opacity-50 mt-1">Requires health endpoint</AdminText>
           </div>
           <div className="bg-white border border-border/50 rounded-[32px] p-8 shadow-sm">
              <AdminText color="secondary" className="mb-2">Redis Cache</AdminText>
              <AdminText variant="bold" size="xl">—</AdminText>
              <AdminText color="secondary" size="xs" className="mt-1">Requires health endpoint</AdminText>
           </div>
           <div className="bg-white border border-border/50 rounded-[32px] p-8 shadow-sm">
              <AdminText color="secondary" className="mb-2">Maintenance Mode</AdminText>
              <AdminText variant="bold" size="xl">{config?.maintenanceMode === "true" ? "ACTIVE" : "Disabled"}</AdminText>
           </div>
        </div>
      </div>
    </div>
  );
}
