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

export interface FraudLog {
  id: string;
  jobId: string;
  attemptedById: string;
  targetUserId: string;
  action: 'BLOCKED' | 'FLAGGED';
  reason: string;
  attemptedRole: 'CLIENT' | 'AGENT' | null;
  attemptedRating: number | null;
  attemptedComment: string | null;
  reviewId: string | null;
  createdAt: string;
  attemptedBy: User;
  targetUser: User;
  job: {
    id: string;
  } | null;
}

export const getFraudLogs = async (params: any) => {
  const response = await api.get('/reviews/admin/fraud-logs', { params });
  return response.data;
};
