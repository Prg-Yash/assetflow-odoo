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

interface AuditCycle {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  department?: { name: string };
  location?: { name: string };
  auditor?: { name: string };
  auditItems?: AuditItem[];
}

interface AuditItem {
  id: string;
  result: string;
  condition: string;
  asset: { id: string; assetCode: string; name: string };
}

interface AuditDetail extends AuditCycle {
  foundCount?: number;
  missingCount?: number;
  damagedCount?: number;
  uncheckedCount?: number;
}

const STATUS_BADGE: Record<string, BadgeVariant> = {
  CREATED: 'neutral',
  ASSIGNED: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CLOSED: 'neutral',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AuditScreen() {
  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected audit detail
  const [selectedAudit, setSelectedAudit] = useState<AuditDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Create audit modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', locationId: '', departmentId: '', scheduledDate: '' });

  // QR Scan for audit
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scanTag, setScanTag] = useState('');
  const [scanNotes, setScanNotes] = useState('');
  const [scanCondition, setScanCondition] = useState('GOOD');
  const [scanning, setScanning] = useState(false);
  const [scanAuditId, setScanAuditId] = useState('');

  const fetchCycles = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: AuditCycle[] }>('/api/v1/audits');
      if (res?.data) setCycles(res.data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load audits');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCycles(); }, [fetchCycles]);

  const openDetail = async (audit: AuditCycle) => {
    setDetailLoading(true);
    setDetailModalVisible(true);
    try {
      const res = await apiFetch<{ data: AuditDetail }>(`/api/v1/audits/${audit.id}`);
      if (res?.data) setSelectedAudit(res.data);
      else setSelectedAudit(audit as AuditDetail);
    } catch {
      setSelectedAudit(audit as AuditDetail);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.title || !createForm.scheduledDate) {
      Alert.alert('Required', 'Title and scheduled date are required.\nDate format: YYYY-MM-DD');
      return;
    }
    setCreating(true);
    try {
      const payload: any = {
        title: createForm.title,
        startDate: new Date(createForm.scheduledDate).toISOString(),
        endDate: new Date(new Date(createForm.scheduledDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      if (createForm.locationId) payload.locationId = createForm.locationId;
      if (createForm.departmentId) payload.departmentId = createForm.departmentId;

      await apiFetch('/api/v1/audits', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setCreateModalVisible(false);
      setCreateForm({ title: '', locationId: '', departmentId: '', scheduledDate: '' });
      await fetchCycles();
      Alert.alert('Success', 'Audit cycle created!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setCreating(false);
    }
  };

  const openScan = (auditId: string) => {
    setScanAuditId(auditId);
    setScanTag('');
    setScanNotes('');
    setScanCondition('GOOD');
    setScanModalVisible(true);
  };

  const handleScan = async () => {
    if (!scanTag) { Alert.alert('Required', 'Asset tag is required.'); return; }
    setScanning(true);
    try {
      await apiFetch(`/api/v1/audits/${scanAuditId}/scan`, {
        method: 'POST',
        body: JSON.stringify({
          assetTag: scanTag.trim(),
          condition: scanCondition,
          notes: scanNotes || undefined,
          locationVerified: true,
        }),
      });
      Alert.alert('✅ Verified', `Asset ${scanTag} marked as verified!`);
      setScanModalVisible(false);
      if (selectedAudit?.id === scanAuditId) openDetail(selectedAudit);
    } catch (err: any) {
      Alert.alert('Scan Error', err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleComplete = async (auditId: string) => {
    Alert.alert('Complete Audit', 'This will finalize the audit and calculate discrepancies. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete', onPress: async () => {
          try {
            await apiFetch(`/api/v1/audits/${auditId}/complete`, { method: 'POST' });
            await fetchCycles();
            setDetailModalVisible(false);
            Alert.alert('Audit Completed', 'The audit has been finalized and discrepancy report generated.');
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const onRefresh = () => { setRefreshing(true); fetchCycles(); };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Physical Audits</Text>
        <NeoButton label="+ New Audit" size="sm" onPress={() => setCreateModalVisible(true)} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={NeoColors.primary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NeoColors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {cycles.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>⚡</Text>
              <Text style={styles.emptyTxt}>No Audit Cycles</Text>
              <Text style={styles.emptySubTxt}>Create a physical verification audit cycle to reconcile your asset inventory.</Text>
            </View>
          ) : (
            cycles.map((cycle) => (
              <TouchableOpacity key={cycle.id} onPress={() => openDetail(cycle)} activeOpacity={0.85}>
                <NeoCard style={styles.auditCard}>
                  <View style={styles.auditTop}>
                    <Text style={styles.auditTitle} numberOfLines={2}>{cycle.title}</Text>
                    <NeoBadge label={cycle.status} variant={STATUS_BADGE[cycle.status] || 'secondary'} />
                  </View>

                  <View style={styles.auditMeta}>
                    {cycle.department && <Text style={styles.metaChip}>🏢 {cycle.department.name}</Text>}
                    {cycle.location && <Text style={styles.metaChip}>📍 {cycle.location.name}</Text>}
                    {cycle.auditor && <Text style={styles.metaChip}>👤 {cycle.auditor.name}</Text>}
                  </View>

                  <View style={styles.auditDates}>
                    <Text style={styles.dateLabel}>Start: {formatDate(cycle.startDate)}</Text>
                    <Text style={styles.dateLabel}>End: {formatDate(cycle.endDate)}</Text>
                  </View>

                  {(cycle.status === 'IN_PROGRESS' || cycle.status === 'ASSIGNED') && (
                    <View style={styles.auditActions}>
                      <TouchableOpacity onPress={(e) => { e.stopPropagation(); openScan(cycle.id); }} style={styles.scanBtn}>
                        <Text style={styles.scanBtnTxt}>📷 Scan Asset</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </NeoCard>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Audit Detail Modal */}
      <Modal visible={detailModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDetailModalVisible(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle} numberOfLines={1}>{selectedAudit?.title || 'Audit Details'}</Text>
            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {detailLoading ? (
            <ActivityIndicator color={NeoColors.primary} style={{ marginTop: 40 }} />
          ) : selectedAudit && (
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
              <View style={styles.statusRow}>
                <NeoBadge label={selectedAudit.status} variant={STATUS_BADGE[selectedAudit.status] || 'secondary'} />
              </View>

              {/* Tally counters */}
              {(selectedAudit.foundCount !== undefined || selectedAudit.missingCount !== undefined) && (
                <View style={styles.tallyRow}>
                  <View style={styles.tallyItem}>
                    <Text style={[styles.tallyNum, { color: '#10B981' }]}>{selectedAudit.foundCount ?? 0}</Text>
                    <Text style={styles.tallyLabel}>Verified</Text>
                  </View>
                  <View style={styles.tallyItem}>
                    <Text style={[styles.tallyNum, { color: '#EF4444' }]}>{selectedAudit.missingCount ?? 0}</Text>
                    <Text style={styles.tallyLabel}>Missing</Text>
                  </View>
                  <View style={styles.tallyItem}>
                    <Text style={[styles.tallyNum, { color: '#F59E0B' }]}>{selectedAudit.damagedCount ?? 0}</Text>
                    <Text style={styles.tallyLabel}>Damaged</Text>
                  </View>
                  <View style={styles.tallyItem}>
                    <Text style={[styles.tallyNum, { color: '#687082' }]}>{selectedAudit.uncheckedCount ?? 0}</Text>
                    <Text style={styles.tallyLabel}>Unchecked</Text>
                  </View>
                </View>
              )}

              {/* Action buttons */}
              {(selectedAudit.status === 'IN_PROGRESS' || selectedAudit.status === 'ASSIGNED') && (
                <View style={styles.detailActions}>
                  <NeoButton label="📷 Scan Asset" variant="primary" onPress={() => openScan(selectedAudit.id)} style={{ flex: 1 }} />
                  <NeoButton label="✅ Complete" variant="secondary" onPress={() => handleComplete(selectedAudit.id)} style={{ flex: 1 }} />
                </View>
              )}

              {/* Audit items */}
              {selectedAudit.auditItems && selectedAudit.auditItems.length > 0 && (
                <View>
                  <Text style={styles.sectionTitle}>Checklist ({selectedAudit.auditItems.length} items)</Text>
                  {selectedAudit.auditItems.map((item) => (
                    <NeoCard key={item.id} style={styles.checkItem}>
                      <View style={styles.checkRow}>
                        <Text style={styles.checkIcon}>
                          {item.result === 'VERIFIED' ? '✅' : item.result === 'MISSING' ? '❌' : item.result === 'DAMAGED' ? '⚠️' : '⬜'}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.checkName}>{item.asset.name}</Text>
                          <Text style={styles.checkCode}>{item.asset.assetCode}</Text>
                        </View>
                        <NeoBadge label={item.result} variant={item.result === 'VERIFIED' ? 'success' : item.result === 'MISSING' ? 'danger' : 'warning'} />
                      </View>
                    </NeoCard>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Create Audit Modal */}
      <Modal visible={createModalVisible} transparent animationType="slide" onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.bottomOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>New Audit Cycle</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>AUDIT TITLE *</Text>
              <TextInput style={styles.fieldInput} placeholder="2026 Annual IT Asset Verification" placeholderTextColor="#687082" value={createForm.title} onChangeText={(v) => setCreateForm((f) => ({ ...f, title: v }))} />

              <Text style={styles.fieldLabel}>SCHEDULED START DATE * (YYYY-MM-DD)</Text>
              <TextInput style={styles.fieldInput} placeholder="2026-07-20" placeholderTextColor="#687082" value={createForm.scheduledDate} onChangeText={(v) => setCreateForm((f) => ({ ...f, scheduledDate: v }))} />

              <Text style={styles.fieldLabel}>LOCATION ID (optional)</Text>
              <TextInput style={styles.fieldInput} placeholder="Enter location UUID" placeholderTextColor="#687082" value={createForm.locationId} onChangeText={(v) => setCreateForm((f) => ({ ...f, locationId: v }))} autoCapitalize="none" />

              <Text style={styles.fieldLabel}>DEPARTMENT ID (optional)</Text>
              <TextInput style={styles.fieldInput} placeholder="Enter department UUID" placeholderTextColor="#687082" value={createForm.departmentId} onChangeText={(v) => setCreateForm((f) => ({ ...f, departmentId: v }))} autoCapitalize="none" />

              <NeoButton label={creating ? 'Creating...' : 'Launch Audit Cycle'} variant="primary" onPress={handleCreate} style={{ marginTop: 8 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* QR Scan Entry Modal */}
      <Modal visible={scanModalVisible} transparent animationType="slide" onRequestClose={() => setScanModalVisible(false)}>
        <View style={styles.bottomOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Verify Asset</Text>
              <TouchableOpacity onPress={() => setScanModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>ASSET TAG *</Text>
            <TextInput style={styles.fieldInput} placeholder="AST-100492" placeholderTextColor="#687082" value={scanTag} onChangeText={setScanTag} autoCapitalize="characters" />

            <Text style={styles.fieldLabel}>CONDITION</Text>
            <View style={styles.conditionRow}>
              {['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'].map((c) => (
                <TouchableOpacity key={c} onPress={() => setScanCondition(c)} style={[styles.conditionPill, scanCondition === c && styles.conditionPillActive]}>
                  <Text style={[styles.conditionTxt, scanCondition === c && styles.conditionTxtActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>NOTES</Text>
            <TextInput style={[styles.fieldInput, { height: 70, textAlignVertical: 'top' }]} placeholder="Verified in Rack 4B..." placeholderTextColor="#687082" value={scanNotes} onChangeText={setScanNotes} multiline />

            <NeoButton label={scanning ? 'Submitting...' : '✅ Mark as Verified'} variant="primary" onPress={handleScan} />
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
  auditCard: { marginBottom: 10, padding: 16 },
  auditTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  auditTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', flex: 1, marginRight: 10 },
  auditMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  metaChip: { fontSize: 11, color: '#A0A6B2', backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  auditDates: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dateLabel: { fontSize: 11, color: '#A0A6B2', fontWeight: '600' },
  auditActions: { marginTop: 8 },
  scanBtn: { backgroundColor: 'rgba(255,102,0,0.12)', paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,102,0,0.3)' },
  scanBtnTxt: { color: NeoColors.primary, fontSize: 13, fontWeight: '800' },
  modalSafe: { flex: 1, backgroundColor: NeoColors.background },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.four, borderBottomWidth: 1, borderBottomColor: '#252A3E' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', flex: 1, marginRight: 12 },
  modalClose: { fontSize: 22, color: '#A0A6B2', fontWeight: '800' },
  modalScroll: { flex: 1 },
  modalContent: { padding: Spacing.four, paddingBottom: 40 },
  statusRow: { marginBottom: 16 },
  tallyRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#161923', borderRadius: 16, padding: 16, marginBottom: 16 },
  tallyItem: { alignItems: 'center', gap: 4 },
  tallyNum: { fontSize: 28, fontWeight: '900' },
  tallyLabel: { fontSize: 11, color: '#A0A6B2', fontWeight: '700' },
  detailActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.6, marginBottom: 10 },
  checkItem: { padding: 12, marginBottom: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkIcon: { fontSize: 20 },
  checkName: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  checkCode: { fontSize: 11, color: '#A0A6B2' },
  bottomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#161923', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '85%' },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.8, marginBottom: 6 },
  fieldInput: { backgroundColor: '#1E2233', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#2D334A', marginBottom: 14 },
  conditionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  conditionPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: '#1E2233', borderWidth: 1, borderColor: '#2D334A' },
  conditionPillActive: { backgroundColor: 'rgba(255,102,0,0.15)', borderColor: NeoColors.primary },
  conditionTxt: { fontSize: 11, color: '#A0A6B2', fontWeight: '700' },
  conditionTxtActive: { color: NeoColors.primary },
});
