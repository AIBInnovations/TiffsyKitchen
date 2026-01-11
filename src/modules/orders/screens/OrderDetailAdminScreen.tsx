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
import {formatDistanceToNow} from 'date-fns';

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

const OrderDetailAdminScreen: React.FC<OrderDetailAdminScreenProps> = ({
  route,
  navigation,
}) => {
  const {orderId} = route.params;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch order details
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersService.getOrderById(orderId),
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
    if (order?.userId?.phone) {
      Linking.openURL(`tel:${order.userId.phone}`);
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
    // Can cancel if not yet picked up, delivered, or already cancelled
    const cancellableStatuses: OrderStatus[] = [
      'PLACED',
      'ACCEPTED',
      'PREPARING',
      'READY',
    ];
    return cancellableStatuses.includes(order.status);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load order details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(order.status)},
              ]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          <Text style={styles.placedTime}>
            Placed {formatDistanceToNow(new Date(order.placedAt), {addSuffix: true})}
          </Text>
        </View>

        {/* Customer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{order.userId?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <TouchableOpacity onPress={handleCallCustomer}>
                <Text style={[styles.value, styles.linkText]}>
                  {order.userId?.phone || 'N/A'}
                </Text>
              </TouchableOpacity>
            </View>
            {order.userId?.email && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{order.userId.email}</Text>
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
                <Text style={styles.value}>{order.kitchenId.contactPhone}</Text>
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

        {/* Cancel Button */}
        {canCancelOrder(order) && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCancelModal(true)}>
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Cancel Order Modal */}
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
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
    color: '#000000',
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
    color: '#8E8E93',
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
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetailAdminScreen;
