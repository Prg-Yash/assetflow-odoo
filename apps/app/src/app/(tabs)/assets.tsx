import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge, BadgeVariant } from '@/components/neo/NeoBadge';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing, BottomTabInset } from '@/constants/theme';

type AssetStatus = 'Available' | 'Allocated' | 'Maintenance' | 'Retired';

interface Asset {
  id: string;
  tag: string;
  name: string;
  category: string;
  status: AssetStatus;
  location: string;
  department: string;
  serialNo: string;
  assignedTo: string;
}

const INITIAL_ASSETS: Asset[] = [
  { id: 'a1', tag: 'AF-0012', name: 'Dell Laptop XPS 15', category: 'Electronics', status: 'Allocated', location: 'Bengaluru', department: 'Engineering', serialNo: 'DL-2024-0012', assignedTo: 'Priya Shah' },
  { id: 'a2', tag: 'AF-0062', name: '4K Laser Projector', category: 'Electronics', status: 'Maintenance', location: 'HQ Floor 2', department: 'Facilities', serialNo: 'PJ-2024-0062', assignedTo: '' },
  { id: 'a3', tag: 'AF-0201', name: 'Ergonomic Office Chair', category: 'Furniture', status: 'Available', location: 'Warehouse Wing A', department: 'Facilities', serialNo: 'OC-2024-0201', assignedTo: '' },
  { id: 'a4', tag: 'AF-0078', name: 'MacBook Pro 16" M3 Max', category: 'Electronics', status: 'Allocated', location: 'Mumbai HQ Floor 4', department: 'Engineering', serialNo: 'MB-2024-0078', assignedTo: 'Rohan Mehta' },
  { id: 'a5', tag: 'AF-0115', name: 'Motorized Standing Desk', category: 'Furniture', status: 'Available', location: 'Warehouse Wing B', department: '', serialNo: 'SD-2024-0115', assignedTo: '' },
  { id: 'a6', tag: 'AF-0310', name: 'Toyota Innova Hybrid', category: 'Vehicles', status: 'Allocated', location: 'Bengaluru Parking', department: 'Field Ops', serialNo: 'TI-2023-0310', assignedTo: 'Sana Iqbal' },
  { id: 'a7', tag: 'AF-0042', name: 'Conference Smart Display 85"', category: 'Electronics', status: 'Retired', location: 'HQ Floor 3 Storage', department: 'Facilities', serialNo: 'CD-2023-0042', assignedTo: '' },
];

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Vehicles'];
const STATUSES: ('All' | AssetStatus)[] = ['All', 'Available', 'Allocated', 'Maintenance', 'Retired'];

