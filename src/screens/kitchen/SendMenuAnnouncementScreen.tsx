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
import { notificationService } from '../../services/notification.service';
import { colors } from '../../theme';

const MAX_TITLE_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 500;

export const SendMenuAnnouncementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canSend = title.trim().length > 0 && message.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) {
      Alert.alert('Missing Information', 'Please enter both title and message');
      return;
    }

    try {
      setIsLoading(true);

      const response = await notificationService.sendMenuAnnouncement({
        title: title.trim(),
        message: message.trim(),
      });

      if (response.success) {
        Alert.alert(
          'Success',
          `Announcement sent to ${response.data.subscribersNotified} subscribers!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setTitle('');
                setMessage('');
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send announcement');
      }
    } catch (error: any) {
      console.error('Error sending announcement:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to send announcement. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaScreen>
      <Header
        title="Send Announcement"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView className="flex-1 px-6 pt-4">
        {/* Info Card */}
        <View className="bg-blue-50 p-4 rounded-lg mb-6 flex-row">
          <Icon name="info-outline" size={24} color={colors.info} />
          <Text className="flex-1 ml-3 text-sm text-gray-700">
            Send menu updates and special announcements to all your subscribers. They'll receive a
            notification immediately.
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
            placeholder="e.g. Special Paneer Dish Today!"
            maxLength={MAX_TITLE_LENGTH}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
            placeholderTextColor={colors.gray400}
          />
        </View>

        {/* Message Input */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-semibold text-gray-900">
              Message <Text className="text-red-500">*</Text>
            </Text>
            <Text
              className={`text-sm ${
                message.length > MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {message.length}/{MAX_MESSAGE_LENGTH}
            </Text>
          </View>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Enter your announcement message..."
            maxLength={MAX_MESSAGE_LENGTH}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 min-h-[120px]"
            placeholderTextColor={colors.gray400}
          />
        </View>

        {/* Preview Card */}
        {(title.trim() || message.trim()) && (
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">Preview</Text>
            <View className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <View className="flex-row items-start mb-2">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${colors.info}20` }}
                >
                  <Icon name="restaurant-menu" size={24} color={colors.info} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {title || 'Your title here'}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {message || 'Your message here'}
                  </Text>
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
          style={!canSend && !isLoading ? { backgroundColor: colors.gray300 } : undefined}
          accessibilityLabel="Send announcement"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Icon name="send" size={20} color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                Send Announcement
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaScreen>
  );
};
