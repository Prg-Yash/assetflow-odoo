import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge } from '@/components/neo/NeoBadge';
import { NeoColors, Spacing } from '@/constants/theme';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface DashboardMetrics {
  totalAssetsCount: number;
  totalAssetValuation: number;
  activeAllocationsCount: number;
  assetsInMaintenanceCount: number;
  pendingTransfersCount: number;
  openAuditAlerts: number;
}

interface OverdueItem {
  id: string;
  assetName: string;
  assetCode: string;
  employeeName: string;
  expectedReturn: string;
  daysOverdue?: number;
}

interface RecentActivity {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  metadata?: any;
  user?: { name: string; email: string };
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#10B981',
  ALLOCATED: '#3B82F6',
  UNDER_MAINTENANCE: '#F59E0B',
  IN_AUDIT: '#8B5CF6',
  LOST: '#EF4444',
  DAMAGED: '#F97316',
  RETIRED: '#6B7280',
  DISPOSED: '#374151',
  RESERVED: '#06B6D4',
};

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardScreen() {
  const router = useRouter();
  const { activeOrg, user } = useAuth();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [overdue, setOverdue] = useState<OverdueItem[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [statusDist, setStatusDist] = useState<StatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [metricsRes, overdueRes, activitiesRes, distRes] = await Promise.all([
        apiFetch<{ data: DashboardMetrics }>('/api/v1/dashboard/metrics'),
        apiFetch<{ data: OverdueItem[] }>('/api/v1/dashboard/overdue'),
        apiFetch<{ data: RecentActivity[] }>('/api/v1/dashboard/recent-activities'),
        apiFetch<{ data: StatusDistribution[] }>('/api/v1/dashboard/asset-status-distribution'),
      ]);
      if (metricsRes?.data) setMetrics(metricsRes.data);
      if (overdueRes?.data) setOverdue(overdueRes.data);
      if (activitiesRes?.data) setActivities(activitiesRes.data);
      if (distRes?.data) setStatusDist(distRes.data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const KpiCard = ({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) => (
    <NeoCard style={styles.kpiCard}>
      <Text style={styles.kpiIcon}>{icon}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </NeoCard>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={NeoColors.primary} />
          <Text style={styles.loadingTxt}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NeoColors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.orgName}>{activeOrg?.name || 'Your Organization'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/organizations')} style={styles.orgSwitchBtn}>
            <Text style={styles.orgSwitchTxt}>Switch</Text>
          </TouchableOpacity>
        </View>

        {/* Role badge */}
        {activeOrg?.role && (
          <View style={styles.roleBadgeRow}>
            <NeoBadge label={activeOrg.role.replace(/_/g, ' ')} variant="warning" />
            <Text style={styles.roleSub}>{user?.email}</Text>
          </View>
        )}

        {/* KPI Grid */}
        {metrics && (
          <View style={styles.kpiGrid}>
            <KpiCard label="Total Assets" value={String(metrics.totalAssetsCount)} icon="📦" color="#FFFFFF" />
            <KpiCard label="Valuation" value={formatCurrency(metrics.totalAssetValuation)} icon="💰" color="#10B981" />
            <KpiCard label="Allocated" value={String(metrics.activeAllocationsCount)} icon="🔑" color="#3B82F6" />
            <KpiCard label="Maintenance" value={String(metrics.assetsInMaintenanceCount)} icon="🛠️" color="#F59E0B" />
            <KpiCard label="Transfers" value={String(metrics.pendingTransfersCount)} icon="🔄" color="#8B5CF6" />
            <KpiCard label="Audit Alerts" value={String(metrics.openAuditAlerts)} icon="⚡" color="#EF4444" />
          </View>
        )}

        {/* Asset Status Distribution */}
        {statusDist.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Asset Status Breakdown</Text>
            <NeoCard style={styles.distCard}>
              {statusDist.map((s) => (
                <View key={s.status} style={styles.distRow}>
                  <View style={styles.distLeft}>
                    <View style={[styles.distDot, { backgroundColor: STATUS_COLORS[s.status] || '#6B7280' }]} />
                    <Text style={styles.distLabel}>{s.status.replace(/_/g, ' ')}</Text>
                  </View>
                  <View style={styles.distRight}>
                    <Text style={styles.distCount}>{s.count}</Text>
                    <Text style={styles.distPct}>{s.percentage?.toFixed(1) ?? 0}%</Text>
                  </View>
                </View>
              ))}
            </NeoCard>
          </View>
        )}

        {/* Overdue Returns */}
        {overdue.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Overdue Returns ({overdue.length})</Text>
            {overdue.slice(0, 5).map((item) => (
              <NeoCard key={item.id} style={styles.overdueCard}>
                <View style={styles.overdueTop}>
                  <View>
                    <Text style={styles.overdueAsset}>{item.assetName}</Text>
                    <Text style={styles.overdueCode}>{item.assetCode}</Text>
                  </View>
                  <NeoBadge label="OVERDUE" variant="danger" />
                </View>
                <Text style={styles.overdueEmployee}>📋 {item.employeeName}</Text>
                <Text style={styles.overdueDate}>Due: {formatDate(item.expectedReturn)}</Text>
              </NeoCard>
            ))}
          </View>
        )}

        {/* Recent Activities */}
        {activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {activities.slice(0, 8).map((act) => (
              <View key={act.id} style={styles.activityRow}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{act.action.replace(/_/g, ' ')}</Text>
                  <Text style={styles.activityMeta}>
                    {act.entity} • {act.user?.name ?? 'System'} • {formatDate(act.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/assets')} style={styles.quickBtn}>
              <Text style={styles.quickIcon}>📦</Text>
              <Text style={styles.quickLabel}>Assets</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')} style={styles.quickBtn}>
              <Text style={styles.quickIcon}>📅</Text>
              <Text style={styles.quickLabel}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/audit')} style={styles.quickBtn}>
              <Text style={styles.quickIcon}>⚡</Text>
              <Text style={styles.quickLabel}>Audit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/qr-scanner')} style={styles.quickBtn}>
              <Text style={styles.quickIcon}>📷</Text>
              <Text style={styles.quickLabel}>QR Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NeoColors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingTxt: { color: '#A0A6B2', fontSize: 14 },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: 120 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginBottom: 8 },
  greeting: { fontSize: 13, color: '#A0A6B2', fontWeight: '500' },
  orgName: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginTop: 2 },
  orgSwitchBtn: { backgroundColor: 'rgba(255,102,0,0.12)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,102,0,0.3)' },
  orgSwitchTxt: { color: NeoColors.primary, fontSize: 12, fontWeight: '800' },
  roleBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  roleSub: { fontSize: 11, color: '#687082', fontWeight: '500' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  kpiCard: { width: '30.5%', padding: 14, alignItems: 'center' },
  kpiIcon: { fontSize: 22, marginBottom: 6 },
  kpiValue: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  kpiLabel: { fontSize: 10, color: '#A0A6B2', fontWeight: '700', textAlign: 'center', letterSpacing: 0.3 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.6, marginBottom: 10 },
  distCard: { padding: 16 },
  distRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  distLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  distDot: { width: 10, height: 10, borderRadius: 5 },
  distLabel: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  distRight: { flexDirection: 'row', gap: 12 },
  distCount: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', minWidth: 30, textAlign: 'right' },
  distPct: { fontSize: 12, color: '#A0A6B2', fontWeight: '600', minWidth: 42, textAlign: 'right' },
  overdueCard: { padding: 14, marginBottom: 10 },
  overdueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  overdueAsset: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  overdueCode: { fontSize: 11, color: '#A0A6B2' },
  overdueEmployee: { fontSize: 13, color: '#A0A6B2', marginBottom: 4 },
  overdueDate: { fontSize: 12, color: NeoColors.danger },
  activityRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: NeoColors.primary, marginTop: 5 },
  activityContent: { flex: 1 },
  activityAction: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginBottom: 2, textTransform: 'capitalize' },
  activityMeta: { fontSize: 11, color: '#687082' },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1, backgroundColor: '#161923', borderRadius: 16, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: '#252A3E' },
  quickIcon: { fontSize: 24, marginBottom: 6 },
  quickLabel: { fontSize: 11, color: '#A0A6B2', fontWeight: '700' },
});
