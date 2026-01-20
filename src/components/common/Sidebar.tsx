import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, ScreenName } from '../../context/NavigationContext';
import { getMenuItemsForRole, MenuItem as RBACMenuItem } from '../../utils/rbac';
import { UserRole } from '../../types/user';
import { kitchenStaffService } from '../../services/kitchen-staff.service';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onLogout?: () => void | Promise<void>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  visible,
  onClose,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();
  const { user, logout: authLogout } = useAuth();
  const { currentScreen, navigate } = useNavigation();
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [menuItems, setMenuItems] = useState<RBACMenuItem[]>([]);
  const [kitchenName, setKitchenName] = useState<string | null>(null);

  // Load user role from AsyncStorage and get menu items
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        console.log('========== SIDEBAR: Loading User Role ==========');
        console.log('Role from storage:', role);

        if (role) {
          setUserRole(role as UserRole);
          const items = getMenuItemsForRole(role as UserRole);
          console.log('Menu items for role:', items.length);
          setMenuItems(items);

          // Fetch kitchen name for kitchen staff
          if (role === 'KITCHEN_STAFF') {
            try {
              const response = await kitchenStaffService.getMyKitchenStatus();
              if (response?.data?.kitchen?.name) {
                setKitchenName(response.data.kitchen.name);
              }
            } catch (error) {
              console.error('Error fetching kitchen name:', error);
            }
          }
        }
        console.log('===============================================');
      } catch (error) {
        console.error('Error loading user role:', error);
      }
    };

    loadUserRole();
  }, [visible]); // Reload when sidebar becomes visible

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogout = async () => {
    onClose();

    // If parent provided onLogout, use it (for App.tsx logout flow)
    // Otherwise fall back to AuthContext logout
    if (onLogout) {
      await onLogout();
    } else {
      await authLogout();
    }
  };

  const handleMenuPress = (screen: ScreenName) => {
    navigate(screen);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        {/* Sidebar */}
        <Animated.View
          style={[
            {
              width: SIDEBAR_WIDTH,
              transform: [{ translateX: slideAnim }],
              paddingTop: insets.top,
            },
          ]}
          className="bg-white h-full shadow-2xl"
        >
          {/* User Profile Section */}
          <View className="bg-[#F56B4C] px-4 py-5">
            <Text className="text-white font-bold text-lg">
              {user?.fullName || 'User'}
            </Text>
            <Text className="text-orange-50 text-sm opacity-90">
              {userRole === 'ADMIN'
                ? 'Administrator'
                : userRole === 'KITCHEN_STAFF'
                ? kitchenName || 'Kitchen Staff'
                : userRole === 'DRIVER'
                ? 'Driver'
                : 'User'}
            </Text>
          </View>

          {/* Menu Items */}
          <ScrollView className="flex-1">
            <View className="py-1">
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleMenuPress(item.screen)}
                  className={`flex-row items-center px-4 py-3 ${currentScreen === item.screen ? 'bg-[#FFF7F5]' : ''
                    }`}
                >
                  <Icon
                    name={item.icon}
                    size={24}
                    color="#F56B4C"
                    style={{ marginRight: 14 }}
                  />
                  <Text
                    className={`text-base ${currentScreen === item.screen
                      ? 'text-[#F56B4C] font-semibold'
                      : 'text-gray-700'
                      }`}
                  >
                    {item.label}
                  </Text>
                  {currentScreen === item.screen && (
                    <View className="absolute right-0 w-1 h-8 bg-[#F56B4C] rounded-l-full" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Logout Button */}
          <View className="border-t border-gray-200 px-4 py-3" style={{ paddingBottom: insets.bottom + 14 }}>
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center py-2"
            >
              <Icon name="logout" size={24} color="#F56B4C" style={{ marginRight: 16 }} />
              <Text className="text-red-500 font-medium text-base">Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Overlay */}
        <Pressable
          onPress={onClose}
          className="flex-1 bg-black/50"
        />
      </View>
    </Modal>
  );
};
