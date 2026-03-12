import api from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
  profileImage?: string;
  bio?: string;
  age?: number;
  isVerified?: boolean;
  ninStatus?: string;
  ninNumber?: string;
  bees?: any[];
  walletBalance?: number;
  lockedBalance?: number;
}

export const getUsers = async (params: {
  search?: string;
  role?: string;
  status?: string;
  ninStatus?: string;
  take?: number;
  skip?: number;
}): Promise<{ items: User[]; total: number }> => {
  const response = await api.get('/users/list/all', { params });
  return response.data;
};

export const getUserDetails = async (userId: string): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const toggleBlockUser = async (userId: string) => {
  const response = await api.patch(`/users/${userId}/toggle-block`);
  return response.data;
};

export const updateVerificationStatus = async (userId: string, status: string) => {
  const response = await api.patch(`/users/verifications/${userId}/status`, { status });
  return response.data;
};
