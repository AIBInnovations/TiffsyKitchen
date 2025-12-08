export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Nigerian phone number validation
  const cleaned = phone.replace(/\D/g, '');

  // Check for valid Nigerian formats
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    return true;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return true;
  }
  if (cleaned.length === 10) {
    return true;
  }

  return false;
};

export const isValidOTP = (otp: string, length = 6): boolean => {
  const otpRegex = new RegExp(`^\\d{${length}}$`);
  return otpRegex.test(otp);
};

export const isValidPrice = (price: string | number): boolean => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(numPrice) && numPrice >= 0;
};

export const isValidQuantity = (quantity: string | number): boolean => {
  const numQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  return !isNaN(numQuantity) && numQuantity > 0 && Number.isInteger(numQuantity);
};

export const isNotEmpty = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0;
};

export const minLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateLoginForm = (phone: string): ValidationResult => {
  const errors: string[] = [];

  if (!isNotEmpty(phone)) {
    errors.push('Phone number is required');
  } else if (!isValidPhone(phone)) {
    errors.push('Please enter a valid Nigerian phone number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateMenuItemForm = (data: {
  name: string;
  description: string;
  price: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!isNotEmpty(data.name)) {
    errors.push('Item name is required');
  } else if (!minLength(data.name, 2)) {
    errors.push('Item name must be at least 2 characters');
  }

  if (!isNotEmpty(data.description)) {
    errors.push('Description is required');
  }

  if (!isNotEmpty(data.price)) {
    errors.push('Price is required');
  } else if (!isValidPrice(data.price)) {
    errors.push('Please enter a valid price');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
