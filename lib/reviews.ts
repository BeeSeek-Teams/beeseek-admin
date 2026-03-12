import api from './api';
import { User } from './users';

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  reviewerRole: 'CLIENT' | 'AGENT';
  isVerifiedTransaction: boolean;
  isFlagged: boolean;
  flagReason: string | null;
  createdAt: string;
  reviewer: User;
  reviewee: User;
  job: {
    id: string;
  }
}

export const getFlaggedReviews = async (params: any) => {
  const response = await api.get('/reviews/admin/flagged', { params });
  return response.data;
};

export const toggleReviewFlag = async (id: string, isFlagged: boolean) => {
  const response = await api.post(`/reviews/admin/${id}/toggle-flag`, { isFlagged });
  return response.data;
};
