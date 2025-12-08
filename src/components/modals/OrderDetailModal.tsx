import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';

interface OrderDetailModalProps {
  visible: boolean;
  onClose: () => void;
  order?: {
    id: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    status: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
  };
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  visible,
  onClose,
  order,
}) => {
  if (!order) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold text-xl">Order #{order.id}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500">Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View className="mb-4">
              <Text className="text-gray-600 mb-1">Customer</Text>
              <Text className="font-semibold">{order.customerName}</Text>
              <Text>{order.customerPhone}</Text>
            </View>
            <View className="mb-4">
              <Text className="text-gray-600 mb-1">Delivery Address</Text>
              <Text>{order.deliveryAddress}</Text>
            </View>
            <View className="mb-4">
              <Text className="text-gray-600 mb-2">Items</Text>
              {order.items.map((item, index) => (
                <View key={index} className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text>{item.quantity}x {item.name}</Text>
                  <Text>₦{item.price.toLocaleString()}</Text>
                </View>
              ))}
            </View>
            <View className="flex-row justify-between pt-4 border-t border-gray-200">
              <Text className="font-bold text-lg">Total</Text>
              <Text className="font-bold text-lg">₦{order.totalAmount.toLocaleString()}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
