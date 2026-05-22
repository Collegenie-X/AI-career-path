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
import specialized from '@/data/high-school/specialized.json';
import generalElite from '@/data/high-school/general_elite.json';
import general from '@/data/high-school/general.json';
import identityChallengeData from '@/data/high-school/identity-challenge.json';
import mentalChallengeData from '@/data/high-school/mental-challenge.json';
import type { HighSchoolAdmissionV2Data, HighSchoolCategory, HighSchoolDetail } from '../../types';
import type { IdentityChallengeData, MentalChallengeData } from '../../types';
import { PlanetOrbitView } from './PlanetOrbitView';
import { SchoolCategoryView } from './SchoolCategoryView';
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
    specialized,
    generalElite,
    general,
  ] as unknown as HighSchoolCategory[]),
};

export function HighSchoolAdmissionTab() {
  /** 2단계: 오른쪽 패널에 표시할 카테고리 (학교 유형) */
  const [selectedCategory, setSelectedCategory] = useState<HighSchoolCategory | null>(null);
  /** 3단계: 다이얼로그로 표시할 개별 학교 */
  const [selectedSchool, setSelectedSchool] = useState<HighSchoolDetail | null>(null);
  const [openOrbitHubChallengeTabId, setOpenOrbitHubChallengeTabId] =
    useState<HighSchoolOrbitHubChallengeTabId | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const schoolId = new URLSearchParams(window.location.search).get('school');
    if (!schoolId) return;

    for (const category of typedData.categories) {
      const matchedSchool = category.schools.find((school) => school.id === schoolId);
      if (!matchedSchool) continue;
      setSelectedCategory(category);
      setSelectedSchool(matchedSchool);
      return;
    }
  }, []);

  /** 1단계 → 2단계: 카테고리 선택 → 오른쪽 패널 노출 */
  const handleSelectCategory = (category: HighSchoolCategory) => {
    setSelectedCategory(category);
    setSelectedSchool(null);
  };

  /** 2단계 → 3단계: 학교 선택 → 다이얼로그 노출 */
  const handleSelectSchool = (school: HighSchoolDetail) => {
    setSelectedSchool(school);
  };

  /** 2컬럼 레이아웃: 왼쪽 = 항상 카테고리 그리드, 오른쪽 = 카테고리 상세 + 학교 목록 */
  const hasDetailSelection = selectedCategory !== null;

  return (
    <>
      <TwoColumnPanelLayout
        hasSelection={hasDetailSelection}
        onClearSelection={() => {
          setSelectedCategory(null);
          setSelectedSchool(null);
        }}
        emptyPlaceholderText="학교 유형을 선택하세요"
        emptyPlaceholderSubText="왼쪽에서 학교 유형(행성)을 클릭하면 카테고리 설명과 학교 목록이 여기에 표시됩니다"
        listSlot={
          <div
            className={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanel}
            style={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanelStyle}
          >
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
          </div>
        }
        detailSlot={
          selectedCategory ? (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${selectedCategory.color}40` }}>
              <SchoolCategoryView
                variant="rightDetail"
                category={selectedCategory}
                onBack={() => {
                  setSelectedCategory(null);
                  setSelectedSchool(null);
                }}
                onSelectSchool={handleSelectSchool}
              />
            </div>
          ) : null
        }
      />

      {selectedSchool && selectedCategory && (
        <SchoolDetailDialog
          school={selectedSchool}
          categoryColor={selectedCategory.color}
          categoryBgColor={selectedCategory.bgColor}
          onClose={() => setSelectedSchool(null)}
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
