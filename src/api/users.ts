import apiClient from './client';
import { User } from '../types';

export const userApi = {
  getAll: async () => {
    const response = await apiClient.get<User[]>('/api/users');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get<User>(`/api/users/${id}`);
    return response.data;
  },
};
