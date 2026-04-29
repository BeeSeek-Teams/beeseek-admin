import api from './api';
import { User } from './users';

export enum JobStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  ESCALATED = 'ESCALATED',
  COMPLETED = 'COMPLETED',
}

export enum JobStep {
  ALL_SET = 'ALL_SET',
  MATERIALS_PURCHASED = 'MATERIALS_PURCHASED',
  ON_THE_WAY = 'ON_THE_WAY',
  ARRIVED = 'ARRIVED',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
  HOME_SAFE = 'HOME_SAFE',
}

export const isErrandDetails = (details?: string) =>
  typeof details === 'string' &&
  details.includes('[ERRAND_META]') &&
  details.includes('[/ERRAND_META]');

export const getJobFlowLabel = (details?: string) =>
  isErrandDetails(details) ? 'ERRAND' : 'JOB';

export interface Job {
  id: string;
  contractId: string;
  status: JobStatus;
  currentStep: JobStep;
  arrivalCode: string;
  paidAt: string | null;
  materialsPurchasedAt: string | null;
  onTheWayAt: string | null;
  arrivedAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  completedAt: string | null;
  homeSafeAt: string | null;
  createdAt: string;
  updatedAt: string;
  contract: {
    id: string;
    details: string;
    workDate: string;
    startTime: string;
    address: string;
    workmanshipCost: number;
    transportFare: number;
    serviceFee: number;
    commissionAmount: number;
    totalAmount: number;
    materials?: { item: string; cost: number }[];
    client: User;
    agent: User;
    bee: {
      id: string;
      title: string;
      category: string;
      image: string;
    };
  };
  reviews?: any[];
  cancellationAudit?: {
    reason: string;
    category: string;
    createdAt: string;
    cancelledBy: User;
    isAgentInfraction: boolean;
    refundedAmount: number;
    agentRetention: number;
  };
}

export const getJobs = async (params: any) => {
  const response = await api.get('/contracts/admin/jobs', { params });
  return response.data;
};

export const getJob = async (id: string): Promise<Job> => {
  const response = await api.get(`/contracts/jobs/${id}`);
  return response.data;
};

export const updateJobStatus = async (id: string, status: JobStatus) => {
  const response = await api.post(`/contracts/jobs/${id}/status`, { status });
  return response.data;
};

export const getAdminInfractions = async (params: any) => {
  const response = await api.get('/contracts/admin/infractions', { params });
  return response.data;
};

export const adminCancelJob = async (jobId: string, reason: string, markAsInfraction: boolean = false) => {
  const response = await api.post(`/contracts/admin/jobs/${jobId}/cancel`, { reason, markAsInfraction });
  return response.data;
};

export const getAgentInfractionCount = async (agentId: string): Promise<{ agentId: string; infractionCount: number }> => {
  const response = await api.get(`/contracts/admin/agents/${agentId}/infraction-count`);
  return response.data;
};
