import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoColors, Spacing } from '@/constants/theme';
import { apiFetch } from '@/lib/api';

export default function ReportsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [utilization, setUtilization] = useState<any[]>([]);
  const [deptAllocations, setDeptAllocations] = useState<any[]>([]);
  const [maintenanceFreq, setMaintenanceFreq] = useState<Record<string, { totalRequests: number; totalCost: number }>>({});

  const fetchReports = useCallback(async () => {
    try {
      const [utilRes, deptRes, maintRes] = await Promise.all([
        apiFetch<{ data: any[] }>('/api/v1/dashboard/utilization-report'),
        apiFetch<{ data: any[] }>('/api/v1/dashboard/department-allocations-report'),
        apiFetch<{ data: any }>('/api/v1/dashboard/maintenance-frequency-report')
      ]);

      if (utilRes?.data) setUtilization(utilRes.data);
      if (deptRes?.data) setDeptAllocations(deptRes.data);
      if (maintRes?.data) setMaintenanceFreq(maintRes.data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const onRefresh = () => { setRefreshing(true); fetchReports(); };

  const formatCurrency = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <TouchableOpacity onPress={() => Alert.alert('Export', 'Export functionality would trigger a backend job to email a CSV/PDF report.')} style={styles.exportBtn}>
          <Text style={styles.exportTxt}>Export</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator color={NeoColors.primary} style={{ marginTop: 40 }} size="large" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NeoColors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Asset Utilization */}
          <Text style={styles.sectionTitle}>Asset Utilization by Category</Text>
          {utilization.map(item => (
            <NeoCard key={item.categoryId} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.categoryName}</Text>
                <Text style={[styles.rateTxt, { color: item.utilizationRate > 80 ? '#10B981' : item.utilizationRate < 30 ? '#EF4444' : '#F59E0B' }]}>
                  {item.utilizationRate}% Utilized
                </Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${item.utilizationRate}%`, backgroundColor: item.utilizationRate > 80 ? '#10B981' : item.utilizationRate < 30 ? '#EF4444' : '#F59E0B' }]} />
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statTxt}>{item.allocated} Allocated</Text>
                <Text style={styles.statTxt}>{item.available} Available</Text>
                <Text style={styles.statTxt}>{item.maintenance} Repair</Text>
              </View>
              <Text style={styles.valTxt}>Total Value: {formatCurrency(item.totalValue)}</Text>
            </NeoCard>
          ))}

          {/* Department Allocations */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Department Allocations</Text>
          {deptAllocations.map(dept => (
            <NeoCard key={dept.departmentId} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{dept.departmentName}</Text>
                <Text style={styles.statHighlight}>{dept.activeAllocationsCount} Assets</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statTxt}>{dept.employeeCount} Employees</Text>
                <Text style={styles.statTxt}>Total Value: {formatCurrency(dept.totalAllocatedValue)}</Text>
              </View>
            </NeoCard>
          ))}

          {/* Maintenance Frequency */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Maintenance Frequency</Text>
          {Object.entries(maintenanceFreq).length === 0 ? (
            <Text style={styles.emptyTxt}>No maintenance data available.</Text>
          ) : (
            Object.entries(maintenanceFreq).map(([cat, data]: [string, any]) => (
              <NeoCard key={cat} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{cat}</Text>
                  <Text style={styles.statHighlight}>{data.totalRequests} Repairs</Text>
                </View>
                <Text style={styles.statTxt}>Total Repair Cost: {formatCurrency(data.totalCost)}</Text>
              </NeoCard>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NeoColors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.four, paddingTop: 16, paddingBottom: 10 },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  backTxt: { fontSize: 16, color: NeoColors.primary, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  exportBtn: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#2D334A' },
  exportTxt: { color: '#A0A6B2', fontSize: 12, fontWeight: '700' },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: 60 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.6, marginBottom: 12, marginTop: 10 },
  card: { padding: 16, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  rateTxt: { fontSize: 14, fontWeight: '900' },
  barBg: { height: 8, backgroundColor: '#1E2233', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  barFill: { height: '100%', borderRadius: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statTxt: { fontSize: 12, color: '#A0A6B2', fontWeight: '600' },
  statHighlight: { fontSize: 14, color: NeoColors.primary, fontWeight: '800' },
  valTxt: { fontSize: 13, color: '#FFFFFF', fontWeight: '700', marginTop: 4 },
  emptyTxt: { fontSize: 13, color: '#687082', fontStyle: 'italic', paddingHorizontal: 10 },
});
