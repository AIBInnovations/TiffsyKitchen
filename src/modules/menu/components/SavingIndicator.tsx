import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../../../theme';

interface SavingIndicatorProps {
  isSaving: boolean;
  hasError?: boolean;
}

export const SavingIndicator: React.FC<SavingIndicatorProps> = ({
  isSaving,
  hasError = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSaving) {
      // Start spinning animation
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Stop spinning and fade out briefly then back in
      spinAnim.stopAnimation();
      spinAnim.setValue(0);

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSaving]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (hasError) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="error-outline" size={14} color={colors.error} />
        <Text style={[styles.text, styles.errorText]}>Save failed</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {isSaving ? (
        <>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialIcons name="sync" size={14} color={colors.textMuted} />
          </Animated.View>
          <Text style={styles.text}>Saving...</Text>
        </>
      ) : (
        <>
          <MaterialIcons name="cloud-done" size={14} color={colors.success} />
          <Text style={[styles.text, styles.savedText]}>All changes saved</Text>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusSm,
  },
  text: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
  },
  savedText: {
    color: colors.success,
  },
  errorText: {
    color: colors.error,
  },
});

export default SavingIndicator;
