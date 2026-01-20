import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addonService } from '../../../services/addon.service';
import { Addon, DietaryType, CreateAddonRequest } from '../../../types/api.types';

interface AddonDetailScreenProps {
  addonId?: string;
  kitchenId: string;
  onBack: () => void;
  onSaved: () => void;
}

export const AddonDetailScreen: React.FC<AddonDetailScreenProps> = ({
  addonId,
  kitchenId,
  onBack,
  onSaved,
}) => {
  const insets = useSafeAreaInsets();
  const isEditMode = !!addonId;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [addon, setAddon] = useState<Addon | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [dietaryType, setDietaryType] = useState<DietaryType>('VEG');
  const [minQuantity, setMinQuantity] = useState('0');
  const [maxQuantity, setMaxQuantity] = useState('10');
  const [displayOrder, setDisplayOrder] = useState('1');

  useEffect(() => {
    if (isEditMode && addonId) {
      loadAddon();
    }
  }, [addonId]);

  const loadAddon = async () => {
    try {
      const response = await addonService.getAddonById(addonId!);
      const loadedAddon = response.addon;

      setAddon(loadedAddon);
      setName(loadedAddon.name);
      setDescription(loadedAddon.description || '');
      setPrice(String(loadedAddon.price));
      setDietaryType(loadedAddon.dietaryType);
      setMinQuantity(String(loadedAddon.minQuantity));
      setMaxQuantity(String(loadedAddon.maxQuantity));
      setDisplayOrder(String(loadedAddon.displayOrder));
    } catch (error) {
      console.error('Error loading addon:', error);
      Alert.alert('Error', 'Failed to load add-on');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return false;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Validation Error', 'Valid price is required');
      return false;
    }

    const min = Number(minQuantity);
    const max = Number(maxQuantity);

    if (isNaN(min) || min < 0) {
      Alert.alert('Validation Error', 'Min quantity must be 0 or greater');
      return false;
    }

    if (isNaN(max) || max < 1) {
      Alert.alert('Validation Error', 'Max quantity must be at least 1');
      return false;
    }

    if (min > max) {
      Alert.alert('Validation Error', 'Min quantity cannot exceed max quantity');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const data: CreateAddonRequest = {
        kitchenId,
        name: name.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        dietaryType,
        minQuantity: Number(minQuantity),
        maxQuantity: Number(maxQuantity),
        isAvailable: true,
        displayOrder: Number(displayOrder),
      };

      if (isEditMode && addonId) {
        await addonService.updateAddon(addonId, data);
        Alert.alert('Success', 'Add-on updated successfully');
      } else {
        await addonService.createAddon(data);
        Alert.alert('Success', 'Add-on created successfully');
      }

      onSaved();
      onBack();
    } catch (error: any) {
      console.error('Error saving addon:', error);
      Alert.alert('Error', error.message || 'Failed to save add-on');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (addon?.menuItemCount && addon.menuItemCount > 0) {
      Alert.alert(
        'Cannot Delete',
        `This add-on is used in ${addon.menuItemCount} menu item${addon.menuItemCount > 1 ? 's' : ''}. Remove it from all menu items first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Add-on',
      'Are you sure you want to delete this add-on?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await addonService.deleteAddon(addonId!);
              Alert.alert('Success', 'Add-on deleted');
              onSaved();
              onBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete add-on');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F56B4C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F56B4C" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Add-on' : 'Create Add-on'}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Extra Roti"
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price */}
        <View style={styles.field}>
          <Text style={styles.label}>Price (₹) *</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>

        {/* Dietary Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Dietary Type *</Text>
          <View style={styles.radioGroup}>
            {(['VEG', 'NON_VEG', 'VEGAN', 'EGGETARIAN'] as DietaryType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.radioButton,
                  dietaryType === type && styles.radioButtonActive,
                ]}
                onPress={() => setDietaryType(type)}
              >
                <Text
                  style={[
                    styles.radioButtonText,
                    dietaryType === type && styles.radioButtonTextActive,
                  ]}
                >
                  {type.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity Limits */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Min Quantity</Text>
            <TextInput
              style={styles.input}
              value={minQuantity}
              onChangeText={setMinQuantity}
              placeholder="0"
              keyboardType="numeric"
            />
            <Text style={styles.hint}>Minimum number customer can order</Text>
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Max Quantity</Text>
            <TextInput
              style={styles.input}
              value={maxQuantity}
              onChangeText={setMaxQuantity}
              placeholder="10"
              keyboardType="numeric"
            />
            <Text style={styles.hint}>Maximum number customer can order</Text>
          </View>
        </View>

        {/* Display Order */}
        <View style={styles.field}>
          <Text style={styles.label}>Display Order</Text>
          <TextInput
            style={styles.input}
            value={displayOrder}
            onChangeText={setDisplayOrder}
            placeholder="1"
            keyboardType="numeric"
          />
          <Text style={styles.hint}>Lower numbers appear first</Text>
        </View>

        {/* Usage Info (Edit mode only) */}
        {isEditMode && addon && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Usage Information</Text>
            <Text style={styles.infoText}>
              This add-on is used in <Text style={styles.infoBold}>{addon.menuItemCount || 0}</Text> menu item{addon.menuItemCount !== 1 ? 's' : ''}
            </Text>
            {addon.menuItemCount && addon.menuItemCount > 0 && (
              <Text style={styles.infoWarning}>
                Remove from all menu items before deleting
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isEditMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditMode ? 'Save Changes' : 'Create Add-on'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#F56B4C',
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  halfField: {
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  radioButtonActive: {
    backgroundColor: '#F56B4C',
    borderColor: '#F56B4C',
  },
  radioButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  radioButtonTextActive: {
    color: '#ffffff',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  infoBold: {
    fontWeight: '700',
  },
  infoWarning: {
    fontSize: 12,
    color: '#F56B4C',
    marginTop: 4,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#F56B4C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#F56B4C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
