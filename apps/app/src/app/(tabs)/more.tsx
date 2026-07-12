import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge, BadgeVariant } from '@/components/neo/NeoBadge';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing, BottomTabInset } from '@/constants/theme';

type TabSubSection = 'maintenance' | 'transfers' | 'ecard' | 'settings';
type MaintenanceStatus = 'Pending Approval' | 'In Progress' | 'Completed' | 'Rejected';
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

interface MaintenanceRequest {
  id: string;
  assetTag: string;
  assetName: string;
  requestedBy: string;
  issue: string;
  priority: Priority;
  status: MaintenanceStatus;
  cost?: number;
  date: string;
}

interface TransferRecord {
  id: string;
  tag: string;
  name: string;
  fromDept: string;
  toDept: string;
  custodian: string;
  status: string;
  date: string;
}

const INITIAL_MAINTENANCE: MaintenanceRequest[] = [
  { id: 'm1', assetTag: 'AF-0062', assetName: '4K Laser Projector', requestedBy: 'Rohan Mehta', issue: 'Lamp replacement required. Image is dim.', priority: 'Medium', status: 'In Progress', cost: 120, date: '2026-07-10' },
  { id: 'm2', assetTag: 'AF-0012', assetName: 'Dell Laptop XPS 15', requestedBy: 'Priya Shah', issue: 'Keyboard keys not working (A, S, D). Water spill.', priority: 'High', status: 'Pending Approval', date: '2026-07-12' },
  { id: 'm3', assetTag: 'AF-0078', assetName: 'MacBook Pro 16" M3 Max', requestedBy: 'System Audit', issue: 'Battery health degraded below 70%. Swelling observed.', priority: 'Critical', status: 'Completed', cost: 240, date: '2026-07-05' },
  { id: 'm4', assetTag: 'AF-0310', assetName: 'Toyota Innova Hybrid', requestedBy: 'Sana Iqbal', issue: 'Scheduled engine oil change and brake inspection.', priority: 'Low', status: 'Pending Approval', date: '2026-07-11' },
];

const INITIAL_TRANSFERS: TransferRecord[] = [
  { id: 't1', tag: 'AF-0114', name: 'Dell Laptop XPS 15', fromDept: 'IT Pool', toDept: 'Engineering', custodian: 'Priya Shah', status: 'Completed', date: 'Jul 12, 2026' },
  { id: 't2', tag: 'AF-0201', name: 'Ergonomic Office Chair', fromDept: 'Facilities Wing', toDept: 'Executive Suite', custodian: 'Rohan Mehta', status: 'Pending Custodian Sign-off', date: 'Jul 11, 2026' },
  { id: 't3', tag: 'AF-0310', name: 'Toyota Innova Hybrid', fromDept: 'Pool Fleet', toDept: 'Field Ops', custodian: 'Sana Iqbal', status: 'Completed', date: 'Jul 08, 2026' },
];

