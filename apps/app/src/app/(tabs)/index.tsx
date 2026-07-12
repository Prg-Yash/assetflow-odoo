import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoHeader } from '@/components/neo/NeoHeader';
import { NeoQuickNav } from '@/components/neo/NeoQuickNav';
import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge } from '@/components/neo/NeoBadge';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing, BottomTabInset } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [activeQuickTab, setActiveQuickTab] = useState('assets');

  const handleQuickNavSelect = (id: string) => {
    setActiveQuickTab(id);
    if (id === 'assets') router.push('/assets');
    else if (id === 'bookings') router.push('/bookings');
    else if (id === 'audit') router.push('/audit');
    else if (id === 'maintenance' || id === 'transfers' || id === 'ecard') router.push('/more');
    else if (id === 'qr') router.push('/qr-scanner');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top App Bar with Title & QR Scan Action */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.appName}>AssetFlow</Text>
            <Text style={styles.appTagline}>Enterprise Intelligence</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/qr-scanner')}
            style={styles.qrScanButton}
          >
            <Text style={styles.qrScanIcon}>[ QR ]</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Top Section (Matches Welcome Back + Status Pill + Card in Screenshot) */}
        <NeoHeader
          userName="Priya Shah"
          userRole="Engineering Team Lead — Mumbai HQ"
          pendingCount={3}
          pendingLabel="You have 3 pending asset requests"
          onPressPending={() => router.push('/more')}
          cardTitle="2 Overdue Check-In Assets"
          cardSubtitle="Due in 2 days — Immediate verification required"
          cardValue="$2,450.00"
          cardButtonLabel="View Assets"
          onPressCardButton={() => router.push('/assets')}
          avatarInitials="PS"
        />

        {/* Quick Action Navigation Pills (Matches Horizontal Pills in Screenshot) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Services & Modules</Text>
          <TouchableOpacity onPress={() => router.push('/assets')}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickNavWrapper}>
          <NeoQuickNav
            activeId={activeQuickTab}
            onSelect={handleQuickNavSelect}
            items={[
              { id: 'assets', label: 'Assets', badgeCount: 128 },
              { id: 'bookings', label: 'Bookings', badgeCount: 9 },
              { id: 'audit', label: 'Audit Run', badgeCount: 3 },
              { id: 'qr', label: 'QR Scan' },
              { id: 'maintenance', label: 'Repairs', badgeCount: 4 },
              { id: 'transfers', label: 'Transfers', badgeCount: 3 },
              { id: 'ecard', label: 'e-Card' },
            ]}
          />
        </View>

        {/* Stacked Neo-morphic Cards matching the screenshot ('Hospitals', 'Events', 'e-Cards', 'Teleconsult') */}

        {/* Card 1: Featured Asset Detail (Matches 'Hospitals / Harmony General Hospital' Card) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Assets</Text>
          <TouchableOpacity onPress={() => router.push('/assets')}>
            <Text style={styles.viewAllText}>Catalog ›</Text>
          </TouchableOpacity>
        </View>
        <NeoCard glow orangeBorder style={styles.featuredCard}>
          <View style={styles.cardTopRow}>
            <NeoBadge label="Electronics & IT" variant="orange" />
            <NeoBadge label="Allocated" variant="info" />
          </View>

          {/* Graphic Placeholder matching the modern architectural preview in screenshot */}
          <View style={styles.graphicPreviewBox}>
            <View style={styles.graphicInner}>
              <Text style={styles.graphicTagText}>[ PRO HARDWARE UNIT ]</Text>
              <Text style={styles.graphicTitleText}>MacBook Pro 16" — M3 Max</Text>
              <Text style={styles.graphicSerialText}>SN: MB-2024-0078 | Tag: AF-0078</Text>
            </View>
          </View>

          <View style={styles.assetInfoSection}>
            <Text style={styles.assetCardTitle}>MacBook Pro 16" Laptop</Text>
            <Text style={styles.assetCardSubtitle}>📍 Assigned to: Rohan Mehta (Engineering)</Text>
            <Text style={styles.assetCardDetails}>🏢 Location: Mumbai HQ — Floor 4 | Dept: Engineering</Text>
          </View>

          <View style={styles.cardActionsRow}>
            <NeoButton
              label="↗ Check-In / Inspect"
              variant="primary"
              style={styles.actionBtnPrimary}
              onPress={() => router.push('/assets')}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Alert.alert('Custodian Contact', 'Calling Rohan Mehta (+91 98765 43210)...')}
              style={styles.circleBtn}
            >
              <Text style={styles.circleBtnText}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/audit')}
              style={styles.circleBtn}
            >
              <Text style={styles.circleBtnText}>⚡</Text>
            </TouchableOpacity>
          </View>
        </NeoCard>

        {/* Card 2: Digital e-Card Section (Matches 'e-Cards' orange gradient card from screenshot) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Digital e-Card & Quick ID</Text>
          <TouchableOpacity onPress={() => router.push('/more')}>
            <Text style={styles.viewAllText}>Pass ›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eCardWrapper}>
          <View style={styles.eCard}>
            <View style={styles.eCardHeader}>
              <Text style={styles.eCardTag}>ASSET CUSTODIAN PASS</Text>
              <Text style={styles.eCardId}>AF-EMP-2026-PS</Text>
            </View>

            <View style={styles.eCardBody}>
              <View style={styles.eCardAvatar}>
                <Text style={styles.eCardAvatarText}>PS</Text>
              </View>
              <View style={styles.eCardUserInfo}>
                <Text style={styles.eCardUserName}>Priya Shah</Text>
                <Text style={styles.eCardUserRole}>Senior Engineering Lead</Text>
                <Text style={styles.eCardUserDept}>Department: Engineering & Cloud</Text>
              </View>
            </View>

            <View style={styles.eCardFooter}>
              <View>
                <Text style={styles.eCardStatLabel}>ASSIGNED ASSETS</Text>
                <Text style={styles.eCardStatValue}>12 Units</Text>
              </View>
              <View>
                <Text style={styles.eCardStatLabel}>TOTAL VALUE</Text>
                <Text style={styles.eCardStatValue}>$18,450.00</Text>
              </View>
              <View>
                <Text style={styles.eCardStatLabel}>AUDIT SCORE</Text>
                <Text style={styles.eCardStatValueOrange}>100% Verified</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card 3: Events & Active Bookings (Matches 'Events' split grid from screenshot) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Reservations & Bookings</Text>
          <TouchableOpacity onPress={() => router.push('/bookings')}>
            <Text style={styles.viewAllText}>Book Room ›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eventsGrid}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push('/bookings')}
            style={[styles.eventBox, styles.eventBoxLeft]}
          >
            <NeoBadge label="Confirmed Room" variant="success" />
            <Text style={styles.eventTitle}>Conference room B2 — Orion</Text>
            <Text style={styles.eventSub}>Today | 2:00 PM – 3:00 PM</Text>
            <Text style={styles.eventFoot}>📍 HQ Floor 2 — Meeting Wing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push('/bookings')}
            style={[styles.eventBox, styles.eventBoxRight]}
          >
            <NeoBadge label="Equipment" variant="info" />
            <Text style={styles.eventTitle}>Projector A & Van #1</Text>
            <Text style={styles.eventSub}>Booked for Field Ops</Text>
            <Text style={styles.eventFoot}>⚠️ 1 Schedule Conflict Alert</Text>
          </TouchableOpacity>
        </View>

        {/* Card 4: Latest Maintenance Work Order (Matches 'Latest Teleconsult' from screenshot) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Maintenance & Repairs</Text>
          <TouchableOpacity onPress={() => router.push('/more')}>
            <Text style={styles.viewAllText}>Requests ›</Text>
          </TouchableOpacity>
        </View>
        <NeoCard style={styles.teleconsultCard}>
          <View style={styles.teleHeader}>
            <View style={styles.teleAvatar}>
              <Text style={styles.teleAvatarText}>PJ</Text>
            </View>
            <View style={styles.teleInfo}>
              <Text style={styles.teleTitle}>Projector AF-0062 — HQ Floor 2</Text>
              <View style={styles.teleRow}>
                <NeoBadge label="In Progress" variant="warning" />
                <Text style={styles.teleDate}>Priority: Medium | Est: $120</Text>
              </View>
            </View>
          </View>

          <View style={styles.teleChecklist}>
            <View style={styles.checkRow}>
              <Text style={styles.checkIcon}>✔</Text>
              <Text style={styles.checkText}>Issue reported: Lamp replacement required. Dim display.</Text>
            </View>
            <View style={styles.checkRow}>
              <Text style={styles.checkIcon}>✔</Text>
              <Text style={styles.checkText}>Technician assigned: Rohan Mehta (Est. completion tomorrow)</Text>
            </View>
          </View>
        </NeoCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NeoColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 11,
    color: NeoColors.primary,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  qrScanButton: {
    backgroundColor: 'rgba(255, 102, 0, 0.18)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: NeoColors.primary,
  },
  qrScanIcon: {
    color: NeoColors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 13,
    color: NeoColors.primary,
    fontWeight: '700',
  },
  quickNavWrapper: {
    marginHorizontal: -Spacing.four,
  },
  featuredCard: {
    padding: 20,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  graphicPreviewBox: {
    height: 140,
    borderRadius: 18,
    backgroundColor: '#11141E',
    borderWidth: 1,
    borderColor: 'rgba(255, 102, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  graphicInner: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  graphicTagText: {
    fontSize: 10,
    color: NeoColors.primary,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  graphicTitleText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 4,
  },
  graphicSerialText: {
    fontSize: 12,
    color: '#A0A6B2',
    fontWeight: '600',
  },
  assetInfoSection: {
    marginBottom: 18,
  },
  assetCardTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 6,
  },
  assetCardSubtitle: {
    fontSize: 13,
    color: '#A0A6B2',
    fontWeight: '600',
    marginBottom: 4,
  },
  assetCardDetails: {
    fontSize: 12,
    color: '#687082',
    fontWeight: '500',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtnPrimary: {
    flex: 1,
  },
  circleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#252A3E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  circleBtnText: {
    fontSize: 18,
  },
  eCardWrapper: {
    width: '100%',
  },
  eCard: {
    backgroundColor: '#FF6600',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#FF8533',
    ...Platform.select({
      ios: {
        shadowColor: NeoColors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
      },
      android: {
        elevation: 14,
      },
      web: {
        boxShadow: '0 15px 45px rgba(255, 102, 0, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.25)',
      } as any,
    }),
  },
  eCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eCardTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  eCardId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  eCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 16,
    borderRadius: 20,
  },
  eCardAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  eCardAvatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: NeoColors.primary,
  },
  eCardUserInfo: {
    flex: 1,
  },
  eCardUserName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  eCardUserRole: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFEACC',
    marginTop: 2,
  },
  eCardUserDept: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  eCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    paddingTop: 14,
  },
  eCardStatLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  eCardStatValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  eCardStatValueOrange: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  eventsGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  eventBox: {
    flex: 1,
    backgroundColor: '#161923',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252A3E',
  },
  eventBoxLeft: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  eventBoxRight: {
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 6,
  },
  eventSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0A6B2',
    marginBottom: 8,
  },
  eventFoot: {
    fontSize: 11,
    fontWeight: '500',
    color: '#687082',
  },
  teleconsultCard: {
    padding: 18,
  },
  teleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teleAvatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginRight: 14,
  },
  teleAvatarText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '800',
  },
  teleInfo: {
    flex: 1,
  },
  teleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  teleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teleDate: {
    fontSize: 12,
    color: '#A0A6B2',
    fontWeight: '600',
  },
  teleChecklist: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    color: NeoColors.primary,
    fontSize: 14,
    fontWeight: '900',
    marginRight: 10,
  },
  checkText: {
    flex: 1,
    fontSize: 13,
    color: '#E5E7EB',
    fontWeight: '500',
  },
});
