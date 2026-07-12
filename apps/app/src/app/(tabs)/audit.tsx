import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge, BadgeVariant } from '@/components/neo/NeoBadge';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing, BottomTabInset } from '@/constants/theme';

type VerificationStatus = 'Verified' | 'Missing' | 'Damaged';

interface AuditItem {
  id: string;
  assetTag: string;
  assetName: string;
  expectedLocation: string;
  status: VerificationStatus;
}

const INITIAL_CHECKLIST: AuditItem[] = [
  { id: '1', assetTag: 'AF-0012', assetName: 'Dell Laptop XPS 15', expectedLocation: 'Desk E12 — Engineering Wing', status: 'Verified' },
  { id: '2', assetTag: 'AF-0062', assetName: '4K Laser Projector', expectedLocation: 'HQ Floor 2 — Conf B2', status: 'Missing' },
  { id: '3', assetTag: 'AF-0201', assetName: 'Ergonomic Office Chair', expectedLocation: 'Desk E14 — Facilities Wing', status: 'Damaged' },
  { id: '4', assetTag: 'AF-0078', assetName: 'MacBook Pro 16" M3 Max', expectedLocation: 'Desk E18 — Executive Row', status: 'Verified' },
  { id: '5', assetTag: 'AF-0115', assetName: 'Motorized Standing Desk', expectedLocation: 'Desk E22 — Open Layout', status: 'Verified' },
];

