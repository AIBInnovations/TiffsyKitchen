import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {ordersService} from '../../../services/orders.service';
import {Order, OrderStatus} from '../../../types/api.types';
import StatusTimeline from '../components/StatusTimeline';
import CancelOrderModal from '../components/CancelOrderModal';
import {AcceptOrderModal} from '../components/AcceptOrderModal';
import {RejectOrderModal} from '../components/RejectOrderModal';
import {UpdateStatusModal} from '../components/UpdateStatusModal';
import {DeliveryStatusModal} from '../components/DeliveryStatusModal';
import {formatDistanceToNow} from 'date-fns';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface OrderDetailAdminScreenProps {
  route: {
    params: {
      orderId: string;
    };
  };
  navigation: any;
}

const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    PLACED: '#007AFF',
    ACCEPTED: '#00C7BE',
    REJECTED: '#FF3B30',
    PREPARING: '#FFCC00',
    READY: '#FF9500',
    PICKED_UP: '#AF52DE',
    OUT_FOR_DELIVERY: '#5856D6',
    DELIVERED: '#34C759',
    CANCELLED: '#FF3B30',
    FAILED: '#8B0000',
  };
  return colors[status] || '#8E8E93';
};

const safeFormatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Unknown date';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return formatDistanceToNow(date, {addSuffix: true});
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid date';
  }
};

