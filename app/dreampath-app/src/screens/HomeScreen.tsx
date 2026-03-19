import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../config/theme';
import { storage } from '../lib/storage';
import { getLevelForXP } from '../lib/xp';
import { FloatingParticles } from '../components/FloatingParticles';
import { HeroSection } from '../components/home/HeroSection';
import { CareerPathSection } from '../components/home/CareerPathSection';
import { AptitudeSection } from '../components/home/AptitudeSection';
import { RecommendedJobsSection } from '../components/home/RecommendedJobsSection';
import { DailyMissionSection } from '../components/home/DailyMissionSection';
import { WhyTabStructureSection } from '../components/home/WhyTabStructureSection';
import { RiasecReportModal } from '../components/home/RiasecReportModal';
import type { UserProfile, RIASECResult } from '../lib/types';
import type { CareerPlan } from '../config/career-path';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [riasec, setRiasec] = useState<RIASECResult | null>(null);
  const [savedPlans, setSavedPlans] = useState<CareerPlan[]>([]);
  const [currentXP, setCurrentXP] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);

  const loadData = useCallback(async () => {
    const user = await storage.user.get();
    if (!user?.onboardingCompleted) return;
    setUserData(user);

    const riasecResult = await storage.riasec.get();
    setRiasec(riasecResult);

    const xpLog = await storage.xp.get();
    setCurrentXP(xpLog.totalXP);

    const plans = await storage.careerPlans.get();
    setSavedPlans(plans);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!userData) return null;

  const currentLevel = getLevelForXP(currentXP);

  const handleJobClick = (starId: string, jobId?: string) => {
    Alert.alert('직업 탐험', `${starId ? `별: ${starId}` : '전체'} ${jobId ? `직업: ${jobId}` : ''}`, [
      { text: '확인' },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <FloatingParticles />

      <HeroSection
        nickname={userData.nickname}
        level={currentLevel}
        onSettings={() => Alert.alert('설정', '설정 화면은 추후 구현됩니다.')}
      />

      <CareerPathSection
        savedPlans={savedPlans}
        onNavigate={() => navigation.navigate('CareerTab')}
      />

      <AptitudeSection
        riasec={riasec}
        onTest={() => navigation.navigate('Quiz' as never)}
        onViewReport={() => {
          if (riasec) {
            navigation.navigate('QuizResults' as never, { reportMode: true } as never);
          } else {
            setShowReportModal(true);
          }
        }}
      />

      <RecommendedJobsSection riasec={riasec} onJobClick={handleJobClick} />

      <DailyMissionSection
        onQuiz={() => Alert.alert('미션', '미션 기능은 추후 구현됩니다.')}
      />

      <WhyTabStructureSection />

      {riasec && (
        <RiasecReportModal
          visible={showReportModal}
          riasec={riasec}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 100,
  },
});
