import { useState, useEffect, useCallback } from 'react';
import { Delivery } from '../types/delivery';
import { deliveryService } from '../services/delivery.service';

interface UseDeliveriesOptions {
  status?: string;
  isDriver?: boolean;
  autoFetch?: boolean;
}

export const useDeliveries = (options: UseDeliveriesOptions = {}) => {
  const { status, isDriver = false, autoFetch = true } = options;
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = isDriver
        ? await deliveryService.getDriverDeliveries()
        : await deliveryService.getDeliveries(status);
      setDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deliveries');
    } finally {
      setIsLoading(false);
    }
  }, [status, isDriver]);

  const acceptDelivery = useCallback(async (deliveryId: string) => {
    try {
      const updated = await deliveryService.acceptDelivery(deliveryId);
      setDeliveries(prev =>
        prev.map(d => (d.id === deliveryId ? updated : d))
      );
    } catch (err) {
      throw err;
    }
  }, []);

  const startDelivery = useCallback(async (deliveryId: string) => {
    try {
      const updated = await deliveryService.startDelivery(deliveryId);
      setDeliveries(prev =>
        prev.map(d => (d.id === deliveryId ? updated : d))
      );
    } catch (err) {
      throw err;
    }
  }, []);

  const completeDelivery = useCallback(
    async (deliveryId: string, data: { notes?: string; proofImageUrl?: string }) => {
      try {
        const updated = await deliveryService.completeDelivery(deliveryId, data);
        setDeliveries(prev =>
          prev.map(d => (d.id === deliveryId ? updated : d))
        );
      } catch (err) {
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    if (autoFetch) {
      fetchDeliveries();
    }
  }, [autoFetch, fetchDeliveries]);

  return {
    deliveries,
    isLoading,
    error,
    fetchDeliveries,
    acceptDelivery,
    startDelivery,
    completeDelivery,
  };
};
