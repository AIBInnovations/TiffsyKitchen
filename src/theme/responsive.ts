import { Dimensions, PixelRatio } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (design reference - iPhone 12 Pro)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Responsive width based on percentage of screen width
 * @param percentage - percentage of screen width (0-100)
 */
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Responsive height based on percentage of screen height
 * @param percentage - percentage of screen height (0-100)
 */
export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

/**
 * Responsive font size based on screen width
 * Scales font size relative to base width
 * @param size - base font size
 */
export const rf = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Responsive spacing based on screen width
 * @param size - base spacing size
 */
export const rs = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size * scale);
};

/**
 * Get screen dimensions
 */
export const getScreenDimensions = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
});

/**
 * Check if device is small (width < 375)
 */
export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < 375;
};

/**
 * Check if device is medium (375 <= width < 414)
 */
export const isMediumDevice = (): boolean => {
  return SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
};

/**
 * Check if device is large (width >= 414)
 */
export const isLargeDevice = (): boolean => {
  return SCREEN_WIDTH >= 414;
};

/**
 * Get responsive value based on device size
 * @param small - value for small devices
 * @param medium - value for medium devices (optional, defaults to small)
 * @param large - value for large devices (optional, defaults to medium or small)
 */
export const getResponsiveValue = <T,>(
  small: T,
  medium?: T,
  large?: T
): T => {
  if (isSmallDevice()) return small;
  if (isMediumDevice()) return medium ?? small;
  return large ?? medium ?? small;
};

/**
 * Responsive utility object for easy access
 */
export const responsive = {
  wp,
  hp,
  rf,
  rs,
  isSmall: isSmallDevice(),
  isMedium: isMediumDevice(),
  isLarge: isLargeDevice(),
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  getValue: getResponsiveValue,
};

export default responsive;
