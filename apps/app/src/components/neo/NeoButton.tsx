import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { NeoColors } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface NeoButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  icon,
  rightIcon,
  loading = false,
  disabled = false,
  size = 'md',
}) => {
  const getContainerStyles = (): ViewStyle => {
    if (disabled) {
      return { backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' };
    }
    switch (variant) {
      case 'secondary':
        return { backgroundColor: '#212638', borderColor: '#303752' };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: NeoColors.primary, borderWidth: 1.5 };
      case 'danger':
        return { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)' };
      case 'ghost':
        return { backgroundColor: 'transparent', borderWidth: 0 };
      case 'primary':
      default:
        return {
          backgroundColor: NeoColors.primary,
          borderColor: '#FF8533',
        };
    }
  };

  const getTextStyles = (): TextStyle => {
    if (disabled) return { color: '#687082' };
    switch (variant) {
      case 'outline':
        return { color: NeoColors.primary };
      case 'danger':
        return { color: '#FCA5A5' };
      case 'ghost':
        return { color: NeoColors.textSecondary };
      case 'primary':
      case 'secondary':
      default:
        return { color: '#FFFFFF' };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16 };
      case 'lg':
        return { paddingVertical: 15, paddingHorizontal: 28, borderRadius: 24 };
      case 'md':
      default:
        return { paddingVertical: 12, paddingHorizontal: 22, borderRadius: 20 };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getSizeStyles(),
        getContainerStyles(),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? NeoColors.primary : '#FFFFFF'} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.leftIcon}>{icon}</View>}
          <Text style={[styles.label, size === 'sm' && { fontSize: 13 }, size === 'lg' && { fontSize: 16 }, getTextStyles(), textStyle]}>
            {label}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
