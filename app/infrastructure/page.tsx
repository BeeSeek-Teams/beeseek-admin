"use client";

import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  ShieldAlert, 
  Save, 
  RefreshCcw, 
  Zap, 
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminText } from "@/components/AdminText";
import { AdminButton } from "@/components/AdminButton";
import { AdminInput } from "@/components/AdminInput";
import { toast } from "sonner";
import { getSystemConfig, updateSystemConfig } from "@/lib/system-config";

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
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSystemConfig(config);
      toast.success("Settings saved successfully");
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
        <AdminText variant="bold" color="error">Could not load settings</AdminText>
        <AdminText size="sm">Something went wrong. Please try again.</AdminText>
        <AdminButton onClick={fetchConfig} variant="outline" className="mt-4">
          <RefreshCcw size={16} className="mr-2" />
          Try Again
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
        title="App Settings"
        description="Control app versions, store links, update messages, and maintenance mode."
        action={
          <div className="flex gap-3">
             <AdminButton variant="outline" onClick={fetchConfig} disabled={saving}>
                <RefreshCcw size={16} className={saving ? "animate-spin" : ""} />
             </AdminButton>
             <AdminButton onClick={handleSave} loading={saving} className="gap-2">
                <Save size={16} />
                Save Changes
             </AdminButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-8">
        {/* App Versions & Store Links */}
        <ConfigSection title="App Versions & Store Links" icon={Smartphone}>
          <div className="space-y-4">
            <AdminText variant="bold" size="sm">Client App (for job posters)</AdminText>
            <div className="grid grid-cols-2 gap-4">
               <AdminInput 
                 label="Current Version" 
                 placeholder="e.g. 1.0.0"
                 value={config.clientVersion} 
                 onChange={(e) => setConfig({...config, clientVersion: e.target.value})}
               />
               <AdminInput 
                 label="Minimum Allowed Version" 
                 placeholder="e.g. 1.0.0"
                 value={config.clientMinVersion} 
                 onChange={(e) => setConfig({...config, clientMinVersion: e.target.value})}
               />
            </div>
            <AdminText size="xs" color="secondary">
              Users below the minimum version will be forced to update. Users between minimum and current will see an optional update prompt.
            </AdminText>
            <div className="grid grid-cols-2 gap-4">
               <AdminInput 
                 label="App Store Link (iOS)" 
                 placeholder="https://apps.apple.com/app/..."
                 value={config.clientIosUrl} 
                 onChange={(e) => setConfig({...config, clientIosUrl: e.target.value})}
               />
               <AdminInput 
                 label="Play Store Link (Android)" 
                 placeholder="https://play.google.com/store/apps/..."
                 value={config.clientAndroidUrl} 
                 onChange={(e) => setConfig({...config, clientAndroidUrl: e.target.value})}
               />
            </div>
          </div>

          <div className="space-y-4">
            <AdminText variant="bold" size="sm">Agent App (for service providers)</AdminText>
            <div className="grid grid-cols-2 gap-4">
               <AdminInput 
                 label="Current Version" 
                 placeholder="e.g. 1.0.0"
                 value={config.agentVersion} 
                 onChange={(e) => setConfig({...config, agentVersion: e.target.value})}
               />
               <AdminInput 
                 label="Minimum Allowed Version" 
                 placeholder="e.g. 1.0.0"
                 value={config.agentMinVersion} 
                 onChange={(e) => setConfig({...config, agentMinVersion: e.target.value})}
               />
            </div>
            <AdminText size="xs" color="secondary">
              Users below the minimum version will be forced to update. Users between minimum and current will see an optional update prompt.
            </AdminText>
            <div className="grid grid-cols-2 gap-4">
               <AdminInput 
                 label="App Store Link (iOS)" 
                 placeholder="https://apps.apple.com/app/..."
                 value={config.agentIosUrl} 
                 onChange={(e) => setConfig({...config, agentIosUrl: e.target.value})}
               />
               <AdminInput 
                 label="Play Store Link (Android)" 
                 placeholder="https://play.google.com/store/apps/..."
                 value={config.agentAndroidUrl} 
                 onChange={(e) => setConfig({...config, agentAndroidUrl: e.target.value})}
               />
            </div>
          </div>
        </ConfigSection>

        {/* Update Message & Maintenance */}
        <ConfigSection title="Update Message & Maintenance" icon={Zap}>
          <div className="space-y-4 md:col-span-2">
            <AdminInput 
               label="Update Message (shown to users when an update is available)" 
               placeholder="e.g. A new version of BeeSeek is available with important improvements."
               value={config.updateMessage} 
               onChange={(e) => setConfig({...config, updateMessage: e.target.value})}
            />
          </div>
          
          <div className="p-6 rounded-2xl border border-red-100 bg-red-50/30 flex items-center justify-between md:col-span-2">
             <div className="flex gap-4 items-center">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                   <ShieldAlert size={20} />
                </div>
                <div>
                   <AdminText variant="bold" color="error">Maintenance Mode</AdminText>
                   <AdminText size="xs" color="secondary">
                     When active, both apps will show a "BeeSeek is under maintenance" screen. No one can use the app.
                   </AdminText>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <AdminButton 
                  size="sm" 
                  variant={config.maintenanceMode === "true" ? "primary" : "outline"}
                  onClick={() => {
                    const newValue = config.maintenanceMode === "true" ? "false" : "true";
                    if (newValue === "true") {
                      if (!confirm("⚠️ This will block ALL users from using both apps. Are you sure?")) return;
                    }
                    setConfig({...config, maintenanceMode: newValue});
                  }}
                >
                   {config.maintenanceMode === "true" ? "ON — Apps Blocked" : "OFF"}
                </AdminButton>
             </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 md:col-span-2">
            <AdminText size="xs" color="secondary">
              <strong>Remember:</strong> Toggling maintenance mode or changing versions only takes effect after you click "Save Changes" above.
            </AdminText>
          </div>
        </ConfigSection>
      </div>
    </div>
  );
}
