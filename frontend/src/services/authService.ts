import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('bhumi_auth_token', response.data.access_token);
    localStorage.setItem('bhumi_user', JSON.stringify(response.data.user));
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('bhumi_auth_token');
    localStorage.removeItem('bhumi_user');
  },

  getStoredUser(): User | null {
    const data = localStorage.getItem('bhumi_user');
    return data ? JSON.parse(data) : null;
  }
};
