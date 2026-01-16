import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

interface SafeAreaScreenProps {
    children: React.ReactNode;
    style?: ViewStyle;
    topBackgroundColor?: string;
    bottomBackgroundColor?: string;
    backgroundColor?: string;
    statusBarColor?: string;
    darkIcon?: boolean;
}

export const SafeAreaScreen: React.FC<SafeAreaScreenProps> = ({
    children,
    style,
    topBackgroundColor,
    bottomBackgroundColor,
    backgroundColor = colors.background,
    statusBarColor,
    darkIcon = false,
}) => {
    const insets = useSafeAreaInsets();

    // effective colors
    const effectiveTopColor = topBackgroundColor || backgroundColor;
    const effectiveBottomColor = bottomBackgroundColor || backgroundColor;

    return (
        <View style={[styles.container, style]}>
            <StatusBar
                backgroundColor={statusBarColor || effectiveTopColor}
                barStyle={darkIcon ? 'dark-content' : 'light-content'}
            />

            {/* Top Spacer */}
            <View style={{ height: insets.top, backgroundColor: effectiveTopColor }} />

            {/* Content */}
            <View style={[styles.content, { backgroundColor }]}>
                {children}
            </View>

            {/* Bottom Spacer */}
            {insets.bottom > 0 && (
                <View style={{ height: insets.bottom, backgroundColor: effectiveBottomColor }} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});
