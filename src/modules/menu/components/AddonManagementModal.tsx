import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { addonService } from '../../../services/addon.service';
import { menuManagementService } from '../../../services/menu-management.service';
import { Addon } from '../../../types/api.types';
import { DietaryBadge } from './DietaryBadge';

interface AddonManagementModalProps {
  visible: boolean;
  menuItemId: string;
  onClose: () => void;
  onSaved: () => void;
  onCreateNewAddon?: () => void;
}

interface AddonWithSelection extends Addon {
  isAttached: boolean;
}

export const AddonManagementModal: React.FC<AddonManagementModalProps> = ({
  visible,
  menuItemId,
  onClose,
  onSaved,
  onCreateNewAddon,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attachedAddons, setAttachedAddons] = useState<AddonWithSelection[]>([]);
  const [availableAddons, setAvailableAddons] = useState<AddonWithSelection[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visible) {
      loadAddons();
    }
  }, [visible, menuItemId]);

  const loadAddons = async () => {
    setLoading(true);
    try {
      const response = await addonService.getAddonsForMenuItem(menuItemId);

      const attached = response.attached.map(addon => ({
        ...addon,
        isAttached: true,
      }));

      const available = response.available.map(addon => ({
        ...addon,
        isAttached: false,
      }));

      setAttachedAddons(attached);
      setAvailableAddons(available);

      // Initialize selected IDs with currently attached addons
      const initialSelected = new Set(attached.map(addon => addon._id));
      setSelectedAddonIds(initialSelected);
    } catch (error) {
      console.error('Error loading addons:', error);
      Alert.alert('Error', 'Failed to load add-ons');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddonIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(addonId)) {
        newSet.delete(addonId);
      } else {
        newSet.add(addonId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await menuManagementService.updateMenuItemAddons(
        menuItemId,
        Array.from(selectedAddonIds)
      );

      Alert.alert('Success', 'Add-ons updated successfully');
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving addons:', error);
      Alert.alert('Error', 'Failed to update add-ons');
    } finally {
      setSaving(false);
    }
  };

  const renderAddonItem = ({ item }: { item: AddonWithSelection }) => {
    const isSelected = selectedAddonIds.has(item._id);

    return (
      <TouchableOpacity
        style={[styles.addonCard, isSelected && styles.addonCardSelected]}
        onPress={() => handleToggleAddon(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.addonInfo}>
          <View style={styles.addonHeader}>
            <Text style={styles.addonName}>{item.name}</Text>
            {!item.isAvailable && (
              <View style={styles.unavailableBadge}>
                <Text style={styles.unavailableText}>Unavailable</Text>
              </View>
            )}
          </View>

          {item.description && (
            <Text style={styles.addonDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.addonFooter}>
            <DietaryBadge dietaryType={item.dietaryType} size="small" />
            <Text style={styles.addonPrice}>₹{item.price}</Text>
          </View>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, data: AddonWithSelection[]) => {
    if (data.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <FlatList
          data={data}
          renderItem={renderAddonItem}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Manage Add-ons</Text>
          {onCreateNewAddon && (
            <TouchableOpacity onPress={onCreateNewAddon} style={styles.createButton}>
              <Text style={styles.createButtonText}>+ New</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : (
          <FlatList
            style={styles.content}
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={
              <>
                {renderSection(
                  `Currently Attached (${attachedAddons.filter(a => selectedAddonIds.has(a._id)).length})`,
                  attachedAddons
                )}
                {renderSection(
                  `Available to Attach (${availableAddons.filter(a => selectedAddonIds.has(a._id)).length})`,
                  availableAddons
                )}
                {attachedAddons.length === 0 && availableAddons.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No add-ons available</Text>
                    {onCreateNewAddon && (
                      <TouchableOpacity
                        style={styles.emptyCreateButton}
                        onPress={onCreateNewAddon}
                      >
                        <Text style={styles.emptyCreateButtonText}>Create First Add-on</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </>
            }
          />
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>
                Save ({selectedAddonIds.size} selected)
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  addonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  addonCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eff6ff',
  },
  addonInfo: {
    flex: 1,
    marginRight: 12,
  },
  addonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  unavailableBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  unavailableText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '600',
  },
  addonDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  addonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addonPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  emptyCreateButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyCreateButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