export default function AssetsScreen() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | AssetStatus>('All');
  const [modalVisible, setModalVisible] = useState(false);

  // Form state for adding asset
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('Mumbai HQ');
  const [department, setDepartment] = useState('Engineering');
  const [serialNo, setSerialNo] = useState('');

  const filteredAssets = assets.filter((a) => {
    const matchCat = categoryFilter === 'All' || a.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchQuery =
      a.name.toLowerCase().includes(q) ||
      a.tag.toLowerCase().includes(q) ||
      a.serialNo.toLowerCase().includes(q) ||
      a.assignedTo.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q);
    return matchCat && matchStatus && matchQuery;
  });

  const getStatusVariant = (status: AssetStatus): BadgeVariant => {
    switch (status) {
      case 'Available': return 'success';
      case 'Allocated': return 'info';
      case 'Maintenance': return 'warning';
      case 'Retired': return 'neutral';
    }
  };

  const handleCheckInOut = (asset: Asset) => {
    if (asset.status === 'Available') {
      Alert.prompt(
        'Check-Out Asset',
        `Enter name of employee taking custody of ${asset.name} (${asset.tag}):`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Check Out',
            onPress: (user?: string) => {
              const assignee = user || 'Arjun Nair';
              setAssets((prev) =>
                prev.map((item) =>
                  item.id === asset.id
                    ? { ...item, status: 'Allocated', assignedTo: assignee, department: 'Engineering' }
                    : item
                )
              );
              Alert.alert('Checked Out', `${asset.name} is now allocated to ${assignee}.`);
            },
          },
        ],
        'plain-text',
        'Arjun Nair'
      );
    } else if (asset.status === 'Allocated') {
      Alert.alert(
        'Check-In Asset',
        `Return ${asset.name} (${asset.tag}) currently assigned to ${asset.assignedTo} back to inventory?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Return to Inventory',
            onPress: () => {
              setAssets((prev) =>
                prev.map((item) =>
                  item.id === asset.id
                    ? { ...item, status: 'Available', assignedTo: '', location: 'Warehouse Wing A' }
                    : item
                )
              );
              Alert.alert('Checked In', `${asset.name} is now available in inventory.`);
            },
          },
        ]
      );
    } else {
      Alert.alert('Status Note', `${asset.name} is currently under ${asset.status}. Update work order in Maintenance tab.`);
    }
  };

  const handleCreateAsset = () => {
    if (!name.trim() || !serialNo.trim()) {
      Alert.alert('Validation Error', 'Please enter both Asset Name and Serial Number.');
      return;
    }
    const maxTag = Math.max(...assets.map((a) => parseInt(a.tag.replace('AF-', '') || '0', 10)));
    const nextTag = `AF-${String(maxTag + 1).padStart(4, '0')}`;
    const newAsset: Asset = {
      id: Math.random().toString(36).slice(2, 9),
      tag: nextTag,
      name: name.trim(),
      category,
      status: 'Available',
      location,
      department,
      serialNo: serialNo.trim(),
      assignedTo: '',
    };
    setAssets([newAsset, ...assets]);
    setModalVisible(false);
    setName('');
    setSerialNo('');
    Alert.alert('Asset Created', `Successfully registered ${newAsset.name} as ${newAsset.tag}.`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Asset Catalog</Text>
          <Text style={styles.headerSub}>{filteredAssets.length} total units matched</Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity
            onPress={() => router.push('/qr-scanner')}
            style={styles.qrBtn}
          >
            <Text style={styles.qrBtnText}>📷 QR</Text>
          </TouchableOpacity>
          <NeoButton
            label="+ Add Asset"
            size="sm"
            onPress={() => setModalVisible(true)}
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tag, name, serial number, or custodian..."
          placeholderTextColor="#687082"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Pills */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategoryFilter(cat)}
              style={[styles.filterPill, categoryFilter === cat && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, categoryFilter === cat && styles.filterTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Status Pills */}
      <View style={[styles.filtersContainer, { marginBottom: 16 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUSES.map((st) => (
            <TouchableOpacity
              key={st}
              onPress={() => setStatusFilter(st)}
              style={[styles.statusPill, statusFilter === st && styles.statusPillActive]}
            >
              <Text style={[styles.statusText, statusFilter === st && styles.statusTextActive]}>
                ● {st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Assets List */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredAssets.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No assets matched your filter</Text>
            <Text style={styles.emptySub}>Try adjusting the category, status, or query keywords.</Text>
          </View>
        ) : (
          filteredAssets.map((item) => (
            <NeoCard key={item.id} style={styles.assetCard}>
              <View style={styles.assetCardHeader}>
                <View style={styles.tagBox}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                  <Text style={styles.categoryText}> • {item.category}</Text>
                </View>
                <NeoBadge label={item.status} variant={getStatusVariant(item.status)} />
              </View>

              <Text style={styles.assetName}>{item.name}</Text>
              <Text style={styles.serialText}>Serial No: {item.serialNo}</Text>

              <View style={styles.metaBox}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>📍 Location:</Text>
                  <Text style={styles.metaValue}>{item.location}</Text>
                </View>
                {item.department ? (
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>🏢 Department:</Text>
                    <Text style={styles.metaValue}>{item.department}</Text>
                  </View>
                ) : null}
                {item.assignedTo ? (
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>👤 Assigned To:</Text>
                    <Text style={[styles.metaValue, { color: NeoColors.primary, fontWeight: '700' }]}>
                      {item.assignedTo}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.cardFoot}>
                <NeoButton
                  label={item.status === 'Available' ? 'Check Out ›' : item.status === 'Allocated' ? 'Check In ›' : 'View Status ›'}
                  variant={item.status === 'Available' ? 'primary' : 'secondary'}
                  size="sm"
                  onPress={() => handleCheckInOut(item)}
                />
                <TouchableOpacity
                  onPress={() => Alert.alert('Asset QR Tag', `Simulating QR display for ${item.tag} — ${item.serialNo}`)}
                  style={styles.actionIconBtn}
                >
                  <Text style={styles.actionIconText}>🏷 QR Tag</Text>
                </TouchableOpacity>
              </View>
            </NeoCard>
          ))
        )}
      </ScrollView>

      {/* Modal for Adding New Asset */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Add New Asset</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>ASSET NAME *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. iPad Pro 12.9 M4"
                placeholderTextColor="#687082"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.fieldLabel}>CATEGORY *</Text>
              <View style={styles.modalPills}>
                {['Electronics', 'Furniture', 'Vehicles'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.modalPill, category === c && styles.modalPillActive]}
                  >
                    <Text style={[styles.modalPillText, category === c && styles.modalPillTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>SERIAL NUMBER *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. SN-2026-8891"
                placeholderTextColor="#687082"
                value={serialNo}
                onChangeText={setSerialNo}
              />

              <Text style={styles.fieldLabel}>DEPARTMENT</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Engineering, Facilities"
                placeholderTextColor="#687082"
                value={department}
                onChangeText={setDepartment}
              />

              <Text style={styles.fieldLabel}>LOCATION</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Mumbai HQ — Floor 4"
                placeholderTextColor="#687082"
                value={location}
                onChangeText={setLocation}
              />

              <View style={styles.modalActions}>
                <NeoButton
                  label="Cancel"
                  variant="ghost"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <NeoButton
                  label="Create Asset"
                  variant="primary"
                  onPress={handleCreateAsset}
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
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: '#A0A6B2',
    fontWeight: '600',
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qrBtn: {
    backgroundColor: '#1E2233',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D334A',
  },
  qrBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161923',
    marginHorizontal: Spacing.four,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#252A3E',
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 12,
  },
  clearIcon: {
    color: '#A0A6B2',
    fontSize: 18,
    padding: 4,
  },
  filtersContainer: {
    marginHorizontal: -Spacing.four,
  },
  filterScroll: {
    paddingHorizontal: Spacing.four,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#161923',
    borderWidth: 1,
    borderColor: '#252A3E',
  },
  filterPillActive: {
    backgroundColor: NeoColors.primary,
    borderColor: '#FF8533',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A0A6B2',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusPillActive: {
    backgroundColor: 'rgba(255, 102, 0, 0.2)',
    borderColor: NeoColors.primary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E96A4',
  },
  statusTextActive: {
    color: NeoColors.primary,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: 16,
  },
  assetCard: {
    padding: 18,
  },
  assetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '900',
    color: NeoColors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0A6B2',
  },
  assetName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  serialText: {
    fontSize: 12,
    color: '#687082',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  metaBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 12,
    color: '#8E96A4',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 12,
  },
  actionIconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionIconText: {
    color: '#A0A6B2',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#8E96A4',
    textAlign: 'center',
    maxWidth: 280,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
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
  modalPills: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  modalPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#1E2233',
    borderWidth: 1,
    borderColor: '#2D334A',
    alignItems: 'center',
  },
  modalPillActive: {
    backgroundColor: NeoColors.primary,
    borderColor: '#FF8533',
  },
  modalPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0A6B2',
  },
  modalPillTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 10,
  },
});
