"use client";

import React, { useState, useEffect } from "react";
import { 
  DeviceMobile, 
  ShieldWarning, 
  FloppyDisk, 
  ArrowClockwise, 
  Lightning, 
} from "@phosphor-icons/react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminInput } from "@/components/AdminInput";
import { AdminConsentModal } from "@/components/AdminConsentModal";
import { toast } from "sonner";
import { getSystemConfig, updateSystemConfig } from "@/lib/system-config";

export default function InfrastructurePage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenanceConfirm, setMaintenanceConfirm] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await getSystemConfig();
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
    } catch {
      toast.error("Couldn't load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSystemConfig(config);
      toast.success("Settings saved");
    } catch {
      toast.error("Couldn't save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-black/[0.04] rounded-lg" />
        <div className="h-52 bg-black/[0.02] rounded-2xl" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <ShieldWarning size={40} weight="duotone" className="text-black/10" />
        <p className="text-sm font-bold text-black/30">Couldn't load settings</p>
        <button onClick={fetchConfig} className="text-xs font-bold text-primary hover:opacity-80 transition-opacity">
          Try again
        </button>
      </div>
    );
  }

  const ConfigSection = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white border border-black/5 rounded-2xl p-5 md:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black/[0.03] flex items-center justify-center text-black/30">
          <Icon size={20} weight="duotone" />
        </div>
        <p className="text-sm font-black text-primary">{title}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl">
      <AdminConsentModal
        isOpen={maintenanceConfirm}
        onClose={() => setMaintenanceConfirm(false)}
        onConfirm={() => {
          setConfig({ ...config, maintenanceMode: "true" });
          setMaintenanceConfirm(false);
        }}
        title="Turn on maintenance mode?"
        description="This will block ALL users from using both apps. They'll see a maintenance screen until you turn it off."
        confirmLabel="Turn On"
        variant="danger"
      />

      <AdminHeader
        title="App Settings"
        description="Manage app versions, store links, and maintenance mode."
        action={
          <div className="flex gap-2">
            <button
              onClick={fetchConfig}
              disabled={saving}
              className="p-2.5 bg-white border border-black/5 rounded-xl text-black/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
            >
              <ArrowClockwise size={16} weight="bold" className={saving ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <FloppyDisk size={14} weight="bold" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        }
      />

      <div className="space-y-4 md:space-y-6">
        <ConfigSection title="App Versions & Store Links" icon={DeviceMobile}>
          <div className="space-y-3">
            <p className="text-xs font-bold text-black/30">Client App (job posters)</p>
            <div className="grid grid-cols-2 gap-3">
              <AdminInput 
                label="Current Version" 
                placeholder="e.g. 1.0.0"
                value={config.clientVersion} 
                onChange={(e) => setConfig({...config, clientVersion: e.target.value})}
              />
              <AdminInput 
                label="Minimum Version" 
                placeholder="e.g. 1.0.0"
                value={config.clientMinVersion} 
                onChange={(e) => setConfig({...config, clientMinVersion: e.target.value})}
              />
            </div>
            <p className="text-[10px] text-black/20">
              Below minimum = forced update. Between min and current = optional update prompt.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <AdminInput 
                label="App Store (iOS)" 
                placeholder="https://apps.apple.com/..."
                value={config.clientIosUrl} 
                onChange={(e) => setConfig({...config, clientIosUrl: e.target.value})}
              />
              <AdminInput 
                label="Play Store (Android)" 
                placeholder="https://play.google.com/..."
                value={config.clientAndroidUrl} 
                onChange={(e) => setConfig({...config, clientAndroidUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-black/30">Agent App (service providers)</p>
            <div className="grid grid-cols-2 gap-3">
              <AdminInput 
                label="Current Version" 
                placeholder="e.g. 1.0.0"
                value={config.agentVersion} 
                onChange={(e) => setConfig({...config, agentVersion: e.target.value})}
              />
              <AdminInput 
                label="Minimum Version" 
                placeholder="e.g. 1.0.0"
                value={config.agentMinVersion} 
                onChange={(e) => setConfig({...config, agentMinVersion: e.target.value})}
              />
            </div>
            <p className="text-[10px] text-black/20">
              Below minimum = forced update. Between min and current = optional update prompt.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <AdminInput 
                label="App Store (iOS)" 
                placeholder="https://apps.apple.com/..."
                value={config.agentIosUrl} 
                onChange={(e) => setConfig({...config, agentIosUrl: e.target.value})}
              />
              <AdminInput 
                label="Play Store (Android)" 
                placeholder="https://play.google.com/..."
                value={config.agentAndroidUrl} 
                onChange={(e) => setConfig({...config, agentAndroidUrl: e.target.value})}
              />
            </div>
          </div>
        </ConfigSection>

        <ConfigSection title="Update Message & Maintenance" icon={Lightning}>
          <div className="md:col-span-2">
            <AdminInput 
              label="Update message (shown when an update is available)" 
              placeholder="e.g. A new version of BeeSeek is available."
              value={config.updateMessage} 
              onChange={(e) => setConfig({...config, updateMessage: e.target.value})}
            />
          </div>
          
          <div className="p-4 rounded-xl border border-red-100 bg-red-50 flex items-center justify-between md:col-span-2">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <ShieldWarning size={18} weight="fill" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-900">Maintenance Mode</p>
                <p className="text-[10px] text-red-700/50">Both apps show a maintenance screen. Nobody can use the app.</p>
              </div>
            </div>
            <button 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                config.maintenanceMode === "true" 
                  ? "bg-red-600 text-white hover:opacity-90" 
                  : "bg-white border border-red-200 text-red-600 hover:bg-red-100"
              }`}
              onClick={() => {
                if (config.maintenanceMode === "true") {
                  setConfig({...config, maintenanceMode: "false"});
                } else {
                  setMaintenanceConfirm(true);
                }
              }}
            >
              {config.maintenanceMode === "true" ? "ON — Turn Off" : "OFF"}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 md:col-span-2">
            <p className="text-[10px] text-amber-700">
              <strong>Note:</strong> Changes only take effect after clicking "Save Changes" above.
            </p>
          </div>
        </ConfigSection>
      </div>
    </div>
  );
}
