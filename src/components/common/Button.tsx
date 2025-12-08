import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  ...props
}) => {
  return (
    <TouchableOpacity
      className={`py-3 px-6 rounded-lg ${
        variant === 'primary' ? 'bg-blue-500' :
        variant === 'secondary' ? 'bg-gray-500' : 'border border-blue-500'
      }`}
      {...props}
    >
      <Text className={`text-center font-semibold ${
        variant === 'outline' ? 'text-blue-500' : 'text-white'
      }`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
