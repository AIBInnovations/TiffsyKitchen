import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { City, Kitchen } from '../models/types';
import { colors, spacing } from '../../../theme';

interface CityKitchenSelectorProps {
  cities: City[];
  kitchens: Kitchen[];
  selectedCityId: string | null;
  selectedKitchenId: string | null;
  onCityChange: (cityId: string) => void;
  onKitchenChange: (kitchenId: string) => void;
}

export const CityKitchenSelector: React.FC<CityKitchenSelectorProps> = ({
  cities,
  kitchens,
  selectedCityId,
  selectedKitchenId,
  onCityChange,
  onKitchenChange,
}) => {
  const [showCityModal, setShowCityModal] = useState(false);
  const [showKitchenModal, setShowKitchenModal] = useState(false);

  const selectedCity = cities.find((c) => c.id === selectedCityId);
  const selectedKitchen = kitchens.find((k) => k.id === selectedKitchenId);
  const availableKitchens = kitchens.filter((k) => k.cityId === selectedCityId);

  const handleCitySelect = (cityId: string) => {
    onCityChange(cityId);
    setShowCityModal(false);
    // Reset kitchen if it doesn't belong to new city
    const newKitchens = kitchens.filter((k) => k.cityId === cityId);
    if (selectedKitchenId && !newKitchens.some((k) => k.id === selectedKitchenId)) {
      if (newKitchens.length > 0) {
        onKitchenChange(newKitchens[0].id);
      }
    }
  };

  const handleKitchenSelect = (kitchenId: string) => {
    onKitchenChange(kitchenId);
    setShowKitchenModal(false);
  };

  return (
    <View style={styles.container}>
      {/* City Selector */}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowCityModal(true)}
      >
        <MaterialIcons name="location-city" size={18} color={colors.primary} />
        <Text style={styles.selectorText} numberOfLines={1}>
          {selectedCity?.name || 'Select City'}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Kitchen Selector */}
      <TouchableOpacity
        style={[styles.selector, !selectedCityId && styles.selectorDisabled]}
        onPress={() => selectedCityId && setShowKitchenModal(true)}
        disabled={!selectedCityId}
      >
        <MaterialIcons name="restaurant" size={18} color={selectedCityId ? colors.primary : colors.textMuted} />
        <Text
          style={[styles.selectorText, !selectedCityId && styles.selectorTextDisabled]}
          numberOfLines={1}
        >
          {selectedKitchen?.name || 'Select Kitchen'}
        </Text>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={20}
          color={selectedCityId ? colors.textSecondary : colors.textMuted}
        />
      </TouchableOpacity>

      {/* City Modal */}
      <Modal
        visible={showCityModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCityModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCityModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={[
                    styles.modalItem,
                    selectedCityId === city.id && styles.modalItemSelected,
                  ]}
                  onPress={() => handleCitySelect(city.id)}
                >
                  <MaterialIcons
                    name="location-city"
                    size={20}
                    color={selectedCityId === city.id ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedCityId === city.id && styles.modalItemTextSelected,
                    ]}
                  >
                    {city.name}
                  </Text>
                  {selectedCityId === city.id && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Kitchen Modal */}
      <Modal
        visible={showKitchenModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowKitchenModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowKitchenModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Kitchen</Text>
              <TouchableOpacity onPress={() => setShowKitchenModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {availableKitchens.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="info-outline" size={32} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No kitchens available for this city</Text>
                </View>
              ) : (
                availableKitchens.map((kitchen) => (
                  <TouchableOpacity
                    key={kitchen.id}
                    style={[
                      styles.modalItem,
                      selectedKitchenId === kitchen.id && styles.modalItemSelected,
                    ]}
                    onPress={() => handleKitchenSelect(kitchen.id)}
                  >
                    <MaterialIcons
                      name="restaurant"
                      size={20}
                      color={selectedKitchenId === kitchen.id ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedKitchenId === kitchen.id && styles.modalItemTextSelected,
                      ]}
                    >
                      {kitchen.name}
                    </Text>
                    {selectedKitchenId === kitchen.id && (
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.sm,
  },
  selector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  selectorDisabled: {
    backgroundColor: colors.background,
    opacity: 0.6,
  },
  selectorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  selectorTextDisabled: {
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusLg,
    width: '85%',
    maxHeight: '60%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  modalItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  modalItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});

export default CityKitchenSelector;