export default function AuditScreen() {
  const router = useRouter();
  const [checklist, setChecklist] = useState<AuditItem[]>(INITIAL_CHECKLIST);
  const [isClosed, setIsClosed] = useState(false);

  const cycleStatus = (id: string) => {
    if (isClosed) {
      Alert.alert('Audit Closed', 'This audit run has been signed off and closed.');
      return;
    }
    const order: VerificationStatus[] = ['Verified', 'Missing', 'Damaged'];
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextIdx = (order.indexOf(item.status) + 1) % order.length;
          return { ...item, status: order[nextIdx] };
        }
        return item;
      })
    );
  };

  const verifiedCount = checklist.filter((i) => i.status === 'Verified').length;
  const missingCount = checklist.filter((i) => i.status === 'Missing').length;
  const damagedCount = checklist.filter((i) => i.status === 'Damaged').length;
  const progressPercent = Math.round((verifiedCount / checklist.length) * 100);

  const getStatusVariant = (status: VerificationStatus): BadgeVariant => {
    switch (status) {
      case 'Verified': return 'success';
      case 'Missing': return 'danger';
      case 'Damaged': return 'warning';
    }
  };

  const handleResetAudit = () => {
    Alert.alert('Reset Audit Run', 'Reset all items back to Verified status?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset Run',
        style: 'destructive',
        onPress: () => {
          setChecklist((prev) => prev.map((item) => ({ ...item, status: 'Verified' })));
          setIsClosed(false);
        },
      },
    ]);
  };

  const handleSignOff = () => {
    if (missingCount > 0 || damagedCount > 0) {
      Alert.alert(
        'Discrepancy Report',
        `You have flagged ${missingCount} missing and ${damagedCount} damaged assets. Submit compliance audit report to facilities?`,
        [
          { text: 'Review List', style: 'cancel' },
          {
            text: 'Submit Report & Sign Off',
            onPress: () => {
              setIsClosed(true);
              Alert.alert('Audit Completed', 'Compliance report submitted to Facilities & Procurement.');
            },
          },
        ]
      );
    } else {
      setIsClosed(true);
      Alert.alert('Audit Completed', '100% asset verification signed off successfully.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Physical Asset Audit</Text>
          <Text style={styles.headerSub}>Verify inventory condition & location</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/qr-scanner')}
          style={styles.qrHeaderBtn}
        >
          <Text style={styles.qrHeaderText}>📷 Scan Tag</Text>
        </TouchableOpacity>
      </View>

      {/* Progress & Stats Banner */}
      <NeoCard glow orangeBorder style={styles.statsCard}>
        <View style={styles.statsHeadRow}>
          <Text style={styles.statsTitle}>Q3 Compliance Audit Run</Text>
          <NeoBadge label={isClosed ? 'Closed & Signed Off' : 'Active Run'} variant={isClosed ? 'neutral' : 'orange'} />
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>{progressPercent}% Verified ({verifiedCount}/{checklist.length} units)</Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: NeoColors.success }]}>{verifiedCount}</Text>
            <Text style={styles.metricLabel}>VERIFIED</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: NeoColors.danger }]}>{missingCount}</Text>
            <Text style={styles.metricLabel}>MISSING</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: NeoColors.warning }]}>{damagedCount}</Text>
            <Text style={styles.metricLabel}>DAMAGED</Text>
          </View>
        </View>
      </NeoCard>

      <View style={styles.instructionsBox}>
        <Text style={styles.instructionsText}>
          💡 Tap any asset card to cycle status: Verified › Missing › Damaged
        </Text>
      </View>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {checklist.map((item) => (
          <NeoCard
            key={item.id}
            style={[
              styles.checkCard,
              item.status === 'Missing' ? styles.missingBorder : {},
              item.status === 'Damaged' ? styles.damagedBorder : {},
            ]}
            onPress={() => cycleStatus(item.id)}
          >
            <View style={styles.checkCardTop}>
              <View>
                <Text style={styles.itemTag}>{item.assetTag}</Text>
                <Text style={styles.itemName}>{item.assetName}</Text>
              </View>
              <NeoBadge label={item.status} variant={getStatusVariant(item.status)} />
            </View>

            <View style={styles.locBox}>
              <Text style={styles.locLabel}>📍 Expected Location:</Text>
              <Text style={styles.locValue}>{item.expectedLocation}</Text>
            </View>

            <View style={styles.checkFoot}>
              <Text style={styles.tapHint}>Tap card to change status</Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Simulated Tag Scan', `Tag ${item.assetTag} verified via NFC/QR!`)}
                style={styles.scanQuickBtn}
              >
                <Text style={styles.scanQuickText}>📲 NFC verify</Text>
              </TouchableOpacity>
            </View>
          </NeoCard>
        ))}

        <View style={styles.footerActions}>
          <NeoButton
            label="Reset Run"
            variant="secondary"
            onPress={handleResetAudit}
            style={{ flex: 1 }}
          />
          <NeoButton
            label={isClosed ? 'Reopen Audit' : 'Submit & Sign Off ›'}
            variant="primary"
            onPress={handleSignOff}
            style={{ flex: 1.5 }}
          />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#A0A6B2',
    fontWeight: '600',
    marginTop: 2,
  },
  qrHeaderBtn: {
    backgroundColor: 'rgba(255, 102, 0, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: NeoColors.primary,
  },
  qrHeaderText: {
    color: NeoColors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  statsCard: {
    marginHorizontal: Spacing.four,
    marginBottom: 14,
    padding: 18,
  },
  statsHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: NeoColors.primary,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#A0A6B2',
    fontWeight: '600',
    marginBottom: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E96A4',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionsBox: {
    marginHorizontal: Spacing.four,
    backgroundColor: 'rgba(255, 102, 0, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 12,
    color: '#FFEACC',
    fontWeight: '600',
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: 14,
  },
  checkCard: {
    padding: 16,
  },
  missingBorder: {
    borderColor: NeoColors.danger,
    borderWidth: 1.5,
  },
  damagedBorder: {
    borderColor: NeoColors.warning,
    borderWidth: 1.5,
  },
  checkCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemTag: {
    fontSize: 13,
    fontWeight: '900',
    color: NeoColors.primary,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  locBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locLabel: {
    fontSize: 12,
    color: '#8E96A4',
    fontWeight: '500',
  },
  locValue: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '700',
  },
  checkFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  tapHint: {
    fontSize: 11,
    color: '#687082',
    fontWeight: '600',
  },
  scanQuickBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scanQuickText: {
    color: '#A0A6B2',
    fontSize: 11,
    fontWeight: '700',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 10,
  },
});
