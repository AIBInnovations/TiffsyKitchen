import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface AddMenuItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    category: string;
  }) => void;
}

export const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = () => {
    onSubmit({
      name,
      description,
      price: parseFloat(price),
      category,
    });
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold text-xl">Add Menu Item</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500">Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter item name"
            />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              multiline
            />
            <Input
              label="Price (₦)"
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="numeric"
            />
            <Input
              label="Category"
              value={category}
              onChangeText={setCategory}
              placeholder="Enter category"
            />
            <Button title="Add Item" onPress={handleSubmit} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
