import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaScreen } from '../../../components/common/SafeAreaScreen';
import { colors } from '../../../theme/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export const DriverOrdersScreen: React.FC = () => {
  console.log('📦 DriverOrdersScreen loaded - showing orders');

  return (
    <SafeAreaScreen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="assignment" size={32} color={colors.primary} />
          <Text style={styles.headerTitle}>Driver Order Management</Text>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <MaterialIcons name="shopping-cart" size={64} color={colors.primary} />
            <Text style={styles.mainText}>orders and orders</Text>
            <Text style={styles.subText}>Driver Order Management Screen</Text>
          </View>

          {/* Additional Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>This screen shows:</Text>
            <View style={styles.infoItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.success} />
              <Text style={styles.infoText}>orders and orders</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.success} />
              <Text style={styles.infoText}>Order management for drivers</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.success} />
              <Text style={styles.infoText}>Driver-specific order interface</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
    width: '100%',
  },
  mainText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
  },
});
