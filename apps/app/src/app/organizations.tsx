import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, RefreshControl, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';
import { apiFetch, setActiveOrgId } from '@/lib/api';
import { useAuth, OrgMembership } from '@/context/AuthContext';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#FF6600',
  ASSET_MANAGER: '#3B82F6',
  DEPARTMENT_HEAD: '#8B5CF6',
  EMPLOYEE: '#10B981',
  AUDITOR: '#F59E0B',
  TECHNICIAN: '#EC4899',
};

export default function OrganizationsScreen() {
  const router = useRouter();
  const { user, switchOrg, signOut, setMemberships } = useAuth();

  const [orgs, setOrgs] = useState<OrgMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  // Create org modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', email: '', phone: '' });

  const fetchOrgs = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: OrgMembership[] }>('/api/v1/organizations/my-memberships');
      if (res?.data) {
        setOrgs(res.data);
        setMemberships(res.data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setMemberships]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  const handleEnterOrg = async (org: OrgMembership) => {
    setSwitching(org.organizationId);
    try {
      await switchOrg(org.organizationId);
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to switch organization');
    } finally {
      setSwitching(null);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.slug) {
      Alert.alert('Required', 'Organization name and slug are required.');
      return;
    }
    setCreating(true);
    try {
      const payload: any = { name: form.name.trim(), slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-') };
      if (form.email) payload.email = form.email.trim();
      if (form.phone) payload.phone = form.phone.trim();

      await apiFetch('/api/v1/organizations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setForm({ name: '', slug: '', email: '', phone: '' });
      setCreateModalVisible(false);
      await fetchOrgs();
    } catch (err: any) {
      Alert.alert('Create Failed', err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/'); } },
    ]);
  };

  const onRefresh = () => { setRefreshing(true); fetchOrgs(); };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            Asset<Text style={{ color: NeoColors.primary }}>Flow</Text>
          </Text>
          <Text style={styles.headerSub}>
            {user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Your Workspaces'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={NeoColors.primary} />
          <Text style={styles.loadingTxt}>Loading workspaces...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NeoColors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Your Organizations ({orgs.length})</Text>

          {orgs.length === 0 ? (
            <NeoCard style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🏢</Text>
              <Text style={styles.emptyTitle}>No Organizations Yet</Text>
              <Text style={styles.emptyDesc}>
                Create your first workspace or ask an admin to send you an invite link.
              </Text>
            </NeoCard>
          ) : (
            orgs.map((org) => (
              <TouchableOpacity
                key={org.organizationId}
                onPress={() => handleEnterOrg(org)}
                activeOpacity={0.85}
                style={styles.orgCardTouchable}
              >
                <NeoCard glow={org.isActiveContext} style={styles.orgCard}>
                  <View style={styles.orgTop}>
                    <View style={styles.orgAvatarBox}>
                      <Text style={styles.orgAvatarText}>
                        {(org.name || '  ').slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.orgInfo}>
                      <Text style={styles.orgName}>{org.name}</Text>
                      <Text style={styles.orgSlug}>@{org.slug}</Text>
                    </View>
                    {switching === org.organizationId ? (
                      <ActivityIndicator size="small" color={NeoColors.primary} />
                    ) : (
                      <Text style={styles.enterArrow}>›</Text>
                    )}
                  </View>
                  <View style={styles.orgBottom}>
                    <View style={[styles.roleBadge, { backgroundColor: `${ROLE_COLORS[org.role] || '#6B7280'}22` }]}>
                      <Text style={[styles.roleText, { color: ROLE_COLORS[org.role] || '#A0A6B2' }]}>
                        {org.role.replace(/_/g, ' ')}
                      </Text>
                    </View>
                    {org.isActiveContext && (
                      <View style={styles.activeDot}>
                        <Text style={styles.activeLabel}>Active Context</Text>
                      </View>
                    )}
                  </View>
                </NeoCard>
              </TouchableOpacity>
            ))
          )}

          <NeoButton
            label="+ Create New Organization"
            variant="outline"
            onPress={() => setCreateModalVisible(true)}
            style={styles.createBtn}
          />

          <Text style={styles.footerNote}>
            To join an existing organization, ask an admin to send you an invite link.
          </Text>
        </ScrollView>
      )}

      {/* Create Org Modal */}
      <Modal visible={createModalVisible} transparent animationType="slide" onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Create Organization</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>ORGANIZATION NAME *</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.name}
                onChangeText={(v) => {
                  setForm((f) => ({
                    ...f,
                    name: v,
                    slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                  }));
                }}
                placeholder="Acme Global HQ"
                placeholderTextColor="#687082"
              />

              <Text style={styles.fieldLabel}>SLUG (URL identifier) *</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.slug}
                onChangeText={(v) => setForm((f) => ({ ...f, slug: v.toLowerCase().replace(/\s+/g, '-') }))}
                placeholder="acme-global"
                placeholderTextColor="#687082"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>EMAIL (optional)</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.email}
                onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                placeholder="ops@acmecorp.com"
                placeholderTextColor="#687082"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>PHONE (optional)</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.phone}
                onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
                placeholder="+1-555-0199"
                placeholderTextColor="#687082"
                keyboardType="phone-pad"
              />

              <NeoButton
                label={creating ? 'Creating...' : 'Create Organization'}
                variant="primary"
                onPress={handleCreate}
                style={{ marginTop: 16 }}
              />
              {creating && <ActivityIndicator style={{ marginTop: 10 }} color={NeoColors.primary} />}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NeoColors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.four, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '300', color: '#FFFFFF', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: '#A0A6B2', fontWeight: '500', marginTop: 2 },
  signOutBtn: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#2D334A' },
  signOutTxt: { color: '#A0A6B2', fontSize: 12, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingTxt: { color: '#A0A6B2', fontSize: 14, fontWeight: '500' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.6, marginBottom: 16, marginTop: 8 },
  orgCardTouchable: { marginBottom: 12 },
  orgCard: { padding: 16 },
  orgTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  orgAvatarBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,102,0,0.15)', borderWidth: 1, borderColor: 'rgba(255,102,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  orgAvatarText: { fontSize: 18, fontWeight: '800', color: NeoColors.primary },
  orgInfo: { flex: 1 },
  orgName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  orgSlug: { fontSize: 12, color: '#A0A6B2', fontWeight: '500' },
  enterArrow: { fontSize: 22, color: NeoColors.primary, fontWeight: '800' },
  orgBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  activeDot: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activeLabel: { fontSize: 11, color: '#10B981', fontWeight: '700' },
  emptyCard: { padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#A0A6B2', textAlign: 'center', lineHeight: 20 },
  createBtn: { marginTop: 8, marginBottom: 16 },
  footerNote: { fontSize: 12, color: '#687082', textAlign: 'center', lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#161923', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '85%' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  modalClose: { fontSize: 20, color: '#A0A6B2', fontWeight: '800' },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.8, marginBottom: 6 },
  fieldInput: { backgroundColor: '#1E2233', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2D334A', marginBottom: 16 },
});
