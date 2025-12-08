import React from 'react';
import { View, Text } from 'react-native';

interface RouteMapProps {
  pickupLocation: {
    latitude: number;
    longitude: number;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
  };
}

export const RouteMap: React.FC<RouteMapProps> = ({
  pickupLocation,
  deliveryLocation,
}) => {
  // TODO: Implement map integration (react-native-maps)
  return (
    <View className="h-64 bg-gray-200 rounded-lg justify-center items-center">
      <Text className="text-gray-500">Map Placeholder</Text>
      <Text className="text-gray-400 text-xs mt-1">
        {pickupLocation.latitude}, {pickupLocation.longitude} →{' '}
        {deliveryLocation.latitude}, {deliveryLocation.longitude}
      </Text>
    </View>
  );
};
