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
  phone?: string;
  role?: string;
  age?: number;
  deviceType?: string;
  deviceModel?: string;
  lastLoginAt?: string;
  lastIpAddress?: string;
}

export interface ScreeningMatch {
  name: string;
  matchScore: number;
  category: string;
  source: string;
  details?: string;
}

export interface BackgroundCheckResult {
  success: boolean;
  riskLevel?: 'low' | 'medium' | 'high' | 'unknown';
  isPEP?: boolean;
  isSanctioned?: boolean;
  isWatchlisted?: boolean;
  totalMatches?: number;
  matches?: ScreeningMatch[];
  reportId?: string;
  error?: string;
}

export const getPendingVerifications = async (): Promise<PendingVerification[]> => {
  const response = await api.get('/users/verifications/pending');
  return response.data;
};

export const runBackgroundCheck = async (userId: string): Promise<BackgroundCheckResult> => {
  const response = await api.post(`/users/verifications/${userId}/background-check`);
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
