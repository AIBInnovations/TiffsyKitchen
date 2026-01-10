/**
 * Add/Edit Menu Screen
 *
 * Form to create or update menu items with image upload
 * Uses real API: POST/PUT /api/kitchen/menu-items
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { menuService } from '../../../services/menu.service';
import { MenuItem, MealType, FoodType, SpiceLevel } from '../../../types/api.types';
import { colors, spacing } from '../../../theme';

interface AddEditMenuScreenProps {
  item?: MenuItem;
  onBack: () => void;
  onSuccess: () => void;
}

export const AddEditMenuScreen: React.FC<AddEditMenuScreenProps> = ({
  item,
  onBack,
  onSuccess,
}) => {
  const isEditMode = !!item;

  // Form state
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [category, setCategory] = useState(item?.category || '');
  const [image, setImage] = useState<any>(null);
  const [imageUri, setImageUri] = useState(item?.image || '');
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>(
    item?.mealTypes || []
  );
  const [foodType, setFoodType] = useState<FoodType>(item?.foodType || 'VEG');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>(item?.spiceLevel || 'MEDIUM');
  const [isJainFriendly, setIsJainFriendly] = useState(item?.isJainFriendly || false);
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);
  const [preparationTime, setPreparationTime] = useState(
    item?.preparationTime?.toString() || ''
  );

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handle image picker
   */
  const handleImagePicker = () => {
    Alert.alert('Select Image', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => {
          // Uncomment when react-native-image-picker is installed
          // launchCamera({ mediaType: 'photo', quality: 0.8 }, handleImageResponse);
          Alert.alert('Camera', 'Install react-native-image-picker first');
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          // Uncomment when react-native-image-picker is installed
          // launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, handleImageResponse);
          Alert.alert('Gallery', 'Install react-native-image-picker first');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  /**
   * Handle image response
   */
  const handleImageResponse = (response: any) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorMessage) {
      Alert.alert('Error', response.errorMessage);
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      setImage(asset);
      setImageUri(asset.uri);
    }
  };

  /**
   * Toggle meal type selection
   */
  const toggleMealType = (mealType: MealType) => {
    setSelectedMealTypes((prev) => {
      if (prev.includes(mealType)) {
        return prev.filter((t) => t !== mealType);
      } else {
        return [...prev, mealType];
      }
    });
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!price || parseFloat(price) <= 0) newErrors.price = 'Valid price is required';
    if (selectedMealTypes.length === 0) newErrors.mealTypes = 'Select at least one meal type';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Submit form
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const formData: any = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        mealTypes: selectedMealTypes,
        foodType,
        spiceLevel,
        isJainFriendly,
        isAvailable,
      };

      if (category.trim()) {
        formData.category = category.trim();
      }

      if (preparationTime && parseFloat(preparationTime) > 0) {
        formData.preparationTime = parseFloat(preparationTime);
      }

      // Add image if selected
      if (image) {
        formData.image = {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || 'menu-item.jpg',
        };
      }

      if (isEditMode && item) {
        await menuService.updateMenuItem(item._id, formData);
        Alert.alert('Success', 'Menu item updated successfully');
      } else {
        await menuService.createMenuItem(formData);
        Alert.alert('Success', 'Menu item created successfully');
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error submitting form:', err);
      Alert.alert('Error', err.message || 'Failed to save menu item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Menu Item' : 'Add Menu Item'}
        </Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={styles.saveButton}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialIcons name="check" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Upload */}
        <TouchableOpacity style={styles.imageContainer} onPress={handleImagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="camera-alt" size={48} color="#9ca3af" />
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </View>
          )}
          {imageUri && (
            <View style={styles.changeImageBadge}>
              <MaterialIcons name="edit" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          {/* Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Item Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Paneer Butter Masala"
              placeholderTextColor="#9ca3af"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your dish..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Price */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Price (₹) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category (Optional)</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Main Course, Dessert"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Meal Types */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Meal Types <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.checkboxGroup}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleMealType('LUNCH')}
              >
                <MaterialIcons
                  name={selectedMealTypes.includes('LUNCH') ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={selectedMealTypes.includes('LUNCH') ? colors.primary : '#9ca3af'}
                />
                <Text style={styles.checkboxLabel}>Lunch</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleMealType('DINNER')}
              >
                <MaterialIcons
                  name={selectedMealTypes.includes('DINNER') ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={selectedMealTypes.includes('DINNER') ? colors.primary : '#9ca3af'}
                />
                <Text style={styles.checkboxLabel}>Dinner</Text>
              </TouchableOpacity>
            </View>
            {errors.mealTypes && <Text style={styles.errorText}>{errors.mealTypes}</Text>}
          </View>

          {/* Food Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Food Type</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radio}
                onPress={() => setFoodType('VEG')}
              >
                <MaterialIcons
                  name={foodType === 'VEG' ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={24}
                  color={foodType === 'VEG' ? colors.primary : '#9ca3af'}
                />
                <Text style={styles.radioLabel}>🟢 Veg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radio}
                onPress={() => setFoodType('NON_VEG')}
              >
                <MaterialIcons
                  name={foodType === 'NON_VEG' ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={24}
                  color={foodType === 'NON_VEG' ? colors.primary : '#9ca3af'}
                />
                <Text style={styles.radioLabel}>🔴 Non-Veg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radio}
                onPress={() => setFoodType('VEGAN')}
              >
                <MaterialIcons
                  name={foodType === 'VEGAN' ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={24}
                  color={foodType === 'VEGAN' ? colors.primary : '#9ca3af'}
                />
                <Text style={styles.radioLabel}>🌿 Vegan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Spice Level */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Spice Level</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radio}
                onPress={() => setSpiceLevel('LOW')}
              >
                <MaterialIcons
                  name={spiceLevel === 'LOW' ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={24}
                  color={spiceLevel === 'LOW' ? colors.primary : '#9ca3af'}
                />
                <Text style={styles.radioLabel}>🌶️ Low</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radio}
                onPress={() => setSpiceLevel('MEDIUM')}
              >
                <MaterialIcons
                  name={spiceLevel === 'MEDIUM' ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={24}
                  color={spiceLevel === 'MEDIUM' ? colors.primary : '#9ca3af'}
                />
                <Text style={styles.radioLabel}>🌶️🌶️ Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radio}
                onPress={() => setSpiceLevel('HIGH')}
              >
                <MaterialIcons
                  name={spiceLevel === 'HIGH' ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={24}
                  color={spiceLevel === 'HIGH' ? colors.primary : '#9ca3af'}
                />
                <Text style={styles.radioLabel}>🌶️🌶️🌶️ High</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Switches */}
          <View style={styles.switchGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Jain Friendly</Text>
              <Switch
                value={isJainFriendly}
                onValueChange={setIsJainFriendly}
                trackColor={{ false: '#d1d5db', true: colors.primary + '80' }}
                thumbColor={isJainFriendly ? colors.primary : '#f3f4f6'}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Available Now</Text>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#d1d5db', true: colors.primary + '80' }}
                thumbColor={isAvailable ? colors.primary : '#f3f4f6'}
              />
            </View>
          </View>

          {/* Preparation Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Preparation Time (minutes)</Text>
            <TextInput
              style={styles.input}
              value={preparationTime}
              onChangeText={setPreparationTime}
              placeholder="e.g., 20"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Update Menu Item' : 'Create Menu Item'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    position: 'relative',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: '#9ca3af',
  },
  changeImageBadge: {
    position: 'absolute',
    right: '30%',
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  form: {
    padding: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: spacing.sm,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: '#1f2937',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  checkboxGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: spacing.xs,
  },
  radioGroup: {
    gap: spacing.sm,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  radioLabel: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: spacing.xs,
  },
  switchGroup: {
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
