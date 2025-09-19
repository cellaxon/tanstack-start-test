import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService, type UserProfile } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: UserProfile;
}

export function useAuthMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials, {
        skipAuth: true,
      });

      AuthService.saveTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_in: response.expires_in,
        token_type: response.token_type,
      });

      return response;
    },
    onSuccess: (data) => {
      // Save user info to localStorage for DashboardLayout
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
      AuthService.clearTokens();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.get<UserProfile>('/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = AuthService.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await apiClient.post<LoginResponse>(
        '/auth/refresh',
        { refresh_token: refreshToken },
        { skipAuth: true }
      );

      AuthService.saveTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_in: response.expires_in,
        token_type: response.token_type,
      });

      return response;
    },
  });
}