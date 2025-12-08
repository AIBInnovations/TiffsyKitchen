import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface AddAddonModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; price: number }) => void;
}

export const AddAddonModal: React.FC<AddAddonModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = () => {
    onSubmit({
      name,
      price: parseFloat(price),
    });
    setName('');
    setPrice('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold text-xl">Add Addon</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500">Cancel</Text>
            </TouchableOpacity>
          </View>
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter addon name"
          />
          <Input
            label="Price (₦)"
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            keyboardType="numeric"
          />
          <Button title="Add Addon" onPress={handleSubmit} />
        </View>
      </View>
    </Modal>
  );
};
