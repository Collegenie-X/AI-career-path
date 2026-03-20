'use client';

import { useState } from 'react';
import { Building2, Briefcase, Target } from 'lucide-react';
import { motion } from 'framer-motion';

import metaData from '@/data/university-admission/meta.json';
import studentRecordComprehensiveCategory from '@/data/university-admission/admission-categories/student-record-comprehensive.json';
import studentRecordAcademicCategory from '@/data/university-admission/admission-categories/student-record-academic.json';
import regularAdmissionCategory from '@/data/university-admission/admission-categories/regular-admission.json';
import internationalCategory from '@/data/university-admission/admission-categories/international.json';
import specialAdmissionCategory from '@/data/university-admission/admission-categories/special-admission.json';
import ibDirectAdmissionCategory from '@/data/university-admission/admission-categories/ib-direct-admission.json';
import overseasKoreanAdmissionCategory from '@/data/university-admission/admission-categories/overseas-korean-admission.json';
import ruralOpportunityAdmissionCategory from '@/data/university-admission/admission-categories/rural-opportunity-admission.json';
import governmentTrackInstitutions from '@/data/university-admission/institutions/government-track.json';
import companyTrackInstitutions from '@/data/university-admission/institutions/company-track.json';
import privateTrackInstitutions from '@/data/university-admission/institutions/private-track.json';
import innovativeTrackInstitutions from '@/data/university-admission/institutions/innovative-track.json';
import inquiryKingdomCareers from '@/data/university-admission/careers/inquiry-kingdom.json';
import technologyKingdomCareers from '@/data/university-admission/careers/technology-kingdom.json';
import creativeKingdomCareers from '@/data/university-admission/careers/creative-kingdom.json';
import natureKingdomCareers from '@/data/university-admission/careers/nature-kingdom.json';
import studentRecordComprehensivePlaybook from '@/data/university-admission/playbooks/student-record-comprehensive.json';
import studentRecordAcademicPlaybook from '@/data/university-admission/playbooks/student-record-academic.json';
import regularAdmissionPlaybook from '@/data/university-admission/playbooks/regular-admission.json';
import internationalPlaybook from '@/data/university-admission/playbooks/international.json';
import specialAdmissionPlaybook from '@/data/university-admission/playbooks/special-admission.json';
import ibDirectAdmissionPlaybook from '@/data/university-admission/playbooks/ib-direct-admission.json';
import overseasKoreanAdmissionPlaybook from '@/data/university-admission/playbooks/overseas-korean-admission.json';
import ruralOpportunityAdmissionPlaybook from '@/data/university-admission/playbooks/rural-opportunity-admission.json';
import strategy2028Data from '@/data/university-admission/strategy-hub/strategy-2028.json';
import aiProjectLearningData from '@/data/university-admission/strategy-hub/ai-project-learning.json';
import paperMakerActivitiesData from '@/data/university-admission/strategy-hub/paper-maker-activities.json';
import gradeRoadmapOverviewData from '@/data/university-admission/strategy-hub/grade-roadmap-overview.json';
import admissionSubscreenMasterDetailUi from '@/data/university-admission/ui-master-detail-subscreens.json';

import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
import { EXPLORE_PAGE_LAYOUT_CLASS } from '../../config';
import { PlanetOrbitView } from './PlanetOrbitView';
import { CategoryDetailView } from './CategoryDetailView';
import { DevEducationInstitutionsView } from './DevEducationInstitutionsView';
import { CareerMajorConnectionView } from './CareerMajorConnectionView';
import { InnovativeInstitutionsListIntroBlock } from './InnovativeInstitutionsListIntroBlock';
import { StrategyHubView } from './StrategyHubView';
import {
  AdmissionExploreCosmicBackdrop,
  AdmissionGameHudBanner,
  admissionExploreOrbitCallout,
} from '../AdmissionExploreGameChrome';

type AdmissionCategory = {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  planet: {
    size: string;
    orbitRadius: number;
    orbitSpeed: number;
    glowColor: string;
  };
  keyFeatures: string[];
  targetStudents: string[];
  preparationGuide: any;
  cautions: string[];
  universities: string[];
};

