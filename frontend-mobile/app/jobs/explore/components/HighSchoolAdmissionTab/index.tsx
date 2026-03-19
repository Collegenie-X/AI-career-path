'use client';

import { useEffect, useState } from 'react';
import { LibraryBig, Sparkles, Zap } from 'lucide-react';

// ── 분리된 JSON 파일 import ──────────────────────────────────
// 카테고리별로 파일이 나뉘어 있어 유지보수가 쉽습니다.
// 새 학교 추가 시 해당 카테고리 파일만 수정하면 됩니다.
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
import { SchoolDetailModal } from './SchoolDetailModal';
import { IdentityChallengeGame } from './IdentityChallengeGame';
import { MentalChallengeGame } from './MentalChallengeGame';
import { enrichHighSchoolCategories } from './school-profile-enricher';
import { HighSchoolResourceHubSection } from './HighSchoolResourceHubSection';

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

  return (
    <div className="space-y-3">
      {/* 인트로 배너 */}
      {viewState.view === 'planet' && (
        <div
          className="rounded-2xl p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(132,94,247,0.2) 0%, rgba(32,201,151,0.1) 100%)',
            border: '1px solid rgba(132,94,247,0.3)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">🪐</div>
            <div>
              <h2 className="text-sm font-bold text-white">{typedData.meta.subtitle}</h2>
              <p className="text-[12px] text-gray-300 mt-0.5">{typedData.meta.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* 섹션 선택 탭 (정체성 / 멘탈 / 자료실) */}
      {viewState.view === 'planet' && (
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <button
            onClick={() => setViewState({ view: 'identity-challenge' })}
            className="flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5"
            style={{ background: 'transparent', color: '#9ca3af' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            정체성
          </button>
          <button
            onClick={() => setViewState({ view: 'mental-challenge' })}
            className="flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5"
            style={{ background: 'transparent', color: '#9ca3af' }}
          >
            <Zap className="w-3.5 h-3.5" />
            멘탈
          </button>
          <button
            onClick={() => setViewState({ view: 'resource-hub' })}
            className="flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5"
            style={{ background: 'transparent', color: '#9ca3af' }}
          >
            <LibraryBig className="w-3.5 h-3.5" />
            자료실
          </button>
        </div>
      )}

      {/* 행성 궤도 뷰 */}
      {viewState.view === 'planet' && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            🪐 행성을 눌러 학교 유형을 탐방하세요
          </p>
          <PlanetOrbitView
            categories={typedData.categories}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      )}

      {/* 카테고리 뷰 */}
      {viewState.view === 'category' && currentCategory && (
        <SchoolCategoryView
          category={currentCategory}
          onBack={handleBackToPlanet}
          onSelectSchool={(school) => handleSelectSchool(school, currentCategory)}
        />
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

      {/* 학교 상세 모달 */}
      {selectedSchool && selectedCategory && (
        <SchoolDetailModal
          school={selectedSchool}
          categoryColor={selectedCategory.color}
          categoryBgColor={selectedCategory.bgColor}
          onClose={() => {
            setSelectedSchool(null);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
}
