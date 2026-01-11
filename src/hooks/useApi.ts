import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api.enhanced.service';

/**
 * API Hook State
 */
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * In-memory cache for API responses
 * Performance: Reduces unnecessary API calls
 */
const apiCache = new Map<string, CacheEntry<any>>();

/**
 * useApi Hook
 *
 * A reusable hook for making API calls with automatic:
 * - Loading state management
 * - Error handling
 * - Manual refresh capability
 * - Optional caching with TTL
 *
 * Usage:
 * ```tsx
 * const { data, loading, error, refresh } = useApi<DashboardData>(
 *   '/api/admin/dashboard',
 *   { cache: 30000 } // Cache for 30 seconds
 * );
 * ```
 *
 * Performance Considerations:
 * - Caching prevents redundant API calls when navigating back to screen
 * - Automatic cleanup prevents memory leaks
 * - Debouncing prevents rapid repeated calls
 */
export function useApi<T>(
  endpoint: string,
  options?: {
    /**
     * Cache duration in milliseconds
     * 0 or undefined = no caching (always fresh)
     * 30000 = cache for 30 seconds
     */
    cache?: number;
    /**
     * Auto-fetch on mount
     * Default: true
     */
    autoFetch?: boolean;
    /**
     * Dependencies that trigger refetch
     */
    dependencies?: any[];
  }
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const lastFetchTime = useRef<number>(0);

  const cacheDuration = options?.cache || 0;
  const autoFetch = options?.autoFetch !== false;

  /**
   * Fetch data from API
   * Performance: Prevents fetch spam with 500ms minimum between calls
   */
  const fetchData = useCallback(async () => {
    // Prevent fetch spam (minimum 500ms between calls)
    const now = Date.now();
    if (now - lastFetchTime.current < 500) {
      return;
    }
    lastFetchTime.current = now;

    // Check cache first
    if (cacheDuration > 0) {
      const cached = apiCache.get(endpoint);
      if (cached && now - cached.timestamp < cacheDuration) {
        setData(cached.data);
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.get<T>(endpoint);

      if (!isMounted.current) return;

      // Handle backend response structure
      // Backend can return multiple formats:
      // 1. Standard: { success: true, data: {...}, message: string }
      // 2. Backend format: { message: true, error: {...}, data: null }
      // 3. Error format: { message: false/string, data: string/null, error: null }

      let actualData = null;
      let isSuccess = false;
      let errorMessage = null;

      const rawResponse = response as any;

      // Check if message is boolean true (backend success format)
      if (rawResponse.message === true && rawResponse.error && typeof rawResponse.error === 'object') {
        // Backend actual response: { message: true, error: {...} }
        actualData = rawResponse.error;
        isSuccess = true;
      }
      // Check if success field exists and is true (standard format)
      else if (response.success && response.data) {
        // Standard response: { success: true, data: {...} }
        actualData = response.data;
        isSuccess = true;
      }
      // Check if message is false or a string (error case)
      else if (rawResponse.message === false || typeof rawResponse.message === 'string') {
        isSuccess = false;
        // Extract error message from data field or message field
        if (typeof rawResponse.data === 'string') {
          errorMessage = rawResponse.data;
        } else if (typeof rawResponse.message === 'string') {
          errorMessage = rawResponse.message;
        } else {
          errorMessage = 'Request failed';
        }
      }

      if (isSuccess && actualData) {
        setData(actualData);

        // Update cache
        if (cacheDuration > 0) {
          apiCache.set(endpoint, {
            data: actualData,
            timestamp: now,
          });
        }
      } else {
        setError(errorMessage || 'Request failed');
      }
    } catch (err: any) {
      if (!isMounted.current) return;

      // Handle error object with message field being boolean
      let errorMsg = 'An error occurred';
      if (err.data && typeof err.data === 'string') {
        errorMsg = err.data;
      } else if (err.message && typeof err.message === 'string') {
        errorMsg = err.message;
      }

      setError(errorMsg);

      // Handle auth errors
      if (err.requiresReauth) {
        // Trigger logout/re-login flow
        // This will be handled by a global auth context
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [endpoint, cacheDuration]);

  /**
   * Manual refresh function
   * Clears cache and refetches data
   */
  const refresh = useCallback(async () => {
    // Clear cache for this endpoint
    apiCache.delete(endpoint);
    await fetchData();
  }, [endpoint, fetchData]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    return () => {
      isMounted.current = false;
    };
  }, [autoFetch, fetchData, ...(options?.dependencies || [])]);

  return { data, loading, error, refresh };
}

/**
 * useMutation Hook
 *
 * For POST/PUT/PATCH/DELETE operations
 *
 * Usage:
 * ```tsx
 * const { mutate, loading, error } = useMutation<User>('/api/admin/users');
 *
 * const handleCreate = async () => {
 *   const result = await mutate({ name: 'John', role: 'ADMIN' });
 *   if (result) {
 *     // Success
 *   }
 * };
 * ```
 */
export function useMutation<T>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const mutate = useCallback(
    async (data?: any): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        let response;

        switch (method) {
          case 'POST':
            response = await apiService.post<T>(endpoint, data);
            break;
          case 'PUT':
            response = await apiService.put<T>(endpoint, data);
            break;
          case 'PATCH':
            response = await apiService.patch<T>(endpoint, data);
            break;
          case 'DELETE':
            response = await apiService.delete<T>(endpoint);
            break;
        }

        if (!isMounted.current) return null;

        const rawResponse = response as any;

        // Handle different response formats
        if (response.success) {
          // Standard success format
          clearRelatedCache(endpoint);
          return response.data;
        } else if (rawResponse.message === true && rawResponse.error) {
          // Backend success format: { message: true, error: {...} }
          clearRelatedCache(endpoint);
          return rawResponse.error;
        } else {
          // Error format: extract proper error message
          let errorMessage = 'Request failed';
          if (typeof rawResponse.data === 'string') {
            errorMessage = rawResponse.data;
          } else if (typeof rawResponse.message === 'string') {
            errorMessage = rawResponse.message;
          }
          setError(errorMessage);
          return null;
        }
      } catch (err: any) {
        if (!isMounted.current) return null;

        // Handle error object with message field being boolean
        let errorMsg = 'An error occurred';
        if (err.data && typeof err.data === 'string') {
          errorMsg = err.data;
        } else if (err.message && typeof err.message === 'string') {
          errorMsg = err.message;
        }

        setError(errorMsg);
        return null;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [endpoint, method]
  );

  return { mutate, loading, error };
}

/**
 * Clear cached data for related endpoints
 * Example: After creating a user, clear /api/admin/users cache
 */
function clearRelatedCache(endpoint: string) {
  const keys = Array.from(apiCache.keys());
  const baseEndpoint = endpoint.split('?')[0];

  keys.forEach(key => {
    if (key.startsWith(baseEndpoint)) {
      apiCache.delete(key);
    }
  });
}

/**
 * useInfiniteScroll Hook
 *
 * For paginated lists with infinite scroll
 *
 * Usage:
 * ```tsx
 * const { data, loading, error, loadMore, hasMore, refresh } = useInfiniteScroll<User>(
 *   '/api/admin/users',
 *   { limit: 20 }
 * );
 * ```
 */
export function useInfiniteScroll<T>(
  endpoint: string,
  options?: {
    limit?: number;
    initialParams?: Record<string, any>;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const limit = options?.limit || 20;
  const initialParams = options?.initialParams || {};

  const fetchPage = useCallback(
    async (pageNum: number, reset = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          ...initialParams,
          page: pageNum.toString(),
          limit: limit.toString(),
        });

        const response = await apiService.get<any>(`${endpoint}?${params}`);

        if (!isMounted.current) return;

        console.log('useInfiniteScroll received response:', response);

        // Handle backend response structure (same as useApi)
        let actualData = null;
        let isSuccess = false;
        let errorMessage = null;

        const rawResponse = response as any;

        // Check if message is boolean true (backend success format)
        if (rawResponse.message === true && rawResponse.error && typeof rawResponse.error === 'object') {
          // Backend actual response: { message: true, error: {...} }
          actualData = rawResponse.error;
          isSuccess = true;
          console.log('Using data from error field (backend structure)');
        }
        // Check if success field exists and is true (standard format)
        else if (response.success && response.data) {
          // Standard response: { success: true, data: {...} }
          actualData = response.data;
          isSuccess = true;
          console.log('Using data from data field (standard)');
        }
        // Check if message is false or a string (error case)
        else if (rawResponse.message === false || typeof rawResponse.message === 'string') {
          isSuccess = false;
          // Extract error message from data field or message field
          if (typeof rawResponse.data === 'string') {
            errorMessage = rawResponse.data;
          } else if (typeof rawResponse.message === 'string') {
            errorMessage = rawResponse.message;
          } else {
            errorMessage = 'Request failed';
          }
          console.log('Error response detected:', errorMessage);
        }

        if (isSuccess && actualData) {
          // Get the data array (first key that's an array)
          const dataKey = Object.keys(actualData).find(
            key => Array.isArray(actualData[key])
          );

          if (dataKey) {
            const newData = actualData[dataKey] as T[];

            if (reset) {
              setData(newData);
            } else {
              setData(prev => [...prev, ...newData]);
            }

            // Check for pagination info
            if (actualData.pagination) {
              setHasMore(actualData.pagination.page < actualData.pagination.pages);
            } else {
              // If no pagination info, assume no more pages
              setHasMore(false);
            }
          }
        } else {
          console.log('Response not successful:', errorMessage);
          setError(errorMessage || 'Request failed');
        }
      } catch (err: any) {
        if (!isMounted.current) return;
        setError(err.message || 'An error occurred');
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [endpoint, limit, initialParams, loading]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage);
    }
  }, [page, loading, hasMore, fetchPage]);

  const refresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await fetchPage(1, true);
  }, [fetchPage]);

  useEffect(() => {
    fetchPage(1, true);

    return () => {
      isMounted.current = false;
    };
  }, [endpoint, limit]);

  return { data, loading, error, loadMore, hasMore, refresh };
}

/**
 * Clear all cached data
 * Useful for logout
 */
export function clearAllCache() {
  apiCache.clear();
}
