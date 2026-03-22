'use client';

import { useEffect, useState } from 'react';
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
import { SchoolDetailDialog } from './SchoolDetailDialog';
import { enrichHighSchoolCategories } from './school-profile-enricher';
import {
  HighSchoolOrbitHubChallengeDialogLayer,
  HighSchoolOrbitHubChallengeTabBar,
  type HighSchoolOrbitHubChallengeTabId,
} from './HighSchoolOrbitHubChallengeUi';
import { EXPLORE_PAGE_LAYOUT_CLASS } from '../../config';
import { admissionExploreOrbitCallout } from '../AdmissionExploreGameChrome';

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

type AdmissionViewState = { view: 'planet' } | { view: 'category'; category: HighSchoolCategory };

export function HighSchoolAdmissionTab() {
  const [viewState, setViewState] = useState<AdmissionViewState>({ view: 'planet' });
  const [selectedSchool, setSelectedSchool] = useState<HighSchoolDetail | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<HighSchoolCategory | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [openOrbitHubChallengeTabId, setOpenOrbitHubChallengeTabId] =
    useState<HighSchoolOrbitHubChallengeTabId | null>(null);

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

  /** 2컬럼 레이아웃: 왼쪽 리스트, 오른쪽 디테일 (대입 UI와 동일) */
  const hasDetailSelection = selectedSchool !== null;

  const listSlotContent =
    !currentCategory ? (
      <div className="relative z-[1] space-y-3">
        <HighSchoolOrbitHubChallengeTabBar onSelectTab={setOpenOrbitHubChallengeTabId} />
        <p className="admission-orbit-callout text-center text-[11px] font-black uppercase tracking-wide text-purple-200/90">
          {admissionExploreOrbitCallout('highSchool')}
        </p>
        <PlanetOrbitView
          categories={typedData.categories}
          onSelectCategory={handleSelectCategory}
        />
      </div>
    ) : (
      <SchoolCategoryView
        category={currentCategory}
        onBack={handleBackToPlanet}
        onSelectSchool={(school) => handleSelectSchool(school, currentCategory)}
      />
    );

  return (
    <>
      <TwoColumnPanelLayout
        hasSelection={hasDetailSelection}
        onClearSelection={() => {
          setSelectedSchool(null);
          setSelectedCategory(null);
        }}
        emptyPlaceholderText="학교를 선택하세요"
        emptyPlaceholderSubText="왼쪽에서 학교 유형(행성)을 선택한 뒤, 학교를 클릭하면 상세 내용이 여기에 표시됩니다"
        listSlot={
          <div
            className={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanel}
            style={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanelStyle}
          >
            {listSlotContent}
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
              onOpenDetailDialog={() => setShowDetailDialog(true)}
            />
          ) : null
        }
      />

      {showDetailDialog && selectedSchool && selectedCategory && (
        <SchoolDetailDialog
          school={selectedSchool}
          categoryColor={selectedCategory.color}
          categoryBgColor={selectedCategory.bgColor}
          onClose={() => setShowDetailDialog(false)}
        />
      )}

      <HighSchoolOrbitHubChallengeDialogLayer
        openTabId={openOrbitHubChallengeTabId}
        onRequestClose={() => setOpenOrbitHubChallengeTabId(null)}
        categories={typedData.categories}
        identityData={identityChallengeData as IdentityChallengeData}
        mentalData={mentalChallengeData as MentalChallengeData}
        onIdentitySelectCategory={handleSelectCategory}
      />
    </>
  );
}
