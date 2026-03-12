import api from './api';

export interface BeeAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  isNinVerified: boolean;
  ninStatus: string;
  status: string;
}

export interface Bee {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  offersInspection: boolean;
  inspectionPrice: number | null;
  locationAddress: string;
  latitude: number;
  longitude: number;
  workHours: string;
  images: string[];
  clientRequirements: string;
  isActive: boolean;
  totalViews: number;
  totalHires: number;
  jobsCompleted: number;
  totalRevenue: number;
  rating: number;
  agentId: string;
  agent: BeeAgent;
  createdAt: string;
  updatedAt: string;
}

export interface BeeStats {
  totalBees: number;
  activeBees: number;
  inactiveBees: number;
  totalRevenue: number;
  avgRating: number;
  categories: { category: string; count: number }[];
}

export const getBees = async (params: {
  search?: string;
  category?: string;
  isActive?: string;
  take?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}): Promise<{ items: Bee[]; total: number }> => {
  const response = await api.get('/bees/admin/list/all', { params });
  return response.data;
};

export const getBeeStats = async (): Promise<BeeStats> => {
  const response = await api.get('/bees/admin/stats');
  return response.data;
};

export const getBeeDetails = async (id: string): Promise<Bee> => {
  const response = await api.get(`/bees/${id}`);
  return response.data;
};

export const toggleBeeActive = async (id: string): Promise<Bee> => {
  const response = await api.patch(`/bees/admin/${id}/toggle-active`);
  return response.data;
};

export const deleteBee = async (id: string): Promise<void> => {
  await api.delete(`/bees/admin/${id}`);
};
