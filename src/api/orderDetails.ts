import apiClient from './client';
import { OrderDetail } from '../types';

export const orderDetailApi = {
  getAll: async () => {
    const response = await apiClient.get<OrderDetail[]>('/api/order-details');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get<OrderDetail>(`/api/order-details/${id}`);
    return response.data;
  },
  create: async (orderDetail: { order: { id: number }; product: { id: number }; quantity: number; price: number }) => {
    const response = await apiClient.post<OrderDetail>('/api/order-details', orderDetail);
    return response.data;
  },
  update: async (id: number, orderDetail: { order: { id: number }; product: { id: number }; quantity: number; price: number }) => {
    const response = await apiClient.put<OrderDetail>(`/api/order-details/${id}`, orderDetail);
    return response.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(`/api/order-details/${id}`);
  },
};
