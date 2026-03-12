import api from './api';

export interface PendingVerification {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ninNumber: string;
  ninStatus: string;
  createdAt: string;
  profileImage?: string;
}

export const getPendingVerifications = async (): Promise<PendingVerification[]> => {
  const response = await api.get('/users/verifications/pending');
  return response.data;
};

export const updateVerificationStatus = async (
  userId: string,
  status: 'VERIFIED' | 'REJECTED',
  registryName?: string
) => {
  const response = await api.patch(`/users/verifications/${userId}/status`, {
    status,
    registryName,
  });
  return response.data;
};
