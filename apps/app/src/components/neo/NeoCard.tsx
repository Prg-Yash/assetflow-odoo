import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, Pressable } from 'react-native';
import { NeoColors, Spacing } from '@/constants/theme';

interface NeoCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  glow?: boolean;
  orangeBorder?: boolean;
  onPress?: () => void;
  className?: string;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  children,
  style,
  glow = false,
  orangeBorder = false,
  onPress,
}) => {
  const cardContent = (
    <View
      style={[
        styles.card,
        orangeBorder && styles.orangeBorder,
        glow && styles.glow,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
        ]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: NeoColors.card,
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: NeoColors.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      } as any,
    }),
  },
  orangeBorder: {
    borderColor: NeoColors.cardBorderOrange,
  },
  glow: {
    borderColor: NeoColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: NeoColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 0 25px rgba(255, 102, 0, 0.25), inset 0 1px 0 rgba(255, 102, 0, 0.2)',
      } as any,
    }),
  },
  pressable: {
    width: '100%',
  },
});
