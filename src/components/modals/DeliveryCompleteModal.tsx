import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface DeliveryCompleteModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (data: { notes?: string; proofImageUrl?: string }) => void;
}

export const DeliveryCompleteModal: React.FC<DeliveryCompleteModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);

  const handleComplete = () => {
    onComplete({
      notes: notes || undefined,
      proofImageUrl: proofImage || undefined,
    });
    setNotes('');
    setProofImage(null);
  };

  const handleTakePhoto = () => {
    // TODO: Implement camera/image picker
    console.log('Take photo');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold text-xl">Complete Delivery</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500">Cancel</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleTakePhoto}
            className="h-40 bg-gray-100 rounded-lg justify-center items-center mb-4"
          >
            {proofImage ? (
              <Image source={{ uri: proofImage }} className="w-full h-full rounded-lg" />
            ) : (
              <>
                <Text className="text-gray-500">Tap to take photo</Text>
                <Text className="text-gray-400 text-xs">Proof of delivery</Text>
              </>
            )}
          </TouchableOpacity>

          <Input
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any delivery notes..."
            multiline
          />

          <Button title="Mark as Delivered" onPress={handleComplete} />
        </View>
      </View>
    </Modal>
  );
};
