import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Kitchen } from '../../../types/api.types';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import kitchenService from '../../../services/kitchen.service';

interface KitchenPickerModalProps {
  visible: boolean;
  selectedKitchenIds: string[];
  onClose: () => void;
  onSave: (kitchenIds: string[]) => void;
  title?: string;
}

export const KitchenPickerModal: React.FC<KitchenPickerModalProps> = ({
  visible,
  selectedKitchenIds,
  onClose,
  onSave,
  title = 'Select Kitchens',
}) => {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [filteredKitchens, setFilteredKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(selectedKitchenIds);

  useEffect(() => {
    if (visible) {
      loadKitchens();
      setTempSelectedIds(selectedKitchenIds);
    }
  }, [visible, selectedKitchenIds]);

  useEffect(() => {
    if (searchText === '') {
      setFilteredKitchens(kitchens);
    } else {
      const filtered = kitchens.filter(
        (kitchen) =>
          kitchen.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (kitchen.code && kitchen.code.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredKitchens(filtered);
    }
  }, [searchText, kitchens]);

  const loadKitchens = async () => {
    setLoading(true);
    try {
      const response = await kitchenService.getKitchens({ status: 'ACTIVE', limit: 100 });
      setKitchens(response.kitchens);
      setFilteredKitchens(response.kitchens);
    } catch (error) {
      console.error('Error loading kitchens:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleKitchen = (kitchenId: string) => {
    setTempSelectedIds((prev) => {
      if (prev.includes(kitchenId)) {
        return prev.filter((id) => id !== kitchenId);
      } else {
        return [...prev, kitchenId];
      }
    });
  };

  const handleSave = () => {
    onSave(tempSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedIds(selectedKitchenIds);
    setSearchText('');
    onClose();
  };

  const renderKitchenItem = ({ item }: { item: Kitchen }) => {
    const isSelected = tempSelectedIds.includes(item._id);

    return (
      <TouchableOpacity
        style={[styles.kitchenItem, isSelected && styles.kitchenItemSelected]}
        onPress={() => toggleKitchen(item._id)}
      >
        <View style={styles.kitchenInfo}>
          <Text style={styles.kitchenName}>{item.name}</Text>
          {item.code && <Text style={styles.kitchenCode}>{item.code}</Text>}
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Icon name="check" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titleText}>{title}</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or code..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText !== '' && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Icon name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.selectedCount}>
            <Icon name="store" size={16} color={colors.primary} />
            <Text style={styles.selectedCountText}>
              {tempSelectedIds.length} {tempSelectedIds.length === 1 ? 'kitchen' : 'kitchens'} selected
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading kitchens...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredKitchens}
              renderItem={renderKitchenItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="store-off" size={48} color={colors.textMuted} />
                  <Text style={styles.emptyText}>
                    {searchText ? 'No kitchens found' : 'No active kitchens available'}
                  </Text>
                </View>
              }
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save ({tempSelectedIds.length})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: spacing.borderRadiusLg,
    borderTopRightRadius: spacing.borderRadiusLg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    margin: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  selectedCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  kitchenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  kitchenItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  kitchenInfo: {
    flex: 1,
  },
  kitchenName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  kitchenCode: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: spacing.borderRadiusSm,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
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
