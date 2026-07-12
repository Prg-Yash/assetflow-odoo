import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Recovery Email Sent', 'If an account exists, a reset link will be sent to your inbox.', [
        { text: 'Back to Login', onPress: () => router.back() }
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBox}>
          <Text style={styles.logoTitle}>
            Asset<Text style={styles.logoAccent}>Flow</Text>
          </Text>
          <Text style={styles.headerSub}>Recover your enterprise account</Text>
        </View>

        <View style={styles.formBox}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarTxt}>🔒</Text>
            </View>
          </View>

          <Text style={styles.instructionTxt}>
            Enter the email address associated with your account, and we will send you a secure link to reset your password.
          </Text>

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

          <NeoButton
            label={loading ? "Sending link..." : "Send Reset Link"}
            variant="primary"
            onPress={handleReset}
            style={styles.submitBtn}
          />

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divTxt}>Or</Text>
            <View style={styles.divLine} />
          </View>

          <NeoButton
            label="Back to Login"
            variant="ghost"
            onPress={() => router.back()}
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
    backgroundColor: 'rgba(255, 102, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxt: {
    fontSize: 26,
  },
  instructionTxt: {
    fontSize: 13,
    color: '#A0A6B2',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
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
    marginBottom: 24,
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
});
