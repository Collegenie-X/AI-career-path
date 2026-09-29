'use client';

import { useEffect, useState } from 'react';
import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
import { useExploreUrlState } from '../../utils/useExploreUrlState';
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
import alternative from '@/data/high-school/alternative.json';
import identityChallengeData from '@/data/high-school/identity-challenge.json';
import mentalChallengeData from '@/data/high-school/mental-challenge.json';
import type { HighSchoolAdmissionV2Data, HighSchoolCategory, HighSchoolDetail } from '../../types';
import type { IdentityChallengeData, MentalChallengeData } from '../../types';
import { PlanetOrbitView } from './PlanetOrbitView';
import { SchoolCategoryView } from './SchoolCategoryView';
import { SchoolDetailDialog } from './SchoolDetailDialog';
import { YouthProgramsView } from './YouthProgramsView';
import { enrichHighSchoolCategories } from './school-profile-enricher';
import {
  HighSchoolOrbitHubChallengeDialogLayer,
  HighSchoolOrbitHubChallengeTabBar,
  type HighSchoolOrbitHubChallengeTabId,
} from './HighSchoolOrbitHubChallengeUi';
import { EXPLORE_PAGE_LAYOUT_CLASS } from '../../config';
import { admissionExploreOrbitCallout } from '../AdmissionExploreGameChrome';

/** 청소년 활동 5대 영역 (별도 subView) */
type YouthCat = 'contest' | 'camp' | 'bigtech' | 'exhibition' | 'volunteer';
const YOUTH_SUBVIEWS: { cat: YouthCat; sub: string; emoji: string; label: string; color: string }[] = [
  { cat: 'contest', sub: 'youth-contest', emoji: '🏆', label: '대회·공모전·해커톤', color: '#F472B6' },
  { cat: 'camp', sub: 'youth-camp', emoji: '🏕️', label: '캠프·교육', color: '#34D399' },
  { cat: 'bigtech', sub: 'youth-bigtech', emoji: '🏢', label: '빅테크 캠프', color: '#22D3EE' },
  { cat: 'exhibition', sub: 'youth-exhibition', emoji: '🎨', label: '전시회·페스티벌', color: '#A78BFA' },
  { cat: 'volunteer', sub: 'youth-volunteer', emoji: '🤝', label: '봉사활동·NGO', color: '#60A5FA' },
];
const SUBVIEW_TO_CAT: Record<string, YouthCat> = Object.fromEntries(YOUTH_SUBVIEWS.map((y) => [y.sub, y.cat]));

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
    alternative,
  ] as unknown as HighSchoolCategory[]),
};

/** 전체 카테고리를 통합한 학교 인덱스 — 지도/매트릭스처럼 다른 카테고리의 학교를 클릭하는 경우까지 커버 */
const SCHOOL_INDEX = new Map<string, { school: HighSchoolDetail; category: HighSchoolCategory }>();
for (const category of typedData.categories) {
  for (const school of category.schools ?? []) {
    if (!SCHOOL_INDEX.has(school.id)) SCHOOL_INDEX.set(school.id, { school, category });
  }
}

const DEFAULT_CATEGORY = typedData.categories.find((c) => c.id === 'science_high') ?? null;

