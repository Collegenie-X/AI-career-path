'use client';

import { useEffect, useState } from 'react';
import { LibraryBig, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
import metaData from '@/data/high-school/meta.json';
import scienceHigh from '@/data/high-school/science_high.json';
import foreignLanguage from '@/data/high-school/foreign_language.json';
import international from '@/data/high-school/international.json';
import ibSchool from '@/data/high-school/ib.json';
import autonomousPublic from '@/data/high-school/autonomous_public.json';
import autonomousPrivate from '@/data/high-school/autonomous_private.json';
import artsSports from '@/data/high-school/arts_sports.json';
import meister from '@/data/high-school/meister.json';
import business from '@/data/high-school/business.json';
import generalElite from '@/data/high-school/general_elite.json';
import identityChallengeData from '@/data/high-school/identity-challenge.json';
import mentalChallengeData from '@/data/high-school/mental-challenge.json';
import type { HighSchoolAdmissionV2Data, HighSchoolCategory, HighSchoolDetail } from '../../types';
import type { IdentityChallengeData, MentalChallengeData } from '../../types';
import { PlanetOrbitView } from './PlanetOrbitView';
import { SchoolCategoryView } from './SchoolCategoryView';
import { SchoolDetailPanel } from './SchoolDetailPanel';
import { IdentityChallengeGame } from './IdentityChallengeGame';
import { MentalChallengeGame } from './MentalChallengeGame';
import { enrichHighSchoolCategories } from './school-profile-enricher';
import { HighSchoolResourceHubSection } from './HighSchoolResourceHubSection';
import { EXPLORE_PAGE_LAYOUT_CLASS } from '../../config';
import {
  AdmissionExploreCosmicBackdrop,
  AdmissionGameHudBanner,
  admissionExploreOrbitCallout,
} from '../AdmissionExploreGameChrome';

// 분리된 카테고리 파일을 합쳐서 기존 타입과 호환되는 데이터 구성
const typedData: HighSchoolAdmissionV2Data = {
  ...(metaData as unknown as Pick<HighSchoolAdmissionV2Data, 'meta' | 'identityAndMentalStrength' | 'aptitudeCheckList'>),
  categories: enrichHighSchoolCategories([
    scienceHigh,
    foreignLanguage,
    international,
    ibSchool,
    autonomousPublic,
    autonomousPrivate,
    artsSports,
    meister,
    business,
    generalElite,
  ] as unknown as HighSchoolCategory[]),
};

type AdmissionViewState =
  | { view: 'planet' }
  | { view: 'category'; category: HighSchoolCategory }
  | { view: 'identity-challenge' }
  | { view: 'mental-challenge' }
  | { view: 'resource-hub' };

export function HighSchoolAdmissionTab() {
  const [viewState, setViewState] = useState<AdmissionViewState>({ view: 'planet' });
  const [selectedSchool, setSelectedSchool] = useState<HighSchoolDetail | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<HighSchoolCategory | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const schoolId = new URLSearchParams(window.location.search).get('school');
    if (!schoolId) return;

    for (const category of typedData.categories) {
      const matchedSchool = category.schools.find((school) => school.id === schoolId);
      if (!matchedSchool) continue;
      setViewState({ view: 'category', category });
      setSelectedCategory(category);
      setSelectedSchool(matchedSchool);
      return;
    }
  }, []);

  const handleSelectCategory = (category: HighSchoolCategory) => {
    setViewState({ view: 'category', category });
  };

  const handleSelectSchool = (school: HighSchoolDetail, category: HighSchoolCategory) => {
    setSelectedSchool(school);
    setSelectedCategory(category);
  };

  const handleBackToPlanet = () => {
    setViewState({ view: 'planet' });
  };

  const currentCategory = viewState.view === 'category' ? viewState.category : null;

  const shouldShow2Column = viewState.view === 'category' || (viewState.view === 'planet' && selectedSchool);

  return (
    <>
      {/* 단일 컬럼 뷰 (행성 궤도, 정체성, 멘탈, 자료실) */}
      {!shouldShow2Column && (
        <div className="space-y-3">
          {/* 인트로 배너 */}
          {viewState.view === 'planet' && (
            <div className="relative overflow-hidden rounded-2xl">
              <AdmissionExploreCosmicBackdrop variant="highSchool" />
              <div className="relative z-[1] space-y-3">
                <AdmissionGameHudBanner variant="highSchool" />
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, type: 'spring', stiffness: 320, damping: 26 }}
                  className="rounded-2xl p-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(132,94,247,0.22) 0%, rgba(32,201,151,0.12) 100%)',
                    border: '1px solid rgba(132,94,247,0.35)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      className="text-2xl"
                      animate={{ rotate: [0, -6, 6, 0], y: [0, -3, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      🪐
                    </motion.div>
                    <div>
                      <h2 className="text-sm font-bold text-white">{typedData.meta.subtitle}</h2>
                      <p className="text-[12px] text-gray-300 mt-0.5">{typedData.meta.description}</p>
                    </div>
                  </div>
                </motion.div>

                {/* 섹션 선택 탭 (정체성 / 멘탈 / 자료실) — 스킬 바 느낌 */}
                <div
                  className="flex rounded-xl p-1 gap-1"
                  style={{
                    background: 'rgba(15,23,42,0.65)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  {(
                    [
                      { view: 'identity-challenge' as const, icon: Sparkles, label: '정체성 퀘스트' },
                      { view: 'mental-challenge' as const, icon: Zap, label: '멘탈 던전' },
                      { view: 'resource-hub' as const, icon: LibraryBig, label: '자료 상점' },
                    ] as const
                  ).map(({ view, icon: Icon, label }) => (
                    <motion.button
                      key={view}
                      type="button"
                      onClick={() => setViewState({ view })}
                      className="flex-1 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 text-gray-400 hover:text-white"
                      style={{ background: 'transparent' }}
                      whileHover={{ scale: 1.03, backgroundColor: 'rgba(139,92,246,0.15)' }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </motion.button>
                  ))}
                </div>

                {/* 행성 궤도 뷰 */}
                <div className="space-y-2">
                  <p className="admission-orbit-callout text-center text-[11px] font-black uppercase tracking-wide text-purple-200/90">
                    {admissionExploreOrbitCallout('highSchool')}
                  </p>
                  <PlanetOrbitView
                    categories={typedData.categories}
                    onSelectCategory={handleSelectCategory}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 정체성 뷰 */}
          {viewState.view === 'identity-challenge' && (
            <IdentityChallengeGame
              data={identityChallengeData as IdentityChallengeData}
              categories={typedData.categories}
              onBack={handleBackToPlanet}
              onSelectCategory={handleSelectCategory}
            />
          )}

          {/* 멘탈 뷰 */}
          {viewState.view === 'mental-challenge' && (
            <MentalChallengeGame
              data={mentalChallengeData as MentalChallengeData}
              onBack={handleBackToPlanet}
            />
          )}

          {/* 자료실 뷰 */}
          {viewState.view === 'resource-hub' && (
            <HighSchoolResourceHubSection onBack={handleBackToPlanet} />
          )}
        </div>
      )}

      {/* 2컬럼 뷰 (카테고리 선택 시) */}
      {shouldShow2Column && currentCategory && (
        <TwoColumnPanelLayout
          hasSelection={selectedSchool !== null}
          onClearSelection={() => {
            setSelectedSchool(null);
            setSelectedCategory(null);
          }}
          emptyPlaceholderText="학교를 선택하세요"
          emptyPlaceholderSubText="왼쪽 목록에서 학교를 클릭하면 상세 내용이 여기에 표시됩니다"
          listSlot={
            <div
              className={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanel}
              style={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanelStyle}
            >
              <SchoolCategoryView
                category={currentCategory}
                onBack={handleBackToPlanet}
                onSelectSchool={(school) => handleSelectSchool(school, currentCategory)}
              />
            </div>
          }
          detailSlot={
            selectedSchool && selectedCategory ? (
              <SchoolDetailPanel
                school={selectedSchool}
                categoryColor={selectedCategory.color}
                categoryBgColor={selectedCategory.bgColor}
                onClose={() => {
                  setSelectedSchool(null);
                  setSelectedCategory(null);
                }}
              />
            ) : null
          }
        />
      )}
    </>
  );
}
