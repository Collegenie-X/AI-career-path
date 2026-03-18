import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../config/theme';
import { UNIVERSITY_ADMISSION_EXPLORE_LABELS } from '../config/labels';
import {
  AdmissionMethodCard,
  AdmissionMethodDetailModal,
  EducationInstitutionCard,
  EducationInstitutionDetailModal,
  CareerPathTemplateCard,
  CareerPathDetailModal,
} from '../components/university-admission';
import { StarryBackground } from '../components/jobs/StarryBackground';

import admissionMethodsData from '../data/university-admission-methods-data.json';
import educationInstitutionsData from '../data/university-education-institutions-data.json';
import careerPathTemplatesData from '../data/career-path-templates-admission.json';

type TabView = 'methods' | 'institutions' | 'careerPaths';

export function UniversityAdmissionExploreScreen() {
  const insets = useSafeAreaInsets();
  const [currentTab, setCurrentTab] = useState<TabView>('methods');
  const [selectedMethodCategory, setSelectedMethodCategory] = useState<string>('all');
  const [selectedInstitutionCategory, setSelectedInstitutionCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [selectedCareerPath, setSelectedCareerPath] = useState<any>(null);
  const [isMethodModalVisible, setIsMethodModalVisible] = useState(false);
  const [isInstitutionModalVisible, setIsInstitutionModalVisible] = useState(false);
  const [isCareerPathModalVisible, setIsCareerPathModalVisible] = useState(false);

  const handleMethodPress = useCallback((method: any) => {
    setSelectedMethod(method);
    setIsMethodModalVisible(true);
  }, []);

  const handleInstitutionPress = useCallback((institution: any) => {
    setSelectedInstitution(institution);
    setIsInstitutionModalVisible(true);
  }, []);

  const handleCareerPathPress = useCallback((template: any) => {
    setSelectedCareerPath(template);
    setIsCareerPathModalVisible(true);
  }, []);

  const filteredMethods = selectedMethodCategory === 'all'
    ? admissionMethodsData
    : admissionMethodsData.filter(m => m.categoryId === selectedMethodCategory);

  const filteredInstitutions = selectedInstitutionCategory === 'all'
    ? educationInstitutionsData
    : educationInstitutionsData.filter(i => i.category === selectedInstitutionCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StarryBackground />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pageTitle}>{UNIVERSITY_ADMISSION_EXPLORE_LABELS.pageTitle}</Text>
          <Text style={styles.pageSubtitle}>{UNIVERSITY_ADMISSION_EXPLORE_LABELS.pageSubtitle}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Text style={styles.headerEmoji}>🎓</Text>
        </View>
      </View>

      <View style={styles.introBanner}>
        <Text style={styles.introBannerTitle}>{UNIVERSITY_ADMISSION_EXPLORE_LABELS.introBannerTitle}</Text>
        <Text style={styles.introBannerDescription}>
          {UNIVERSITY_ADMISSION_EXPLORE_LABELS.introBannerDescription}
        </Text>
        <Text style={styles.introBannerSubDescription}>
          {UNIVERSITY_ADMISSION_EXPLORE_LABELS.introBannerSubDescription}
        </Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'methods' && styles.tabActive]}
          onPress={() => setCurrentTab('methods')}
        >
          <Text style={[styles.tabText, currentTab === 'methods' && styles.tabTextActive]}>
            {UNIVERSITY_ADMISSION_EXPLORE_LABELS.tabs.methods}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'institutions' && styles.tabActive]}
          onPress={() => setCurrentTab('institutions')}
        >
          <Text style={[styles.tabText, currentTab === 'institutions' && styles.tabTextActive]}>
            {UNIVERSITY_ADMISSION_EXPLORE_LABELS.tabs.institutions}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'careerPaths' && styles.tabActive]}
          onPress={() => setCurrentTab('careerPaths')}
        >
          <Text style={[styles.tabText, currentTab === 'careerPaths' && styles.tabTextActive]}>
            {UNIVERSITY_ADMISSION_EXPLORE_LABELS.tabs.careerPaths}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentTab === 'methods' && (
          <View style={styles.tabContent}>
            <View style={styles.categorySelector}>
              <Text style={styles.categorySelectorTitle}>
                {UNIVERSITY_ADMISSION_EXPLORE_LABELS.categorySelectTitle}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryChips}>
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedMethodCategory === 'all' && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedMethodCategory('all')}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedMethodCategory === 'all' && styles.categoryChipTextActive,
                      ]}
                    >
                      전체
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedMethodCategory === 'susi' && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedMethodCategory('susi')}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedMethodCategory === 'susi' && styles.categoryChipTextActive,
                      ]}
                    >
                      📚 수시
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedMethodCategory === 'jeongsi' && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedMethodCategory('jeongsi')}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedMethodCategory === 'jeongsi' && styles.categoryChipTextActive,
                      ]}
                    >
                      📝 정시
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedMethodCategory === 'abroad' && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedMethodCategory('abroad')}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedMethodCategory === 'abroad' && styles.categoryChipTextActive,
                      ]}
                    >
                      ✈️ 유학
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            <View style={styles.cardList}>
              {filteredMethods.map((method) => (
                <AdmissionMethodCard
                  key={method.id}
                  method={method}
                  onPress={() => handleMethodPress(method)}
                />
              ))}
            </View>
          </View>
        )}

        {currentTab === 'institutions' && (
          <View style={styles.tabContent}>
            <View style={styles.categorySelector}>
              <Text style={styles.categorySelectorTitle}>
                {UNIVERSITY_ADMISSION_EXPLORE_LABELS.institutionSelectTitle}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryChips}>
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedInstitutionCategory === 'all' && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedInstitutionCategory('all')}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedInstitutionCategory === 'all' && styles.categoryChipTextActive,
                      ]}
                    >
                      전체
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedInstitutionCategory === '24gyeongsan' && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedInstitutionCategory('24gyeongsan')}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedInstitutionCategory === '24gyeongsan' && styles.categoryChipTextActive,
                      ]}
                    >
                      🏛️ 24경산
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedInstitutionCategory === 'special' && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedInstitutionCategory('special')}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedInstitutionCategory === 'special' && styles.categoryChipTextActive,
                      ]}
                    >
                      ⚔️ 특수대학
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            <View style={styles.cardList}>
              {filteredInstitutions.map((institution) => (
                <EducationInstitutionCard
                  key={institution.id}
                  institution={institution}
                  onPress={() => handleInstitutionPress(institution)}
                />
              ))}
            </View>
          </View>
        )}

        {currentTab === 'careerPaths' && (
          <View style={styles.tabContent}>
            <View style={styles.careerPathHeader}>
              <Text style={styles.careerPathTitle}>
                {UNIVERSITY_ADMISSION_EXPLORE_LABELS.careerPathMake}
              </Text>
              <Text style={styles.careerPathDescription}>
                {UNIVERSITY_ADMISSION_EXPLORE_LABELS.careerPathDescription}
              </Text>
            </View>

            <View style={styles.cardList}>
              {careerPathTemplatesData.map((template) => (
                <CareerPathTemplateCard
                  key={template.id}
                  template={template}
                  onPress={() => handleCareerPathPress(template)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <AdmissionMethodDetailModal
        visible={isMethodModalVisible}
        method={selectedMethod}
        onClose={() => setIsMethodModalVisible(false)}
      />

      <EducationInstitutionDetailModal
        visible={isInstitutionModalVisible}
        institution={selectedInstitution}
        onClose={() => setIsInstitutionModalVisible(false)}
        onCareerPathPress={(templateId) => {
          const template = careerPathTemplatesData.find(t => t.id === templateId);
          if (template) {
            setIsInstitutionModalVisible(false);
            setTimeout(() => {
              handleCareerPathPress(template);
            }, 300);
          }
        }}
      />

      <CareerPathDetailModal
        visible={isCareerPathModalVisible}
        template={selectedCareerPath}
        onClose={() => setIsCareerPathModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03030E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
  },
  pageTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: {
    fontSize: 16,
  },
  introBanner: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    padding: SPACING.lg,
  },
  introBannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 8,
  },
  introBannerDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  introBannerSubDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: SPACING.xl,
  },
  categorySelector: {
    marginBottom: SPACING.lg,
  },
  categorySelectorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  categoryChips: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3B82F6',
  },
  cardList: {
    gap: SPACING.md,
  },
  careerPathHeader: {
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  careerPathTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 8,
  },
  careerPathDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});
