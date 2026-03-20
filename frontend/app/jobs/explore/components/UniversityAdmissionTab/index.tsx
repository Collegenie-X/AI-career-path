'use client';

import { useState } from 'react';
import { Building2, Briefcase } from 'lucide-react';

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

import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
import { EXPLORE_PAGE_LAYOUT_CLASS } from '../../config';
import { PlanetOrbitView } from './PlanetOrbitView';
import { CategoryDetailView } from './CategoryDetailView';
import { DevEducationInstitutionsView } from './DevEducationInstitutionsView';
import { CareerMajorConnectionView } from './CareerMajorConnectionView';
import { TopStrategyHubSection } from './TopStrategyHubSection';
import { TopStrategyHubDetailDialog } from './TopStrategyHubDetailDialog';

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
  | { view: 'dev-institutions' }
  | { view: 'innovative-institutions' }
  | { view: 'career-major' };

function InnovativeInstitutionsHeader() {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(239,68,68,0.2) 100%)',
        border: '1px solid rgba(245,158,11,0.3)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🌐</span>
        <h3 className="text-sm font-bold text-white">혁신 교육기관</h3>
      </div>
      <p className="text-xs text-white/70 leading-relaxed">
        대학 대신, 또는 대학과 함께 선택할 수 있는 새로운 교육 모델입니다.
        미네르바 대학·태재대학교·42 경산·POSTECH·KAIST 특수 트랙 — 수능 없이 입학 가능한 경로를 포함합니다.
      </p>
    </div>
  );
}

export function UniversityAdmissionTab() {
  const [viewState, setViewState] = useState<ViewState>({ view: 'planet' });
  const [selectedCategory, setSelectedCategory] = useState<AdmissionCategory | null>(null);
  const [strategyHubDetailOpen, setStrategyHubDetailOpen] = useState(false);
  const [strategyHubSectionId, setStrategyHubSectionId] = useState('');
  const [strategyHubGradeId, setStrategyHubGradeId] = useState('');

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

  const hasRightPanelDetail = selectedCategory !== null || strategyHubDetailOpen;

  const handleClearRightPanelSelection = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
      return;
    }
    setStrategyHubDetailOpen(false);
  };

  const handleSelectCategory = (category: AdmissionCategory) => {
    setStrategyHubDetailOpen(false);
    setSelectedCategory(category);
  };

  const handleRequestStrategyHubDetailOpen = (payload: { sectionId: string; gradeId: string }) => {
    setSelectedCategory(null);
    setStrategyHubSectionId(payload.sectionId);
    setStrategyHubGradeId(payload.gradeId);
    setStrategyHubDetailOpen(true);
  };

  const handleBackToPlanet = () => {
    setViewState({ view: 'planet' });
    setSelectedCategory(null);
    setStrategyHubDetailOpen(false);
  };

  const handleShowDevInstitutions = () => {
    setSelectedCategory(null);
    setStrategyHubDetailOpen(false);
    setViewState({ view: 'dev-institutions' });
  };

  const handleShowInnovativeInstitutions = () => {
    setSelectedCategory(null);
    setStrategyHubDetailOpen(false);
    setViewState({ view: 'innovative-institutions' });
  };

  const handleShowCareerMajor = () => {
    setSelectedCategory(null);
    setStrategyHubDetailOpen(false);
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
          emptyPlaceholderSubText="왼쪽에서 「상세 가이드 열기」를 누르거나 행성(전형)을 선택하면 여기에 표시됩니다"
          listSlot={
            <div
              className={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanel}
              style={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanelStyle}
            >
              <div className="space-y-3">
                <div
                  className="rounded-2xl p-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(132,94,247,0.2) 0%, rgba(32,201,151,0.1) 100%)',
                    border: '1px solid rgba(132,94,247,0.3)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-bold text-white mb-3">{metaData.intro.title}</h2>
                      <div className="flex flex-wrap gap-1.5">
                        {metaData.intro.highlights.map((highlight, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl p-3"
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                  }}
                >
                  <p className="text-sm text-red-300 font-medium">{metaData.intro.warning}</p>
                </div>

                <TopStrategyHubSection
                  sections={topStrategySections}
                  onRequestOpenDetail={handleRequestStrategyHubDetailOpen}
                />

                <PlanetOrbitView categories={categories} onSelectCategory={handleSelectCategory} />

                <div className="space-y-2">
            {/* 직업(과) 연계 준비 */}
            <button
              onClick={handleShowCareerMajor}
              className="w-full rounded-xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
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
                  <h3 className="text-sm font-bold text-white mb-1">직업(과)별 대입 준비</h3>
                  <p className="text-xs text-white/70">
                    32개 직업별 학과 연계 및 세특 작성 전략
                  </p>
                </div>
                <span className="text-white/40">→</span>
              </div>
            </button>

            {/* 개발자 교육기관 */}
            <button
              onClick={handleShowDevInstitutions}
              className="w-full rounded-xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
              }}
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
                  <h3 className="text-sm font-bold text-white mb-1">개발자 교육기관</h3>
                  <p className="text-xs text-white/70">
                    42서울, SSAFY 등 실전 개발자 양성 교육기관
                  </p>
                </div>
                <span className="text-white/40">→</span>
              </div>
            </button>

            {/* 혁신 교육기관 */}
            <button
              onClick={handleShowInnovativeInstitutions}
              className="w-full rounded-xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(239,68,68,0.2) 100%)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
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
                  <h3 className="text-sm font-bold text-white mb-1">혁신 교육기관</h3>
                  <p className="text-xs text-white/70">
                    미네르바 대학·태재대·42 경산 등 新대학 모델
                  </p>
                </div>
                <span className="text-white/40">→</span>
              </div>
            </button>
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
            ) : strategyHubDetailOpen ? (
              <TopStrategyHubDetailDialog
                variant="inline"
                sections={topStrategySections}
                initialSectionId={strategyHubSectionId || topStrategySections[0]?.id || ''}
                initialGradeId={strategyHubGradeId || topStrategySections[0]?.grades[0]?.id || ''}
                onClose={() => setStrategyHubDetailOpen(false)}
              />
            ) : null
          }
        />
      )}

      {viewState.view === 'dev-institutions' && (
        <div className="space-y-3">
          <button
            onClick={handleBackToPlanet}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span>←</span>
            <span className="text-sm">행성으로 돌아가기</span>
          </button>
          <DevEducationInstitutionsView institutions={devInstitutions} />
        </div>
      )}

      {viewState.view === 'innovative-institutions' && (
        <div className="space-y-3">
          <button
            onClick={handleBackToPlanet}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span>←</span>
            <span className="text-sm">행성으로 돌아가기</span>
          </button>
          <InnovativeInstitutionsHeader />
          <DevEducationInstitutionsView institutions={innovativeInstitutions} />
        </div>
      )}

      {viewState.view === 'career-major' && (
        <div className="space-y-3">
          <button
            onClick={handleBackToPlanet}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span>←</span>
            <span className="text-sm">행성으로 돌아가기</span>
          </button>
          <CareerMajorConnectionView careers={careerMajorData} />
        </div>
      )}

    </div>
  );
}
