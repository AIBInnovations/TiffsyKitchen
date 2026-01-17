import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import type { DriverDocumentViewerProps } from '../../../types/driver.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DriverDocumentViewer: React.FC<DriverDocumentViewerProps> = ({
  visible,
  imageUrl,
  documentType,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{documentType}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.white} />
              <Text style={styles.loadingText}>Loading image...</Text>
            </View>
          )}

          {hasError && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="broken-image" size={64} color={colors.white} />
              <Text style={styles.errorText}>Failed to load image</Text>
              <Text style={styles.errorSubtext}>
                The image may have been removed or the URL is invalid
              </Text>
            </View>
          )}

          {!hasError && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </View>

        {/* Footer with instructions */}
        <View style={styles.footer}>
          <View style={styles.instructionRow}>
            <MaterialIcons name="info-outline" size={20} color={colors.white} />
            <Text style={styles.instructionText}>
              Tap outside or press close to exit
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT - 200,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.7,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  instructionText: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
});
