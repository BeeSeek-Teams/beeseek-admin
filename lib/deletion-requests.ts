import api from './api';

export interface DeletionRequest {
  id: string;
  email: string;
  fullName: string;
  reason: string | null;
  status: 'PENDING' | 'CONFIRMATION_SENT' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  confirmationSentAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  processedBy: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getDeletionRequests = async (params: {
  status?: string;
  take?: number;
  skip?: number;
}): Promise<{ items: DeletionRequest[]; total: number }> => {
  const response = await api.get('/deletion-requests', { params });
  return response.data;
};

export const getDeletionRequest = async (id: string): Promise<DeletionRequest> => {
  const response = await api.get(`/deletion-requests/${id}`);
  return response.data;
};

export const sendConfirmationEmail = async (id: string) => {
  const response = await api.post(`/deletion-requests/${id}/send-confirmation`);
  return response.data;
};

export const initiateDeletion = async (id: string) => {
  const response = await api.post(`/deletion-requests/${id}/initiate`);
  return response.data;
};

export const rejectDeletionRequest = async (id: string, reason?: string) => {
  const response = await api.post(`/deletion-requests/${id}/reject`, { reason });
  return response.data;
};
