import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';

interface ImageItem {
  url: string;
  title: string;
}

interface EnhancedImageViewerProps {
  visible: boolean;
  images: ImageItem[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const EnhancedImageViewer: React.FC<EnhancedImageViewerProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setZoomLevel(1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setZoomLevel(1);
    }
  };

  const handleDownload = () => {
    // Note: In React Native, downloading images requires native module
    // This is a placeholder for download functionality
    Alert.alert(
      'Download',
      'Image download feature requires native implementation.\n\nOn web, right-click and "Save Image As..."',
      [{ text: 'OK' }]
    );
  };

  const handleClose = () => {
    setZoomLevel(1);
    setCurrentIndex(initialIndex);
    onClose();
  };

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{currentImage.title}</Text>
            {images.length > 1 && (
              <Text style={styles.headerSubtitle}>
                {currentIndex + 1} / {images.length}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <MaterialIcons name="close" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Image Container */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.imageContainer}
          contentContainerStyle={styles.imageContentContainer}
          minimumZoomScale={1}
          maximumZoomScale={3}
          zoomScale={zoomLevel}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: currentImage.url }}
            style={[
              styles.image,
              {
                transform: [{ scale: zoomLevel }],
              },
            ]}
            resizeMode="contain"
          />
        </ScrollView>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Zoom Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleZoomOut}
              disabled={zoomLevel <= 1}
            >
              <MaterialIcons
                name="zoom-out"
                size={24}
                color={zoomLevel <= 1 ? colors.textMuted : colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={handleResetZoom}>
              <Text style={styles.zoomText}>{Math.round(zoomLevel * 100)}%</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleZoomIn}
              disabled={zoomLevel >= 3}
            >
              <MaterialIcons
                name="zoom-in"
                size={24}
                color={zoomLevel >= 3 ? colors.textMuted : colors.white}
              />
            </TouchableOpacity>
          </View>

          {/* Download Button */}
          <TouchableOpacity style={styles.controlButton} onPress={handleDownload}>
            <MaterialIcons name="download" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={handlePrevious}
              >
                <MaterialIcons name="chevron-left" size={40} color={colors.white} />
              </TouchableOpacity>
            )}

            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={handleNext}
              >
                <MaterialIcons name="chevron-right" size={40} color={colors.white} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Hint Text */}
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            Pinch to zoom • Drag to pan • Swipe to navigate
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerButton: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
  },
  imageContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 8,
    borderRadius: 4,
  },
  zoomText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    minWidth: 50,
    textAlign: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -30 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 10,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  hintContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
});
