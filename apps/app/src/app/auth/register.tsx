import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';

import { apiFetch, setToken } from '@/lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    
    try {
      const res = await apiFetch('/api/v1/auth/sign-up/email', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      // better-auth might return the token in res.token or cookie.
      if (res.token) await setToken(res.token);
      
      Alert.alert('Account Created!', 'Your employee account is ready. Admin roles will be assigned by your org admin.', [
        { text: 'Go to Login', onPress: () => router.replace('/auth/login') }
      ]);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', color: NeoColors.danger, width: '25%' };
    if (score === 2) return { label: 'Fair', color: NeoColors.warning, width: '50%' };
    if (score === 3) return { label: 'Good', color: NeoColors.success, width: '75%' };
    return { label: 'Strong', color: '#4ADE80', width: '100%' };
  };

  const strength = getStrength(password);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBox}>
          <Text style={styles.logoTitle}>
            Asset<Text style={styles.logoAccent}>Flow</Text>
          </Text>
          <Text style={styles.headerSub}>Register for your enterprise workspace</Text>
        </View>

        <View style={styles.formBox}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarTxt}>AF</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>FULL NAME</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Jane Smith"
            placeholderTextColor="#687082"
            value={name}
            onChangeText={setName}
          />

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
              placeholder="Min. 8 characters"
              placeholderTextColor="#687082"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Text style={styles.eyeTxt}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {password.length > 0 && (
            <View style={styles.strengthBox}>
              <View style={styles.strengthBarBg}>
                <View style={[styles.strengthBarFill, { width: strength.width as any, backgroundColor: strength.color }]} />
              </View>
              <Text style={styles.strengthTxt}>Strength: <Text style={{ color: strength.color }}>{strength.label}</Text></Text>
            </View>
          )}

          <Text style={styles.termsTxt}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </Text>

          <NeoButton
            label={loading ? "Creating account..." : "Create Account"}
            variant="primary"
            onPress={handleRegister}
            style={styles.submitBtn}
          />

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divTxt}>Already have an account?</Text>
            <View style={styles.divLine} />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTxt}>
              Sign up creates an employee account.{'\n'}Admin roles assigned later.
            </Text>
          </View>

          <NeoButton
            label="Sign In"
            variant="secondary"
            onPress={() => router.push('/auth/login')}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NeoColors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: 30,
    paddingBottom: Spacing.six,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoAccent: {
    fontWeight: '800',
    color: NeoColors.primary,
  },
  headerSub: {
    fontSize: 14,
    color: '#A0A6B2',
    marginTop: 6,
    fontWeight: '500',
  },
  formBox: {
    backgroundColor: '#161923',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#252A3E',
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255, 102, 0, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxt: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E96A4',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#1E2233',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2D334A',
    marginBottom: 16,
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
  },
  eyeTxt: {
    color: '#A0A6B2',
    fontSize: 12,
    fontWeight: '700',
  },
  strengthBox: {
    marginBottom: 16,
  },
  strengthBarBg: {
    height: 4,
    backgroundColor: '#252A3E',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthTxt: {
    fontSize: 11,
    color: '#A0A6B2',
    fontWeight: '600',
  },
  termsTxt: {
    fontSize: 11,
    color: '#687082',
    lineHeight: 16,
    marginBottom: 20,
  },
  submitBtn: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#252A3E',
  },
  divTxt: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#687082',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoTxt: {
    fontSize: 12,
    color: '#A0A6B2',
    textAlign: 'center',
    lineHeight: 18,
  },
});
