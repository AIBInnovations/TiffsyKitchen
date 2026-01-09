/**
 * Orders Stack Navigator
 *
 * Handles navigation within Orders module:
 * - Orders List
 * - Order Details
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OrdersStackParamList } from './types';
import OrdersListScreen from '../screens/orders/OrdersListScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';

const Stack = createStackNavigator<OrdersStackParamList>();

export default function OrdersNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We'll use custom headers
      }}
    >
      <Stack.Screen name="OrdersList" component={OrdersListScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
}
