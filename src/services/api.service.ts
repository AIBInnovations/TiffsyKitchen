import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://tiffsy-backend.onrender.com';

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

    console.log('========== API SERVICE REQUEST ==========');
    console.log('Endpoint:', `${BASE_URL}${endpoint}`);
    console.log('Method:', config.method);
    console.log('Token Retrieved from Storage:', token ? 'YES' : 'NO');
    if (token) {
      console.log('Token Length:', token.length);
      console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
      console.log('Token (last 20 chars):', '...' + token.substring(token.length - 20));
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization Header Set:', `Bearer ${token.substring(0, 30)}...`);
    } else {
      console.log('⚠️  No token available - Request will be sent without Authorization header');
    }

    console.log('Request Headers:', JSON.stringify(headers, null, 2));
    if (config.body) {
      console.log('Request Body:', JSON.stringify(config.body, null, 2));
    }
    console.log('Timestamp:', new Date().toISOString());
    console.log('=========================================');

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: config.method,
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    console.log('========== API SERVICE RESPONSE ==========');
    console.log('Endpoint:', endpoint);
    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response OK:', response.ok);
    console.log('Timestamp:', new Date().toISOString());
    console.log('==========================================');

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      console.log('========== API SERVICE ERROR ==========');
      console.log('Endpoint:', endpoint);
      console.log('Status Code:', response.status);
      console.log('Error Message:', error.message);
      console.log('Full Error:', JSON.stringify(error, null, 2));
      console.log('=======================================');
      throw new Error(error.message || 'Request failed');
    }

    const responseData = await response.json();
    console.log('========== API SERVICE SUCCESS DATA ==========');
    console.log('Endpoint:', endpoint);
    console.log('Response Data:', JSON.stringify(responseData, null, 2));
    console.log('==============================================');

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
