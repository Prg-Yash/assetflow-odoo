import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet, Text } from 'react-native';

import { ExternalLink } from './external-link';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, NeoColors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%', backgroundColor: NeoColors.background }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href={'/(tabs)/index' as any} asChild>
            <TabButton icon="🏠">Overview</TabButton>
          </TabTrigger>
          <TabTrigger name="assets" href="/(tabs)/assets" asChild>
            <TabButton icon="📦">Assets</TabButton>
          </TabTrigger>
          <TabTrigger name="bookings" href="/(tabs)/bookings" asChild>
            <TabButton icon="📅">Bookings</TabButton>
          </TabTrigger>
          <TabTrigger name="audit" href="/(tabs)/audit" asChild>
            <TabButton icon="⚡">Audit</TabButton>
          </TabTrigger>
          <TabTrigger name="more" href="/(tabs)/more" asChild>
            <TabButton icon="🪪">Hub & Pass</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, icon, isFocused, ...props }: TabTriggerSlotProps & { icon?: string }) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.tabButtonView,
          isFocused ? styles.tabButtonActive : styles.tabButtonInactive,
        ]}
      >
        {icon && <Text style={{ fontSize: 14, marginRight: 6 }}>{icon}</Text>}
        <Text
          style={[
            styles.tabButtonText,
            isFocused ? { color: '#FFFFFF', fontWeight: '800' } : { color: NeoColors.textSecondary },
          ]}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.brandBox}>
          <Text style={styles.brandText}>AssetFlow</Text>
          <Text style={styles.brandSub}>ENTERPRISE</Text>
        </View>

        <View style={styles.tabsRow}>
          {props.children}
        </View>

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={styles.externalPressable}>
            <Text style={styles.docsText}>Docs</Text>
          </Pressable>
        </ExternalLink>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    backgroundColor: '#161923',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 102, 0, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 900,
    boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(255, 102, 0, 0.25)' as any,
  },
  brandBox: {
    marginRight: 16,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  brandSub: {
    color: NeoColors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.75,
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: NeoColors.primary,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  externalPressable: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 16,
  },
  docsText: {
    color: NeoColors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
