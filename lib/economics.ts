import api from './api';

export interface EconomicsStats {
  revenue: {
    serviceFees: number;
    commissions: number;
    total: number;
  };
  withdrawals: {
    feesCollected: number;
    costsBorne: number;
    netWithdrawalProfit: number;
  };
  netPlatformPosition: number;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'FEE_WAIVER' | 'FLAT_DISCOUNT' | 'PERCENTAGE_DISCOUNT';
  value: number;
  isActive: boolean;
  conditions: any;
  priority: number;
  createdAt: string;
}

export const getEconomicsStats = async (): Promise<EconomicsStats> => {
  const response = await api.get('/wallet/admin/economics');
  return response.data;
};

export const getPromotions = async (): Promise<Promotion[]> => {
  const response = await api.get('/admin/promotions');
  return response.data;
};

export const createPromotion = async (data: Partial<Promotion>): Promise<Promotion> => {
  const response = await api.post('/admin/promotions', data);
  return response.data;
};

export const updatePromotion = async (id: string, data: Partial<Promotion>): Promise<Promotion> => {
  const response = await api.patch(`/admin/promotions/${id}`, data);
  return response.data;
};

export const deletePromotion = async (id: string): Promise<void> => {
  await api.delete(`/admin/promotions/${id}`);
};
