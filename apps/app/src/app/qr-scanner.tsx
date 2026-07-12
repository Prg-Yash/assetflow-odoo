import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NeoCard } from '@/components/neo/NeoCard';
import { NeoBadge } from '@/components/neo/NeoBadge';
import { NeoButton } from '@/components/neo/NeoButton';
import { NeoColors, Spacing } from '@/constants/theme';

export default function QRScannerScreen() {
  const router = useRouter();
  const [scannedAsset, setScannedAsset] = useState<{
    tag: string;
    name: string;
    serial: string;
    status: string;
    custodian: string;
  } | null>(null);

  const simulateScan = (tag: string, name: string, serial: string, status: string, custodian: string) => {
    setScannedAsset({ tag, name, serial, status, custodian });
    Alert.alert('🏷 Tag Scanned Successfully', `Detected Asset: ${name} (${tag})`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Asset QR / NFC Scanner</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Simulated Camera / Scanner Viewport */}
      <View style={styles.viewportContainer}>
        <View style={styles.viewportFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          <View style={styles.scanLine} />
          <Text style={styles.viewportHint}>Align QR Code or NFC Tag within frame</Text>
        </View>
      </View>

      {scannedAsset ? (
        <NeoCard glow orangeBorder style={styles.resultCard}>
          <View style={styles.resultHead}>
            <Text style={styles.resultTag}>{scannedAsset.tag}</Text>
            <NeoBadge label={scannedAsset.status} variant="info" />
          </View>
          <Text style={styles.resultName}>{scannedAsset.name}</Text>
          <Text style={styles.resultSerial}>Serial Number: {scannedAsset.serial}</Text>
          <Text style={styles.resultCustodian}>👤 Current Custodian: {scannedAsset.custodian}</Text>

          <View style={styles.resultActions}>
            <NeoButton
              label="Check-In Unit ›"
              variant="primary"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => {
                Alert.alert('Status Updated', `${scannedAsset.name} checked in to storage.`);
                router.push('/assets');
              }}
            />
            <NeoButton
              label="Log Audit ›"
              variant="secondary"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => {
                Alert.alert('Audit Logged', `Verified condition of ${scannedAsset.name}.`);
                router.push('/audit');
              }}
            />
          </View>
        </NeoCard>
      ) : (
        <View style={styles.simBox}>
          <Text style={styles.simHeading}>⚡ Quick Scan Simulation Presets:</Text>
          <View style={styles.presetGrid}>
            <TouchableOpacity
              onPress={() => simulateScan('AF-0078', 'MacBook Pro 16" M3 Max', 'MB-2024-0078', 'Allocated', 'Rohan Mehta')}
              style={styles.presetBtn}
            >
              <Text style={styles.presetBtnTag}>AF-0078</Text>
              <Text style={styles.presetBtnName}>MacBook Pro 16"</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => simulateScan('AF-0062', '4K Laser Projector', 'PJ-2024-0062', 'Maintenance', 'Facilities Depot')}
              style={styles.presetBtn}
            >
              <Text style={styles.presetBtnTag}>AF-0062</Text>
              <Text style={styles.presetBtnName}>4K Laser Projector</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => simulateScan('AF-0012', 'Dell Laptop XPS 15', 'DL-2024-0012', 'Allocated', 'Priya Shah')}
              style={styles.presetBtn}
            >
              <Text style={styles.presetBtnTag}>AF-0012</Text>
              <Text style={styles.presetBtnName}>Dell Laptop XPS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => simulateScan('AF-0310', 'Toyota Innova Hybrid', 'TI-2023-0310', 'Allocated', 'Sana Iqbal')}
              style={styles.presetBtn}
            >
              <Text style={styles.presetBtnTag}>AF-0310</Text>
              <Text style={styles.presetBtnName}>Toyota Innova</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NeoColors.background,
    paddingHorizontal: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#1E2233',
    borderRadius: 16,
  },
  closeText: {
    fontSize: 18,
    color: '#A0A6B2',
  },
  viewportContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  viewportFrame: {
    width: 280,
    height: 280,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 102, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: NeoColors.primary,
  },
  topLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  topRight: {
    top: 14,
    right: 14,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  bottomLeft: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  bottomRight: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  scanLine: {
    width: '80%',
    height: 3,
    backgroundColor: NeoColors.primary,
    shadowColor: NeoColors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    marginBottom: 40,
  },
  viewportHint: {
    position: 'absolute',
    bottom: 20,
    color: '#A0A6B2',
    fontSize: 12,
    fontWeight: '600',
  },
  resultCard: {
    padding: 20,
  },
  resultHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTag: {
    fontSize: 14,
    fontWeight: '900',
    color: NeoColors.primary,
  },
  resultName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resultSerial: {
    fontSize: 13,
    color: '#A0A6B2',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  resultCustodian: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '700',
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  simBox: {
    backgroundColor: '#161923',
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#252A3E',
  },
  simHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetBtn: {
    width: '48%',
    backgroundColor: '#1E2233',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 102, 0, 0.3)',
  },
  presetBtnTag: {
    fontSize: 12,
    fontWeight: '900',
    color: NeoColors.primary,
  },
  presetBtnName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
});
