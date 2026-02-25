import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://d31od4t2t5epcb.cloudfront.net';

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, config: RequestConfig): Promise<T> {
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Log request
    console.log('📤 REQUEST:', config.method, `${BASE_URL}${endpoint}`);
    if (config.body) {
      console.log('📦 Body:', JSON.stringify(config.body, null, 2));
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: config.method,
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    console.log(response)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      console.log('❌ Response:', response.status, JSON.stringify(errorData, null, 2));

      // Create a detailed error object that preserves backend response structure
      const error: any = new Error(errorData.data || errorData.message || 'Request failed');
      error.status = response.status;
      error.response = {
        status: response.status,
        data: errorData,
      };
      throw error;
    }

    const responseData = await response.json();

    // Log response
    console.log('✅ RESPONSE:', config.method, `${BASE_URL}${endpoint}`, JSON.stringify(responseData, null, 2));

    return responseData;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
