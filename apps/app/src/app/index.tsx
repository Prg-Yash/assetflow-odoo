import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated, activeOrg, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && activeOrg) {
        router.replace('/(tabs)' as any);
      } else if (isAuthenticated) {
        router.replace('/organizations');
      }
    }
  }, [isLoading, isAuthenticated, activeOrg, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={NeoColors.primary} />
        <Text style={styles.loadingText}>AssetFlow</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logoTitle}>
            Asset<Text style={styles.logoAccent}>Flow</Text>
          </Text>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.badgeBox}>
            <Text style={styles.badgeText}>ENTERPRISE ASSET MANAGEMENT</Text>
          </View>
          <Text style={styles.heroTitle}>Manage Assets</Text>
          <Text style={styles.heroTitleAccent}>with Clarity</Text>
          <Text style={styles.heroSubtitle}>
            Centralize asset tracking, streamline allocations, and gain real-time visibility into your organization's resources.
          </Text>
        </View>

        <View style={styles.actionBlock}>
          <NeoButton
            label="Start Free Trial ›"
            variant="primary"
            onPress={() => router.push('/auth/register')}
            style={styles.actionBtn}
          />
          <NeoButton
            label="Sign In to Workspace"
            variant="secondary"
            onPress={() => router.push('/auth/login')}
            style={styles.actionBtn}
          />
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresHeading}>Powerful Features</Text>
          {[
            { icon: '📦', title: 'Asset Lifecycle Tracking', desc: 'Track assets from acquisition to retirement with automated state transitions and real-time history.' },
            { icon: '📅', title: 'No-Overlap Booking', desc: 'Calendar-based resource bookings with built-in clash prevention.' },
            { icon: '👥', title: 'Role-Based Workflows', desc: 'Secure, explicit workflows for Admin, Dept Head, Asset Manager, and Employee.' },
            { icon: '⚡', title: 'Audit & Maintenance', desc: 'Scheduled audit runs and multi-step maintenance approvals integrated out of the box.' },
          ].map((f) => (
            <NeoCard key={f.title} style={styles.featureCard}>
              <Text style={styles.fIcon}>{f.icon}</Text>
              <Text style={styles.fTitle}>{f.title}</Text>
              <Text style={styles.fDesc}>{f.desc}</Text>
            </NeoCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, backgroundColor: NeoColors.background, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 22, fontWeight: '800', color: NeoColors.primary },
  safeArea: { flex: 1, backgroundColor: NeoColors.background },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  logoTitle: { fontSize: 22, fontWeight: '300', color: '#FFFFFF', letterSpacing: -0.5 },
  logoAccent: { fontWeight: '800', color: NeoColors.primary },
  heroSection: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  badgeBox: { backgroundColor: 'rgba(255,102,0,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,102,0,0.3)', marginBottom: 16 },
  badgeText: { fontSize: 10, fontWeight: '800', color: NeoColors.primary, letterSpacing: 1 },
  heroTitle: { fontSize: 38, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', lineHeight: 44 },
  heroTitleAccent: { fontSize: 38, fontWeight: '900', color: NeoColors.primary, textAlign: 'center', lineHeight: 44, marginBottom: 16 },
  heroSubtitle: { fontSize: 14, color: '#A0A6B2', textAlign: 'center', fontWeight: '500', paddingHorizontal: 10, lineHeight: 22 },
  actionBlock: { gap: 12, marginBottom: 40 },
  actionBtn: { width: '100%' },
  featuresSection: { gap: 12 },
  featuresHeading: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  featureCard: { padding: 20, alignItems: 'center' },
  fIcon: { fontSize: 32, marginBottom: 12 },
  fTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 6, textAlign: 'center' },
  fDesc: { fontSize: 13, color: '#A0A6B2', textAlign: 'center', lineHeight: 20 },
});
