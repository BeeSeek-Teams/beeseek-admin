import api from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  slug?: string;
  linkedAccountId?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  profileImage?: string;
  bio?: string;
  age?: number;
  phone?: string;
  // Verification
  isVerified?: boolean;
  isNinVerified?: boolean;
  ninStatus?: string;
  ninNumber?: string;
  ninVerifiedAt?: string;
  ninRegistryName?: string;
  ninBackgroundCheck?: Record<string, any>;
  ninNameMatchConfidence?: number;
  // Wallet
  walletBalance?: number;
  lockedBalance?: number;
  monnifyNUBAN?: string;
  monnifyBankName?: string;
  monnifyAccountName?: string;
  monnifyBVN?: string;
  // Profile extras
  rating?: number;
  totalReviews?: number;
  latitude?: number;
  longitude?: number;
  // Device info
  deviceId?: string;
  deviceType?: string;
  deviceModel?: string;
  lastIpAddress?: string;
  // Achievements
  earlyAccessAchievement?: boolean;
  topRatedAchievement?: boolean;
  goldenBadgeAchievement?: boolean;
  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  // Activity
  isActive?: boolean;
  isAvailable?: boolean;
  isBooked?: boolean;
  bookedDate?: string;
  bookedTime?: string;
  lastLoginAt?: string;
  lastClientLoginAt?: string;
  lastAgentLoginAt?: string;
  // Biometrics / Notifications
  useBiometrics?: boolean;
  pushNotificationsEnabled?: boolean;
  // Suspension
  suspendedAt?: string;
  suspensionExpiresAt?: string;
  suspensionReason?: string;
  suspendedBy?: string;
  // Deactivation / Deletion
  deactivatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  // Services
  bees?: any[];
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

export const suspendUser = async (userId: string, reason: string, durationDays?: number) => {
  const response = await api.post(`/users/${userId}/suspend`, { reason, durationDays });
  return response.data;
};

export const unsuspendUser = async (userId: string) => {
  const response = await api.post(`/users/${userId}/unsuspend`);
  return response.data;
};

export const sendNinReminder = async (userId: string) => {
  const response = await api.post(`/users/${userId}/remind-nin`);
  return response.data;
};
