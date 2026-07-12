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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge, BadgeVariant } from '@/components/neo/NeoBadge';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing, BottomTabInset } from '@/constants/theme';

type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

interface Resource {
  id: string;
  name: string;
  type: string;
  location: string;
}

interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  bookedBy: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: BookingStatus;
  hasConflict?: boolean;
}

const RESOURCES: Resource[] = [
  { id: 'r1', name: 'Conference room B2', type: 'Meeting Room', location: 'HQ Floor 2 Wing A' },
  { id: 'r2', name: 'Conf Room — Orion', type: 'Meeting Room', location: 'HQ Floor 2 Wing B' },
  { id: 'r3', name: 'Conf Room — Nova', type: 'Meeting Room', location: 'HQ Floor 3 Executive' },
  { id: 'r4', name: '4K Projector Unit A', type: 'Equipment', location: 'HQ Floor 2 IT Depot' },
  { id: 'r5', name: 'Company Van #1 (Toyota)', type: 'Vehicle', location: 'Parking Bay B' },
  { id: 'r6', name: 'Hot Desk — 4A Ergonomic', type: 'Workspace', location: 'HQ Floor 4 Open Wing' },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    resourceId: 'r1',
    resourceName: 'Conference room B2',
    bookedBy: 'Procurement Team',
    date: '2026-07-12',
    startTime: '09:00',
    endTime: '10:30',
    purpose: 'Q3 Supplier Vendor Negotiation',
    status: 'Confirmed',
  },
  {
    id: 'b2',
    resourceId: 'r1',
    resourceName: 'Conference room B2',
    bookedBy: 'Engineering Core',
    date: '2026-07-12',
    startTime: '10:00',
    endTime: '11:00',
    purpose: 'Architecture Review & Sprint Demo',
    status: 'Pending',
    hasConflict: true,
  },
  {
    id: 'b3',
    resourceId: 'r4',
    resourceName: '4K Projector Unit A',
    bookedBy: 'Priya Shah',
    date: '2026-07-12',
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'All-Hands Presentation Townhall',
    status: 'Confirmed',
  },
  {
    id: 'b4',
    resourceId: 'r5',
    resourceName: 'Company Van #1 (Toyota)',
    bookedBy: 'Field Operations',
    date: '2026-07-13',
    startTime: '08:00',
    endTime: '18:00',
    purpose: 'Client Site Equipment Inspection — Pune',
    status: 'Confirmed',
  },
];

const FILTER_TYPES = ['All', 'Meeting Room', 'Equipment', 'Vehicle', 'Workspace'];

