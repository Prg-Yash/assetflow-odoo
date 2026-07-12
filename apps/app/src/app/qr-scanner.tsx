import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge, BadgeVariant } from '@/components/neo/NeoBadge';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';
import { apiFetch } from '@/lib/api';

interface AssetLookupResult {
  id: string;
  assetCode: string;
  name: string;
  serialNumber?: string;
  status: string;
  condition: string;
  isShared: boolean;
  purchaseCost?: number;
  currentValue?: number;
  warrantyExpiry?: string;
  description?: string;
  category?: { name: string };
  department?: { name: string };
  location?: { name: string };
  allocations?: Array<{
    id: string;
    status: string;
    employee?: { user?: { name: string }; employeeCode: string };
    allocatedAt: string;
    expectedReturn?: string;
  }>;
}

const STATUS_BADGE: Record<string, BadgeVariant> = {
  AVAILABLE: 'success', ALLOCATED: 'info', UNDER_MAINTENANCE: 'warning',
  RESERVED: 'info', LOST: 'danger', DAMAGED: 'danger', RETIRED: 'neutral',
  DISPOSED: 'neutral', IN_AUDIT: 'warning',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(v?: number) {
  if (!v) return '—';
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

export default function QRScannerScreen() {
  const router = useRouter();
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssetLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    const tag = tagInput.trim();
    if (!tag) {
      Alert.alert('Required', 'Enter an asset tag to look up.');
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await apiFetch<{ data: AssetLookupResult }>(`/api/v1/assets/by-tag/${encodeURIComponent(tag)}`);
      if (res?.data) {
        setResult(res.data);
      } else {
        setError('Asset not found');
      }
    } catch (err: any) {
      setError(err.message || 'Asset not found');
    } finally {
      setLoading(false);
    }
  };

  const activeAllocation = result?.allocations?.find((a) => a.status === 'ACTIVE');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR / Asset Lookup</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Scanner Frame (simulated — expo-camera integration pending) */}
        <View style={styles.scanFrame}>
          <View style={styles.scanCornerTL} />
          <View style={styles.scanCornerTR} />
          <View style={styles.scanCornerBL} />
          <View style={styles.scanCornerBR} />
          <Text style={styles.scanPlaceholder}>
            📷{'\n'}Camera scan coming soon{'\n'}Enter tag below
          </Text>
        </View>

        {/* Manual Entry */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.tagInput}
            placeholder="Enter asset tag  (e.g. AST-100492)"
            placeholderTextColor="#687082"
            value={tagInput}
            onChangeText={setTagInput}
            autoCapitalize="characters"
            onSubmitEditing={handleLookup}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleLookup} style={styles.searchBtn} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.searchBtnTxt}>🔍</Text>}
          </TouchableOpacity>
        </View>

        <NeoButton label={loading ? 'Looking up...' : 'Look Up Asset'} variant="primary" onPress={handleLookup} />

        {/* Error state */}
        {error && !loading && (
          <NeoCard style={styles.errorCard}>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorTxt}>{error}</Text>
            <Text style={styles.errorHint}>Check the asset tag and try again.</Text>
          </NeoCard>
        )}

        {/* Result */}
        {result && !loading && (
          <View style={styles.resultBox}>
            {/* Main info */}
            <NeoCard glow style={styles.resultCard}>
              <View style={styles.resultTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={styles.resultCode}>{result.assetCode}</Text>
                  {result.serialNumber && <Text style={styles.resultSerial}>S/N: {result.serialNumber}</Text>}
                </View>
                <NeoBadge label={result.status.replace(/_/g, ' ')} variant={STATUS_BADGE[result.status] || 'secondary'} />
              </View>

              <View style={styles.chipRow}>
                {result.category && <Text style={styles.chip}>🏷️ {result.category.name}</Text>}
                {result.department && <Text style={styles.chip}>🏢 {result.department.name}</Text>}
                {result.location && <Text style={styles.chip}>📍 {result.location.name}</Text>}
                {result.isShared && <Text style={styles.chip}>🔗 Shared Asset</Text>}
              </View>
            </NeoCard>

            {/* Financial */}
            <NeoCard style={styles.detailCard}>
              <Text style={styles.cardLabel}>Financial Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Purchase Cost</Text>
                <Text style={styles.detailVal}>{formatCurrency(result.purchaseCost)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Current Value</Text>
                <Text style={styles.detailVal}>{formatCurrency(result.currentValue)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Condition</Text>
                <Text style={styles.detailVal}>{result.condition}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Warranty Expiry</Text>
                <Text style={styles.detailVal}>{formatDate(result.warrantyExpiry)}</Text>
              </View>
            </NeoCard>

            {/* Active Allocation */}
            {activeAllocation && (
              <NeoCard style={styles.detailCard}>
                <Text style={styles.cardLabel}>Current Custodian</Text>
                <Text style={styles.custodianName}>
                  {activeAllocation.employee?.user?.name ?? activeAllocation.employee?.employeeCode ?? 'Unknown'}
                </Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Allocated On</Text>
                  <Text style={styles.detailVal}>{formatDate(activeAllocation.allocatedAt)}</Text>
                </View>
                {activeAllocation.expectedReturn && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Expected Return</Text>
                    <Text style={styles.detailVal}>{formatDate(activeAllocation.expectedReturn)}</Text>
                  </View>
                )}
              </NeoCard>
            )}

            {result.description && (
              <NeoCard style={styles.detailCard}>
                <Text style={styles.cardLabel}>Description</Text>
                <Text style={styles.description}>{result.description}</Text>
              </NeoCard>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NeoColors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.four, paddingTop: 16, paddingBottom: 10 },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  backTxt: { fontSize: 16, color: NeoColors.primary, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: 60 },
  scanFrame: { height: 200, borderRadius: 20, borderWidth: 1, borderColor: '#2D334A', backgroundColor: '#0D1117', justifyContent: 'center', alignItems: 'center', marginBottom: 20, position: 'relative' },
  scanCornerTL: { position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: NeoColors.primary, borderRadius: 4 },
  scanCornerTR: { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: NeoColors.primary, borderRadius: 4 },
  scanCornerBL: { position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: NeoColors.primary, borderRadius: 4 },
  scanCornerBR: { position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: NeoColors.primary, borderRadius: 4 },
  scanPlaceholder: { fontSize: 14, color: '#687082', textAlign: 'center', lineHeight: 22 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  tagInput: { flex: 1, backgroundColor: '#161923', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#2D334A' },
  searchBtn: { width: 52, height: 52, backgroundColor: NeoColors.primary, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  searchBtnTxt: { fontSize: 20 },
  errorCard: { marginTop: 20, padding: 24, alignItems: 'center' },
  errorIcon: { fontSize: 40, marginBottom: 10 },
  errorTxt: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  errorHint: { fontSize: 13, color: '#687082', textAlign: 'center' },
  resultBox: { marginTop: 16, gap: 10 },
  resultCard: { padding: 18 },
  resultTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  resultName: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 },
  resultCode: { fontSize: 13, color: NeoColors.primary, fontWeight: '800' },
  resultSerial: { fontSize: 11, color: '#A0A6B2', marginTop: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { fontSize: 11, color: '#A0A6B2', backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  detailCard: { padding: 16 },
  cardLabel: { fontSize: 12, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.6, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1E2233' },
  detailKey: { fontSize: 13, color: '#A0A6B2', fontWeight: '600' },
  detailVal: { fontSize: 13, color: '#FFFFFF', fontWeight: '700' },
  custodianName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 10 },
  description: { fontSize: 13, color: '#A0A6B2', lineHeight: 20 },
});
