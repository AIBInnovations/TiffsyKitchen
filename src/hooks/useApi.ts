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

      console.log('useApi received response:', JSON.stringify(response, null, 2));

      // Handle backend response structure
      // Backend returns: { message: true/string, data: any, error: any }
      // If message is true and error contains object data, use error field
      // If success is true, use data field (standard case)

      let actualData = null;
      let isSuccess = false;

      if (response.success && response.data) {
        // Standard response: { success: true, data: {...} }
        actualData = response.data;
        isSuccess = true;
        console.log('Using data from data field (standard)');
      } else if ((response as any).message === true && (response as any).error && typeof (response as any).error === 'object') {
        // Backend actual response: { message: true, error: {...} }
        actualData = (response as any).error;
        isSuccess = true;
        console.log('Using data from error field (backend structure)');
      }

      if (isSuccess && actualData) {
        console.log('Setting data:', JSON.stringify(actualData, null, 2));
        setData(actualData);

        // Update cache
        if (cacheDuration > 0) {
          apiCache.set(endpoint, {
            data: actualData,
            timestamp: now,
          });
        }
      } else {
        console.log('Response not successful:', response.message);
        setError(response.message || 'Request failed');
      }
    } catch (err: any) {
      if (!isMounted.current) return;

      console.log('useApi error:', err);
      setError(err.message || 'An error occurred');

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

        if (response.success) {
          // Clear any cached data for related endpoints
          // This ensures lists update after mutations
          clearRelatedCache(endpoint);
          return response.data;
        } else {
          setError(response.message || 'Request failed');
          return null;
        }
      } catch (err: any) {
        if (!isMounted.current) return null;

        setError(err.message || 'An error occurred');
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

        const response = await apiService.get<{
          [key: string]: T[];
          pagination: { page: number; pages: number };
        }>(`${endpoint}?${params}`);

        if (!isMounted.current) return;

        if (response.success) {
          // Get the data array (first key that's an array)
          const dataKey = Object.keys(response.data).find(
            key => Array.isArray(response.data[key])
          );

          if (dataKey) {
            const newData = response.data[dataKey] as T[];

            if (reset) {
              setData(newData);
            } else {
              setData(prev => [...prev, ...newData]);
            }

            setHasMore(response.data.pagination.page < response.data.pagination.pages);
          }
        } else {
          setError(response.message || 'Request failed');
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
