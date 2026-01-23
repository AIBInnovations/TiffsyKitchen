import { Order } from '../types/api.types';

/**
 * Checks if an order is an auto-order (subscription-based)
 * Uses multiple detection methods for backward compatibility
 */
export const isAutoOrder = (order: Order): boolean => {
  // Check isAutoOrder flag first (most reliable)
  if (order.isAutoOrder === true) {
    return true;
  }

  // Fallback: Check special instructions
  if (order.specialInstructions === 'Auto-order') {
    return true;
  }

  // Heuristic: Voucher-only + ACCEPTED + auto in instructions
  if (
    order.paymentMethod === 'VOUCHER_ONLY' &&
    order.status === 'ACCEPTED' &&
    order.voucherUsage?.voucherCount > 0 &&
    order.specialInstructions?.toLowerCase().includes('auto')
  ) {
    return true;
  }

  return false;
};

/**
 * Checks if an order was auto-accepted (voucher order within operating hours)
 * Looks for "Auto-accepted" notes in the statusTimeline
 */
export const isAutoAccepted = (order: Order): boolean => {
  if (!order.statusTimeline || order.statusTimeline.length === 0) {
    return false;
  }

  const acceptedEntry = order.statusTimeline.find(
    entry => entry.status === 'ACCEPTED'
  );

  return (
    acceptedEntry?.notes?.toLowerCase().includes('auto-accepted') || false
  );
};

/**
 * Determines the auto-accept type of an order
 */
export const getAutoAcceptType = (
  order: Order
): 'AUTO_ORDER' | 'AUTO_ACCEPTED' | 'MANUAL' => {
  if (isAutoOrder(order)) return 'AUTO_ORDER';
  if (isAutoAccepted(order)) return 'AUTO_ACCEPTED';
  return 'MANUAL';
};

/**
 * Returns badge information for displaying auto-accept indicators
 * Returns null for manual orders
 */
export const getAutoAcceptBadgeInfo = (
  order: Order
): {
  label: string;
  color: string;
  icon: string;
} | null => {
  const type = getAutoAcceptType(order);

  if (type === 'AUTO_ORDER') {
    return {
      label: 'Auto-Order',
      color: '#8B5CF6', // Purple
      icon: 'repeat',
    };
  }

  if (type === 'AUTO_ACCEPTED') {
    return {
      label: 'Auto-Accepted',
      color: '#10B981', // Green
      icon: 'verified',
    };
  }

  return null;
};

/**
 * Checks if order timeline notes indicate auto-accept
 * Useful for highlighting notes in StatusTimeline component
 */
export const isAutoAcceptNote = (notes?: string): boolean => {
  if (!notes) return false;
  return (
    notes.toLowerCase().includes('auto-accept') ||
    notes.toLowerCase().includes('auto order')
  );
};

/**
 * Gets a human-readable description of why an order was auto-accepted
 */
export const getAutoAcceptDescription = (order: Order): string | null => {
  if (isAutoOrder(order)) {
    return 'Subscription-based auto-order - start preparation immediately';
  }

  if (isAutoAccepted(order)) {
    return 'Auto-accepted voucher order - within operating hours';
  }

  return null;
};
