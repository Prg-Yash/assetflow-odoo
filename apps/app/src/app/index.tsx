import React from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          <NeoButton
            label="Explore Demo Dashboard"
            variant="ghost"
            onPress={() => router.push('/(tabs)/index')}
            style={styles.actionBtn}
          />
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresHeading}>Powerful Features</Text>

          <NeoCard glow style={styles.featureCard}>
            <Text style={styles.fIcon}>📦</Text>
            <Text style={styles.fTitle}>Asset Lifecycle Tracking</Text>
            <Text style={styles.fDesc}>
              Track assets from acquisition to retirement with automated state transitions and real-time history.
            </Text>
          </NeoCard>

          <NeoCard style={styles.featureCard}>
            <Text style={styles.fIcon}>📅</Text>
            <Text style={styles.fTitle}>No-Overlap Booking</Text>
            <Text style={styles.fDesc}>
              Calendar-based resource bookings with built-in clash prevention for rooms and equipment.
            </Text>
          </NeoCard>

          <NeoCard style={styles.featureCard}>
            <Text style={styles.fIcon}>👥</Text>
            <Text style={styles.fTitle}>Role-Based Workflows</Text>
            <Text style={styles.fDesc}>
              Secure, explicit workflows for Admin, Dept Head, Asset Manager, and Employee.
            </Text>
          </NeoCard>
          
          <NeoCard style={styles.featureCard}>
            <Text style={styles.fIcon}>⚡</Text>
            <Text style={styles.fTitle}>Audit & Maintenance</Text>
            <Text style={styles.fDesc}>
              Scheduled audit runs and multi-step maintenance approvals integrated out of the box.
            </Text>
          </NeoCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NeoColors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoAccent: {
    fontWeight: '800',
    color: NeoColors.primary,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  badgeBox: {
    backgroundColor: 'rgba(255, 102, 0, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 102, 0, 0.3)',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: NeoColors.primary,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
  },
  heroTitleAccent: {
    fontSize: 38,
    fontWeight: '900',
    color: NeoColors.primary,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#A0A6B2',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  actionBlock: {
    gap: 12,
    marginBottom: 40,
  },
  actionBtn: {
    width: '100%',
  },
  featuresSection: {
    gap: 12,
  },
  featuresHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureCard: {
    padding: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  fIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  fTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  fDesc: {
    fontSize: 13,
    color: '#A0A6B2',
    textAlign: 'center',
    lineHeight: 20,
  },
});
