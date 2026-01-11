/**
 * Simple Test Subscriptions Screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SubscriptionsScreenSimple: React.FC = () => {
  console.log('SubscriptionsScreenSimple: Rendering');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscriptions Screen Works!</Text>
      <Text style={styles.subtitle}>If you see this, the screen is loading correctly</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
