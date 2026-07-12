import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge } from '@/components/neo/NeoBadge';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type AdminTab = 'departments' | 'categories' | 'employees';

export default function AdminScreen() {
  const router = useRouter();
  const { activeOrg } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('departments');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [formType, setFormType] = useState<'department' | 'category' | 'employee' | null>(null);
  const [form, setForm] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'departments') {
        const res = await apiFetch<{ data: any[] }>('/api/v1/departments');
        setDepartments(res?.data || []);
      } else if (activeTab === 'categories') {
        const res = await apiFetch<{ data: any[] }>('/api/v1/categories');
        setCategories(res?.data || []);
      } else if (activeTab === 'employees') {
        const res = await apiFetch<{ data: any[] }>('/api/v1/employees');
        setEmployees(res?.data || []);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleOpenForm = (type: 'department' | 'category' | 'employee', item?: any) => {
    setFormType(type);
    if (type === 'department') setForm(item || { name: '', description: '' });
    if (type === 'category') setForm(item || { name: '', description: '' });
    if (type === 'employee') setForm(item || { role: 'EMPLOYEE' }); // Usually edit role
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (formType === 'department') {
        if (form.id) {
          await apiFetch(`/api/v1/departments/${form.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        } else {
          await apiFetch('/api/v1/departments', { method: 'POST', body: JSON.stringify(form) });
        }
      } else if (formType === 'category') {
        if (form.id) {
          await apiFetch(`/api/v1/categories/${form.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        } else {
          await apiFetch('/api/v1/categories', { method: 'POST', body: JSON.stringify(form) });
        }
      } else if (formType === 'employee') {
        // Change role
        await apiFetch(`/api/v1/employees/${form.id}/role`, { method: 'PATCH', body: JSON.stringify({ role: form.role }) });
      }
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'departments', label: 'Departments' },
    { id: 'categories', label: 'Categories' },
    { id: 'employees', label: 'Directory' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Organization Setup</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => setActiveTab(t.id)} style={[styles.tab, activeTab === t.id && styles.tabActive]}>
            <Text style={[styles.tabTxt, activeTab === t.id && styles.tabTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator color={NeoColors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NeoColors.primary} />}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{activeTab.toUpperCase()}</Text>
            {activeTab !== 'employees' && (
              <NeoButton label={`+ Add ${activeTab.slice(0, -1)}`} size="sm" onPress={() => handleOpenForm(activeTab === 'departments' ? 'department' : 'category')} />
            )}
          </View>

          {activeTab === 'departments' && departments.map(d => (
            <NeoCard key={d.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{d.name}</Text>
                  {d.description && <Text style={styles.itemDesc}>{d.description}</Text>}
                </View>
                <NeoButton label="Edit" size="sm" variant="outline" onPress={() => handleOpenForm('department', d)} />
              </View>
            </NeoCard>
          ))}

          {activeTab === 'categories' && categories.map(c => (
            <NeoCard key={c.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{c.name}</Text>
                  {c.description && <Text style={styles.itemDesc}>{c.description}</Text>}
                </View>
                <NeoButton label="Edit" size="sm" variant="outline" onPress={() => handleOpenForm('category', c)} />
              </View>
            </NeoCard>
          ))}

          {activeTab === 'employees' && employees.map(e => (
            <NeoCard key={e.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{e.user?.name || e.employeeCode}</Text>
                  <Text style={styles.itemDesc}>{e.user?.email}</Text>
                  <View style={{ marginTop: 4 }}>
                    <NeoBadge label={e.role.replace(/_/g, ' ')} variant="info" />
                  </View>
                </View>
                <NeoButton label="Change Role" size="sm" variant="outline" onPress={() => handleOpenForm('employee', e)} />
              </View>
            </NeoCard>
          ))}
        </ScrollView>
      )}

      {/* Form Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>{form.id ? 'Edit' : 'Add'} {formType}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>

            {(formType === 'department' || formType === 'category') && (
              <>
                <Text style={styles.label}>NAME *</Text>
                <TextInput style={styles.input} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="Name" placeholderTextColor="#687082" />
                <Text style={styles.label}>DESCRIPTION</Text>
                <TextInput style={styles.input} value={form.description} onChangeText={v => setForm({ ...form, description: v })} placeholder="Description" placeholderTextColor="#687082" />
              </>
            )}

            {formType === 'employee' && (
              <>
                <Text style={styles.label}>ROLE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {['EMPLOYEE', 'DEPARTMENT_HEAD', 'ASSET_MANAGER', 'ADMIN'].map(role => (
                    <TouchableOpacity key={role} onPress={() => setForm({ ...form, role })} style={[styles.roleBtn, form.role === role && styles.roleBtnActive]}>
                      <Text style={[styles.roleTxt, form.role === role && styles.roleTxtActive]}>{role.replace(/_/g, ' ')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <NeoButton label={submitting ? 'Saving...' : 'Save'} variant="primary" onPress={handleSubmit} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NeoColors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.four, paddingTop: 16, paddingBottom: 10 },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  backTxt: { fontSize: 16, color: NeoColors.primary, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: Spacing.four, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: NeoColors.primary },
  tabTxt: { fontSize: 13, color: '#A0A6B2', fontWeight: '700' },
  tabTxtActive: { color: NeoColors.primary },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#8E96A4', letterSpacing: 1 },
  card: { padding: 16, marginBottom: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  itemDesc: { fontSize: 13, color: '#A0A6B2' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#161923', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  modalClose: { fontSize: 20, color: '#A0A6B2', fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.8, marginBottom: 6 },
  input: { backgroundColor: '#1E2233', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#2D334A', marginBottom: 14 },
  roleBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#1E2233', borderWidth: 1, borderColor: '#2D334A' },
  roleBtnActive: { backgroundColor: 'rgba(255,102,0,0.15)', borderColor: NeoColors.primary },
  roleTxt: { fontSize: 12, color: '#A0A6B2', fontWeight: '700' },
  roleTxtActive: { color: NeoColors.primary },
});
