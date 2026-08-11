import apiClient from './client';
import { Product } from '../types';

export const productApi = {
  getAll: async () => {
    const response = await apiClient.get<Product[]>('/api/products');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get<Product>(`/api/products/${id}`);
    return response.data;
  },
  create: async (product: Omit<Product, 'id'>) => {
    const response = await apiClient.post<Product>('/api/products', product);
    return response.data;
  },
  update: async (id: number, product: Omit<Product, 'id'>) => {
    const response = await apiClient.put<Product>(`/api/products/${id}`, product);
    return response.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(`/api/products/${id}`);
  },
};
