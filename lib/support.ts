import api from './api';

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  evidence: string[];
  assignedAdminId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  text: string;
  isFromSupport: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export const getAllTickets = async (): Promise<Ticket[]> => {
  const response = await api.get('/support/admin/tickets');
  return response.data?.items || [];
};

export const getTicketDetails = async (id: string): Promise<Ticket> => {
  const response = await api.get(`/support/admin/tickets/${id}`);
  return response.data;
};

export const claimTicket = async (id: string): Promise<Ticket> => {
  const response = await api.patch(`/support/admin/tickets/${id}/claim`);
  return response.data;
};

export const resolveTicket = async (id: string): Promise<Ticket> => {
  const response = await api.patch(`/support/admin/tickets/${id}/resolve`);
  return response.data;
};

export const sendSupportMessage = async (ticketId: string, text: string): Promise<TicketMessage> => {
  const response = await api.post(`/support/admin/tickets/${ticketId}/messages`, { text });
  return response.data;
};
export interface SupportStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export const getSupportStats = async (): Promise<SupportStats> => {
  const response = await api.get('/support/admin/tickets');
  const { items = [] } = response.data || {};
  
  return {
    total: items.length,
    open: items.filter((t: Ticket) => t.status === 'OPEN').length,
    inProgress: items.filter((t: Ticket) => t.status === 'IN_PROGRESS').length,
    resolved: items.filter((t: Ticket) => t.status === 'RESOLVED').length,
  };
};