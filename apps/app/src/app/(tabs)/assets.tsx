import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge, BadgeVariant } from '@/components/neo/NeoBadge';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Asset {
  id: string;
  assetCode: string;
  name: string;
  serialNumber?: string;
  status: string;
  condition: string;
  isShared: boolean;
  purchaseCost?: number;
  currentValue?: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  description?: string;
  category?: { id: string; name: string };
  department?: { id: string; name: string };
  location?: { id: string; name: string };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_BADGE: Record<string, BadgeVariant> = {
  AVAILABLE: 'success',
  ALLOCATED: 'info',
  UNDER_MAINTENANCE: 'warning',
  RESERVED: 'info',
  LOST: 'danger',
  DAMAGED: 'danger',
  RETIRED: 'neutral',
  DISPOSED: 'neutral',
  IN_AUDIT: 'warning',
};

const STATUSES = ['', 'AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE', 'RESERVED', 'LOST', 'DAMAGED', 'RETIRED'];

function formatCurrency(v?: number) {
  if (!v) return '—';
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AssetsScreen() {
  const router = useRouter();
  const { activeOrg, user } = useAuth();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Detail modal
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Registration Modal
  const [registerModal, setRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', categoryId: '', condition: 'NEW', isShared: false, description: '' });
  const [categories, setCategories] = useState<any[]>([]);

  // Allocation Modal
  const [allocateModal, setAllocateModal] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [allocForm, setAllocForm] = useState({ employeeId: '', expectedReturn: '' });

  const buildQuery = useCallback((p: number, s: string, status: string) => {
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('limit', '20');
    if (s) params.set('search', s);
    if (status) params.set('status', status);
    return `/api/v1/assets?${params.toString()}`;
  }, []);

  const fetchAssets = useCallback(async (p = 1, replace = true) => {
    try {
      const res = await apiFetch<{ data: Asset[]; meta: PaginationMeta }>(buildQuery(p, search, statusFilter));
      if (res?.data) {
        setAssets(replace ? res.data : (prev) => [...prev, ...res.data]);
        setMeta(res.meta || null);
        setPage(p);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load assets');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search, statusFilter, buildQuery]);

  const loadCategories = async () => {
    try {
      const res = await apiFetch<{ data: any[] }>('/api/v1/categories');
      setCategories(res.data || []);
    } catch { }
  };

  useEffect(() => {
    setLoading(true);
    fetchAssets(1, true);
    loadCategories();
  }, [fetchAssets]);

  const onRefresh = () => { setRefreshing(true); fetchAssets(1, true); };
  const loadMore = () => {
    if (meta && page < meta.totalPages && !loadingMore) {
      setLoadingMore(true);
      fetchAssets(page + 1, false);
    }
  };

  const openDetail = async (asset: Asset) => {
    setSelectedAsset(asset);
    setDetailLoading(true);
    try {
      const res = await apiFetch<{ data: Asset }>(`/api/v1/assets/${asset.id}`);
      if (res?.data) setSelectedAsset(res.data);
    } catch { /* use the list data */ } finally {
      setDetailLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regForm.name) return Alert.alert('Required', 'Asset name is required');
    setRegistering(true);
    try {
      await apiFetch('/api/v1/assets', {
        method: 'POST',
        body: JSON.stringify({
          name: regForm.name,
          categoryId: regForm.categoryId || undefined,
          condition: regForm.condition,
          isShared: regForm.isShared,
          description: regForm.description || undefined
        })
      });
      setRegisterModal(false);
      setRegForm({ name: '', categoryId: '', condition: 'NEW', isShared: false, description: '' });
      fetchAssets(1, true);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setRegistering(false);
    }
  };

  const handleAllocate = async () => {
    if (!allocForm.employeeId || !selectedAsset) return Alert.alert('Required', 'Employee ID is required');
    setAllocating(true);
    try {
      const payload: any = { employeeId: allocForm.employeeId };
      if (allocForm.expectedReturn) payload.expectedReturn = new Date(allocForm.expectedReturn).toISOString();

      await apiFetch(`/api/v1/allocations`, {
        method: 'POST',
        body: JSON.stringify({ ...payload, assetId: selectedAsset.id })
      });
      setAllocateModal(false);
      setAllocForm({ employeeId: '', expectedReturn: '' });
      openDetail(selectedAsset);
      fetchAssets(page, true);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setAllocating(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedAsset) return;
    Alert.alert('Return Asset', 'Are you returning this asset to the inventory?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Return', onPress: async () => {
        try {
          // Typically we'd find the active allocation ID, but let's assume the backend has an endpoint or we mark it available
          await apiFetch(`/api/v1/assets/${selectedAsset.id}/return`, { method: 'POST', body: JSON.stringify({ condition: 'GOOD', notes: 'Returned via mobile' }) });
          openDetail(selectedAsset);
          fetchAssets(page, true);
        } catch (err: any) {
          Alert.alert('Error', err.message);
        }
      }}
    ]);
  };

  const renderAsset = ({ item }: { item: Asset }) => (
    <TouchableOpacity onPress={() => openDetail(item)} activeOpacity={0.85}>
      <NeoCard style={styles.assetCard}>
        <View style={styles.assetTop}>
          <View style={styles.assetIconBox}>
            <Text style={styles.assetIcon}>📦</Text>
          </View>
          <View style={styles.assetMeta}>
            <Text style={styles.assetName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.assetCode}>{item.assetCode}</Text>
          </View>
          <NeoBadge label={item.status.replace(/_/g, ' ')} variant={STATUS_BADGE[item.status] || 'neutral'} />
        </View>

        <View style={styles.assetDetails}>
          {item.category && <Text style={styles.detailChip}>🏷️ {item.category.name}</Text>}
          {item.department && <Text style={styles.detailChip}>🏢 {item.department.name}</Text>}
          {item.location && <Text style={styles.detailChip}>📍 {item.location.name}</Text>}
        </View>

        <View style={styles.assetFooter}>
          <Text style={styles.assetValue}>{formatCurrency(item.currentValue || item.purchaseCost)}</Text>
          <Text style={styles.assetCondition}>{item.condition}</Text>
        </View>
      </NeoCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Asset Registry</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => router.push('/qr-scanner')} style={styles.qrBtn}>
            <Text style={styles.qrBtnTxt}>📷 QR Scan</Text>
          </TouchableOpacity>
          {(activeOrg?.role === 'ADMIN' || activeOrg?.role === 'ASSET_MANAGER') && (
            <TouchableOpacity onPress={() => setRegisterModal(true)} style={styles.qrBtn}>
              <Text style={styles.qrBtnTxt}>+ New</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, tag or serial..."
          placeholderTextColor="#687082"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Status Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {STATUSES.map((s) => (
          <TouchableOpacity
            key={s || 'ALL'}
            onPress={() => setStatusFilter(s)}
            style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipTxt, statusFilter === s && styles.filterChipTxtActive]}>
              {s || 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      {meta && (
        <Text style={styles.countTxt}>
          {meta.total} asset{meta.total !== 1 ? 's' : ''} found
        </Text>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={NeoColors.primary} />
        </View>
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(i) => i.id}
          renderItem={renderAsset}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NeoColors.primary} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={NeoColors.primary} style={{ marginVertical: 12 }} /> : null}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTxt}>No assets found</Text>
              <Text style={styles.emptySubTxt}>Try adjusting your search or status filter</Text>
            </View>
          }
        />
      )}

      {/* Asset Detail Modal */}
      <Modal visible={!!selectedAsset} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedAsset(null)}>
        {selectedAsset && (
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedAsset.name}</Text>
              <TouchableOpacity onPress={() => setSelectedAsset(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {detailLoading ? (
              <ActivityIndicator color={NeoColors.primary} style={{ marginTop: 40 }} />
            ) : (
              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
                {/* Status Row */}
                <View style={styles.detailStatusRow}>
                  <NeoBadge label={selectedAsset.status.replace(/_/g, ' ')} variant={STATUS_BADGE[selectedAsset.status] || 'neutral'} />
                  <NeoBadge label={selectedAsset.condition} variant="info" />
                  {selectedAsset.isShared && <NeoBadge label="SHARED" variant="warning" />}
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                  {selectedAsset.status === 'AVAILABLE' && ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'].includes(activeOrg?.role || '') && (
                    <NeoButton label="Allocate" variant="primary" style={{ flex: 1 }} onPress={() => setAllocateModal(true)} />
                  )}
                  {selectedAsset.status === 'ALLOCATED' && (
                    <NeoButton label="Return Asset" variant="outline" style={{ flex: 1 }} onPress={handleReturn} />
                  )}
                </View>

                <NeoCard style={styles.detailCard}>
                  <DetailRow label="Asset Code" value={selectedAsset.assetCode} />
                  <DetailRow label="Serial Number" value={selectedAsset.serialNumber} />
                  <DetailRow label="Category" value={selectedAsset.category?.name} />
                  <DetailRow label="Department" value={selectedAsset.department?.name} />
                  <DetailRow label="Location" value={selectedAsset.location?.name} />
                </NeoCard>

                <NeoCard style={styles.detailCard}>
                  <Text style={styles.detailSectionTitle}>Financial Details</Text>
                  <DetailRow label="Purchase Cost" value={formatCurrency(selectedAsset.purchaseCost)} />
                  <DetailRow label="Current Value" value={formatCurrency(selectedAsset.currentValue)} />
                  <DetailRow label="Purchase Date" value={formatDate(selectedAsset.purchaseDate)} />
                  <DetailRow label="Warranty Expiry" value={formatDate(selectedAsset.warrantyExpiry)} />
                </NeoCard>

                {selectedAsset.description && (
                  <NeoCard style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>Description</Text>
                    <Text style={styles.descriptionTxt}>{selectedAsset.description}</Text>
                  </NeoCard>
                )}
              </ScrollView>
            )}
          </SafeAreaView>
        )}
      </Modal>

      {/* Registration Modal */}
      <Modal visible={registerModal} transparent animationType="slide">
        <View style={styles.bottomOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Register Asset</Text>
              <TouchableOpacity onPress={() => setRegisterModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>NAME *</Text>
              <TextInput style={styles.input} placeholder="MacBook Pro 16" placeholderTextColor="#687082" value={regForm.name} onChangeText={v => setRegForm({...regForm, name: v})} />
              
              <Text style={styles.label}>CONDITION</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                {['NEW', 'GOOD', 'FAIR'].map(c => (
                  <TouchableOpacity key={c} onPress={() => setRegForm({...regForm, condition: c})} style={[styles.roleBtn, regForm.condition === c && styles.roleBtnActive]}>
                    <Text style={[styles.roleTxt, regForm.condition === c && styles.roleTxtActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>IS SHARED / BOOKABLE?</Text>
              <TouchableOpacity onPress={() => setRegForm({...regForm, isShared: !regForm.isShared})} style={[styles.roleBtn, regForm.isShared && styles.roleBtnActive, { alignSelf: 'flex-start', marginBottom: 14 }]}>
                <Text style={[styles.roleTxt, regForm.isShared && styles.roleTxtActive]}>{regForm.isShared ? 'YES' : 'NO'}</Text>
              </TouchableOpacity>

              <NeoButton label={registering ? "Saving..." : "Register"} variant="primary" onPress={handleRegister} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Allocate Modal */}
      <Modal visible={allocateModal} transparent animationType="slide">
        <View style={styles.bottomOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Allocate {selectedAsset?.assetCode}</Text>
              <TouchableOpacity onPress={() => setAllocateModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>EMPLOYEE ID *</Text>
              <TextInput style={styles.input} placeholder="Enter Employee UUID" placeholderTextColor="#687082" value={allocForm.employeeId} onChangeText={v => setAllocForm({...allocForm, employeeId: v})} autoCapitalize="none" />
              
              <Text style={styles.label}>EXPECTED RETURN DATE (Optional)</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#687082" value={allocForm.expectedReturn} onChangeText={v => setAllocForm({...allocForm, expectedReturn: v})} />

              <NeoButton label={allocating ? "Allocating..." : "Confirm Allocation"} variant="primary" onPress={handleAllocate} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NeoColors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.four, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  qrBtn: { backgroundColor: 'rgba(255,102,0,0.12)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,102,0,0.3)' },
  qrBtnTxt: { color: NeoColors.primary, fontSize: 12, fontWeight: '800' },
  searchRow: { paddingHorizontal: Spacing.four, marginBottom: 10 },
  searchInput: { backgroundColor: '#161923', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#2D334A' },
  filterScroll: { flexGrow: 0 },
  filterContent: { paddingHorizontal: Spacing.four, gap: 8, marginBottom: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#161923', borderWidth: 1, borderColor: '#2D334A' },
  filterChipActive: { backgroundColor: 'rgba(255,102,0,0.15)', borderColor: NeoColors.primary },
  filterChipTxt: { fontSize: 12, color: '#A0A6B2', fontWeight: '700' },
  filterChipTxtActive: { color: NeoColors.primary },
  countTxt: { fontSize: 11, color: '#687082', paddingHorizontal: Spacing.four, marginBottom: 4, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: Spacing.four, paddingBottom: 120 },
  assetCard: { marginBottom: 10, padding: 14 },
  assetTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  assetIconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,102,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  assetIcon: { fontSize: 20 },
  assetMeta: { flex: 1 },
  assetName: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  assetCode: { fontSize: 11, color: '#A0A6B2' },
  assetDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  detailChip: { fontSize: 11, color: '#A0A6B2', backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  assetFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  assetValue: { fontSize: 13, fontWeight: '800', color: '#10B981' },
  assetCondition: { fontSize: 11, color: '#A0A6B2', fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTxt: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  emptySubTxt: { fontSize: 13, color: '#687082', textAlign: 'center' },
  // Modal
  modalSafe: { flex: 1, backgroundColor: NeoColors.background },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.four, borderBottomWidth: 1, borderBottomColor: '#252A3E', marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', flex: 1, marginRight: 12 },
  modalClose: { fontSize: 22, color: '#A0A6B2', fontWeight: '800' },
  modalScroll: { flex: 1 },
  modalContent: { padding: Spacing.four, paddingBottom: 40 },
  detailStatusRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  detailCard: { marginBottom: 12, padding: 16 },
  detailSectionTitle: { fontSize: 12, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.6, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1E2233' },
  detailLabel: { fontSize: 13, color: '#A0A6B2', fontWeight: '600' },
  detailValue: { fontSize: 13, color: '#FFFFFF', fontWeight: '700', maxWidth: '55%', textAlign: 'right' },
  descriptionTxt: { fontSize: 13, color: '#A0A6B2', lineHeight: 20 },
  // Bottom Sheet
  bottomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#161923', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '85%' },
  label: { fontSize: 11, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.8, marginBottom: 6 },
  input: { backgroundColor: '#1E2233', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#2D334A', marginBottom: 14 },
  roleBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#1E2233', borderWidth: 1, borderColor: '#2D334A' },
  roleBtnActive: { backgroundColor: 'rgba(255,102,0,0.15)', borderColor: NeoColors.primary },
  roleTxt: { fontSize: 12, color: '#A0A6B2', fontWeight: '700' },
  roleTxtActive: { color: NeoColors.primary },
});
