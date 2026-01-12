import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {ordersService} from '../../../services/orders.service';
import StatusTimeline from './StatusTimeline';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ActivityIndicator} from 'react-native';

interface OrderTrackingProps {
  orderId: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({orderId}) => {
  const {data: trackingData, isLoading, error} = useQuery({
    queryKey: ['orderTracking', orderId],
    queryFn: () => ordersService.trackOrder(orderId),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Order Tracking</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#f97316" />
          <Text style={styles.loadingText}>Loading tracking info...</Text>
        </View>
      </View>
    );
  }

  if (error || !trackingData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Order Tracking</Text>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={32} color="#FF3B30" />
          <Text style={styles.errorText}>Unable to load tracking info</Text>
        </View>
      </View>
    );
  }

  const {order} = trackingData;

  const handleCallDriver = () => {
    if (order.driver?.phone) {
      Linking.openURL(`tel:${order.driver.phone}`);
    }
  };

  const getEstimatedDeliveryText = () => {
    if (!order.estimatedDeliveryTime) return null;

    const estimatedTime = new Date(order.estimatedDeliveryTime);
    const now = new Date();
    const diffMs = estimatedTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) {
      return 'Delivery time passed';
    } else if (diffMins < 60) {
      return `Estimated in ${diffMins} minutes`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `Estimated in ${hours}h ${mins}m`;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Tracking</Text>

      {/* Order Status */}
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Current Status:</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        {order.estimatedDeliveryTime && (
          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={16} color="#8E8E93" />
            <Text style={styles.estimatedText}>{getEstimatedDeliveryText()}</Text>
          </View>
        )}
      </View>

      {/* Driver Info */}
      {order.driver && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Driver Information</Text>
          <View style={styles.driverInfo}>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{order.driver.name}</Text>
              <Text style={styles.driverPhone}>{order.driver.phone}</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={handleCallDriver}>
              <MaterialIcons name="phone" size={20} color="#FFFFFF" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <MaterialIcons name="location-on" size={16} color="#f97316" />
            <View style={styles.addressTextContainer}>
              {order.deliveryAddress.addressLine1 && (
                <Text style={styles.addressText}>
                  {order.deliveryAddress.addressLine1}
                </Text>
              )}
              <Text style={styles.addressText}>
                {order.deliveryAddress.locality}, {order.deliveryAddress.city}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Status Timeline */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>
        <StatusTimeline timeline={order.statusTimeline} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
  },
  errorContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f97316',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  estimatedText: {
    fontSize: 14,
    color: '#3C3C43',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#3C3C43',
    marginBottom: 2,
    lineHeight: 20,
  },
});

export default OrderTracking;
