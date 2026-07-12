import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { NeoColors } from '@/constants/theme';

interface NeoHeaderProps {
  userName: string;
  userRole?: string;
  pendingCount?: number;
  pendingLabel?: string;
  onPressPending?: () => void;
  cardTitle?: string;
  cardSubtitle?: string;
  cardValue?: string;
  cardButtonLabel?: string;
  onPressCardButton?: () => void;
  avatarInitials?: string;
}

export const NeoHeader: React.FC<NeoHeaderProps> = ({
  userName,
  userRole = 'Engineering Team Lead',
  pendingCount = 3,
  pendingLabel = 'You have 3 pending asset requests',
  onPressPending,
  cardTitle = '2 Overdue Check-In Assets',
  cardSubtitle = 'Due in 2 days — Immediate Action Required',
  cardValue = '$2,450.00',
  cardButtonLabel = 'View Assets',
  onPressCardButton,
  avatarInitials = 'PS',
}) => {
  return (
    <View style={styles.container}>
      {/* Top Greeting & Avatar Row */}
      <View style={styles.topRow}>
        <View style={styles.greetingBox}>
          <Text style={styles.welcomeText}>Welcome Back,</Text>
          <Text style={styles.userNameText}>{userName}</Text>
          {userRole ? <Text style={styles.roleText}>{userRole}</Text> : null}
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitials}</Text>
          <View style={styles.onlineDot} />
        </View>
      </View>

      {/* Floating Status Pill Banner (Matches Orange Alert Pill inside Hero in Screenshot) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPressPending}
        style={styles.alertPill}
      >
        <View style={styles.alertCountBox}>
          <Text style={styles.alertCountText}>{pendingCount}</Text>
        </View>
        <Text style={styles.alertLabelText} numberOfLines={1}>
          {pendingLabel}
        </Text>
        <Text style={styles.alertArrow}>›</Text>
      </TouchableOpacity>

      {/* Elevated Hero Card (Matches White/Glass Hero Bottom Card inside Orange Glow in Screenshot) */}
      <View style={styles.heroCard}>
        <View style={styles.heroCardHeader}>
          <View>
            <Text style={styles.heroCardTitle}>{cardTitle}</Text>
            <Text style={styles.heroCardSubtitle}>{cardSubtitle}</Text>
          </View>
        </View>

        <View style={styles.heroCardFooter}>
          <Text style={styles.heroCardValue}>{cardValue}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPressCardButton}
            style={styles.heroCardButton}
          >
            <Text style={styles.heroCardButtonText}>{cardButtonLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161923',
    borderRadius: 32,
    padding: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 102, 0, 0.35)',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: NeoColors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.28,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 12px 40px rgba(255, 102, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      } as any,
    }),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  greetingBox: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#A0A6B2',
    fontWeight: '600',
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  roleText: {
    fontSize: 12,
    color: NeoColors.primary,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: NeoColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#161923',
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 102, 0, 0.18)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 102, 0, 0.4)',
    marginBottom: 16,
  },
  alertCountBox: {
    backgroundColor: NeoColors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  alertCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  alertLabelText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  alertArrow: {
    color: NeoColors.primary,
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 6,
  },
  heroCard: {
    backgroundColor: '#1E2233',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2D334A',
  },
  heroCardHeader: {
    marginBottom: 14,
  },
  heroCardTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 4,
  },
  heroCardSubtitle: {
    fontSize: 12,
    color: '#A0A6B2',
    fontWeight: '500',
  },
  heroCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 14,
  },
  heroCardValue: {
    fontSize: 20,
    color: NeoColors.primary,
    fontWeight: '800',
  },
  heroCardButton: {
    backgroundColor: '#2D334A',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroCardButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
