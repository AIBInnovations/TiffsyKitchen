import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaScreen } from '../../components/common/SafeAreaScreen';
import { Header } from '../../components/common/Header';
import { useNavigation } from '../../context/NavigationContext';
import { notificationService, KitchenReminderPayload } from '../../services/notification.service';
import { colors } from '../../theme';

const MEAL_WINDOWS = [
  { value: 'BREAKFAST', label: 'Breakfast', icon: 'free-breakfast' },
  { value: 'LUNCH', label: 'Lunch', icon: 'restaurant' },
  { value: 'DINNER', label: 'dinner', icon: 'restaurant-menu' },
] as const;

export const SendBatchReminderScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedMealWindow, setSelectedMealWindow] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER'>(
    'LUNCH'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    try {
      setIsLoading(true);

      const payload: KitchenReminderPayload = {
        mealWindow: selectedMealWindow,
      };

      const response = await notificationService.sendKitchenReminder(payload);

      if (response.success) {
        const { kitchensNotified, minutesUntilCutoff, cutoffTime, details } = response.data;

        let detailText = '';
        if (details && details.length > 0) {
          detailText = details
            .map((d) => `\n• ${d.kitchenName}: ${d.orderCount} orders (${d.staffNotified} staff)`)
            .join('');
        }

        Alert.alert(
          'Reminders Sent Successfully',
          `Notified ${kitchensNotified} kitchen(s) about pending orders.\n\nCutoff: ${cutoffTime} (in ${minutesUntilCutoff} minutes)${detailText}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send reminders');
      }
    } catch (error: any) {
      console.error('Error sending batch reminder:', error);
      Alert.alert('Error', error?.message || 'Failed to send reminders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaScreen>
      <Header
        title="Send Kitchen Reminder"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView className="flex-1 px-6 pt-4">
        {/* Info Card */}
        <View className="bg-yellow-50 p-4 rounded-lg mb-6 flex-row">
          <Icon name="schedule" size={24} color={colors.warning} />
          <Text className="flex-1 ml-3 text-sm text-gray-700">
            Send a reminder to all kitchens about pending orders. Best used 30-60 minutes before
            cutoff time.
          </Text>
        </View>

        {/* Meal Window Selection */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Select Meal Window <Text className="text-red-500">*</Text>
          </Text>

          <View className="space-y-3">
            {MEAL_WINDOWS.map((mealWindow) => (
              <TouchableOpacity
                key={mealWindow.value}
                onPress={() => setSelectedMealWindow(mealWindow.value)}
                className={`flex-row items-center p-4 rounded-lg border-2 ${
                  selectedMealWindow === mealWindow.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white'
                }`}
                accessibilityLabel={`Select ${mealWindow.label}`}
                accessibilityState={{ selected: selectedMealWindow === mealWindow.value }}
              >
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                    selectedMealWindow === mealWindow.value ? 'bg-orange-100' : 'bg-gray-100'
                  }`}
                >
                  <Icon
                    name={mealWindow.icon}
                    size={24}
                    color={selectedMealWindow === mealWindow.value ? colors.primary : colors.gray600}
                  />
                </View>

                <Text
                  className={`flex-1 text-base font-medium ${
                    selectedMealWindow === mealWindow.value ? 'text-orange-700' : 'text-gray-900'
                  }`}
                >
                  {mealWindow.label}
                </Text>

                {selectedMealWindow === mealWindow.value && (
                  <Icon name="check-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview Card */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">Preview</Text>
          <View className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <View className="flex-row items-start mb-2">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.error}20` }}
              >
                <Icon name="schedule" size={24} color={colors.error} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  Order Cutoff Approaching!
                </Text>
                <Text className="text-sm text-gray-600">
                  {selectedMealWindow} cutoff in XX minutes. YY orders pending.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Text */}
        <View className="bg-gray-50 p-4 rounded-lg mb-6">
          <Text className="text-sm text-gray-600 mb-2">
            <Text className="font-semibold">What happens:</Text>
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            • All kitchens with pending orders will be notified
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            • Kitchen staff will see order count and cutoff time
          </Text>
          <Text className="text-sm text-gray-600">
            • Use this to ensure timely meal preparation
          </Text>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={isLoading}
          className={`flex-row items-center justify-center py-4 rounded-lg mb-8 ${
            isLoading ? 'bg-gray-300' : 'bg-orange-500'
          }`}
          accessibilityLabel="Send reminder"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Icon name="notifications-active" size={20} color="white" />
              <Text className="text-white font-semibold text-base ml-2">Send Reminder</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaScreen>
  );
};