export default function BookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeType, setActiveType] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [selectedResId, setSelectedResId] = useState(RESOURCES[0].id);
  const [bookedBy, setBookedBy] = useState('Priya Shah (Engineering)');
  const [date, setDate] = useState('2026-07-12');
  const [startTime, setStartTime] = useState('11:30');
  const [endTime, setEndTime] = useState('12:30');
  const [purpose, setPurpose] = useState('');

  const filteredResources = RESOURCES.filter(
    (r) => activeType === 'All' || r.type === activeType
  );

  const getStatusVariant = (status: BookingStatus, conflict?: boolean): BadgeVariant => {
    if (conflict) return 'danger';
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'neutral';
    }
  };

  const handleCreateBooking = () => {
    if (!purpose.trim()) {
      Alert.alert('Validation Required', 'Please enter a purpose for this reservation.');
      return;
    }
    const res = RESOURCES.find((r) => r.id === selectedResId) || RESOURCES[0];
    const newBooking: Booking = {
      id: Math.random().toString(36).slice(2, 9),
      resourceId: res.id,
      resourceName: res.name,
      bookedBy,
      date,
      startTime,
      endTime,
      purpose: purpose.trim(),
      status: 'Confirmed',
    };
    setBookings([newBooking, ...bookings]);
    setModalVisible(false);
    setPurpose('');
    Alert.alert('Reservation Confirmed', `Successfully reserved ${res.name} for ${startTime} - ${endTime}.`);
  };

  const handleCancelBooking = (id: string) => {
    Alert.alert('Cancel Reservation', 'Are you sure you want to cancel this booking slot?', [
      { text: 'Keep Slot', style: 'cancel' },
      {
        text: 'Cancel Slot',
        style: 'destructive',
        onPress: () => {
          setBookings((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' as BookingStatus } : b))
          );
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Resource Bookings</Text>
          <Text style={styles.headerSub}>Reserve meeting rooms, hardware, & vehicles</Text>
        </View>
        <NeoButton
          label="+ Book Slot"
          size="sm"
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* Resource Type Filter Pills */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTER_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveType(t)}
              style={[styles.filterPill, activeType === t && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, activeType === t && styles.filterTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Schedule & Conflict Warnings */}
        <Text style={styles.sectionHeading}>📅 Active Reservations & Schedule</Text>

        {bookings.map((item) => (
          <NeoCard key={item.id} style={[styles.bookingCard, item.hasConflict ? styles.conflictBorder : {}]}>
            {item.hasConflict ? (
              <View style={styles.conflictBanner}>
                <Text style={styles.conflictIcon}>⚠️ SCHEDULE CONFLICT DETECTED</Text>
                <Text style={styles.conflictText}>
                  Overlaps with Conference room B2 (09:00 - 10:30). Please reschedule or request override.
                </Text>
              </View>
            ) : null}

            <View style={styles.cardTop}>
              <View>
                <Text style={styles.resourceName}>{item.resourceName}</Text>
                <Text style={styles.dateText}>
                  🕒 {item.date} | {item.startTime} – {item.endTime}
                </Text>
              </View>
              <NeoBadge
                label={item.hasConflict ? 'Conflict / Double-Booked' : item.status}
                variant={getStatusVariant(item.status, item.hasConflict)}
              />
            </View>

            <View style={styles.purposeBox}>
              <Text style={styles.purposeLabel}>PURPOSE / MEETING TITLE:</Text>
              <Text style={styles.purposeValue}>{item.purpose}</Text>
            </View>

            <View style={styles.cardFoot}>
              <Text style={styles.bookedByText}>👤 Booked by: {item.bookedBy}</Text>
              {item.status !== 'Cancelled' ? (
                <TouchableOpacity onPress={() => handleCancelBooking(item.id)}>
                  <Text style={styles.cancelLinkText}>Cancel Slot</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </NeoCard>
        ))}

        <Text style={[styles.sectionHeading, { marginTop: 14 }]}>🏢 Available Resources Catalog</Text>
        {filteredResources.map((res) => (
          <NeoCard key={res.id} style={styles.resourceCard}>
            <View style={styles.resRow}>
              <View style={styles.resIconBox}>
                <Text style={styles.resIconText}>
                  {res.type === 'Meeting Room' ? '🗣️' : res.type === 'Equipment' ? '📽️' : res.type === 'Vehicle' ? '🚐' : '💻'}
                </Text>
              </View>
              <View style={styles.resInfo}>
                <Text style={styles.resTitle}>{res.name}</Text>
                <Text style={styles.resSub}>{res.type} • {res.location}</Text>
              </View>
              <NeoButton
                label="Reserve ›"
                size="sm"
                variant="outline"
                onPress={() => {
                  setSelectedResId(res.id);
                  setModalVisible(true);
                }}
              />
            </View>
          </NeoCard>
        ))}
      </ScrollView>

      {/* Reservation Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>New Reservation</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>SELECT RESOURCE *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {RESOURCES.map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      onPress={() => setSelectedResId(r.id)}
                      style={[styles.resSelectPill, selectedResId === r.id && styles.resSelectPillActive]}
                    >
                      <Text style={[styles.resSelectText, selectedResId === r.id && { color: '#FFFFFF' }]}>
                        {r.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.fieldLabel}>BOOKED BY</Text>
              <TextInput
                style={styles.fieldInput}
                value={bookedBy}
                onChangeText={setBookedBy}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>DATE</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>START TIME</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>END TIME</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>PURPOSE OR MEETING TITLE *</Text>
              <TextInput
                style={[styles.fieldInput, { height: 74, textAlignVertical: 'top' }]}
                placeholder="e.g. Sprint Planning, Client Demo, Equipment checkout..."
                placeholderTextColor="#687082"
                multiline
                value={purpose}
                onChangeText={setPurpose}
              />

              <View style={styles.modalActions}>
                <NeoButton
                  label="Cancel"
                  variant="ghost"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <NeoButton
                  label="Confirm Booking"
                  variant="primary"
                  onPress={handleCreateBooking}
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
  filtersContainer: {
    marginHorizontal: -Spacing.four,
    marginBottom: 14,
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
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bookingCard: {
    padding: 18,
  },
  conflictBorder: {
    borderColor: NeoColors.danger,
    borderWidth: 1.5,
  },
  conflictBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  conflictIcon: {
    color: NeoColors.danger,
    fontWeight: '900',
    fontSize: 12,
    marginBottom: 4,
  },
  conflictText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: NeoColors.primary,
  },
  purposeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  purposeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E96A4',
    marginBottom: 4,
  },
  purposeValue: {
    fontSize: 14,
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
  bookedByText: {
    fontSize: 12,
    color: '#A0A6B2',
    fontWeight: '600',
  },
  cancelLinkText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  resourceCard: {
    padding: 14,
  },
  resRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resIconText: {
    fontSize: 20,
  },
  resInfo: {
    flex: 1,
  },
  resTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resSub: {
    fontSize: 12,
    color: '#8E96A4',
    fontWeight: '500',
    marginTop: 2,
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
  resSelectPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#1E2233',
    borderWidth: 1,
    borderColor: '#2D334A',
  },
  resSelectPillActive: {
    backgroundColor: NeoColors.primary,
    borderColor: '#FF8533',
  },
  resSelectText: {
    fontSize: 13,
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
