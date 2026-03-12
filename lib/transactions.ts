import api from './api';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  LOCKED = 'LOCKED',
  ESCROW = 'ESCROW',
  REVENUE = 'REVENUE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface Transaction {
  id: string;
  userId: string | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  monnifyReference: string | null;
  contractId: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TransactionStats {
  byType: {
    type: TransactionType;
    total: string;
    count: string;
  }[];
  revenue: {
    totalServiceFees: string;
    totalCommissions: string;
  };
}

export interface TransactionListResponse {
  items: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getTransactions = async (params: {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  search?: string;
}): Promise<TransactionListResponse> => {
  const response = await api.get('/wallet/admin/transactions', { params });
  return response.data;
};

export const getTransactionStats = async (): Promise<TransactionStats> => {
  const response = await api.get('/wallet/admin/stats');
  return response.data;
};
