import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';
import { apiFetch, setToken } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<any>('/api/v1/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res?.token) await setToken(res.token);
      // Refresh auth context then navigate
      await refreshSession();
      router.replace('/organizations');
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const autofill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBox}>
          <Text style={styles.logoTitle}>
            Asset<Text style={styles.logoAccent}>Flow</Text>
          </Text>
          <Text style={styles.headerSub}>Welcome back to your workspace</Text>
        </View>

        <View style={styles.formBox}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarTxt}>AF</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.inputField}
            placeholder="name@company.com"
            placeholderTextColor="#687082"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.inputField, { flex: 1, marginBottom: 0 }]}
              placeholder="••••••••"
              placeholderTextColor="#687082"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Text style={styles.eyeTxt}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.forgotRow}>
            <TouchableOpacity onPress={() => router.push('/auth/forgot')}>
              <Text style={styles.forgotTxt}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <NeoButton
            label={loading ? 'Signing in...' : 'Sign In'}
            variant="primary"
            onPress={handleLogin}
            style={styles.submitBtn}
          />

          {loading && <ActivityIndicator style={{ marginTop: 8 }} color={NeoColors.primary} />}

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divTxt}>New here?</Text>
            <View style={styles.divLine} />
          </View>

          <NeoButton
            label="Create Account"
            variant="secondary"
            onPress={() => router.push('/auth/register')}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>🚀 Quick Demo Accounts</Text>
          <TouchableOpacity onPress={() => autofill('p.shah@assetflow-enterprise.io', 'demo123')} style={styles.demoPill}>
            <Text style={styles.demoRole}>Employee / Dept Head</Text>
            <Text style={styles.demoName}>Priya Shah</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => autofill('admin@assetflow-enterprise.io', 'admin123')} style={styles.demoPill}>
            <Text style={styles.demoRole}>System Admin</Text>
            <Text style={styles.demoName}>Willie Schulist</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => autofill('a.nair@assetflow-enterprise.io', 'demo123')} style={styles.demoPill}>
            <Text style={styles.demoRole}>Asset Manager</Text>
            <Text style={styles.demoName}>Arjun Nair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NeoColors.background },
  scrollContent: { paddingHorizontal: Spacing.four, paddingTop: 30, paddingBottom: Spacing.six },
  headerBox: { alignItems: 'center', marginBottom: 30 },
  logoTitle: { fontSize: 26, fontWeight: '300', color: '#FFFFFF', letterSpacing: -0.5 },
  logoAccent: { fontWeight: '800', color: NeoColors.primary },
  headerSub: { fontSize: 14, color: '#A0A6B2', marginTop: 6, fontWeight: '500' },
  formBox: { backgroundColor: '#161923', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#252A3E' },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: 'rgba(255,102,0,0.4)', backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#8E96A4', letterSpacing: 0.8, marginBottom: 6 },
  inputField: { backgroundColor: '#1E2233', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2D334A', marginBottom: 16 },
  passRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  eyeBtn: { position: 'absolute', right: 16 },
  eyeTxt: { color: '#A0A6B2', fontSize: 12, fontWeight: '700' },
  forgotRow: { alignItems: 'flex-end', marginBottom: 20 },
  forgotTxt: { fontSize: 12, color: '#A0A6B2', fontWeight: '600' },
  submitBtn: { width: '100%' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divLine: { flex: 1, height: 1, backgroundColor: '#252A3E' },
  divTxt: { marginHorizontal: 12, fontSize: 12, color: '#687082', fontWeight: '600' },
  demoBox: { marginTop: 30, gap: 10 },
  demoTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', marginBottom: 4, textAlign: 'center' },
  demoPill: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,102,0,0.08)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,102,0,0.2)' },
  demoRole: { fontSize: 13, color: NeoColors.primary, fontWeight: '800' },
  demoName: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
});
