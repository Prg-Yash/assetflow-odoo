import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge, BadgeVariant } from '@/components/neo/NeoBadge';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';
import { apiFetch, clearToken } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type SubSection = 'maintenance' | 'transfers' | 'notifications' | 'settings';

interface MaintenanceRequest {
  id: string;
  issue: string;
  priority: string;
  status: string;
  openedAt: string;
  cost?: number;
  asset?: { assetCode: string; name: string };
  raisedBy?: { name: string };
  assignedTo?: { name: string };
}

interface Transfer {
  id: string;
  status: string;
  reason?: string;
  createdAt: string;
  asset?: { assetCode: string; name: string };
  fromEmployee?: { user?: { name: string }; employeeCode: string };
  toEmployee?: { user?: { name: string }; employeeCode: string };
}

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const PRIORITY_BADGE: Record<string, BadgeVariant> = {
  LOW: 'neutral', MEDIUM: 'warning', HIGH: 'danger', CRITICAL: 'danger',
};
const STATUS_BADGE: Record<string, BadgeVariant> = {
  OPEN: 'warning', APPROVED: 'info', ASSIGNED: 'info', IN_PROGRESS: 'info',
  RESOLVED: 'success', REJECTED: 'danger', CLOSED: 'neutral',
  PENDING: 'warning', COMPLETED: 'success', CANCELLED: 'neutral',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MoreScreen() {
  const router = useRouter();
  const { user, activeOrg, signOut } = useAuth();
  const [activeSub, setActiveSub] = useState<SubSection>('maintenance');

  // Maintenance
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [maintLoading, setMaintLoading] = useState(false);

  // Transfers
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Create Maintenance Modal
  const [maintModal, setMaintModal] = useState(false);
  const [creatingMaint, setCreatingMaint] = useState(false);
  const [maintForm, setMaintForm] = useState({ assetId: '', issue: '', priority: 'MEDIUM', estimatedCost: '' });

  // Transfer Modal
  const [transferModal, setTransferModal] = useState(false);
  const [creatingTransfer, setCreatingTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({ assetId: '', fromEmployeeId: '', toEmployeeId: '', reason: '' });

  // Load data per sub-section
  const loadMaintenance = useCallback(async () => {
    setMaintLoading(true);
    try {
      const res = await apiFetch<{ data: MaintenanceRequest[] }>('/api/v1/maintenance');
      if (res?.data) setMaintenance(res.data);
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setMaintLoading(false); }
  }, []);

  const loadTransfers = useCallback(async () => {
    setTransfersLoading(true);
    try {
      const res = await apiFetch<{ data: Transfer[] }>('/api/v1/transfers');
      if (res?.data) setTransfers(res.data);
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setTransfersLoading(false); }
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await apiFetch<{ data: Notification[] }>('/api/v1/notifications');
      if (res?.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.read).length);
      }
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setNotifLoading(false); }
  }, []);

  useEffect(() => {
    if (activeSub === 'maintenance') loadMaintenance();
    if (activeSub === 'transfers') loadTransfers();
    if (activeSub === 'notifications') loadNotifications();
  }, [activeSub]);

  const handleCreateMaintenance = async () => {
    if (!maintForm.assetId || !maintForm.issue) {
      Alert.alert('Required', 'Asset ID and issue description are required.');
      return;
    }
    setCreatingMaint(true);
    try {
      const payload: any = {
        assetId: maintForm.assetId.trim(),
        issue: maintForm.issue.trim(),
        priority: maintForm.priority,
      };
      if (maintForm.estimatedCost) payload.cost = parseFloat(maintForm.estimatedCost);
      await apiFetch('/api/v1/maintenance', { method: 'POST', body: JSON.stringify(payload) });
      setMaintModal(false);
      setMaintForm({ assetId: '', issue: '', priority: 'MEDIUM', estimatedCost: '' });
      await loadMaintenance();
      Alert.alert('Success', 'Maintenance request submitted!');
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setCreatingMaint(false); }
  };

  const handleCreateTransfer = async () => {
    if (!transferForm.assetId || !transferForm.fromEmployeeId || !transferForm.toEmployeeId) {
      Alert.alert('Required', 'Asset ID, From Employee ID, and To Employee ID are required.');
      return;
    }
    setCreatingTransfer(true);
    try {
      await apiFetch('/api/v1/transfers', {
        method: 'POST',
        body: JSON.stringify({
          assetId: transferForm.assetId.trim(),
          fromEmployeeId: transferForm.fromEmployeeId.trim(),
          toEmployeeId: transferForm.toEmployeeId.trim(),
          reason: transferForm.reason.trim() || undefined,
        }),
      });
      setTransferModal(false);
      setTransferForm({ assetId: '', fromEmployeeId: '', toEmployeeId: '', reason: '' });
      await loadTransfers();
      Alert.alert('Success', 'Transfer request submitted!');
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setCreatingTransfer(false); }
  };

  const handleApproveTransfer = async (id: string) => {
    try {
      await apiFetch(`/api/v1/transfers/${id}/approve`, { method: 'POST' });
      await loadTransfers();
    } catch (err: any) { Alert.alert('Error', err.message); }
  };

  const handleRejectTransfer = async (id: string) => {
    try {
      await apiFetch(`/api/v1/transfers/${id}/reject`, { method: 'POST', body: JSON.stringify({ rejectionReason: 'Rejected via mobile' }) });
      await loadTransfers();
    } catch (err: any) { Alert.alert('Error', err.message); }
  };

  const markRead = async (id: string) => {
    try {
      await apiFetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/'); } },
    ]);
  };

  const tabs: { id: SubSection; label: string; badge?: number }[] = [
    { id: 'maintenance', label: '🛠️ Maintenance' },
    { id: 'transfers', label: '🔄 Transfers' },
    { id: 'notifications', label: '🔔 Alerts', badge: unreadCount },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hub</Text>
          <Text style={styles.headerSub}>{activeOrg?.name}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/qr-scanner')} style={styles.qrBtn}>
          <Text style={styles.qrBtnTxt}>📷 QR</Text>
        </TouchableOpacity>
      </View>

      {/* Sub Nav Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subNavScroll} contentContainerStyle={styles.subNavContent}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => setActiveSub(t.id)} style={[styles.subNavPill, activeSub === t.id && styles.subNavPillActive]}>
            <Text style={[styles.subNavTxt, activeSub === t.id && styles.subNavTxtActive]}>{t.label}</Text>
            {!!t.badge && t.badge > 0 && (
              <View style={styles.badgeDot}><Text style={styles.badgeDotTxt}>{t.badge}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* MAINTENANCE */}
        {activeSub === 'maintenance' && (
          <View>
            <View style={styles.subHead}>
              <Text style={styles.subTitle}>Work Orders ({maintenance.length})</Text>
              <NeoButton label="+ New" size="sm" onPress={() => setMaintModal(true)} />
            </View>
            {maintLoading ? <ActivityIndicator color={NeoColors.primary} /> : maintenance.length === 0 ? (
              <View style={styles.emptyBox}><Text style={styles.emptyIcon}>🛠️</Text><Text style={styles.emptyTxt}>No maintenance requests</Text></View>
            ) : maintenance.map((m) => (
              <NeoCard key={m.id} style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{m.asset?.name ?? 'Unknown Asset'}</Text>
                    <Text style={styles.itemCode}>{m.asset?.assetCode}</Text>
                  </View>
                  <View style={{ gap: 4 }}>
                    <NeoBadge label={m.status} variant={STATUS_BADGE[m.status] || 'secondary'} />
                    <NeoBadge label={m.priority} variant={PRIORITY_BADGE[m.priority] || 'secondary'} />
                  </View>
                </View>
                <Text style={styles.issueText}>{m.issue}</Text>
                <View style={styles.itemFoot}>
                  <Text style={styles.footTxt}>📅 {formatDate(m.openedAt)}</Text>
                  {m.cost && <Text style={styles.footTxt}>💰 ${m.cost}</Text>}
                  {m.assignedTo && <Text style={styles.footTxt}>👤 {m.assignedTo.name}</Text>}
                </View>
              </NeoCard>
            ))}
          </View>
        )}

        {/* TRANSFERS */}
        {activeSub === 'transfers' && (
          <View>
            <View style={styles.subHead}>
              <Text style={styles.subTitle}>Transfer Orders ({transfers.length})</Text>
              <NeoButton label="+ Request" size="sm" onPress={() => setTransferModal(true)} />
            </View>
            {transfersLoading ? <ActivityIndicator color={NeoColors.primary} /> : transfers.length === 0 ? (
              <View style={styles.emptyBox}><Text style={styles.emptyIcon}>🔄</Text><Text style={styles.emptyTxt}>No transfer requests</Text></View>
            ) : transfers.map((t) => (
              <NeoCard key={t.id} style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{t.asset?.name ?? 'Unknown Asset'}</Text>
                    <Text style={styles.itemCode}>{t.asset?.assetCode}</Text>
                  </View>
                  <NeoBadge label={t.status} variant={STATUS_BADGE[t.status] || 'secondary'} />
                </View>

                <View style={styles.transferFlow}>
                  <Text style={styles.transferPerson}>{t.fromEmployee?.user?.name ?? t.fromEmployee?.employeeCode ?? '—'}</Text>
                  <Text style={styles.transferArrow}>→</Text>
                  <Text style={styles.transferPerson}>{t.toEmployee?.user?.name ?? t.toEmployee?.employeeCode ?? '—'}</Text>
                </View>

                {t.reason && <Text style={styles.issueText}>{t.reason}</Text>}
                <Text style={styles.footTxt}>📅 {formatDate(t.createdAt)}</Text>

                {t.status === 'PENDING' && ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'].includes(activeOrg?.role || '') && (
                  <View style={styles.approvalRow}>
                    <TouchableOpacity onPress={() => handleApproveTransfer(t.id)} style={styles.approveBtn}>
                      <Text style={styles.approveTxt}>✅ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRejectTransfer(t.id)} style={styles.rejectBtn}>
                      <Text style={styles.rejectTxt}>❌ Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </NeoCard>
            ))}
          </View>
        )}

        {/* NOTIFICATIONS */}
        {activeSub === 'notifications' && (
          <View>
            <Text style={styles.subTitle}>Notifications ({notifications.length})</Text>
            {notifLoading ? <ActivityIndicator color={NeoColors.primary} /> : notifications.length === 0 ? (
              <View style={styles.emptyBox}><Text style={styles.emptyIcon}>🔔</Text><Text style={styles.emptyTxt}>No notifications</Text></View>
            ) : notifications.map((n) => (
              <TouchableOpacity key={n.id} onPress={() => !n.read && markRead(n.id)} activeOpacity={0.85}>
                <NeoCard style={n.read ? styles.notifCard : [styles.notifCard, styles.notifUnread]}>
                  <View style={styles.notifTop}>
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    {!n.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifBody}>{n.body}</Text>
                  <Text style={styles.notifDate}>{formatDate(n.createdAt)}</Text>
                </NeoCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SETTINGS */}
        {activeSub === 'settings' && (
          <View>
            <Text style={styles.subTitle}>Settings</Text>

            {/* User Card */}
            <NeoCard style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarTxt}>{user?.name?.slice(0, 2).toUpperCase() ?? 'AF'}</Text>
              </View>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {activeOrg && <NeoBadge label={`${activeOrg.role.replace(/_/g, ' ')} @ ${activeOrg.name}`} variant="info" />}
            </NeoCard>

            <NeoCard style={styles.settingCard}>
              <Text style={styles.settingTitle}>Organization</Text>
              <Text style={styles.settingText}>Name: {activeOrg?.name ?? '—'}</Text>
              <Text style={styles.settingText}>Slug: @{activeOrg?.slug ?? '—'}</Text>
              <Text style={styles.settingText}>Role: {activeOrg?.role ?? '—'}</Text>
            </NeoCard>

            <NeoCard style={styles.settingCard}>
              <Text style={styles.settingTitle}>Platform</Text>
              <Text style={styles.settingText}>Theme: Dark Obsidian</Text>
              <Text style={styles.settingText}>Primary: #FF6600</Text>
              <Text style={styles.settingText}>API: {process.env.EXPO_PUBLIC_API_URL}</Text>
            </NeoCard>

            {activeOrg?.role === 'ADMIN' && (
              <NeoButton
                label="Organization Setup (Admin)"
                variant="primary"
                onPress={() => router.push('/admin')}
                style={{ marginTop: 10 }}
              />
            )}

            {['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'].includes(activeOrg?.role || '') && (
              <NeoButton
                label="Reports & Analytics"
                variant="outline"
                onPress={() => router.push('/reports')}
                style={{ marginTop: 10 }}
              />
            )}

            <NeoButton
              label="Switch Organization"
              variant="outline"
              onPress={() => router.push('/organizations')}
              style={{ marginTop: 10 }}
            />

            <NeoButton
              label="🚪 Sign Out"
              variant="secondary"
              onPress={handleSignOut}
              style={{ marginTop: 10 }}
            />
          </View>
        )}
      </ScrollView>

      {/* Create Maintenance Modal */}
      <Modal visible={maintModal} transparent animationType="slide" onRequestClose={() => setMaintModal(false)}>
        <View style={styles.bottomOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Log Maintenance Request</Text>
              <TouchableOpacity onPress={() => setMaintModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>ASSET ID *</Text>
              <TextInput style={styles.fieldInput} placeholder="Enter asset UUID" placeholderTextColor="#687082" value={maintForm.assetId} onChangeText={(v) => setMaintForm((f) => ({ ...f, assetId: v }))} autoCapitalize="none" />

              <Text style={styles.fieldLabel}>ISSUE DESCRIPTION *</Text>
              <TextInput style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]} placeholder="Describe the issue..." placeholderTextColor="#687082" value={maintForm.issue} onChangeText={(v) => setMaintForm((f) => ({ ...f, issue: v }))} multiline />

              <Text style={styles.fieldLabel}>PRIORITY</Text>
              <View style={styles.priorityRow}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                  <TouchableOpacity key={p} onPress={() => setMaintForm((f) => ({ ...f, priority: p }))} style={[styles.priorityPill, maintForm.priority === p && styles.priorityPillActive]}>
                    <Text style={[styles.priorityTxt, maintForm.priority === p && styles.priorityTxtActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>ESTIMATED COST ($)</Text>
              <TextInput style={styles.fieldInput} placeholder="450.00" placeholderTextColor="#687082" value={maintForm.estimatedCost} onChangeText={(v) => setMaintForm((f) => ({ ...f, estimatedCost: v }))} keyboardType="decimal-pad" />

              <NeoButton label={creatingMaint ? 'Submitting...' : 'Submit Request'} variant="primary" onPress={handleCreateMaintenance} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Transfer Modal */}
      <Modal visible={transferModal} transparent animationType="slide" onRequestClose={() => setTransferModal(false)}>
        <View style={styles.bottomOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Request Transfer</Text>
              <TouchableOpacity onPress={() => setTransferModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>ASSET ID *</Text>
              <TextInput style={styles.fieldInput} placeholder="Enter asset UUID" placeholderTextColor="#687082" value={transferForm.assetId} onChangeText={(v) => setTransferForm((f) => ({ ...f, assetId: v }))} autoCapitalize="none" />

              <Text style={styles.fieldLabel}>FROM EMPLOYEE ID *</Text>
              <TextInput style={styles.fieldInput} placeholder="Current custodian employee UUID" placeholderTextColor="#687082" value={transferForm.fromEmployeeId} onChangeText={(v) => setTransferForm((f) => ({ ...f, fromEmployeeId: v }))} autoCapitalize="none" />

              <Text style={styles.fieldLabel}>TO EMPLOYEE ID *</Text>
              <TextInput style={styles.fieldInput} placeholder="New custodian employee UUID" placeholderTextColor="#687082" value={transferForm.toEmployeeId} onChangeText={(v) => setTransferForm((f) => ({ ...f, toEmployeeId: v }))} autoCapitalize="none" />

              <Text style={styles.fieldLabel}>REASON</Text>
              <TextInput style={[styles.fieldInput, { height: 70, textAlignVertical: 'top' }]} placeholder="Reason for transfer..." placeholderTextColor="#687082" value={transferForm.reason} onChangeText={(v) => setTransferForm((f) => ({ ...f, reason: v }))} multiline />

              <NeoButton label={creatingTransfer ? 'Submitting...' : 'Submit Transfer'} variant="primary" onPress={handleCreateTransfer} />
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
  headerSub: { fontSize: 12, color: '#A0A6B2', fontWeight: '500' },
  qrBtn: { backgroundColor: 'rgba(255,102,0,0.12)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,102,0,0.3)' },
  qrBtnTxt: { color: NeoColors.primary, fontSize: 12, fontWeight: '800' },
  subNavScroll: { flexGrow: 0 },
  subNavContent: { paddingHorizontal: Spacing.four, gap: 8, marginBottom: 8 },
  subNavPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#161923', borderWidth: 1, borderColor: '#2D334A', flexDirection: 'row', alignItems: 'center', gap: 6 },
  subNavPillActive: { backgroundColor: 'rgba(255,102,0,0.15)', borderColor: NeoColors.primary },
  subNavTxt: { fontSize: 12, color: '#A0A6B2', fontWeight: '700' },
  subNavTxtActive: { color: NeoColors.primary },
  badgeDot: { backgroundColor: NeoColors.danger, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeDotTxt: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: 120 },
  subHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subTitle: { fontSize: 13, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.6, marginBottom: 10 },
  itemCard: { marginBottom: 10, padding: 14 },
  itemTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  itemTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  itemCode: { fontSize: 11, color: '#A0A6B2' },
  issueText: { fontSize: 13, color: '#A0A6B2', marginBottom: 8, lineHeight: 18 },
  itemFoot: { flexDirection: 'row', gap: 12 },
  footTxt: { fontSize: 11, color: '#687082', fontWeight: '600' },
  transferFlow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 10, marginBottom: 8, gap: 8 },
  transferPerson: { flex: 1, fontSize: 13, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  transferArrow: { fontSize: 16, color: NeoColors.primary, fontWeight: '800' },
  approvalRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  approveBtn: { flex: 1, backgroundColor: 'rgba(16,185,129,0.12)', paddingVertical: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#10B981' },
  approveTxt: { fontSize: 12, color: '#10B981', fontWeight: '800' },
  rejectBtn: { flex: 1, backgroundColor: 'rgba(239,68,68,0.12)', paddingVertical: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  rejectTxt: { fontSize: 12, color: '#EF4444', fontWeight: '800' },
  notifCard: { marginBottom: 8, padding: 14 },
  notifUnread: { borderColor: 'rgba(255,102,0,0.3)', borderWidth: 1 },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: NeoColors.primary },
  notifBody: { fontSize: 13, color: '#A0A6B2', lineHeight: 18, marginBottom: 6 },
  notifDate: { fontSize: 11, color: '#687082' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyIcon: { fontSize: 40 },
  emptyTxt: { fontSize: 14, fontWeight: '800', color: '#A0A6B2' },
  userCard: { padding: 20, alignItems: 'center', marginBottom: 12 },
  userAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,102,0,0.15)', borderWidth: 2, borderColor: 'rgba(255,102,0,0.4)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  userAvatarTxt: { fontSize: 24, fontWeight: '800', color: NeoColors.primary },
  userName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  userEmail: { fontSize: 13, color: '#A0A6B2', marginBottom: 10 },
  settingCard: { padding: 16, marginBottom: 10 },
  settingTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', marginBottom: 10 },
  settingText: { fontSize: 12, color: '#A0A6B2', marginBottom: 4 },
  bottomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#161923', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '88%' },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  closeBtn: { fontSize: 20, color: '#A0A6B2', fontWeight: '800' },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.8, marginBottom: 6 },
  fieldInput: { backgroundColor: '#1E2233', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#2D334A', marginBottom: 14 },
  priorityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  priorityPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#1E2233', borderWidth: 1, borderColor: '#2D334A' },
  priorityPillActive: { backgroundColor: 'rgba(255,102,0,0.15)', borderColor: NeoColors.primary },
  priorityTxt: { fontSize: 11, color: '#A0A6B2', fontWeight: '700' },
  priorityTxtActive: { color: NeoColors.primary },
});