type ViewState =
  | { view: 'planet' }
  | { view: 'strategy-hub' }
  | { view: 'dev-institutions' }
  | { view: 'innovative-institutions' }
  | { view: 'career-major' };

export function UniversityAdmissionTab() {
  const [viewState, setViewState] = useState<ViewState>({ view: 'planet' });
  const [selectedCategory, setSelectedCategory] = useState<AdmissionCategory | null>(null);

  const categories = [
    studentRecordComprehensiveCategory.category,
    studentRecordAcademicCategory.category,
    regularAdmissionCategory.category,
    internationalCategory.category,
    specialAdmissionCategory.category,
    ibDirectAdmissionCategory.category,
    overseasKoreanAdmissionCategory.category,
    ruralOpportunityAdmissionCategory.category,
  ] as AdmissionCategory[];

  const devInstitutions = [
    ...governmentTrackInstitutions.institutions,
    ...companyTrackInstitutions.institutions,
    ...privateTrackInstitutions.institutions,
  ];

  const innovativeInstitutions = innovativeTrackInstitutions.institutions;

  const careerMajorData = [
    ...inquiryKingdomCareers.careers,
    ...technologyKingdomCareers.careers,
    ...creativeKingdomCareers.careers,
    ...natureKingdomCareers.careers,
  ];

  const categoryPlaybookMap = {
    [studentRecordComprehensivePlaybook.categoryId]: studentRecordComprehensivePlaybook,
    [studentRecordAcademicPlaybook.categoryId]: studentRecordAcademicPlaybook,
    [regularAdmissionPlaybook.categoryId]: regularAdmissionPlaybook,
    [internationalPlaybook.categoryId]: internationalPlaybook,
    [specialAdmissionPlaybook.categoryId]: specialAdmissionPlaybook,
    [ibDirectAdmissionPlaybook.categoryId]: ibDirectAdmissionPlaybook,
    [overseasKoreanAdmissionPlaybook.categoryId]: overseasKoreanAdmissionPlaybook,
    [ruralOpportunityAdmissionPlaybook.categoryId]: ruralOpportunityAdmissionPlaybook,
  };

  const topStrategySections = [
    strategy2028Data,
    aiProjectLearningData,
    paperMakerActivitiesData,
    gradeRoadmapOverviewData,
  ];

  const hasRightPanelDetail = selectedCategory !== null;

  const handleClearRightPanelSelection = () => setSelectedCategory(null);

  const handleSelectCategory = (category: AdmissionCategory) => setSelectedCategory(category);

  const handleBackToPlanet = () => {
    setViewState({ view: 'planet' });
    setSelectedCategory(null);
  };

  const handleShowStrategyHub = () => {
    setSelectedCategory(null);
    setViewState({ view: 'strategy-hub' });
  };

  const handleShowDevInstitutions = () => {
    setSelectedCategory(null);
    setViewState({ view: 'dev-institutions' });
  };

  const handleShowInnovativeInstitutions = () => {
    setSelectedCategory(null);
    setViewState({ view: 'innovative-institutions' });
  };

  const handleShowCareerMajor = () => {
    setSelectedCategory(null);
    setViewState({ view: 'career-major' });
  };

  return (
    <div className="space-y-3">
      {/* 행성(대입 탐색 홈): 고입 탐색과 동일 — 왼쪽 허브 / 오른쪽 상세 가이드 */}
      {viewState.view === 'planet' && (
        <TwoColumnPanelLayout
          hasSelection={hasRightPanelDetail}
          onClearSelection={handleClearRightPanelSelection}
          emptyPlaceholderText="상세 가이드를 선택하세요"
          emptyPlaceholderSubText="왼쪽에서 행성(전형)을 선택하거나 전략 실행 허브·직업(과)별·교육기관으로 이동하면 상세 내용이 표시됩니다"
          listSlot={
            <div
              className={`relative overflow-hidden ${EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanel}`}
              style={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanelStyle}
            >
              <AdmissionExploreCosmicBackdrop variant="university" />
              <div className="relative z-[1] space-y-3">
                <AdmissionGameHudBanner variant="university" />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  className="rounded-2xl p-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(132,94,247,0.24) 0%, rgba(32,201,151,0.12) 100%)',
                    border: '1px solid rgba(132,94,247,0.35)',
                    boxShadow: '0 10px 36px rgba(0,0,0,0.28)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-bold text-white mb-3">{metaData.intro.title}</h2>
                      <div className="flex flex-wrap gap-1.5">
                        {metaData.intro.highlights.map((highlight, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 22 }}
                            className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80"
                          >
                            {highlight}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl p-3"
                  style={{
                    background: 'rgba(239,68,68,0.16)',
                    border: '1px solid rgba(239,68,68,0.35)',
                  }}
                >
                  <p className="text-sm text-red-300 font-medium">{metaData.intro.warning}</p>
                </motion.div>

                <p className="admission-orbit-callout text-center text-[11px] font-black uppercase tracking-wide text-teal-200/90">
                  {admissionExploreOrbitCallout('university')}
                </p>
                <PlanetOrbitView categories={categories} onSelectCategory={handleSelectCategory} />

                <div className="space-y-2">
            {/* 전략 실행 허브 */}
            <motion.button
              type="button"
              onClick={handleShowStrategyHub}
              className="w-full rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
                border: '1px solid rgba(129,140,248,0.3)',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(99,102,241,0.25)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(99,102,241,0.3)',
                    border: '2px solid rgba(129,140,248,0.5)',
                  }}
                >
                  <Target className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-bold text-white mb-1">{admissionSubscreenMasterDetailUi.planetEntranceButtons.strategyHub.title}</h3>
                  <p className="text-xs text-white/70">
                    {admissionSubscreenMasterDetailUi.planetEntranceButtons.strategyHub.subtitle}
                  </p>
                </div>
                <span className="text-white/40">→</span>
              </div>
            </motion.button>

            {/* 직업(과) 연계 준비 */}
            <motion.button
              type="button"
              onClick={handleShowCareerMajor}
              className="w-full rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(16,185,129,0.25)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(16,185,129,0.3)',
                    border: '2px solid rgba(16,185,129,0.5)',
                  }}
                >
                  <Briefcase className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-bold text-white mb-1">{admissionSubscreenMasterDetailUi.planetEntranceButtons.careerMajor.title}</h3>
                  <p className="text-xs text-white/70">
                    {admissionSubscreenMasterDetailUi.planetEntranceButtons.careerMajor.subtitle}
                  </p>
                </div>
                <span className="text-white/40">→</span>
              </div>
            </motion.button>

            {/* 개발자 교육기관 */}
            <motion.button
              type="button"
              onClick={handleShowDevInstitutions}
              className="w-full rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(59,130,246,0.28)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(59,130,246,0.3)',
                    border: '2px solid rgba(59,130,246,0.5)',
                  }}
                >
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-bold text-white mb-1">{admissionSubscreenMasterDetailUi.planetEntranceButtons.developerInstitutions.title}</h3>
                  <p className="text-xs text-white/70">
                    {admissionSubscreenMasterDetailUi.planetEntranceButtons.developerInstitutions.subtitle}
                  </p>
                </div>
                <span className="text-white/40">→</span>
              </div>
            </motion.button>

            {/* 혁신 교육기관 */}
            <motion.button
              type="button"
              onClick={handleShowInnovativeInstitutions}
              className="w-full rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(239,68,68,0.2) 100%)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(245,158,11,0.28)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: 'rgba(245,158,11,0.3)',
                    border: '2px solid rgba(245,158,11,0.5)',
                  }}
                >
                  🌐
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-bold text-white mb-1">{admissionSubscreenMasterDetailUi.planetEntranceButtons.innovativeInstitutions.title}</h3>
                  <p className="text-xs text-white/70">
                    {admissionSubscreenMasterDetailUi.planetEntranceButtons.innovativeInstitutions.subtitle}
                  </p>
                </div>
                <span className="text-white/40">→</span>
              </div>
            </motion.button>
                </div>
              </div>
            </div>
          }
          detailSlot={
            selectedCategory ? (
              <CategoryDetailView
                variant="inline"
                category={selectedCategory}
                playbook={categoryPlaybookMap[selectedCategory.id as keyof typeof categoryPlaybookMap]}
                onClose={() => setSelectedCategory(null)}
              />
            ) : null
          }
        />
      )}

      {viewState.view === 'strategy-hub' && (
        <StrategyHubView
          sections={topStrategySections}
          onBackToAdmissionExploreMain={handleBackToPlanet}
          masterDetailLabels={{
            backToMainLabel: admissionSubscreenMasterDetailUi.backToAdmissionExploreMain.label,
            backToMainAriaLabel: admissionSubscreenMasterDetailUi.backToAdmissionExploreMain.ariaLabel,
            emptyDetailTitle: admissionSubscreenMasterDetailUi.strategyHub.emptyDetailTitle,
            emptyDetailSubText: admissionSubscreenMasterDetailUi.strategyHub.emptyDetailSubText,
            listIntroEmoji: admissionSubscreenMasterDetailUi.strategyHub.listIntroEmoji,
            listIntroTitle: admissionSubscreenMasterDetailUi.strategyHub.listIntroTitle,
            listIntroDescription: admissionSubscreenMasterDetailUi.strategyHub.listIntroDescription,
          }}
        />
      )}

      {viewState.view === 'dev-institutions' && (
        <DevEducationInstitutionsView
          institutions={devInstitutions}
          onBackToAdmissionExploreMain={handleBackToPlanet}
          masterDetailLabels={{
            backToMainLabel: admissionSubscreenMasterDetailUi.backToAdmissionExploreMain.label,
            backToMainAriaLabel: admissionSubscreenMasterDetailUi.backToAdmissionExploreMain.ariaLabel,
            emptyDetailTitle: admissionSubscreenMasterDetailUi.developerInstitutions.emptyDetailTitle,
            emptyDetailSubText: admissionSubscreenMasterDetailUi.developerInstitutions.emptyDetailSubText,
          }}
        />
      )}

      {viewState.view === 'innovative-institutions' && (
        <DevEducationInstitutionsView
          institutions={innovativeInstitutions}
          onBackToAdmissionExploreMain={handleBackToPlanet}
          masterDetailLabels={{
            backToMainLabel: admissionSubscreenMasterDetailUi.backToAdmissionExploreMain.label,
            backToMainAriaLabel: admissionSubscreenMasterDetailUi.backToAdmissionExploreMain.ariaLabel,
            emptyDetailTitle: admissionSubscreenMasterDetailUi.innovativeInstitutions.emptyDetailTitle,
            emptyDetailSubText: admissionSubscreenMasterDetailUi.innovativeInstitutions.emptyDetailSubText,
          }}
          listIntroSlotOverride={
            <InnovativeInstitutionsListIntroBlock
              emoji={admissionSubscreenMasterDetailUi.innovativeInstitutions.listIntroEmoji}
              title={admissionSubscreenMasterDetailUi.innovativeInstitutions.listIntroTitle}
              description={admissionSubscreenMasterDetailUi.innovativeInstitutions.listIntroDescription}
            />
          }
        />
      )}

      {viewState.view === 'career-major' && (
        <CareerMajorConnectionView
          careers={careerMajorData}
          onBackToAdmissionExploreMain={handleBackToPlanet}
          masterDetailLabels={{
            backToMainLabel: admissionSubscreenMasterDetailUi.backToAdmissionExploreMain.label,
            backToMainAriaLabel: admissionSubscreenMasterDetailUi.backToAdmissionExploreMain.ariaLabel,
            emptyDetailTitle: admissionSubscreenMasterDetailUi.careerMajor.emptyDetailTitle,
            emptyDetailSubText: admissionSubscreenMasterDetailUi.careerMajor.emptyDetailSubText,
          }}
        />
      )}

    </div>
  );
}
