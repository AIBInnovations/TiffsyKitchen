import React, {useState} from 'react';
import {View} from 'react-native';
import OrdersScreen from './OrdersScreen';
import OrderDetailAdminScreen from './OrderDetailAdminScreen';

interface OrdersManagementContainerProps {
  onMenuPress?: () => void;
}

const OrdersManagementContainer: React.FC<OrdersManagementContainerProps> = ({
  onMenuPress,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Create a navigation object that mimics React Navigation
  const navigation = {
    navigate: (screen: string, params: any) => {
      if (screen === 'OrderDetail' && params.orderId) {
        setSelectedOrderId(params.orderId);
      }
    },
    goBack: () => {
      setSelectedOrderId(null);
    },
  };

  // If an order is selected, show the detail screen
  if (selectedOrderId) {
    return (
      <OrderDetailAdminScreen
        route={{params: {orderId: selectedOrderId}}}
        navigation={navigation}
      />
    );
  }

  // Otherwise show the orders list
  return <OrdersScreen onMenuPress={onMenuPress} navigation={navigation} />;
};

export default OrdersManagementContainer;
