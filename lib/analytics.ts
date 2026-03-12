import api from './api';

export interface DashboardStats {
  totalUsers: number;
  pendingVerifications: number;
  activeJobs: number;
  totalJobs: number;
}

export interface DistributionData {
  label: string;
  value: number;
}

export interface PlatformDistributions {
  beeCategories: DistributionData[];
  userRoles: DistributionData[];
  jobStatuses: DistributionData[];
  ninStatuses: DistributionData[];
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'bee' | 'user';
  label: string;
  sublabel: string;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/analytics/admin/dashboard');
  return response.data;
};

export const getDistributions = async (): Promise<PlatformDistributions> => {
  const response = await api.get('/analytics/admin/distributions');
  return response.data;
};

export const getMapMarkers = async (): Promise<MapMarker[]> => {
  const response = await api.get('/analytics/admin/map-markers');
  return response.data;
};
