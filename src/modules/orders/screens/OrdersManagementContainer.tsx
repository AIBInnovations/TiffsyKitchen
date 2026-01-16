import React, { useState, useEffect } from 'react';
import { View, BackHandler } from 'react-native';
import OrdersScreenAdmin from './OrdersScreenAdmin';
import OrderDetailAdminScreen from './OrderDetailAdminScreen';

interface OrdersManagementContainerProps {
  onMenuPress?: () => void;
}

const OrdersManagementContainer: React.FC<OrdersManagementContainerProps> = ({
  onMenuPress,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const onBackPress = () => {
      if (selectedOrderId) {
        setSelectedOrderId(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => backHandler.remove();
  }, [selectedOrderId]);

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
        route={{ params: { orderId: selectedOrderId } }}
        navigation={navigation}
      />
    );
  }

  // Otherwise show the orders list
  return <OrdersScreenAdmin onMenuPress={onMenuPress} navigation={navigation} />;
};

export default OrdersManagementContainer;
