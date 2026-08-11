import apiClient from './client';
import { Order } from '../types';

export const orderApi = {
  getAll: async () => {
    const response = await apiClient.get<Order[]>('/api/orders');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get<Order>(`/api/orders/${id}`);
    return response.data;
  },
  create: async (order: { user: { id: number }; totalAmount: number; status: string }) => {
    const response = await apiClient.post<Order>('/api/orders', order);
    return response.data;
  },
  update: async (id: number, order: { user: { id: number }; totalAmount: number; status: string }) => {
    const response = await apiClient.put<Order>(`/api/orders/${id}`, order);
    return response.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(`/api/orders/${id}`);
  },
};
