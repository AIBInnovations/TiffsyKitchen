import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface EditMenuItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: MenuItem) => void;
  item?: MenuItem;
}

export const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  visible,
  onClose,
  onSubmit,
  item,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price.toString());
      setCategory(item.category);
    }
  }, [item]);

  const handleSubmit = () => {
    if (!item) return;
    onSubmit({
      id: item.id,
      name,
      description,
      price: parseFloat(price),
      category,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold text-xl">Edit Menu Item</Text>
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
            <Button title="Save Changes" onPress={handleSubmit} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
