import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../config/theme';
import { storage } from '../lib/storage';
import { SplashOnboardingBackground } from '../components/SplashOnboardingBackground';

import splashOnboardingData from '../data/splash-onboarding.json';

const SPLASH = splashOnboardingData.splash;

interface SplashScreenProps {
  onFinish: (route: 'home' | 'onboarding' | 'quiz') => void;
  onDevMenu: () => void;
}

export function SplashScreen({ onFinish, onDevMenu }: SplashScreenProps) {
  const [phase, setPhase] = useState(0);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [timersPaused, setTimersPaused] = useState(false);
  const logoScale = useState(new Animated.Value(0.3))[0];
  const logoOpacity = useState(new Animated.Value(0))[0];
  const titleOpacity = useState(new Animated.Value(0))[0];
  const titleTranslateY = useState(new Animated.Value(15))[0];
  const containerOpacity = useState(new Animated.Value(1))[0];
  const progressWidth = useState(new Animated.Value(0))[0];

  const { logoReveal, titleReveal, progressBar, fadeOut, totalBeforeNavigate } =
    SPLASH.animationDuration;

  useEffect(() => {
    if (timersPaused) return;

    const t1 = setTimeout(() => {
      setPhase(1);
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: logoReveal, useNativeDriver: true }),
        Animated.timing(progressWidth, { toValue: 1, duration: progressBar, useNativeDriver: false }),
      ]).start();
    }, 200);

    const t2 = setTimeout(() => {
      setPhase(2);
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: titleReveal, useNativeDriver: true }),
        Animated.timing(titleTranslateY, { toValue: 0, duration: titleReveal, useNativeDriver: true }),
      ]).start();
    }, 900);

    const t3 = setTimeout(() => {
      Animated.timing(containerOpacity, { toValue: 0, duration: fadeOut, useNativeDriver: true }).start();
    }, totalBeforeNavigate - fadeOut - 200);

    const t4 = setTimeout(async () => {
      const user = await storage.user.get();
      if (user?.onboardingCompleted) {
        onFinish('home');
      } else if (user && !user.onboardingCompleted) {
        onFinish('quiz');
      } else {
        onFinish('onboarding');
      }
    }, totalBeforeNavigate);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [
    timersPaused,
    onFinish,
    logoScale,
    logoOpacity,
    titleOpacity,
    titleTranslateY,
    containerOpacity,
    progressWidth,
    logoReveal,
    titleReveal,
    progressBar,
    fadeOut,
    totalBeforeNavigate,
  ]);

  const handleDevMenuToggle = () => {
    const newShowDevMenu = !showDevMenu;
    setShowDevMenu(newShowDevMenu);
    setTimersPaused(newShowDevMenu);
  };

  const handleCheckStorage = async () => {
    const user = await storage.user.get();
    const riasec = await storage.riasec.get();
    const xp = await storage.xp.get();
    
    Alert.alert(
      '현재 저장된 데이터',
      `사용자: ${user ? `${user.nickname} (온보딩: ${user.onboardingCompleted ? '완료' : '미완료'})` : '없음'}\n\nRIASEC: ${riasec ? '있음' : '없음'}\n\nXP: ${xp.totalXP} (레벨 ${xp.level})`,
      [{ text: '확인' }]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      '온보딩 리셋',
      '온보딩을 다시 시작하시겠습니까?\n\n⚠️ 리셋 후 앱을 완전히 종료하고 다시 시작해야 합니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '리셋',
          style: 'destructive',
          onPress: async () => {
            await storage.resetOnboarding();
            Alert.alert(
              '완료',
              '온보딩이 리셋되었습니다.\n\n다음 단계:\n1. 앱을 완전히 종료 (백그라운드에서도 제거)\n2. 앱을 다시 실행\n\niOS: 앱 스와이프 종료 후 재실행\nAndroid: 최근 앱에서 제거 후 재실행',
              [{ text: '확인' }]
            );
          },
        },
      ]
    );
  };

  const handleResetAll = () => {
    Alert.alert(
      '전체 데이터 리셋',
      '모든 데이터를 삭제하시겠습니까?\n\n⚠️ 리셋 후 앱을 완전히 종료하고 다시 시작해야 합니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await storage.reset();
            Alert.alert(
              '완료',
              '모든 데이터가 삭제되었습니다.\n\n다음 단계:\n1. 앱을 완전히 종료 (백그라운드에서도 제거)\n2. 앱을 다시 실행',
              [{ text: '확인' }]
            );
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {phase >= 1 && (
        <SplashOnboardingBackground particleCount={20} showGlowOrbs={true} />
      )}

      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ scale: logoScale }], opacity: logoOpacity },
        ]}
      >
        <LinearGradient
          colors={GRADIENTS.splashLogo as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <Text style={styles.logoIcon}>{SPLASH.logoIcon}</Text>
        </LinearGradient>

        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>{SPLASH.appName}</Text>
          <Text style={styles.subtitle}>{SPLASH.tagline}</Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* 개발자 메뉴 - 우상단 더블 탭으로 활성화 */}
      <TouchableOpacity
        style={styles.devMenuTrigger}
        onPress={handleDevMenuToggle}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.devMenuTriggerText}>🛠</Text>
      </TouchableOpacity>

      {showDevMenu && (
        <View style={styles.devMenu}>
          <Text style={styles.devMenuTitle}>개발자 메뉴</Text>
          <TouchableOpacity 
            style={styles.devMenuItem} 
            onPress={() => {
              setShowDevMenu(false);
              setTimersPaused(false);
              onDevMenu();
            }}
          >
            <Text style={styles.devMenuItemText}>🛠️ 개발자 도구 열기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.devMenuItem} onPress={handleCheckStorage}>
            <Text style={styles.devMenuItemText}>📊 저장된 데이터 확인</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.devMenuItem} onPress={handleResetOnboarding}>
            <Text style={styles.devMenuItemText}>🔄 온보딩 리셋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.devMenuItem} onPress={handleResetAll}>
            <Text style={styles.devMenuItemText}>🗑️ 전체 데이터 삭제</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.devMenuItem} 
            onPress={() => {
              setShowDevMenu(false);
              setTimersPaused(false);
            }}
          >
            <Text style={styles.devMenuItemText}>❌ 닫기</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 20,
  },
  logoGradient: {
    width: 112,
    height: 112,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 48,
    color: COLORS.white,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: COLORS.primaryLight,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 64,
    width: 128,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  devMenuTrigger: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devMenuTriggerText: {
    fontSize: 20,
    opacity: 0.3,
  },
  devMenu: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  devMenuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  devMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  devMenuItemText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
});
