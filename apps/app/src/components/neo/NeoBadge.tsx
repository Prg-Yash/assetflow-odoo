import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { NeoColors } from '@/constants/theme';

export type BadgeVariant = 'orange' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface NeoBadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const NeoBadge: React.FC<NeoBadgeProps> = ({
  label,
  variant = 'orange',
  style,
  textStyle,
  icon,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return {
          container: { backgroundColor: NeoColors.successBg, borderColor: 'rgba(16, 185, 129, 0.35)' },
          text: { color: NeoColors.success },
        };
      case 'warning':
        return {
          container: { backgroundColor: NeoColors.warningBg, borderColor: 'rgba(245, 158, 11, 0.35)' },
          text: { color: NeoColors.warning },
        };
      case 'danger':
        return {
          container: { backgroundColor: NeoColors.dangerBg, borderColor: 'rgba(239, 68, 68, 0.35)' },
          text: { color: NeoColors.danger },
        };
      case 'info':
        return {
          container: { backgroundColor: NeoColors.infoBg, borderColor: 'rgba(59, 130, 246, 0.35)' },
          text: { color: NeoColors.info },
        };
      case 'neutral':
        return {
          container: { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.15)' },
          text: { color: '#D1D5DB' },
        };
      case 'orange':
      default:
        return {
          container: { backgroundColor: 'rgba(255, 102, 0, 0.15)', borderColor: 'rgba(255, 102, 0, 0.4)' },
          text: { color: NeoColors.primary },
        };
    }
  };

  const variantStyles = getStyles();

  return (
    <View style={[styles.badge, variantStyles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.label, variantStyles.text, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
