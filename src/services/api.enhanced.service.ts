import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const BASE_URL = 'https://tiffsy-backend.onrender.com';

// API Response wrapper from your backend
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  skipRetry?: boolean; // For login/auth endpoints
}

interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  retryableStatuses: number[]; // HTTP status codes to retry
}

/**
 * Enhanced API Service
 *
 * Features:
 * - Auto token refresh on 401
 * - Automatic retry with exponential backoff
 * - Network connectivity check
 * - Request deduplication (prevents duplicate in-flight requests)
 * - Better error messages
 *
 * Performance Considerations:
 * - Token is cached in memory after first read (reduces AsyncStorage calls)
 * - Network state is checked before requests (fail fast if offline)
 * - Retry only on network errors and 5xx server errors (not on 4xx client errors)
 */
class EnhancedApiService {
  private tokenCache: string | null = null;
  private refreshingToken: Promise<string | null> | null = null;
  private pendingRequests: Map<string, Promise<any>> = new Map();

  // Retry configuration
  private retryConfig: RetryConfig = {
    maxRetries: 2,
    retryDelay: 1000, // 1 second
    retryableStatuses: [408, 429, 500, 502, 503, 504], // Request Timeout, Too Many Requests, Server Errors
  };

  /**
   * Get auth token from cache or AsyncStorage
   * Performance: Caches token in memory to avoid repeated AsyncStorage reads
   */
  private async getAuthToken(): Promise<string | null> {
    if (this.tokenCache) {
      return this.tokenCache;
    }

    this.tokenCache = await AsyncStorage.getItem('authToken');
    return this.tokenCache;
  }

  /**
   * Update auth token in cache and AsyncStorage
   */
  private async setAuthToken(token: string | null): Promise<void> {
    this.tokenCache = token;
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  }

  /**
   * Check network connectivity before making requests
   * Performance: Fail fast if offline, preventing unnecessary timeout waits
   */
  private async checkConnectivity(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  /**
   * Refresh authentication token
   * Handles concurrent refresh requests (prevents multiple refresh calls)
   */
  private async refreshToken(): Promise<string | null> {
    // If already refreshing, return existing promise
    if (this.refreshingToken) {
      return this.refreshingToken;
    }

    this.refreshingToken = (async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/admin/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await this.getAuthToken()}`,
          },
        });

        if (!response.ok) {
          // Refresh failed, clear token and logout
          await this.setAuthToken(null);
          return null;
        }

        const result: ApiResponse<{ token: string; expiresIn: number }> = await response.json();

        if (result.success && result.data.token) {
          await this.setAuthToken(result.data.token);
          return result.data.token;
        }

        return null;
      } catch (error) {
        console.error('Token refresh failed:', error);
        await this.setAuthToken(null);
        return null;
      } finally {
        this.refreshingToken = null;
      }
    })();

    return this.refreshingToken;
  }

  /**
   * Make HTTP request with automatic retry and token refresh
   *
   * Scale Considerations:
   * - Request deduplication prevents duplicate API calls when user taps multiple times
   * - Exponential backoff prevents overwhelming the server during issues
   * - Only retries on network/server errors (not client errors like 400, 404)
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    // Check network connectivity first
    const isConnected = await this.checkConnectivity();
    if (!isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    // Create unique key for request deduplication
    const requestKey = `${config.method}:${endpoint}:${JSON.stringify(config.body || {})}`;

    // If same request is already in flight, return existing promise
    // Performance: Prevents duplicate API calls (e.g., user double-tapping button)
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)!;
    }

    const requestPromise = (async () => {
      try {
        const token = await this.getAuthToken();

        console.log('========== API REQUEST ==========');
        console.log('Endpoint:', endpoint);
        console.log('Method:', config.method);
        console.log('Token (first 30 chars):', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
        console.log('Token (last 10 chars):', token ? '...' + token.substring(token.length - 10) : 'NO TOKEN');

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...config.headers,
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('Authorization Header:', headers['Authorization'] ? 'Bearer ' + headers['Authorization'].substring(7, 37) + '...' : 'NO AUTH');
        console.log('=================================');

        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: config.method,
          headers,
          body: config.body ? JSON.stringify(config.body) : undefined,
        });

        console.log('========== FETCH COMPLETE ==========');
        console.log('Endpoint:', endpoint);
        console.log('Response Status:', response.status);
        console.log('Response OK:', response.ok);
        console.log('====================================');

        const responseData = await response.json();
        console.log('========== RAW RESPONSE ==========');
        console.log('Endpoint:', endpoint);
        console.log('Status:', response.status);
        console.log('Response:', responseData);
        console.log('==================================');

        // Handle 401 Unauthorized - Try token refresh
        if (response.status === 401 && !config.skipRetry) {
          const newToken = await this.refreshToken();

          if (newToken) {
            // Retry request with new token
            headers['Authorization'] = `Bearer ${newToken}`;

            const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
              method: config.method,
              headers,
              body: config.body ? JSON.stringify(config.body) : undefined,
            });

            const retryData = await retryResponse.json();
            console.log('========== RAW RESPONSE (After Refresh) ==========');
            console.log('Endpoint:', endpoint);
            console.log('Status:', retryResponse.status);
            console.log('Response:', retryData);
            console.log('==================================================');

            if (!retryResponse.ok) {
              throw retryData;
            }

            return retryData;
          } else {
            // Token refresh failed, user needs to login again
            throw {
              success: false,
              message: 'Session expired. Please login again.',
              requiresReauth: true,
            };
          }
        }

        // Handle other error responses
        if (!response.ok) {
          // Retry on retryable status codes
          if (
            this.retryConfig.retryableStatuses.includes(response.status) &&
            retryCount < this.retryConfig.maxRetries &&
            !config.skipRetry
          ) {
            // Exponential backoff: 1s, 2s, 4s...
            const delay = this.retryConfig.retryDelay * Math.pow(2, retryCount);
            await new Promise(resolve => setTimeout(resolve, delay));

            // Recursive retry
            return this.request<T>(endpoint, config, retryCount + 1);
          }

          throw responseData;
        }

        return responseData;
      } catch (error: any) {
        console.log('========== API ERROR ==========');
        console.log('Endpoint:', endpoint);
        console.log('Error Type:', error.name);
        console.log('Error Message:', error.message);
        console.log('Full Error:', error);
        console.log('===============================');

        // Handle network errors (no response from server)
        if (error.message === 'Network request failed' || error.name === 'TypeError') {
          if (retryCount < this.retryConfig.maxRetries && !config.skipRetry) {
            const delay = this.retryConfig.retryDelay * Math.pow(2, retryCount);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.request<T>(endpoint, config, retryCount + 1);
          }

          throw {
            success: false,
            message: 'Network error. Please check your connection and try again.',
          };
        }

        // Re-throw other errors
        throw error;
      } finally {
        // Remove from pending requests
        this.pendingRequests.delete(requestKey);
      }
    })();

    // Store in pending requests
    this.pendingRequests.set(requestKey, requestPromise);

    return requestPromise;
  }

  // Public API methods

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, skipRetry = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: data, skipRetry });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Clear token and logout
   */
  async logout(): Promise<void> {
    await this.setAuthToken(null);
    this.pendingRequests.clear();
  }

  /**
   * Set token explicitly (for login flow)
   */
  async login(token: string): Promise<void> {
    await this.setAuthToken(token);
  }
}

export const apiService = new EnhancedApiService();
