import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useAlert } from '../../../hooks/useAlert';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Kitchen, KitchenType, Zone } from '../../../types/api.types';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { ZonePickerModal } from './ZonePickerModal';

export interface KitchenFormState {
  name: string;
  type: KitchenType;
  description: string;
  cuisineTypes: string;
  addressLine1: string;
  addressLine2: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  zonesServed: string[];
  lunchStartTime: string;
  lunchEndTime: string;
  dinnerStartTime: string;
  dinnerEndTime: string;
  onDemandStartTime: string;
  onDemandEndTime: string;
  isAlwaysOpen: boolean;
  contactPhone: string;
  contactEmail: string;
  ownerName: string;
  ownerPhone: string;
}

interface KitchenFormModalProps {
  visible: boolean;
  kitchen: Kitchen | null;
  onClose: () => void;
  onSave: (formData: KitchenFormState) => Promise<void>;
}

const CUISINE_SUGGESTIONS = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Continental',
  'Mughlai',
  'Italian',
  'Mexican',
  'Thai',
];

export const KitchenFormModal: React.FC<KitchenFormModalProps> = ({
  visible,
  kitchen,
  onClose,
  onSave,
}) => {
  const { showError } = useAlert();
  const [loading, setLoading] = useState(false);
  const [zonePickerVisible, setZonePickerVisible] = useState(false);
  const [formData, setFormData] = useState<KitchenFormState>({
    name: '',
    type: 'PARTNER',
    description: '',
    cuisineTypes: '',
    addressLine1: '',
    addressLine2: '',
    locality: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    zonesServed: [],
    lunchStartTime: '11:00',
    lunchEndTime: '15:00',
    dinnerStartTime: '19:00',
    dinnerEndTime: '23:00',
    onDemandStartTime: '10:00',
    onDemandEndTime: '22:00',
    isAlwaysOpen: false,
    contactPhone: '',
    contactEmail: '',
    ownerName: '',
    ownerPhone: '',
  });

  useEffect(() => {
    if (visible && kitchen) {
      // Pre-fill form for editing
      const zones = Array.isArray(kitchen.zonesServed)
        ? kitchen.zonesServed.map((z) => (typeof z === 'string' ? z : z._id))
        : [];

      setFormData({
        name: kitchen.name,
        type: kitchen.type,
        description: kitchen.description || '',
        cuisineTypes: kitchen.cuisineTypes.join(', '),
        addressLine1: kitchen.address.addressLine1,
        addressLine2: kitchen.address.addressLine2 || '',
        locality: kitchen.address.locality,
        city: kitchen.address.city,
        state: kitchen.address.state || 'Maharashtra',
        pincode: kitchen.address.pincode,
        zonesServed: zones,
        lunchStartTime: kitchen.operatingHours.lunch?.startTime || '11:00',
        lunchEndTime: kitchen.operatingHours.lunch?.endTime || '15:00',
        dinnerStartTime: kitchen.operatingHours.dinner?.startTime || '19:00',
        dinnerEndTime: kitchen.operatingHours.dinner?.endTime || '23:00',
        onDemandStartTime: kitchen.operatingHours.onDemand?.startTime || '10:00',
        onDemandEndTime: kitchen.operatingHours.onDemand?.endTime || '22:00',
        isAlwaysOpen: kitchen.operatingHours.onDemand?.isAlwaysOpen || false,
        contactPhone: kitchen.contactPhone || '',
        contactEmail: kitchen.contactEmail || '',
        ownerName: kitchen.ownerName || '',
        ownerPhone: kitchen.ownerPhone || '',
      });
    } else if (visible && !kitchen) {
      // Reset for creating new kitchen
      setFormData({
        name: '',
        type: 'PARTNER',
        description: '',
        cuisineTypes: '',
        addressLine1: '',
        addressLine2: '',
        locality: '',
        city: '',
        state: 'Maharashtra',
        pincode: '',
        zonesServed: [],
        lunchStartTime: '11:00',
        lunchEndTime: '15:00',
        dinnerStartTime: '19:00',
        dinnerEndTime: '23:00',
        onDemandStartTime: '10:00',
        onDemandEndTime: '22:00',
        isAlwaysOpen: false,
        contactPhone: '',
        contactEmail: '',
        ownerName: '',
        ownerPhone: '',
      });
    }
  }, [visible, kitchen]);

  const updateField = (field: keyof KitchenFormState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // 1. Kitchen Name Validation
    if (!formData.name || !formData.name.trim()) {
      showToast('Kitchen name is required', 'error');
      return false;
    }
    if (formData.name.trim().length < 3) {
      showToast('Kitchen name must be at least 3 characters', 'error');
      return false;
    }
    if (formData.name.trim().length > 100) {
      showToast('Kitchen name must not exceed 100 characters', 'error');
      return false;
    }

    // 2. Kitchen Type Validation
    if (!formData.type || (formData.type !== 'TIFFSY' && formData.type !== 'PARTNER')) {
      showToast('Please select a valid kitchen type', 'error');
      return false;
    }

    // 3. Cuisine Types Validation
    if (!formData.cuisineTypes || !formData.cuisineTypes.trim()) {
      showToast('Please enter at least one cuisine type', 'error');
      return false;
    }
    const cuisines = formData.cuisineTypes.split(',').map(c => c.trim()).filter(c => c);
    if (cuisines.length === 0) {
      showToast('Please enter at least one valid cuisine type', 'error');
      return false;
    }

    // 4. Address Validation
    if (!formData.addressLine1 || !formData.addressLine1.trim()) {
      showToast('Address line 1 is required', 'error');
      return false;
    }
    if (formData.addressLine1.trim().length < 5) {
      showToast('Address line 1 must be at least 5 characters', 'error');
      return false;
    }
    if (!formData.locality || !formData.locality.trim()) {
      showToast('Locality is required', 'error');
      return false;
    }
    if (!formData.city || !formData.city.trim()) {
      showToast('City is required', 'error');
      return false;
    }
    if (!formData.state || !formData.state.trim()) {
      showToast('State is required', 'error');
      return false;
    }

    // 5. Pincode Validation
    if (!formData.pincode || !formData.pincode.trim()) {
      showToast('Pincode is required', 'error');
      return false;
    }
    const pincodePattern = /^\d{6}$/;
    if (!pincodePattern.test(formData.pincode.trim())) {
      showToast('Pincode must be exactly 6 digits', 'error');
      return false;
    }

    // 6. Zones Validation
    if (!formData.zonesServed || formData.zonesServed.length === 0) {
      showToast('Please select at least one zone to serve', 'error');
      return false;
    }

    // 7. Operating Hours Validation
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!formData.lunchStartTime || !timePattern.test(formData.lunchStartTime)) {
      showToast('Invalid lunch start time format (use HH:MM)', 'error');
      return false;
    }
    if (!formData.lunchEndTime || !timePattern.test(formData.lunchEndTime)) {
      showToast('Invalid lunch end time format (use HH:MM)', 'error');
      return false;
    }
    if (formData.lunchStartTime >= formData.lunchEndTime) {
      showToast('Lunch start time must be before end time', 'error');
      return false;
    }

    if (!formData.dinnerStartTime || !timePattern.test(formData.dinnerStartTime)) {
      showToast('Invalid dinner start time format (use HH:MM)', 'error');
      return false;
    }
    if (!formData.dinnerEndTime || !timePattern.test(formData.dinnerEndTime)) {
      showToast('Invalid dinner end time format (use HH:MM)', 'error');
      return false;
    }
    if (formData.dinnerStartTime >= formData.dinnerEndTime) {
      showToast('Dinner start time must be before end time', 'error');
      return false;
    }

    // 7b. On-Demand Hours Validation (if not always open)
    if (!formData.isAlwaysOpen) {
      if (!formData.onDemandStartTime || !timePattern.test(formData.onDemandStartTime)) {
        showToast('Invalid on-demand start time format (use HH:MM)', 'error');
        return false;
      }
      if (!formData.onDemandEndTime || !timePattern.test(formData.onDemandEndTime)) {
        showToast('Invalid on-demand end time format (use HH:MM)', 'error');
        return false;
      }
      if (formData.onDemandStartTime >= formData.onDemandEndTime) {
        showToast('On-demand start time must be before end time', 'error');
        return false;
      }
    }

    // 8. Contact Phone Validation (Optional but must be valid if provided)
    if (formData.contactPhone && formData.contactPhone.trim()) {
      const cleanPhone = formData.contactPhone.replace(/\D/g, '');
      const phonePattern = /^[0-9]{10,15}$/;

      if (!phonePattern.test(cleanPhone)) {
        showToast('Contact phone must be 10-15 digits', 'error');
        return false;
      }

      // Additional check: ensure it's not all same digits
      if (/^(.)\1+$/.test(cleanPhone)) {
        showToast('Contact phone cannot be all same digits', 'error');
        return false;
      }
    }

    // 9. Contact Email Validation (Optional but must be valid if provided)
    if (formData.contactEmail && formData.contactEmail.trim()) {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const email = formData.contactEmail.trim().toLowerCase();

      if (!emailPattern.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
      }

      if (email.length > 100) {
        showToast('Email address is too long', 'error');
        return false;
      }
    }

    // 10. Owner Details Validation (Required for PARTNER kitchens)
    if (formData.type === 'PARTNER') {
      // Owner Name
      if (!formData.ownerName || !formData.ownerName.trim()) {
        showToast('Owner name is required for partner kitchens', 'error');
        return false;
      }
      if (formData.ownerName.trim().length < 2) {
        showToast('Owner name must be at least 2 characters', 'error');
        return false;
      }
      if (formData.ownerName.trim().length > 100) {
        showToast('Owner name must not exceed 100 characters', 'error');
        return false;
      }

      // Owner Phone
      if (!formData.ownerPhone || !formData.ownerPhone.trim()) {
        showToast('Owner phone is required for partner kitchens', 'error');
        return false;
      }

      const cleanOwnerPhone = formData.ownerPhone.replace(/\D/g, '');
      const phonePattern = /^[0-9]{10,15}$/;

      if (!phonePattern.test(cleanOwnerPhone)) {
        showToast('Owner phone must be 10-15 digits', 'error');
        return false;
      }

      // Additional check: ensure it's not all same digits
      if (/^(.)\1+$/.test(cleanOwnerPhone)) {
        showToast('Owner phone cannot be all same digits', 'error');
        return false;
      }

      // Ensure owner phone is different from contact phone if both provided
      if (formData.contactPhone && formData.contactPhone.trim()) {
        const cleanContactPhone = formData.contactPhone.replace(/\D/g, '');
        if (cleanContactPhone === cleanOwnerPhone) {
          showToast('Owner phone should be different from contact phone', 'error');
          return false;
        }
      }
    }

    // 11. Description Validation (Optional but has max length)
    if (formData.description && formData.description.trim().length > 500) {
      showToast('Description must not exceed 500 characters', 'error');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Prevent double submission
    if (loading) return;

    setLoading(true);
    try {
      await onSave(formData);
      // Success handling is done by parent component
      // Modal will be closed by parent's onClose call
    } catch (error: any) {
      // Error handling is done by parent component
      // Just show a generic message here to inform user
      const message = error?.response?.data?.message || error?.message || 'Failed to save kitchen';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      showError(type === 'success' ? 'Success' : 'Error', message);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {kitchen ? 'Edit Kitchen' : 'Create Kitchen'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <Text style={styles.label}>
                Kitchen Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Tiffsy Central Kitchen"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                editable={!loading}
              />

              <Text style={styles.label}>
                Type <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    formData.type === 'TIFFSY' && styles.typeOptionActive,
                  ]}
                  onPress={() => updateField('type', 'TIFFSY')}
                  disabled={loading || !!kitchen}>
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.type === 'TIFFSY' && styles.typeOptionTextActive,
                    ]}>
                    Tiffsy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    formData.type === 'PARTNER' && styles.typeOptionActive,
                  ]}
                  onPress={() => updateField('type', 'PARTNER')}
                  disabled={loading || !!kitchen}>
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.type === 'PARTNER' && styles.typeOptionTextActive,
                    ]}>
                    Partner
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief description about the kitchen"
                value={formData.description}
                onChangeText={(text) => {
                  if (text.length <= 500) {
                    updateField('description', text);
                  }
                }}
                multiline
                numberOfLines={3}
                maxLength={500}
                editable={!loading}
              />
              <Text style={styles.hint}>
                {formData.description.length}/500 characters
              </Text>

              <Text style={styles.label}>
                Cuisine Types <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., North Indian, South Indian, Chinese"
                value={formData.cuisineTypes}
                onChangeText={(text) => updateField('cuisineTypes', text)}
                editable={!loading}
              />
              <Text style={styles.hint}>Separate multiple cuisines with commas</Text>
            </View>

            {/* Address */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address</Text>

              <Text style={styles.label}>
                Address Line 1 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Building, Street"
                value={formData.addressLine1}
                onChangeText={(text) => updateField('addressLine1', text)}
                editable={!loading}
              />

              <Text style={styles.label}>Address Line 2</Text>
              <TextInput
                style={styles.input}
                placeholder="Landmark (optional)"
                value={formData.addressLine2}
                onChangeText={(text) => updateField('addressLine2', text)}
                editable={!loading}
              />

              <Text style={styles.label}>
                Locality <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Andheri East"
                value={formData.locality}
                onChangeText={(text) => updateField('locality', text)}
                editable={!loading}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>
                    City <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={formData.city}
                    onChangeText={(text) => updateField('city', text)}
                    editable={!loading}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>State</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    value={formData.state}
                    onChangeText={(text) => updateField('state', text)}
                    editable={!loading}
                  />
                </View>
              </View>

              <Text style={styles.label}>
                Pincode <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="6-digit pincode"
                value={formData.pincode}
                onChangeText={(text) => updateField('pincode', text)}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
            </View>

            {/* Zones Served */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Zones Served <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.zonePicker}
                onPress={() => setZonePickerVisible(true)}
                disabled={loading}>
                <Icon name="map-marker-multiple" size={20} color={colors.primary} />
                <Text style={styles.zonePickerText}>
                  {formData.zonesServed.length === 0
                    ? 'Select zones'
                    : `${formData.zonesServed.length} ${formData.zonesServed.length === 1 ? 'zone' : 'zones'} selected`}
                </Text>
                <Icon name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Operating Hours */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Operating Hours</Text>

              <Text style={styles.label}>Lunch</Text>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <TextInput
                    style={styles.input}
                    placeholder="Start (HH:MM)"
                    value={formData.lunchStartTime}
                    onChangeText={(text) => updateField('lunchStartTime', text)}
                    editable={!loading}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <TextInput
                    style={styles.input}
                    placeholder="End (HH:MM)"
                    value={formData.lunchEndTime}
                    onChangeText={(text) => updateField('lunchEndTime', text)}
                    editable={!loading}
                  />
                </View>
              </View>

              <Text style={styles.label}>Dinner</Text>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <TextInput
                    style={styles.input}
                    placeholder="Start (HH:MM)"
                    value={formData.dinnerStartTime}
                    onChangeText={(text) => updateField('dinnerStartTime', text)}
                    editable={!loading}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <TextInput
                    style={styles.input}
                    placeholder="End (HH:MM)"
                    value={formData.dinnerEndTime}
                    onChangeText={(text) => updateField('dinnerEndTime', text)}
                    editable={!loading}
                  />
                </View>
              </View>
            </View>

            {/* On-Demand Operating Hours */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>On-Demand Operating Hours</Text>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Start Time</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Start (HH:MM)"
                    value={formData.onDemandStartTime}
                    onChangeText={(text) => updateField('onDemandStartTime', text)}
                    editable={!loading}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>End Time</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="End (HH:MM)"
                    value={formData.onDemandEndTime}
                    onChangeText={(text) => updateField('onDemandEndTime', text)}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Always Open Toggle */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => updateField('isAlwaysOpen', !formData.isAlwaysOpen)}
                disabled={loading}>
                <Icon
                  name={formData.isAlwaysOpen ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.checkboxLabel}>Always Open (24/7)</Text>
              </TouchableOpacity>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="10-15 digit phone number (e.g., 9876543210)"
                value={formData.contactPhone}
                onChangeText={(text) => updateField('contactPhone', text.replace(/\D/g, ''))}
                keyboardType="phone-pad"
                maxLength={15}
                editable={!loading}
              />
              <Text style={styles.hint}>Enter 10-15 digits without spaces or special characters</Text>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="contact@kitchen.com"
                value={formData.contactEmail}
                onChangeText={(text) => updateField('contactEmail', text.toLowerCase().trim())}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Owner Details (for PARTNER only) */}
            {formData.type === 'PARTNER' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Owner Details <Text style={styles.required}>*</Text>
                </Text>

                <Text style={styles.label}>
                  Owner Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Owner full name"
                  value={formData.ownerName}
                  onChangeText={(text) => updateField('ownerName', text)}
                  editable={!loading}
                />

                <Text style={styles.label}>
                  Owner Phone <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-15 digit phone number (e.g., 9876543210)"
                  value={formData.ownerPhone}
                  onChangeText={(text) => updateField('ownerPhone', text.replace(/\D/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={15}
                  editable={!loading}
                />
                <Text style={styles.hint}>Enter 10-15 digits without spaces or special characters</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {kitchen ? 'Update' : 'Create'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ZonePickerModal
        visible={zonePickerVisible}
        selectedZoneIds={formData.zonesServed}
        onClose={() => setZonePickerVisible(false)}
        onSave={(zoneIds) => updateField('zonesServed', zoneIds)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  typeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeOptionTextActive: {
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  zonePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  zonePickerText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
