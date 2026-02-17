import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { deliveryService } from '../../../services/delivery.service';
import { Card } from '../../../components/common/Card';
import { useAlert } from '../../../hooks/useAlert';

interface Props {
  kitchenId: string;
  mealWindow: 'LUNCH' | 'DINNER';
  isAdmin: boolean;
  operatingHours?: any;
  onActionsComplete: () => void;
}

const DeliveryActionsPanel: React.FC<Props> = ({
  kitchenId,
  mealWindow,
  isAdmin,
  operatingHours,
  onActionsComplete,
}) => {
  const { showSuccess, showError } = useAlert();
  const [forceDispatch, setForceDispatch] = useState(false);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [reminderResult, setReminderResult] = useState<any>(null);

  // --- Dispatch timing logic ---
  const getMealWindowEndTime = (): { hours: number; minutes: number } | null => {
    if (!operatingHours) return null;
    const endTime = mealWindow === 'LUNCH'
      ? operatingHours.lunch?.endTime
      : operatingHours.dinner?.endTime;
    if (!endTime) return null;
    const [hours, minutes] = endTime.split(':').map(Number);
    return { hours, minutes };
  };

  const canDispatchMealWindow = (): boolean => {
    const endTime = getMealWindowEndTime();
    if (!endTime) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = endTime.hours * 60 + endTime.minutes;
    return currentMinutes >= endMinutes;
  };

  const getTimeUntilDispatch = (): string => {
    const endTime = getMealWindowEndTime();
    if (!endTime) return 'N/A';
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = endTime.hours * 60 + endTime.minutes;
    if (currentMinutes >= endMinutes) return 'Now';
    const diff = endMinutes - currentMinutes;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getEndTimeFormatted = (): string => {
    const endTime = getMealWindowEndTime();
    if (!endTime) return 'N/A';
    const period = endTime.hours >= 12 ? 'PM' : 'AM';
    const displayHours = endTime.hours > 12 ? endTime.hours - 12 : endTime.hours === 0 ? 12 : endTime.hours;
    return `${displayHours}:${endTime.minutes.toString().padStart(2, '0')} ${period}`;
  };

  // --- Mutations ---
  const batchMutation = useMutation({
    mutationFn: () => {
      if (isAdmin) {
        return deliveryService.autoBatchOrders({ mealWindow, kitchenId });
      }
      return deliveryService.autoBatchMyKitchenOrders({ mealWindow });
    },
    onSuccess: (response: any) => {
      const result = response?.data || response;
      setBatchResult(result);
      showSuccess('Success', `${result?.batchesCreated || 0} batches created, ${result?.ordersProcessed || 0} orders processed`);
      onActionsComplete();
    },
    onError: (error: any) => {
      showError('Error', error?.message || 'Failed to auto-batch orders');
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: () => {
      if (isAdmin) {
        return deliveryService.dispatchBatches({ mealWindow, kitchenId, forceDispatch });
      }
      return deliveryService.dispatchMyKitchenBatches({ mealWindow, forceDispatch });
    },
    onSuccess: (response: any) => {
      const result = response?.data || response;
      setDispatchResult(result);
      showSuccess('Success', `${result?.batchesDispatched || 0} batches dispatched`);
      onActionsComplete();
    },
    onError: (error: any) => {
      showError('Error', error?.message || 'Failed to dispatch batches');
    },
  });

  const reminderMutation = useMutation({
    mutationFn: () => {
      return deliveryService.sendKitchenReminder({ mealWindow, kitchenId });
    },
    onSuccess: (response: any) => {
      const result = response?.data || response;
      setReminderResult(result);
      showSuccess('Success', `${result?.kitchensNotified || 0} kitchens notified`);
    },
    onError: (error: any) => {
      showError('Error', error?.message || 'Failed to send reminder');
    },
  });

  const dispatchDisabled = !canDispatchMealWindow() && !forceDispatch;

  return (
    <View>
      {/* Batch Orders */}
      <View className="px-4 pb-3">
        <Card className="p-4">
          <View className="flex-row items-center mb-2">
            <Icon name="layers" size={22} color="#3b82f6" />
            <Text className="text-base font-semibold text-gray-800 ml-2">Batch Orders</Text>
          </View>
          <Text className="text-sm text-gray-500 mb-3">
            Group pending orders into delivery batches
          </Text>
          <TouchableOpacity
            onPress={() => batchMutation.mutate()}
            disabled={batchMutation.isPending}
            className={`py-3 rounded-lg ${batchMutation.isPending ? 'bg-gray-300' : 'bg-blue-500'}`}
          >
            {batchMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-center">Batch Orders</Text>
            )}
          </TouchableOpacity>
          {batchResult && (
            <View className="mt-3 bg-green-50 p-3 rounded-lg">
              <Text className="text-sm text-green-700">
                {batchResult.batchesCreated} batches created, {batchResult.ordersProcessed} orders processed
              </Text>
            </View>
          )}
        </Card>
      </View>

      {/* Dispatch Batches */}
      <View className="px-4 pb-3">
        <Card className="p-4">
          <View className="flex-row items-center mb-2">
            <Icon name="local-shipping" size={22} color="#14b8a6" />
            <Text className="text-base font-semibold text-gray-800 ml-2">Dispatch Batches</Text>
          </View>
          <Text className="text-sm text-gray-500 mb-3">
            Send collecting batches to drivers
          </Text>

          {/* Dispatch timing info */}
          {!canDispatchMealWindow() && (
            <View className="bg-blue-50 p-3 rounded-lg mb-3 flex-row items-start">
              <Icon name="schedule" size={18} color="#3b82f6" />
              <Text className="text-xs text-blue-700 ml-2 flex-1">
                Dispatch available after {getEndTimeFormatted()} ({mealWindow.toLowerCase()} end).{' '}
                Time remaining: {getTimeUntilDispatch()}
              </Text>
            </View>
          )}

          {/* Force dispatch toggle - admin only */}
          {isAdmin && (
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-medium text-gray-700">Force Dispatch (bypass cutoff)</Text>
              <TouchableOpacity
                onPress={() => setForceDispatch(!forceDispatch)}
                className={`w-12 h-6 rounded-full ${forceDispatch ? 'bg-orange-500' : 'bg-gray-300'}`}
              >
                <View className={`w-5 h-5 rounded-full bg-white m-0.5 ${forceDispatch ? 'self-end' : 'self-start'}`} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={() => dispatchMutation.mutate()}
            disabled={dispatchMutation.isPending || dispatchDisabled}
            className={`py-3 rounded-lg ${
              dispatchMutation.isPending || dispatchDisabled ? 'bg-gray-300' : 'bg-teal-500'
            }`}
          >
            {dispatchMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-center">Dispatch</Text>
            )}
          </TouchableOpacity>
          {dispatchResult && (
            <View className="mt-3 bg-green-50 p-3 rounded-lg">
              <Text className="text-sm text-green-700">
                {dispatchResult.batchesDispatched} batches dispatched
              </Text>
            </View>
          )}
        </Card>
      </View>

      {/* Kitchen Reminder - Admin only */}
      {isAdmin && (
        <View className="px-4 pb-3">
          <Card className="p-4">
            <View className="flex-row items-center mb-2">
              <Icon name="notifications-active" size={22} color="#8b5cf6" />
              <Text className="text-base font-semibold text-gray-800 ml-2">Kitchen Reminder</Text>
            </View>
            <Text className="text-sm text-gray-500 mb-3">
              Notify kitchen staff about pending orders before cutoff
            </Text>
            <TouchableOpacity
              onPress={() => reminderMutation.mutate()}
              disabled={reminderMutation.isPending}
              className={`py-3 rounded-lg ${reminderMutation.isPending ? 'bg-gray-300' : 'bg-purple-500'}`}
            >
              {reminderMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold text-center">Send Reminder</Text>
              )}
            </TouchableOpacity>
            {reminderResult && (
              <View className="mt-3 bg-green-50 p-3 rounded-lg">
                <Text className="text-sm text-green-700">
                  {reminderResult.kitchensNotified} kitchens notified
                </Text>
                {reminderResult.details?.map((d: any, i: number) => (
                  <Text key={i} className="text-xs text-green-600 mt-1">
                    {d.kitchenName}: {d.orderCount} orders, {d.staffNotified} staff notified
                  </Text>
                ))}
              </View>
            )}
          </Card>
        </View>
      )}
    </View>
  );
};

export default DeliveryActionsPanel;
