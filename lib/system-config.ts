import api from './api';

export interface SystemConfig {
  clientVersion: string;
  clientMinVersion: string;
  agentVersion: string;
  agentMinVersion: string;
  clientIosUrl?: string;
  clientAndroidUrl?: string;
  agentIosUrl?: string;
  agentAndroidUrl?: string;
  updateMessage?: string;
  maintenanceMode: string;
}

export const getSystemConfig = async () => {
  const response = await api.get('/system-config/versions');
  return response.data;
};

export const updateSystemConfig = async (data: Partial<SystemConfig>) => {
  const response = await api.post('/system-config/admin/update', data);
  return response.data;
};
