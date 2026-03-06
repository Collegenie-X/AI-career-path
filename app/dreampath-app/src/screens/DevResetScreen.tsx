import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../config/theme';
import { storage } from '../lib/storage';

interface DevResetScreenProps {
  onReset: () => void;
}

export function DevResetScreen({ onReset }: DevResetScreenProps) {
  const [userData, setUserData] = useState<any>(null);
  const [riasecData, setRiasecData] = useState<any>(null);
  const [xpData, setXpData] = useState<any>(null);

  const loadData = async () => {
    const user = await storage.user.get();
    const riasec = await storage.riasec.get();
    const xp = await storage.xp.get();
    setUserData(user);
    setRiasecData(riasec);
    setXpData(xp);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetOnboarding = async () => {
    await storage.resetOnboarding();
    await loadData();
    Alert.alert(
      '✅ 온보딩 리셋 완료', 
      '데이터가 삭제되었습니다.\n\n"앱 재시작" 버튼을 눌러주세요.',
      [{ text: '확인' }]
    );
  };

  const handleResetAll = async () => {
    await storage.reset();
    await loadData();
    Alert.alert(
      '✅ 전체 데이터 삭제 완료',
      '모든 데이터가 삭제되었습니다.\n\n"앱 재시작" 버튼을 눌러주세요.',
      [{ text: '확인' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠 개발자 메뉴</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>현재 저장된 데이터</Text>
        
        <View style={styles.dataCard}>
          <Text style={styles.dataLabel}>사용자:</Text>
          <Text style={styles.dataValue}>
            {userData 
              ? `${userData.nickname} (${userData.grade})\n온보딩: ${userData.onboardingCompleted ? '✅ 완료' : '❌ 미완료'}`
              : '❌ 없음'}
          </Text>
        </View>

        <View style={styles.dataCard}>
          <Text style={styles.dataLabel}>RIASEC:</Text>
          <Text style={styles.dataValue}>
            {riasecData ? `✅ 있음` : '❌ 없음'}
          </Text>
        </View>

        <View style={styles.dataCard}>
          <Text style={styles.dataLabel}>XP:</Text>
          <Text style={styles.dataValue}>
            {xpData ? `${xpData.totalXP} XP (레벨 ${xpData.level})` : '0 XP'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={handleResetOnboarding}>
          <Text style={styles.buttonText}>🔄 온보딩 리셋</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={handleResetAll}>
          <Text style={styles.buttonText}>🗑️ 전체 데이터 삭제</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={loadData}>
          <Text style={styles.buttonSecondaryText}>🔄 새로고침</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={onReset}>
          <Text style={styles.buttonPrimaryText}>🚀 앱 재시작</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E1C',
    padding: SPACING.xl,
    paddingTop: 60,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
  },
  section: {
    marginBottom: SPACING.xxxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  dataCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dataLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: SPACING.xxs,
  },
  dataValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  buttonDanger: {
    backgroundColor: COLORS.red,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  buttonSecondaryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  buttonPrimary: {
    backgroundColor: '#10B981',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
});
