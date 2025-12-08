import React from 'react';
import { View, Text, Image } from 'react-native';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ source, name, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
  };

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        className={`${sizes[size]} rounded-full`}
      />
    );
  }

  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <View className={`${sizes[size]} rounded-full bg-gray-300 justify-center items-center`}>
      <Text className={`${textSizes[size]} font-semibold text-gray-600`}>{initials}</Text>
    </View>
  );
};