const OrderDetailAdminScreen: React.FC<OrderDetailAdminScreenProps> = ({
  route,
  navigation,
}) => {
  const {orderId} = route.params;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showDeliveryStatusModal, setShowDeliveryStatusModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch order details
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      console.log('📥 Fetching order:', orderId);
      try {
        const result = await ordersService.getOrderById(orderId);
        console.log('✅ Order fetched successfully:', result?._id);
        return result;
      } catch (err) {
        console.error('❌ Error fetching order:', err);
        throw err;
      }
    },
    retry: 2,
    staleTime: 0, // Always fetch fresh data
  });

  // Accept order mutation
  const acceptMutation = useMutation({
    mutationFn: (estimatedPrepTime: number) =>
      ordersService.acceptOrder(orderId, estimatedPrepTime),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['order', orderId]});
      queryClient.invalidateQueries({queryKey: ['orders']});
      queryClient.invalidateQueries({queryKey: ['orderStats']});
      Alert.alert('Success', 'Order accepted successfully');
      setShowAcceptModal(false);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response?.data?.error?.message ||
          'Failed to accept order. Please try again.',
      );
    },
  });

  // Reject order mutation
  const rejectMutation = useMutation({
    mutationFn: (reason: string) => ordersService.rejectOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['order', orderId]});
      queryClient.invalidateQueries({queryKey: ['orders']});
      queryClient.invalidateQueries({queryKey: ['orderStats']});
      Alert.alert('Order Rejected', 'Order has been rejected successfully', [
        {text: 'OK', onPress: () => setShowRejectModal(false)},
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response?.data?.error?.message ||
          'Failed to reject order. Please try again.',
      );
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({status, notes}: {status: OrderStatus; notes?: string}) =>
      ordersService.updateOrderStatus(orderId, {status, notes}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['order', orderId]});
      queryClient.invalidateQueries({queryKey: ['orders']});
      queryClient.invalidateQueries({queryKey: ['orderStats']});
      Alert.alert('Success', 'Order status updated successfully');
      setShowUpdateStatusModal(false);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response?.data?.error?.message ||
          'Failed to update order status. Please try again.',
      );
    },
  });

  // Update delivery status mutation
  const updateDeliveryStatusMutation = useMutation({
    mutationFn: (data: {
      status: 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
      notes?: string;
      proofOfDelivery?: {
        type: 'OTP' | 'SIGNATURE' | 'PHOTO';
        value: string;
      };
    }) => ordersService.updateDeliveryStatus(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['order', orderId]});
      queryClient.invalidateQueries({queryKey: ['orders']});
      queryClient.invalidateQueries({queryKey: ['orderStats']});
      Alert.alert('Success', 'Delivery status updated successfully');
      setShowDeliveryStatusModal(false);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response?.data?.error?.message ||
          'Failed to update delivery status. Please try again.',
      );
    },
  });

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: (data: {
      reason: string;
      issueRefund: boolean;
      restoreVouchers: boolean;
    }) => ordersService.cancelOrder(orderId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ['order', orderId]});
      queryClient.invalidateQueries({queryKey: ['orders']});
      queryClient.invalidateQueries({queryKey: ['orderStats']});

      Alert.alert(
        'Order Cancelled',
        `Order cancelled successfully${
          data.refund ? `\nRefund of ₹${data.refund.amount} initiated` : ''
        }${
          data.vouchersRestored
            ? `\n${data.vouchersRestored} voucher(s) restored`
            : ''
        }`,
        [{text: 'OK', onPress: () => setShowCancelModal(false)}],
      );
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response?.data?.error?.message ||
          'Failed to cancel order. Please try again.',
      );
    },
  });

  const handleCallCustomer = () => {
    const phone = order?.userId?.phone || order?.deliveryAddress?.contactPhone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleCancelOrder = (data: {
    reason: string;
    issueRefund: boolean;
    restoreVouchers: boolean;
  }) => {
    cancelMutation.mutate(data);
  };

  const canCancelOrder = (order?: Order): boolean => {
    if (!order) return false;
    const cancellableStatuses: OrderStatus[] = [
      'PLACED',
      'ACCEPTED',
      'PREPARING',
      'READY',
    ];
    return cancellableStatuses.includes(order.status);
  };

  const canAcceptOrder = (order?: Order): boolean => {
    return order?.status === 'PLACED';
  };

  const canRejectOrder = (order?: Order): boolean => {
    return order?.status === 'PLACED';
  };

  const canUpdateStatus = (order?: Order): boolean => {
    if (!order) return false;
    const updatableStatuses: OrderStatus[] = [
      'ACCEPTED',
      'PREPARING',
      'READY',
    ];
    return updatableStatuses.includes(order.status);
  };

  const canUpdateDeliveryStatus = (order?: Order): boolean => {
    if (!order) return false;
    const deliveryStatuses: OrderStatus[] = [
      'READY',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
    ];
    return deliveryStatuses.includes(order.status);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error || (!order && !isLoading)) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>Failed to load order details</Text>
        <Text style={styles.errorSubtext}>
          Order ID: {orderId}
        </Text>
        {error && (
          <Text style={styles.errorDetail}>
            {(error as any)?.message || 'Unknown error occurred'}
          </Text>
        )}
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <MaterialIcons name="refresh" size={20} color="#FFFFFF" style={{marginRight: 8}} />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonErrorText}>Back to Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Log order data for debugging
  console.log('📦 Order Data:', {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    placedAt: order.placedAt,
    menuType: order.menuType,
    hasUserId: !!order.userId,
    hasKitchenId: !!order.kitchenId,
    hasItems: !!order.items && order.items.length > 0,
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <Text style={styles.orderNumber}>{order.orderNumber || 'N/A'}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {backgroundColor: getStatusColor(order.status)},
                  ]}>
                  <Text style={styles.statusText}>{order.status || 'UNKNOWN'}</Text>
                </View>
              </View>
              <Text style={styles.placedTime}>
                Placed {safeFormatDate(order.placedAt)}
              </Text>
              {order.menuType && (
                <View style={styles.menuTypeBadge}>
                  <Text style={styles.menuTypeText}>
                    {order.menuType === 'MEAL_MENU' ? '🍱 Meal Menu' : '🍔 On-Demand'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {(canAcceptOrder(order) || canRejectOrder(order) || canUpdateStatus(order) || canUpdateDeliveryStatus(order) || canCancelOrder(order)) && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsGrid}>
              {canAcceptOrder(order) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => setShowAcceptModal(true)}>
                  <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Accept Order</Text>
                </TouchableOpacity>
              )}
              {canRejectOrder(order) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => setShowRejectModal(true)}>
                  <MaterialIcons name="cancel" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Reject Order</Text>
                </TouchableOpacity>
              )}
              {canUpdateStatus(order) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.updateButton]}
                  onPress={() => setShowUpdateStatusModal(true)}>
                  <MaterialIcons name="update" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Update Status</Text>
                </TouchableOpacity>
              )}
              {canUpdateDeliveryStatus(order) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deliveryButton]}
                  onPress={() => setShowDeliveryStatusModal(true)}>
                  <MaterialIcons name="local-shipping" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Delivery Status</Text>
                </TouchableOpacity>
              )}
              {canCancelOrder(order) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => setShowCancelModal(true)}>
                  <MaterialIcons name="close" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Cancel Order</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Customer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>
                {order.userId?.name || order.deliveryAddress?.contactName || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <TouchableOpacity onPress={handleCallCustomer}>
                <Text style={[styles.value, styles.linkText]}>
                  {order.userId?.phone || order.deliveryAddress?.contactPhone || 'N/A'}
                </Text>
              </TouchableOpacity>
            </View>
            {order.userId?.email && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{order.userId?.email}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.card}>
            {order.deliveryAddress ? (
              <>
                <Text style={styles.addressText}>
                  {order.deliveryAddress.addressLine1 || 'N/A'}
                </Text>
                {order.deliveryAddress.addressLine2 && (
                  <Text style={styles.addressText}>
                    {order.deliveryAddress.addressLine2}
                  </Text>
                )}
                {order.deliveryAddress.landmark && (
                  <Text style={styles.addressText}>
                    Landmark: {order.deliveryAddress.landmark}
                  </Text>
                )}
                <Text style={styles.addressText}>
                  {order.deliveryAddress.locality || 'N/A'}, {order.deliveryAddress.city || 'N/A'}
                </Text>
                <Text style={styles.addressText}>
                  {order.deliveryAddress.pincode || 'N/A'}
                </Text>
                {order.deliveryAddress.contactPhone && (
                  <Text style={styles.addressText}>
                    Contact: {order.deliveryAddress.contactPhone}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.value}>No address provided</Text>
            )}
          </View>
        </View>

        {/* Kitchen Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kitchen</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{order.kitchenId?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Code:</Text>
              <Text style={styles.value}>{order.kitchenId?.code || 'N/A'}</Text>
            </View>
            {order.kitchenId?.contactPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{order.kitchenId?.contactPhone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.card}>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>
                      {item.quantity || 0}x {item.name || 'Unknown Item'}
                    </Text>
                    {item.addons && item.addons.length > 0 && (
                      <View style={styles.addonsContainer}>
                        {item.addons.map((addon, addonIndex) => (
                          <Text key={addonIndex} style={styles.addonText}>
                            + {addon.quantity || 0}x {addon.name || 'Unknown'} (₹
                            {(addon.unitPrice || 0).toFixed(2)})
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemPrice}>
                    ₹{(item.totalPrice || 0).toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.value}>No items</Text>
            )}
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Breakdown</Text>
          <View style={styles.card}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>
                ₹{(order.subtotal || 0).toFixed(2)}
              </Text>
            </View>
            {order.charges && order.charges.deliveryFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Delivery Fee</Text>
                <Text style={styles.priceValue}>
                  ₹{(order.charges.deliveryFee || 0).toFixed(2)}
                </Text>
              </View>
            )}
            {order.charges && order.charges.packagingFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Packaging Fee</Text>
                <Text style={styles.priceValue}>
                  ₹{(order.charges.packagingFee || 0).toFixed(2)}
                </Text>
              </View>
            )}
            {order.charges && order.charges.taxAmount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Tax</Text>
                <Text style={styles.priceValue}>
                  ₹{(order.charges.taxAmount || 0).toFixed(2)}
                </Text>
              </View>
            )}
            {order.discount && order.discount.discountAmount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, styles.discountText]}>
                  Discount
                </Text>
                <Text style={[styles.priceValue, styles.discountText]}>
                  -₹{(order.discount.discountAmount || 0).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ₹{(order.grandTotal || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Amount Paid</Text>
              <Text style={styles.priceValue}>
                ₹{(order.amountPaid || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Voucher Usage */}
        {order.voucherUsage && order.voucherUsage.voucherCount > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voucher Usage</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Vouchers Used:</Text>
                <Text style={styles.value}>{order.voucherUsage.voucherCount}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Main Courses Covered:</Text>
                <Text style={styles.value}>
                  {order.voucherUsage.mainCoursesCovered}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Special Instructions */}
        {order.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <View style={styles.card}>
              <Text style={styles.instructionsText}>
                {order.specialInstructions}
              </Text>
            </View>
          </View>
        )}

        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <View style={styles.card}>
            <StatusTimeline timeline={order.statusTimeline} />
          </View>
        </View>

        <View style={{height: 40}} />
      </ScrollView>

      {/* Modals */}
      <AcceptOrderModal
        visible={showAcceptModal}
        orderNumber={order.orderNumber}
        onClose={() => setShowAcceptModal(false)}
        onAccept={async (prepTime) => {
          await acceptMutation.mutateAsync(prepTime);
        }}
      />

      <RejectOrderModal
        visible={showRejectModal}
        orderNumber={order.orderNumber}
        onClose={() => setShowRejectModal(false)}
        onReject={async (reason) => {
          await rejectMutation.mutateAsync(reason);
        }}
      />

      <UpdateStatusModal
        visible={showUpdateStatusModal}
        orderNumber={order.orderNumber}
        currentStatus={order.status}
        onClose={() => setShowUpdateStatusModal(false)}
        onUpdate={async (status, notes) => {
          await updateStatusMutation.mutateAsync({status, notes});
        }}
      />

      <DeliveryStatusModal
        visible={showDeliveryStatusModal}
        orderNumber={order.orderNumber}
        onClose={() => setShowDeliveryStatusModal(false)}
        onUpdate={async (data) => {
          await updateDeliveryStatusMutation.mutateAsync(data);
        }}
      />

      <CancelOrderModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        loading={cancelMutation.isPending}
        hasVouchers={order.voucherUsage?.voucherCount > 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 13,
    color: '#FF3B30',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonError: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonErrorText: {
    color: '#3C3C43',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#f97316',
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    marginRight: 12,
    marginTop: 2,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placedTime: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  menuTypeBadge: {
    marginTop: 8,
  },
  menuTypeText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.85,
  },
  actionsSection: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  updateButton: {
    backgroundColor: '#007AFF',
  },
  deliveryButton: {
    backgroundColor: '#5856D6',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  linkText: {
    color: '#007AFF',
  },
  addressText: {
    fontSize: 14,
    color: '#3C3C43',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  addonsContainer: {
    marginTop: 4,
    marginLeft: 12,
  },
  addonText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#3C3C43',
  },
  priceValue: {
    fontSize: 14,
    color: '#3C3C43',
    fontWeight: '500',
  },
  discountText: {
    color: '#34C759',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  instructionsText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
});

export default OrderDetailAdminScreen;
