import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge, BadgeVariant } from '@/components/neo/NeoBadge';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';
import { apiFetch } from '@/lib/api';

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  status: string;
  asset?: { id: string; name: string; assetCode: string };
  employee?: { id: string; user?: { name: string } };
}

interface BookableAsset {
  id: string;
  name: string;
  assetCode: string;
}

const STATUS_BADGE: Record<string, BadgeVariant> = {
  PENDING: 'warning',
  APPROVED: 'success',
  ACTIVE: 'info',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sharedAssets, setSharedAssets] = useState<BookableAsset[]>([]);

  // Create form
  const [assetId, setAssetId] = useState('');
  const [assetSearch, setAssetSearch] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: Booking[] }>('/api/v1/bookings');
      if (res?.data) setBookings(res.data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchSharedAssets = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: BookableAsset[] }>('/api/v1/assets?isShared=true&limit=100');
      if (res?.data) setSharedAssets(res.data);
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchSharedAssets();
  }, [fetchBookings, fetchSharedAssets]);

  const handleCreate = async () => {
    if (!assetId || !startTime || !endTime) {
      Alert.alert('Required', 'Asset, start time, and end time are required.\nFormat: YYYY-MM-DDTHH:MM');
      return;
    }
    setCreating(true);
    try {
      const payload: any = {
        assetId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };
      if (purpose) payload.purpose = purpose;

      await apiFetch('/api/v1/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setModalVisible(false);
      setAssetId(''); setAssetSearch(''); setStartTime(''); setEndTime(''); setPurpose('');
      await fetchBookings();
      Alert.alert('Success', 'Booking created successfully!');
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          try {
            await apiFetch(`/api/v1/bookings/${bookingId}`, { method: 'DELETE' });
            await fetchBookings();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const onRefresh = () => { setRefreshing(true); fetchBookings(); };

  const filteredAssets = sharedAssets.filter(
    (a) => a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
            a.assetCode.toLowerCase().includes(assetSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resource Bookings</Text>
        <NeoButton label="+ Book Asset" size="sm" onPress={() => setModalVisible(true)} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={NeoColors.primary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NeoColors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {bookings.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTxt}>No Bookings Yet</Text>
              <Text style={styles.emptySubTxt}>Book a shared resource like a projector, room, or equipment for a time slot.</Text>
            </View>
          ) : (
            bookings.map((b) => (
              <NeoCard key={b.id} style={styles.bookingCard}>
                <View style={styles.bookingTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.assetName}>{b.asset?.name ?? 'Unknown Asset'}</Text>
                    <Text style={styles.assetCode}>{b.asset?.assetCode}</Text>
                  </View>
                  <NeoBadge label={b.status} variant={STATUS_BADGE[b.status] || 'secondary'} />
                </View>

                {b.purpose && <Text style={styles.purpose}>"{b.purpose}"</Text>}

                <View style={styles.timeRow}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeLabel}>START</Text>
                    <Text style={styles.timeValue}>{formatDateTime(b.startTime)}</Text>
                  </View>
                  <Text style={styles.timeSep}>→</Text>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeLabel}>END</Text>
                    <Text style={styles.timeValue}>{formatDateTime(b.endTime)}</Text>
                  </View>
                </View>

                {b.employee?.user?.name && (
                  <Text style={styles.employee}>👤 {b.employee.user.name}</Text>
                )}

                {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                  <TouchableOpacity onPress={() => handleCancel(b.id)} style={styles.cancelBtn}>
                    <Text style={styles.cancelTxt}>Cancel Booking</Text>
                  </TouchableOpacity>
                )}
              </NeoCard>
            ))
          )}
        </ScrollView>
      )}

      {/* Create Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Book a Resource</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>SHARED ASSET *</Text>
              <TouchableOpacity onPress={() => setShowAssetPicker(!showAssetPicker)} style={styles.assetSelector}>
                <Text style={assetId ? styles.assetSelectorSelected : styles.assetSelectorPlaceholder}>
                  {assetId ? sharedAssets.find((a) => a.id === assetId)?.name ?? assetId : 'Tap to select asset...'}
                </Text>
              </TouchableOpacity>

              {showAssetPicker && (
                <View style={styles.assetPickerBox}>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Search shared assets..."
                    placeholderTextColor="#687082"
                    value={assetSearch}
                    onChangeText={setAssetSearch}
                  />
                  {filteredAssets.map((a) => (
                    <TouchableOpacity key={a.id} onPress={() => { setAssetId(a.id); setShowAssetPicker(false); setAssetSearch(''); }} style={styles.assetPickerItem}>
                      <Text style={styles.assetPickerName}>{a.name}</Text>
                      <Text style={styles.assetPickerCode}>{a.assetCode}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredAssets.length === 0 && <Text style={styles.noAssetsNote}>No shared assets found. Assets must have isShared=true.</Text>}
                </View>
              )}

              <Text style={styles.fieldLabel}>START TIME * (YYYY-MM-DDTHH:MM)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="2026-07-15T14:00"
                placeholderTextColor="#687082"
                value={startTime}
                onChangeText={setStartTime}
              />

              <Text style={styles.fieldLabel}>END TIME * (YYYY-MM-DDTHH:MM)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="2026-07-15T16:00"
                placeholderTextColor="#687082"
                value={endTime}
                onChangeText={setEndTime}
              />

              <Text style={styles.fieldLabel}>PURPOSE</Text>
              <TextInput
                style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Q3 Board presentation prep..."
                placeholderTextColor="#687082"
                value={purpose}
                onChangeText={setPurpose}
                multiline
              />

              <NeoButton
                label={creating ? 'Booking...' : 'Confirm Booking'}
                variant="primary"
                onPress={handleCreate}
                style={{ marginTop: 8 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NeoColors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.four, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: 120 },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTxt: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  emptySubTxt: { fontSize: 13, color: '#687082', textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  bookingCard: { marginBottom: 10, padding: 16 },
  bookingTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  assetName: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  assetCode: { fontSize: 11, color: '#A0A6B2' },
  purpose: { fontSize: 13, color: '#A0A6B2', fontStyle: 'italic', marginBottom: 10 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 10, marginBottom: 8 },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 9, fontWeight: '800', color: '#687082', letterSpacing: 0.5, marginBottom: 2 },
  timeValue: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  timeSep: { fontSize: 16, color: NeoColors.primary, fontWeight: '800' },
  employee: { fontSize: 12, color: '#A0A6B2', marginBottom: 8 },
  cancelBtn: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: NeoColors.danger },
  cancelTxt: { fontSize: 11, color: NeoColors.danger, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#161923', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '90%' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  modalClose: { fontSize: 20, color: '#A0A6B2', fontWeight: '800' },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.8, marginBottom: 6 },
  fieldInput: { backgroundColor: '#1E2233', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#2D334A', marginBottom: 14 },
  assetSelector: { backgroundColor: '#1E2233', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#2D334A', marginBottom: 12 },
  assetSelectorSelected: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
  assetSelectorPlaceholder: { fontSize: 14, color: '#687082' },
  assetPickerBox: { backgroundColor: '#1A1F2E', borderRadius: 14, borderWidth: 1, borderColor: '#2D334A', marginBottom: 14, overflow: 'hidden' },
  assetPickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#1E2233' },
  assetPickerName: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  assetPickerCode: { fontSize: 11, color: '#A0A6B2' },
  noAssetsNote: { padding: 12, fontSize: 12, color: '#687082', textAlign: 'center' },
});
