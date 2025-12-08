import React, { useState } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';

interface Driver {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  isAvailable: boolean;
}

interface AssignDriverModalProps {
  visible: boolean;
  onClose: () => void;
  onAssign: (driverId: string) => void;
  drivers: Driver[];
}

export const AssignDriverModal: React.FC<AssignDriverModalProps> = ({
  visible,
  onClose,
  onAssign,
  drivers,
}) => {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const handleAssign = () => {
    if (selectedDriver) {
      onAssign(selectedDriver);
      setSelectedDriver(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold text-xl">Assign Driver</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500">Cancel</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={drivers.filter(d => d.isAvailable)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedDriver(item.id)}
                className={`flex-row items-center p-3 rounded-lg mb-2 ${
                  selectedDriver === item.id ? 'bg-blue-100' : 'bg-gray-50'
                }`}
              >
                <Avatar source={item.avatarUrl} name={item.name} size="sm" />
                <View className="ml-3">
                  <Text className="font-semibold">{item.name}</Text>
                  <Text className="text-gray-500 text-sm">{item.phone}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <Button
            title="Assign Driver"
            onPress={handleAssign}
            disabled={!selectedDriver}
          />
        </View>
      </View>
    </Modal>
  );
};
