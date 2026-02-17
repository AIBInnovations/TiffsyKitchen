import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  orders: any[];
  assignments: any[];
}

const BatchOrdersList: React.FC<Props> = ({ orders, assignments }) => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const getAssignment = (orderId: string) =>
    assignments.find((a: any) => a.orderId === orderId);

  const getStatusIcon = (assignment: any) => {
    if (!assignment) return { icon: 'radio-button-unchecked', color: '#9ca3af' };
    switch (assignment.status) {
      case 'DELIVERED':
        return { icon: 'check-circle', color: '#16a34a' };
      case 'FAILED':
        return { icon: 'cancel', color: '#dc2626' };
      case 'EN_ROUTE':
      case 'ARRIVED':
        return { icon: 'directions-car', color: '#eab308' };
      case 'ASSIGNED':
        return { icon: 'schedule', color: '#3b82f6' };
      default:
        return { icon: 'radio-button-unchecked', color: '#9ca3af' };
    }
  };

  return (
    <View className="px-4 py-2">
      <Text className="text-base font-semibold text-gray-800 mb-3">
        Orders ({orders.length})
      </Text>

      {orders.map((order: any) => {
        const assignment = getAssignment(order._id);
        const statusIcon = getStatusIcon(assignment);
        const isExpanded = expandedOrder === order._id;

        return (
          <TouchableOpacity
            key={order._id}
            onPress={() => setExpandedOrder(isExpanded ? null : order._id)}
            activeOpacity={0.7}
          >
            <View className="bg-white rounded-lg border border-gray-200 mb-2 overflow-hidden">
              {/* Order Header */}
              <View className="flex-row items-center p-3">
                <Icon name={statusIcon.icon} size={20} color={statusIcon.color} />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-semibold text-gray-800">
                    #{order.orderNumber || order._id?.slice(-6)}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {assignment?.status || 'Pending'} · {order.status}
                  </Text>
                </View>
                <Icon
                  name={isExpanded ? 'expand-less' : 'expand-more'}
                  size={20}
                  color="#9ca3af"
                />
              </View>

              {/* Expanded Details */}
              {isExpanded && (
                <View className="px-3 pb-3 border-t border-gray-100 pt-2">
                  {/* Address */}
                  {order.deliveryAddress && (
                    <View className="mb-2">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Delivery Address</Text>
                      <Text className="text-xs text-gray-500">
                        {order.deliveryAddress.addressLine1}
                        {order.deliveryAddress.landmark ? `, ${order.deliveryAddress.landmark}` : ''}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {order.deliveryAddress.locality}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                      </Text>
                      <Text className="text-xs text-gray-700 mt-1">
                        {order.deliveryAddress.contactName} · {order.deliveryAddress.contactPhone}
                      </Text>
                    </View>
                  )}

                  {/* Items */}
                  {order.items?.length > 0 && (
                    <View className="mb-2">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Items</Text>
                      {order.items.map((item: any, i: number) => (
                        <Text key={i} className="text-xs text-gray-500">
                          {item.quantity}x {item.name}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Assignment Details */}
                  {assignment && (
                    <View>
                      <Text className="text-xs font-medium text-gray-600 mb-1">Assignment</Text>
                      {assignment.etaTracking && (
                        <Text className="text-xs text-gray-500">
                          {assignment.etaTracking.currentEtaSeconds != null ? `ETA: ~${Math.round(assignment.etaTracking.currentEtaSeconds / 60)} min` : ''}{assignment.etaTracking.distanceRemainingMeters != null ? ` · ${(assignment.etaTracking.distanceRemainingMeters / 1000).toFixed(1)} km` : ''}{assignment.etaTracking.etaStatus ? ` · ${assignment.etaTracking.etaStatus}` : ''}
                        </Text>
                      )}
                      {assignment.proofOfDelivery?.otpVerified && (
                        <Text className="text-xs text-green-600 mt-1">OTP Verified</Text>
                      )}
                      {assignment.failureReason && (
                        <Text className="text-xs text-red-600 mt-1">
                          Failure: {assignment.failureReason}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BatchOrdersList;
