import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { NeoColors } from '@/constants/theme';

export interface QuickNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badgeCount?: number;
}

interface NeoQuickNavProps {
  items: QuickNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const NeoQuickNav: React.FC<NeoQuickNavProps> = ({ items, activeId, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => onSelect(item.id)}
            style={[
              styles.pill,
              isActive ? styles.pillActive : styles.pillInactive,
            ]}
          >
            {item.icon && (
              <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                {item.icon}
              </View>
            )}
            <Text
              style={[
                styles.label,
                isActive ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {item.label}
            </Text>
            {item.badgeCount !== undefined && item.badgeCount > 0 && (
              <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
                  {item.badgeCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: NeoColors.primary,
    borderColor: '#FF8533',
  },
  pillInactive: {
    backgroundColor: '#161923',
    borderColor: '#252A3E',
  },
  iconBox: {
    marginRight: 6,
  },
  iconBoxActive: {
    opacity: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  labelInactive: {
    color: '#A0A6B2',
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: '#FFFFFF',
  },
  badgeInactive: {
    backgroundColor: 'rgba(255, 102, 0, 0.25)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextActive: {
    color: NeoColors.primary,
  },
  badgeTextInactive: {
    color: NeoColors.primary,
  },
});