export default function MoreScreen() {
  const router = useRouter();
  const [activeSub, setActiveSub] = useState<TabSubSection>('maintenance');
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE);
  const [transferList, setTransferList] = useState<TransferRecord[]>(INITIAL_TRANSFERS);

  // Maintenance form state
  const [modalVisible, setModalVisible] = useState(false);
  const [mTag, setMTag] = useState('AF-0012');
  const [mName, setMName] = useState('Dell Laptop XPS 15');
  const [mIssue, setMIssue] = useState('');
  const [mPriority, setMPriority] = useState<Priority>('High');

  const getPriorityVariant = (p: Priority): BadgeVariant => {
    switch (p) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'neutral';
    }
  };

  const getStatusVariant = (st: MaintenanceStatus): BadgeVariant => {
    switch (st) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Pending Approval': return 'warning';
      case 'Rejected': return 'danger';
    }
  };

  const handleCreateRepair = () => {
    if (!mIssue.trim()) {
      Alert.alert('Validation Error', 'Please describe the maintenance or repair issue.');
      return;
    }
    const newReq: MaintenanceRequest = {
      id: Math.random().toString(36).slice(2, 9),
      assetTag: mTag,
      assetName: mName,
      requestedBy: 'Priya Shah (Lead)',
      issue: mIssue.trim(),
      priority: mPriority,
      status: 'Pending Approval',
      date: '2026-07-12',
    };
    setMaintenanceList([newReq, ...maintenanceList]);
    setModalVisible(false);
    setMIssue('');
    Alert.alert('Request Submitted', `Work order logged for ${mName} (${mTag}).`);
  };

  const handleCreateTransfer = () => {
    Alert.prompt(
      'Initiate Asset Transfer',
      'Enter Asset Tag and New Custodian Name (e.g. AF-0078 - Arjun Nair):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Transfer',
          onPress: (val?: string) => {
            const parts = (val || 'AF-0078 - Arjun Nair').split('-');
            const tag = parts[0]?.trim() || 'AF-0078';
            const user = parts[1]?.trim() || 'Arjun Nair';
            const newT: TransferRecord = {
              id: Math.random().toString(36).slice(2, 9),
              tag,
              name: 'MacBook Pro 16" M3 Max',
              fromDept: 'Engineering Pool',
              toDept: 'Cloud Architecture',
              custodian: user,
              status: 'Pending Custodian Sign-off',
              date: 'Jul 12, 2026',
            };
            setTransferList([newT, ...transferList]);
            Alert.alert('Transfer Initiated', `Transfer order sent to ${user}.`);
          },
        },
      ],
      'plain-text',
      'AF-0078 - Arjun Nair'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Services & Hub</Text>
          <Text style={styles.headerSub}>Maintenance, Transfers, & Custodian Pass</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/qr-scanner')}
          style={styles.qrHeaderBtn}
        >
          <Text style={styles.qrHeaderText}>📷 QR</Text>
        </TouchableOpacity>
      </View>

      {/* Sub-Section Switcher Pills */}
      <View style={styles.subNavBox}>
        {[
          { id: 'maintenance', label: '🛠️ Maintenance' },
          { id: 'transfers', label: '🔄 Transfers' },
          { id: 'ecard', label: '🪪 e-Card Pass' },
          { id: 'settings', label: '⚙️ Settings' },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setActiveSub(item.id as TabSubSection)}
            style={[styles.subNavPill, activeSub === item.id && styles.subNavPillActive]}
          >
            <Text style={[styles.subNavText, activeSub === item.id && styles.subNavTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SUB-SECTION 1: MAINTENANCE & REPAIRS */}
        {activeSub === 'maintenance' && (
          <View style={styles.subContainer}>
            <View style={styles.subHeadRow}>
              <Text style={styles.subSectionTitle}>Active Work Orders ({maintenanceList.length})</Text>
              <NeoButton
                label="+ New Repair"
                size="sm"
                onPress={() => setModalVisible(true)}
              />
            </View>

            {maintenanceList.map((item) => (
              <NeoCard key={item.id} style={styles.mCard}>
                <View style={styles.mHead}>
                  <View>
                    <Text style={styles.mTag}>{item.assetTag}</Text>
                    <Text style={styles.mName}>{item.assetName}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <NeoBadge label={item.status} variant={getStatusVariant(item.status)} />
                    <NeoBadge label={`Priority: ${item.priority}`} variant={getPriorityVariant(item.priority)} />
                  </View>
                </View>

                <View style={styles.issueBox}>
                  <Text style={styles.issueLabel}>REPORTED ISSUE:</Text>
                  <Text style={styles.issueText}>{item.issue}</Text>
                </View>

                <View style={styles.mFoot}>
                  <Text style={styles.mDate}>📅 Requested: {item.date}</Text>
                  <Text style={styles.mCost}>{item.cost ? `Est. Cost: $${item.cost}` : 'Under Assessment'}</Text>
                </View>
              </NeoCard>
            ))}
          </View>
        )}

        {/* SUB-SECTION 2: TRANSFERS & AUDIT LOG */}
        {activeSub === 'transfers' && (
          <View style={styles.subContainer}>
            <View style={styles.subHeadRow}>
              <Text style={styles.subSectionTitle}>Custody Transfer Orders ({transferList.length})</Text>
              <NeoButton
                label="+ New Transfer"
                size="sm"
                onPress={handleCreateTransfer}
              />
            </View>

            {transferList.map((t) => (
              <NeoCard key={t.id} style={styles.tCard}>
                <View style={styles.tHead}>
                  <View>
                    <Text style={styles.tTag}>{t.tag}</Text>
                    <Text style={styles.tName}>{t.name}</Text>
                  </View>
                  <NeoBadge
                    label={t.status}
                    variant={t.status === 'Completed' ? 'success' : 'warning'}
                  />
                </View>

                <View style={styles.flowBox}>
                  <View style={styles.deptCol}>
                    <Text style={styles.deptTitle}>FROM</Text>
                    <Text style={styles.deptValue}>{t.fromDept}</Text>
                  </View>
                  <Text style={styles.flowArrow}>➔</Text>
                  <View style={styles.deptCol}>
                    <Text style={styles.deptTitle}>TO</Text>
                    <Text style={styles.deptValue}>{t.toDept}</Text>
                  </View>
                </View>

                <View style={styles.tFoot}>
                  <Text style={styles.custodianText}>👤 Assignee: {t.custodian}</Text>
                  <Text style={styles.tDate}>🗓 {t.date}</Text>
                </View>
              </NeoCard>
            ))}
          </View>
        )}

        {/* SUB-SECTION 3: DIGITAL e-CARD PASS */}
        {activeSub === 'ecard' && (
          <View style={styles.subContainer}>
            <Text style={styles.subSectionTitle}>🪪 Official Digital ID & Custodian Pass</Text>
            <Text style={styles.eCardSubtext}>
              Present this verified digital ID to security at checkpoints, warehouses, or hardware depots.
            </Text>

            <View style={styles.neonCard}>
              <View style={styles.neonCardHead}>
                <Text style={styles.neonOrg}>ASSETFLOW ENTERPRISE</Text>
                <Text style={styles.neonTag}>VERIFIED CUSTODIAN</Text>
              </View>

              <View style={styles.neonAvatarRow}>
                <View style={styles.neonAvatar}>
                  <Text style={styles.neonAvatarText}>PS</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.neonUserName}>Priya Shah</Text>
                  <Text style={styles.neonUserRole}>Senior Engineering Lead</Text>
                  <Text style={styles.neonUserEmail}>p.shah@assetflow-enterprise.io</Text>
                </View>
              </View>

              <View style={styles.neonGrid}>
                <View style={styles.neonGridItem}>
                  <Text style={styles.neonGridLabel}>EMPLOYEE ID</Text>
                  <Text style={styles.neonGridVal}>EMP-88210-PS</Text>
                </View>
                <View style={styles.neonGridItem}>
                  <Text style={styles.neonGridLabel}>DEPARTMENT</Text>
                  <Text style={styles.neonGridVal}>Engineering & Cloud</Text>
                </View>
                <View style={styles.neonGridItem}>
                  <Text style={styles.neonGridLabel}>CLEARANCE LEVEL</Text>
                  <Text style={styles.neonGridValOrange}>Tier 4 (Hardware & Servers)</Text>
                </View>
                <View style={styles.neonGridItem}>
                  <Text style={styles.neonGridLabel}>ASSIGNED VALUE</Text>
                  <Text style={styles.neonGridVal}>$18,450.00 USD</Text>
                </View>
              </View>

              <View style={styles.neonBarcodeBox}>
                <Text style={styles.neonBarcodeText}>|||| | ||||| || ||| ||||| | |||| ||| ||</Text>
                <Text style={styles.neonBarcodeSerial}>HI1418872904-BB • VALID THRU 2028</Text>
              </View>
            </View>
          </View>
        )}

        {/* SUB-SECTION 4: SETTINGS */}
        {activeSub === 'settings' && (
          <View style={styles.subContainer}>
            <Text style={styles.subSectionTitle}>App & Enterprise Settings</Text>

            <NeoCard style={styles.settingCard}>
              <Text style={styles.settingTitle}>Organization Details</Text>
              <Text style={styles.settingText}>Current Workspace: AssetFlow HQ (Bengaluru / Mumbai)</Text>
              <Text style={styles.settingText}>Connected Database: PostgreSQL + Neon DB Pool</Text>
              <Text style={styles.settingText}>Enterprise Plan: Unlimited Assets Tier</Text>
            </NeoCard>

            <NeoCard style={styles.settingCard}>
              <Text style={styles.settingTitle}>Appearance & Theme</Text>
              <Text style={styles.settingText}>Theme Mode: Dark Obsidian (Recommended)</Text>
              <Text style={styles.settingText}>Primary Color Token: #FF6600 (Neo-morphic Orange)</Text>
              <Text style={styles.settingText}>NativeWind: Enabled (Tailwind + CSS Interop)</Text>
            </NeoCard>

            <NeoButton
              label="Sync & Refresh Cache"
              variant="outline"
              onPress={() => Alert.alert('Sync Complete', 'All assets, bookings, and audit logs are synced with cloud DB.')}
              style={{ marginTop: 10 }}
            />

            <NeoButton
              label="Sign Out"
              variant="secondary"
              onPress={() => {
                Alert.alert('Signed Out', 'You have been securely signed out of your workspace.', [
                  { text: 'OK', onPress: () => router.replace('/auth/login') }
                ]);
              }}
              style={{ marginTop: 10, borderColor: NeoColors.danger }}
            />
          </View>
        )}
      </ScrollView>

      {/* Maintenance Repair Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Log Maintenance Order</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>ASSET TAG OR NAME *</Text>
              <TextInput
                style={styles.fieldInput}
                value={mTag}
                onChangeText={setMTag}
              />

              <Text style={styles.fieldLabel}>ASSET MODEL / NAME</Text>
              <TextInput
                style={styles.fieldInput}
                value={mName}
                onChangeText={setMName}
              />

              <Text style={styles.fieldLabel}>PRIORITY LEVEL</Text>
              <View style={styles.priorityRow}>
                {(['Low', 'Medium', 'High', 'Critical'] as Priority[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setMPriority(p)}
                    style={[styles.priorityPill, mPriority === p && styles.priorityPillActive]}
                  >
                    <Text style={[styles.priorityText, mPriority === p && { color: '#FFFFFF' }]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>ISSUE DESCRIPTION / SYMPTOMS *</Text>
              <TextInput
                style={[styles.fieldInput, { height: 86, textAlignVertical: 'top' }]}
                placeholder="e.g. Battery not charging, display flickering, lamp dim..."
                placeholderTextColor="#687082"
                multiline
                value={mIssue}
                onChangeText={setMIssue}
              />

              <View style={styles.modalActions}>
                <NeoButton
                  label="Cancel"
                  variant="ghost"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <NeoButton
                  label="Submit Work Order"
                  variant="primary"
                  onPress={handleCreateRepair}
                  style={{ flex: 1.5 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  subNavBox: {
    flexDirection: 'row',
    marginHorizontal: Spacing.four,
    backgroundColor: '#161923',
    padding: 6,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#252A3E',
    marginBottom: 16,
  },
  subNavPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  subNavPillActive: {
    backgroundColor: NeoColors.primary,
  },
  subNavText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0A6B2',
  },
  subNavTextActive: {
    color: '#FFFFFF',
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: 16,
  },
  subContainer: {
    gap: 16,
  },
  subHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mCard: {
    padding: 16,
  },
  mHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mTag: {
    fontSize: 13,
    fontWeight: '900',
    color: NeoColors.primary,
  },
  mName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  issueBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  issueLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E96A4',
    marginBottom: 4,
  },
  issueText: {
    fontSize: 13,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  mFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  mDate: {
    fontSize: 12,
    color: '#A0A6B2',
    fontWeight: '600',
  },
  mCost: {
    fontSize: 13,
    fontWeight: '800',
    color: NeoColors.primary,
  },
  tCard: {
    padding: 16,
  },
  tHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tTag: {
    fontSize: 13,
    fontWeight: '900',
    color: NeoColors.primary,
  },
  tName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  flowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  deptCol: {
    alignItems: 'center',
  },
  deptTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E96A4',
    marginBottom: 2,
  },
  deptValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  flowArrow: {
    fontSize: 20,
    color: NeoColors.primary,
    fontWeight: '800',
  },
  tFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  custodianText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  tDate: {
    fontSize: 12,
    color: '#8E96A4',
  },
  eCardSubtext: {
    fontSize: 13,
    color: '#A0A6B2',
    marginBottom: 12,
  },
  neonCard: {
    backgroundColor: '#FF6600',
    borderRadius: 30,
    padding: 24,
    borderWidth: 2,
    borderColor: '#FF8533',
    ...Platform.select({
      ios: {
        shadowColor: NeoColors.primary,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
      },
      android: {
        elevation: 16,
      },
      web: {
        boxShadow: '0 20px 60px rgba(255, 102, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3)',
      } as any,
    }),
  },
  neonCardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  neonOrg: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  neonTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  neonAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
    borderRadius: 22,
  },
  neonAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  neonAvatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: NeoColors.primary,
  },
  neonUserName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  neonUserRole: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFEACC',
    marginTop: 2,
  },
  neonUserEmail: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  neonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  neonGridItem: {
    width: '46%',
  },
  neonGridLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  neonGridVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  neonGridValOrange: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFEACC',
    marginTop: 2,
  },
  neonBarcodeBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
  },
  neonBarcodeText: {
    fontFamily: 'monospace',
    fontSize: 18,
    letterSpacing: 2,
    color: '#000000',
    fontWeight: '900',
  },
  neonBarcodeSerial: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E2233',
    marginTop: 4,
  },
  settingCard: {
    padding: 16,
    gap: 6,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingText: {
    fontSize: 13,
    color: '#A0A6B2',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#161923',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: NeoColors.primary,
  },
  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#252A3E',
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 22,
    color: '#A0A6B2',
    padding: 4,
  },
  modalForm: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A0A6B2',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: '#1E2233',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2D334A',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#1E2233',
    borderWidth: 1,
    borderColor: '#2D334A',
    alignItems: 'center',
  },
  priorityPillActive: {
    backgroundColor: NeoColors.primary,
    borderColor: '#FF8533',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0A6B2',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 10,
  },
});
