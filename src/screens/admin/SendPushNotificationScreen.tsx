import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaScreen } from '../../components/common/SafeAreaScreen';
import { Header } from '../../components/common/Header';
import { useNavigation } from '../../context/NavigationContext';
import { notificationService, AdminPushPayload } from '../../services/notification.service';
import { colors } from '../../theme';

const MAX_TITLE_LENGTH = 100;
const MAX_BODY_LENGTH = 500;

const TARGET_TYPES = [
  {
    value: 'ALL_CUSTOMERS',
    label: 'All Customers',
    icon: 'group',
    description: 'Send to all registered customers',
  },
  {
    value: 'ACTIVE_SUBSCRIBERS',
    label: 'Active Subscribers',
    icon: 'verified-user',
    description: 'Send to customers with active subscriptions',
  },
  {
    value: 'ROLE',
    label: 'By Role',
    icon: 'person',
    description: 'Send to specific user role',
  },
] as const;

const ROLE_OPTIONS = [
  { value: 'DRIVER', label: 'All Drivers', icon: 'local-shipping' },
  { value: 'KITCHEN_STAFF', label: 'All Kitchen Staff', icon: 'restaurant' },
  { value: 'CUSTOMER', label: 'All Customers', icon: 'person' },
] as const;

export const SendPushNotificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState<'ALL_CUSTOMERS' | 'ACTIVE_SUBSCRIBERS' | 'ROLE'>(
    'ALL_CUSTOMERS'
  );
  const [targetRole, setTargetRole] = useState<'DRIVER' | 'KITCHEN_STAFF' | 'CUSTOMER'>('DRIVER');
  const [isLoading, setIsLoading] = useState(false);

  const canSend = title.trim().length > 0 && body.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) {
      Alert.alert('Missing Information', 'Please enter both title and message');
      return;
    }

    try {
      setIsLoading(true);

      const payload: AdminPushPayload = {
        title: title.trim(),
        body: body.trim(),
        targetType,
      };

      // Add target role if "By Role" is selected
      if (targetType === 'ROLE') {
        payload.targetRole = targetRole;
      }

      const response = await notificationService.sendAdminPush(payload);

      if (response.success) {
        Alert.alert(
          'Success',
          `Push notification sent to ${response.data.usersNotified} user(s)!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setTitle('');
                setBody('');
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('Error sending push notification:', error);
      Alert.alert('Error', error?.message || 'Failed to send notification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaScreen>
      <Header
        title="Send Push Notification"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView className="flex-1 px-6 pt-4">
        {/* Info Card */}
        <View className="bg-blue-50 p-4 rounded-lg mb-6 flex-row">
          <Icon name="campaign" size={24} color={colors.info} />
          <Text className="flex-1 ml-3 text-sm text-gray-700">
            Send marketing or announcement notifications to your users. Use this for promotions,
            updates, or important announcements.
          </Text>
        </View>

        {/* Title Input */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-semibold text-gray-900">
              Title <Text className="text-red-500">*</Text>
            </Text>
            <Text
              className={`text-sm ${
                title.length > MAX_TITLE_LENGTH ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {title.length}/{MAX_TITLE_LENGTH}
            </Text>
          </View>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Republic Day Special!"
            maxLength={MAX_TITLE_LENGTH}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
            placeholderTextColor={colors.gray400}
          />
        </View>

        {/* Body Input */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-semibold text-gray-900">
              Message <Text className="text-red-500">*</Text>
            </Text>
            <Text
              className={`text-sm ${
                body.length > MAX_BODY_LENGTH ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {body.length}/{MAX_BODY_LENGTH}
            </Text>
          </View>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Enter your message..."
            maxLength={MAX_BODY_LENGTH}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 min-h-[120px]"
            placeholderTextColor={colors.gray400}
          />
        </View>

        {/* Target Type Selection */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Target Audience <Text className="text-red-500">*</Text>
          </Text>

          <View className="space-y-3">
            {TARGET_TYPES.map((target) => (
              <TouchableOpacity
                key={target.value}
                onPress={() => setTargetType(target.value)}
                className={`p-4 rounded-lg border-2 ${
                  targetType === target.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center mb-2">
                  <Icon
                    name={target.icon}
                    size={24}
                    color={targetType === target.value ? colors.primary : colors.gray600}
                  />
                  <Text
                    className={`ml-3 flex-1 text-base font-medium ${
                      targetType === target.value ? 'text-orange-700' : 'text-gray-900'
                    }`}
                  >
                    {target.label}
                  </Text>
                  {targetType === target.value && (
                    <Icon name="check-circle" size={20} color={colors.primary} />
                  )}
                </View>
                <Text className="text-sm text-gray-600 ml-9">{target.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Role Selection (only visible when "By Role" is selected) */}
        {targetType === 'ROLE' && (
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Select Role <Text className="text-red-500">*</Text>
            </Text>

            <View className="space-y-3">
              {ROLE_OPTIONS.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  onPress={() => setTargetRole(role.value)}
                  className={`flex-row items-center p-4 rounded-lg border-2 ${
                    targetRole === role.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                      targetRole === role.value ? 'bg-orange-100' : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      name={role.icon}
                      size={20}
                      color={targetRole === role.value ? colors.primary : colors.gray600}
                    />
                  </View>

                  <Text
                    className={`flex-1 text-base font-medium ${
                      targetRole === role.value ? 'text-orange-700' : 'text-gray-900'
                    }`}
                  >
                    {role.label}
                  </Text>

                  {targetRole === role.value && (
                    <Icon name="check-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Preview Card */}
        {(title.trim() || body.trim()) && (
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">Preview</Text>
            <View className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <View className="flex-row items-start mb-2">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <Icon name="campaign" size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {title || 'Your title here'}
                  </Text>
                  <Text className="text-sm text-gray-600">{body || 'Your message here'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend || isLoading}
          className={`flex-row items-center justify-center py-4 rounded-lg mb-8 ${
            !canSend || isLoading ? 'bg-gray-300' : 'bg-orange-500'
          }`}
          accessibilityLabel="Send notification"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Icon name="send" size={20} color="white" />
              <Text className="text-white font-semibold text-base ml-2">Send Notification</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaScreen>
  );
};