export function HighSchoolAdmissionTab() {
  const { searchParams, patchUrl } = useExploreUrlState();

  /** 2단계: 오른쪽 패널에 표시할 카테고리 (학교 유형) */
  const [selectedCategory, setSelectedCategory] = useState<HighSchoolCategory | null>(null);
  /** 3단계: 다이얼로그로 표시할 개별 학교 */
  const [selectedSchool, setSelectedSchool] = useState<HighSchoolDetail | null>(null);
  /** 별도 서브뷰(대입 UI 참조): 청소년 활동 4대 영역 중 선택된 영역 */
  const [selectedYouthCat, setSelectedYouthCat] = useState<YouthCat | null>(null);
  const [openOrbitHubChallengeTabId, setOpenOrbitHubChallengeTabId] =
    useState<HighSchoolOrbitHubChallengeTabId | null>(null);

  // URL → resource-hub 자동 열기
  useEffect(() => {
    if (!searchParams) return;
    const resourceId = searchParams.get('resource');
    if (resourceId && openOrbitHubChallengeTabId !== 'resource-hub') {
      setOpenOrbitHubChallengeTabId('resource-hub');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL → 상태 동기화 (?subView= / ?category=&school=)
  useEffect(() => {
    if (!searchParams) return;

    // 서브뷰(청소년 활동 4대 영역)가 켜져 있으면 카테고리/학교 선택을 비운다
    const subView = searchParams.get('subView');
    const youthCat = subView ? SUBVIEW_TO_CAT[subView] : undefined;
    if (youthCat) {
      if (selectedYouthCat !== youthCat) setSelectedYouthCat(youthCat);
      if (selectedCategory) setSelectedCategory(null);
      if (selectedSchool) setSelectedSchool(null);
      return;
    }
    if (selectedYouthCat) setSelectedYouthCat(null);

    const categoryId = searchParams.get('category');
    const schoolId = searchParams.get('school');

    // category 파라미터가 없거나(부분 patch·딥링크) 삭제된 유형(예: 일반고 general)이면
    // 현재 선택을 그대로 유지하고, 그것도 없을 때만 과학고·영재고를 기본 선택한다.
    // (여기서 selectedSchool을 비우면 학교 클릭 직후 팝업이 열렸다가 바로 닫힌다)
    const categoryFromUrl = categoryId
      ? typedData.categories.find((c) => c.id === categoryId) ?? null
      : null;
    const category = categoryFromUrl ?? selectedCategory ?? DEFAULT_CATEGORY;
    if (category && selectedCategory?.id !== category.id) {
      setSelectedCategory(category);
    }

    if (!schoolId) {
      if (selectedSchool) setSelectedSchool(null);
      return;
    }

    // 선택된 카테고리 → 전체 인덱스 순으로 학교를 찾는다 (지도·매트릭스에서 타 카테고리 학교 클릭 대응)
    const school =
      category?.schools?.find((s) => s.id === schoolId) ?? SCHOOL_INDEX.get(schoolId)?.school ?? null;
    if (!school) {
      if (selectedSchool) setSelectedSchool(null);
      return;
    }
    if (selectedSchool?.id !== school.id) setSelectedSchool(school);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /** 1단계 → 2단계: 카테고리 선택 → 오른쪽 패널 노출 */
  const handleSelectCategory = (category: HighSchoolCategory) => {
    setSelectedYouthCat(null);
    setSelectedCategory(category);
    setSelectedSchool(null);
    patchUrl({ tab: 'admission', category: category.id, school: null, subView: null });
  };

  /** 서브뷰 열기: 청소년 활동 4대 영역 중 하나 */
  const handleSelectYouthCat = (entry: { cat: YouthCat; sub: string }) => {
    setSelectedYouthCat(entry.cat);
    setSelectedCategory(null);
    setSelectedSchool(null);
    patchUrl({ tab: 'admission', category: null, school: null, subView: entry.sub });
  };

  /** 2단계 → 3단계: 학교 선택 → 다이얼로그 노출 */
  const handleSelectSchool = (school: HighSchoolDetail) => {
    setSelectedSchool(school);
    // category까지 함께 patch — URL에 category가 없는 상태(기본 선택)에서 school만 넣으면
    // URL 동기화 이펙트가 선택을 초기화해 팝업이 즉시 닫혔다.
    const categoryId = selectedCategory?.id ?? SCHOOL_INDEX.get(school.id)?.category.id ?? null;
    patchUrl({ tab: 'admission', category: categoryId, school: school.id, subView: null });
  };

  const handleClearAll = () => {
    setSelectedCategory(null);
    setSelectedSchool(null);
    setSelectedYouthCat(null);
    patchUrl({ category: null, school: null, subView: null });
  };

  const handleCloseSchool = () => {
    setSelectedSchool(null);
    patchUrl({ school: null });
  };

  /** 2컬럼 레이아웃: 왼쪽 = 항상 카테고리 그리드, 오른쪽 = 카테고리 상세 + 학교 목록 (또는 서브뷰) */
  const hasDetailSelection = selectedCategory !== null || selectedYouthCat !== null;

  /** 다이얼로그 테마 색 — 선택 카테고리에 없는 학교(지도·매트릭스)면 원 소속 카테고리로 폴백 */
  const dialogCategory = selectedSchool
    ? (selectedCategory?.schools?.some((s) => s.id === selectedSchool.id)
        ? selectedCategory
        : SCHOOL_INDEX.get(selectedSchool.id)?.category ?? selectedCategory ?? DEFAULT_CATEGORY)
    : null;

  return (
    <>
      <TwoColumnPanelLayout
        hasSelection={hasDetailSelection}
        onClearSelection={handleClearAll}
        mobileListMode="stack"

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
                selectedCategoryId={selectedCategory?.id ?? null}
              />

              {/* 별도 영역: 청소년 활동 4대 영역 (대입 UI 참조) */}
              <div
                className="rounded-2xl p-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(168,85,247,0.12) 100%)',
                  border: '1px solid rgba(129,140,248,0.35)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-2 px-0.5">
                  <span className="text-base" aria-hidden>🗓️</span>
                  <span className="text-[12px] font-black text-white">청소년 활동 5대 영역</span>
                  <span className="text-[10px] text-purple-200/70">국내외 · 월별/지역별</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {YOUTH_SUBVIEWS.map((y) => {
                    const on = selectedYouthCat === y.cat;
                    return (
                      <button
                        key={y.cat}
                        type="button"
                        onClick={() => handleSelectYouthCat(y)}
                        aria-pressed={on}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: on ? y.color : `${y.color}1a`,
                          border: `1px solid ${on ? y.color : `${y.color}44`}`,
                          boxShadow: on ? `0 6px 18px ${y.color}55` : 'none',
                        }}
                      >
                        <span className="text-lg flex-shrink-0" aria-hidden>{y.emoji}</span>
                        <span
                          className="text-[11px] font-black leading-tight"
                          style={{ color: on ? '#0f172a' : '#fff' }}
                        >
                          {y.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        }
        detailSlot={
          selectedYouthCat ? (
            <div className="rounded-2xl" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(129,140,248,0.35)' }}>
              <YouthProgramsView key={selectedYouthCat} category={selectedYouthCat} />
            </div>
          ) : selectedCategory ? (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${selectedCategory.color}40` }}>
              <SchoolCategoryView
                variant="rightDetail"
                category={selectedCategory}
                onBack={handleClearAll}
                onSelectSchool={handleSelectSchool}
              />
            </div>
          ) : null
        }
      />

      {selectedSchool && dialogCategory && (
        <SchoolDetailDialog
          school={selectedSchool}
          categoryColor={dialogCategory.color}
          categoryBgColor={dialogCategory.bgColor}
          onClose={handleCloseSchool}
        />
      )}

      <HighSchoolOrbitHubChallengeDialogLayer
        openTabId={openOrbitHubChallengeTabId}
        onRequestClose={() => {
          setOpenOrbitHubChallengeTabId(null);
          patchUrl({ resource: null });
        }}
        categories={typedData.categories}
        identityData={identityChallengeData as unknown as IdentityChallengeData}
        mentalData={mentalChallengeData as MentalChallengeData}
        onIdentitySelectCategory={handleSelectCategory}
      />
    </>
  );
}
