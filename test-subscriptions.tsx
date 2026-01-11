/**
 * TEST FILE - Verify SubscriptionsScreen can be imported
 */

import React from 'react';
import { View, Text } from 'react-native';

// Try to import the screen
try {
  const { SubscriptionsScreen } = require('./src/modules/subscriptions');
  console.log('✅ SubscriptionsScreen imported successfully');
  console.log('Type:', typeof SubscriptionsScreen);
} catch (error) {
  console.error('❌ Failed to import SubscriptionsScreen:', error);
}

// Simple test component
export const TestScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Test Screen - Subscriptions should work!</Text>
    </View>
  );
};
