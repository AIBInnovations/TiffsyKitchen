import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types/order';
import { orderService } from '../services/order.service';

interface UseOrdersOptions {
  status?: string;
  autoFetch?: boolean;
}

export const useOrders = (options: UseOrdersOptions = {}) => {
  const { status, autoFetch = true } = options;
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders(status);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  const updateStatus = useCallback(async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      throw err;
    }
  }, []);

  const assignDriver = useCallback(async (orderId: string, driverId: string) => {
    try {
      const updated = await orderService.assignDriver(orderId, driverId);
      setOrders(prev =>
        prev.map(order => (order.id === orderId ? updated : order))
      );
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch, fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateStatus,
    assignDriver,
  };
};
