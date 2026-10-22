// @ts-nocheck — 타입 정의에 없는 레거시 필드(keyActivities·comments·selectionInsights 등)를 읽는다. (ReadingClue 쪽과 동일 처리)
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X, Star, MapPin, Users, BookOpen, Lightbulb, TrendingUp,
  CheckCircle, XCircle, Clock, Heart, MessageCircle, Calendar,
  Zap, Shield, Coffee, Target, Maximize2, Share2, Check,
} from 'lucide-react';
import type { HighSchoolDetail, SchoolCareerPathDetail, SchoolRoadmapChallenge } from '../../types';
import { SchoolSelectionInsightSection } from './SchoolSelectionInsightSection';
import { SchoolCommentSharePanel } from './SchoolCommentSharePanel';
import { SchoolCostOutcomeSections } from './SchoolCostOutcomeSections';
import { SchoolWebReviewSection } from './SchoolWebReviewSection';
import { CareerBridgeSection } from './CareerBridgeSection';
import { CampScheduleSection } from './CampScheduleSection';
import { IbStatusBadges } from './IbStatusBadges';
import meisterData from '@/data/high-school/meister.json';
import specializedData from '@/data/high-school/specialized.json';
import type { HighSchoolCareerBridge } from '../../types';
import { GlossaryText } from '../UniversityAdmissionTab/GlossaryText';
import { copyCurrentUrl } from '../../utils/useExploreUrlState';
import { splitCompetition, parseCompetitionDetail } from './competitionLevel';
import { FavoriteStar } from './FavoriteStar';
import { toggleFavoriteSchool, useHighSchoolFavorites } from './favorites-storage';

/** ==text==는 형광펜, 약자(IB·EE·CAS·HL·TOK·AP·SAT·SKY 등)는 말풍선 툴팁 */
function HL({ text }: { text: string }) {
  return <GlossaryText>{text}</GlossaryText>;
}

type SchoolDetailPanelProps = {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
  onClose: () => void;
  onOpenDetailDialog?: () => void;
  variant?: 'panel' | 'dialog';
  /** 있으면 헤더에 즐겨찾기 별을 띄운다 (학교 id가 카테고리 사이에 겹칠 수 있어 함께 저장) */
  favoriteCategoryId?: string;
};

type DetailTabId = 'intro' | 'future' | 'roadmap' | 'reallife';

const DETAIL_TABS: { id: DetailTabId; label: string; emoji: string }[] = [
  { id: 'intro', label: '학교·입시', emoji: '🏫' },
  { id: 'future', label: '대학·취업', emoji: '🎓' },
  { id: 'roadmap', label: '로드맵·팁', emoji: '🗓️' },
  { id: 'reallife', label: '솔직 후기', emoji: '💬' },
];

const MEISTER_CAREER_BRIDGE = (meisterData as { careerBridge?: HighSchoolCareerBridge }).careerBridge;
const SPECIALIZED_CAREER_BRIDGE = (specializedData as { careerBridge?: HighSchoolCareerBridge }).careerBridge;

/** 직업계고(마이스터고·특성화고)만 졸업 후 대학·취업 탭을 연다 */
function careerBridgeFor(type: string): HighSchoolCareerBridge | undefined {
  if (type === '마이스터고') return MEISTER_CAREER_BRIDGE;
  if (type.startsWith('특성화고')) return SPECIALIZED_CAREER_BRIDGE;
  return undefined;
}

function CompetitionCard({
  competition,
  source,
  categoryColor,
}: {
  competition: { headline: string | null; detail: string };
  source?: string;
  categoryColor: string;
}) {
  const isRatio = !!competition.headline?.includes(':');
  const { yearLabel, trend, note } = parseCompetitionDetail(competition.detail);
  const max = Math.max(...trend.map((t) => t.value), 1);
  const last = trend.at(-1);
  const prev = trend.at(-2);
  const delta = last && prev ? Math.round((last.value - prev.value) * 100) / 100 : null;

  return (
    <div
      className="rounded-xl p-3 h-full"
      style={{
        background: isRatio ? `linear-gradient(135deg, ${categoryColor}14 0%, rgba(255,255,255,0.03) 100%)` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isRatio ? `${categoryColor}40` : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-bold" style={{ color: isRatio ? categoryColor : '#9ca3af' }}>📊 경쟁률</p>
        {source && (
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] px-2 py-0.5 rounded-full text-gray-400 hover:text-gray-200 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            🔗 출처
          </a>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        {competition.headline && (
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-3xl font-extrabold leading-none tracking-tight"
                style={{ color: isRatio ? '#f9fafb' : '#9ca3af' }}
              >
                {isRatio ? competition.headline.replace(/:1$/, '') : competition.headline}
              </span>
              {isRatio && <span className="text-sm font-bold text-gray-400">: 1</span>}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {yearLabel && (
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: `${categoryColor}25`, color: categoryColor }}
                >
                  {yearLabel}
                </span>
              )}
              {delta !== null && delta !== 0 && (
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background: delta > 0 ? 'rgba(251,146,60,0.15)' : 'rgba(56,189,248,0.15)',
                    color: delta > 0 ? '#fb923c' : '#38bdf8',
                  }}
                >
                  {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)} 전년 대비
                </span>
              )}
            </div>
          </div>
        )}

        {trend.length > 0 && (
          <div className="flex items-end gap-2.5">
            {trend.map((t, i) => {
              const isLast = i === trend.length - 1;
              return (
                <div key={t.year} className="flex flex-col items-center gap-1">
                  <span className={`text-[11px] font-bold ${isLast ? 'text-white' : 'text-gray-400'}`}>
                    {t.value.toFixed(2)}
                  </span>
                  <div
                    className="w-7 rounded-t-md"
                    style={{
                      height: `${Math.max(8, (t.value / max) * 44)}px`,
                      background: isLast ? categoryColor : `${categoryColor}45`,
                      boxShadow: isLast ? `0 0 10px ${categoryColor}55` : 'none',
                    }}
                  />
                  <span className={`text-[10px] ${isLast ? 'text-gray-300 font-bold' : 'text-gray-500'}`}>{t.year}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {note && (
        <p className={`text-[12px] text-gray-400 leading-snug ${competition.headline ? 'mt-2' : ''}`}>
          <HL text={note} />
        </p>
      )}
    </div>
  );
}

/** 졸업생 진로·취업 — 경쟁률 카드 옆에 나란히 놓인다 */
function GraduateCareerCard({
  career,
  categoryColor,
}: {
  career: NonNullable<HighSchoolDetail['graduateCareer']>;
  categoryColor: string;
}) {
  return (
    <div
      className="rounded-xl p-3 h-full"
      style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.25) 0%, ${categoryColor}08 100%)`, border: `1px solid ${categoryColor}22` }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[15px]">💼</span>
        <h4 className="text-[13px] font-bold" style={{ color: categoryColor }}>
          졸업생 진로·취업
        </h4>
      </div>

      {/* 취업률 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-gray-500 shrink-0">{career.rateLabel ?? '취업률'}</span>
        <span className="text-[12.5px] font-semibold text-gray-200">
          {career.employmentRate}
        </span>
      </div>

      {/* 주요 취업처 뱃지 */}
      {career.topEmployers?.length > 0 && (
      <div className="mb-2">
        <span className="text-[11px] text-gray-500 block mb-1">{career.destinationsLabel ?? '주요 취업처'}</span>
        <div className="flex flex-wrap gap-1">
          {career.topEmployers.map((emp: string) => (
            <span
              key={emp}
              className="px-1.5 py-0.5 rounded-md text-[10.5px] font-semibold leading-none"
              style={{ background: `${categoryColor}18`, color: categoryColor, border: `1px solid ${categoryColor}44` }}
            >
              {emp}
            </span>
          ))}
        </div>
      </div>
      )}

      {/* 주목할 성과 */}
      {career.notableAchievements?.length > 0 && (
        <div className="mb-2">
          <span className="text-[11px] text-gray-500 block mb-1">주목할 성과</span>
          <ul className="space-y-0.5">
            {career.notableAchievements.map((a: string, i: number) => (
              <li key={i} className="text-[11.5px] text-gray-300 leading-relaxed">
                · {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 출처 */}
      {career.source && (
        <p className="text-[10px] text-gray-600 mt-1.5">
          📰 출처: {career.sourceUrl ? (
            <a
              href={career.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-400"
            >
              {career.source}
            </a>
          ) : (
            career.source
          )}
        </p>
      )}
    </div>
  );
}

/**
 * 웹 2-컬럼 레이아웃용 학교 상세 패널
 */
export function SchoolDetailPanel({ school, categoryColor, categoryBgColor, onClose, onOpenDetailDialog, variant = 'panel', favoriteCategoryId }: SchoolDetailPanelProps) {
  const { isSchoolFavorite } = useHighSchoolFavorites();
  const [activeTab, setActiveTab] = useState<DetailTabId>('intro');
  const bridge = careerBridgeFor(school.type);
  const competition = school.competitionLevel ? splitCompetition(school.competitionLevel) : null;
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    const ok = await copyCurrentUrl();
    if (ok) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  /** 다이얼로그(모바일): 이름 + 버튼만 상단에 고정하고 나머지 헤더는 본문과 함께 스크롤 */
  const compactMobile = variant === 'dialog';
  const actionButtons = (
    <>
      {favoriteCategoryId && (
        <FavoriteStar
          active={isSchoolFavorite(favoriteCategoryId, school.id)}
          onToggle={() => toggleFavoriteSchool(favoriteCategoryId, school.id)}
          label={school.name}
          variant="pill"
        />
      )}
      <button
        type="button"
        onClick={handleShare}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          background: shareCopied ? 'rgba(16,185,129,0.25)' : `${categoryColor}25`,
          border: `1px solid ${shareCopied ? 'rgba(16,185,129,0.55)' : `${categoryColor}55`}`,
        }}
        title={shareCopied ? '링크가 복사되었어요' : '학교 링크 복사'}
        aria-label={shareCopied ? '링크 복사 완료' : '학교 링크 공유'}
      >
        {shareCopied ? (
          <Check className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
        ) : (
          <Share2 className="w-3.5 h-3.5" style={{ color: categoryColor }} />
        )}
      </button>
      {onOpenDetailDialog && (
        <button
          type="button"
          onClick={onOpenDetailDialog}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{
            background: `${categoryColor}25`,
            border: `1px solid ${categoryColor}55`,
          }}
          title="자세히 보기"
          aria-label="자세히 보기"
        >
          <Maximize2 className="w-3.5 h-3.5" style={{ color: categoryColor }} />
        </button>
      )}
      {variant === 'dialog' && (
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/15 hover:rotate-90"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          aria-label="닫기"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      )}
    </>
  );

  // 탭 바를 이름 바(1~2줄) 바로 아래에 붙이려고 이름 바 높이를 잰다
  const nameBarRef = useRef<HTMLDivElement>(null);
  const [nameBarHeight, setNameBarHeight] = useState(0);
  useEffect(() => {
    const el = nameBarRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setNameBarHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 모바일 다이얼로그는 패널 전체가 스크롤되므로, 아래로 내려간 상태에서 탭을 바꾸면 새 탭 첫머리로 올린다
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mobileTabBarRef = useRef<HTMLDivElement>(null);
  const selectTab = (id: DetailTabId) => {
    setActiveTab(id);
    const root = scrollRootRef.current;
    const content = contentRef.current;
    if (!compactMobile || !root || !content || root.scrollHeight <= root.clientHeight) return;
    const stickyHeight = (nameBarRef.current?.offsetHeight ?? 0) + (mobileTabBarRef.current?.offsetHeight ?? 0);
    const contentTop = content.offsetTop - stickyHeight;
    if (root.scrollTop > contentTop) root.scrollTop = contentTop;
  };

  const tabBar = (
    <div
      className="flex gap-1 rounded-xl p-1 mb-0 min-w-0 relative z-10"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      {DETAIL_TABS.filter((tab) => tab.id !== 'future' || bridge).map((tab) => (
        <button
          key={tab.id}
          onClick={() => selectTab(tab.id)}
          className="flex-1 py-2.5 rounded-lg font-semibold transition-all flex flex-col items-center gap-0.5"
          style={{
            background: activeTab === tab.id ? `${categoryColor}40` : 'transparent',
            color: activeTab === tab.id ? categoryColor : '#6b7280',
            boxShadow: activeTab === tab.id ? `0 2px 8px ${categoryColor}30` : 'none',
          }}
        >
          <span className="text-base">{tab.emoji}</span>
          <span className="text-[12px] leading-tight">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div
      ref={scrollRootRef}
      className={`flex flex-col h-full ${compactMobile ? 'relative overflow-y-auto overflow-x-hidden overscroll-contain md:overflow-visible' : ''}`}
      style={{ animation: 'panel-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
    >
      {/* 모바일 고정 바 — 학교 이름(최대 2줄) + 버튼 */}
      {compactMobile && (
        <div
          ref={nameBarRef}
          className="md:hidden sticky top-0 z-30 flex-shrink-0 flex items-center gap-2 px-4 py-2.5"
          style={{
            background: `linear-gradient(135deg, ${categoryColor}28, ${categoryColor}0a), rgb(15,23,42)`,
            borderBottom: `1px solid ${categoryColor}30`,
          }}
        >
          <h2 className="flex-1 min-w-0 text-[15px] font-bold text-white leading-snug line-clamp-2 break-words">{school.name}</h2>
          <div className="flex items-center gap-1.5 flex-shrink-0">{actionButtons}</div>
        </div>
      )}

      {/* 헤더 */}
      <div
        className="flex-shrink-0 px-5 py-4 min-w-0 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${categoryColor}28, ${categoryColor}0a)`,
          borderBottom: `1px solid ${categoryColor}30`,
        }}
      >
        {/* 배경 글로우 */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${categoryColor}, transparent)`,
            animation: 'nebula-drift 8s ease-in-out infinite',
          }}
        />

        {/* 학교 기본 정보 */}
        <div className="flex items-start justify-between gap-3 mb-3 min-w-0 relative z-10">
          <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.2) 100%)`,
                border: `2px solid ${categoryColor}60`,
                boxShadow: `0 0 20px ${categoryColor}30`,
                animation: 'icon-float 3s ease-in-out infinite',
              }}
            >
              {school.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className={`text-base font-bold text-white break-words ${compactMobile ? 'hidden md:block' : ''}`}>{school.name}</h2>
                <IbStatusBadges school={school} size="md" />
                {school.dormitory && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                    🏠 기숙사
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-[12px] text-gray-400">{school.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5"
                      style={{
                        fill: i < school.difficulty ? categoryColor : 'transparent',
                        color: i < school.difficulty ? categoryColor : 'rgba(255,255,255,0.2)',
                      }}
                    />
                  ))}
                </div>
                <span className="text-[12px] text-gray-400">입학 난이도</span>
                <span className="text-[12px] text-gray-600">|</span>
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-[12px] text-gray-400">
                  {school.annualAdmission ? (
                    <HL text={`==연 ${school.annualAdmission}명==`} />
                  ) : school.firstYearClassCount ? (
                    <HL text={`==1학년 ${school.firstYearClassCount}학급==`} />
                  ) : (
                    '정원 공시 확인'
                  )}
                </span>
                {competition?.headline && (
                  <>
                    <span className="text-[12px] text-gray-600">|</span>
                    <span className="text-[12px] text-gray-400">
                      경쟁률{' '}
                      <span className="font-bold" style={{ color: competition.headline.includes(':') ? categoryColor : '#9ca3af' }}>
                        {competition.headline}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={`items-center gap-1.5 flex-shrink-0 relative z-10 ${compactMobile ? 'hidden md:flex' : 'flex'}`}>
            {actionButtons}
          </div>
        </div>

        {/* IB — 인증은 학교 단위, DP 이수 범위는 학교마다 다름 */}
        {school.dpScope && (
          <div
            className="rounded-xl px-3 py-2 mb-2 relative z-10"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px dashed ${categoryColor}45` }}
          >
            <p className="text-[12px] leading-relaxed text-gray-300">
              <span className="font-bold" style={{ color: categoryColor }}>👥 DP 운영 범위 · {school.dpScope.label}</span>
              <br />
              <HL text={school.dpScope.basis} />
            </p>
          </div>
        )}

        {/* 탭 바 — 모바일 다이얼로그에서는 헤더 밖(이름 바 아래 고정)으로 뺀다 */}
        {compactMobile ? <div className="hidden md:block">{tabBar}</div> : tabBar}
      </div>

      {/* 모바일: 탭 바도 이름 바 바로 아래에 고정 */}
      {compactMobile && (
        <div
          ref={mobileTabBarRef}
          className="md:hidden sticky z-20 flex-shrink-0 px-4 py-2"
          style={{
            top: nameBarHeight,
            background: `linear-gradient(135deg, ${categoryColor}1a, ${categoryColor}08), rgb(15,23,42)`,
            borderBottom: `1px solid ${categoryColor}30`,
          }}
        >
          {tabBar}
        </div>
      )}

      {/* 콘텐츠 — 스크롤 영역 */}
      <div
        ref={contentRef}
        className={`min-w-0 ${compactMobile ? 'md:flex-1 md:overflow-y-auto md:overflow-x-hidden md:min-h-0' : 'flex-1 overflow-y-auto overflow-x-hidden min-h-0'}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {activeTab === 'intro' && (
          <>
            <OverviewTab school={school} categoryColor={categoryColor} categoryBgColor={categoryBgColor} section="priority" />
            <AdmissionTab school={school} categoryColor={categoryColor} categoryBgColor={categoryBgColor} />
            <OverviewTab school={school} categoryColor={categoryColor} categoryBgColor={categoryBgColor} section="extra" />
          </>
        )}
        {activeTab === 'future' && bridge && (
          <div className="px-5 py-4">
            <CareerBridgeSection bridge={bridge} color={categoryColor} bgColor={categoryBgColor} />
          </div>
        )}
        {activeTab === 'roadmap' && (
          <>
            <CareerPathTab school={school} categoryColor={categoryColor} categoryBgColor={categoryBgColor} />
            <SurvivalTab school={school} categoryColor={categoryColor} categoryBgColor={categoryBgColor} />
          </>
        )}
        {activeTab === 'reallife' && (
          <RealLifeTab school={school} categoryColor={categoryColor} categoryBgColor={categoryBgColor} />
        )}
      </div>
    </div>
  );
}

// ── 탭 컨텐츠 컴포넌트들 (기존 SchoolDetailModal에서 복사) ──

function OverviewTab({
  school,
  categoryColor,
  categoryBgColor,
  section = 'priority',
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
  section?: 'priority' | 'extra';
}) {
  const infoCard = school.schoolInfoCard;
  const qualifications = school.admissionQualifications;
  const competition = school.competitionLevel ? splitCompetition(school.competitionLevel) : null;
  // 등록금·입시 정보가 costStructure / jagonggoProfile로 통합된 경우 상단 요약에서는 생략 (중복 제거)
  const costHandledElsewhere = !!school.costStructure;
  const admissionHandledElsewhere = !!school.jagonggoProfile;
  const hasGraduateCareer = !!(school.graduateCareer?.topEmployers?.length || school.graduateCareer?.notableAchievements?.length);

  if (section === 'priority') {
    return (
      <div className="px-5 py-4 space-y-3">

        {/* ── 1. 학교 소개 ── */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.3) 100%)`,
            border: `1px solid ${categoryColor}30`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: categoryColor }}>
              🏫 학교 소개
            </p>
            {(school.middleSchoolGuide?.homepageUrl || school.websiteUrl) && (
              <a
                href={school.middleSchoolGuide?.homepageUrl || school.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
                style={{
                  background: `${categoryColor}25`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}50`,
                }}
              >
                🌐 홈페이지
              </a>
            )}
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            <HL text={school.description || school.specialCertification || '학교 소개 정보가 준비 중입니다.'} />
          </p>
          {school.middleSchoolGuide && (
            <p className="mt-2 pt-2 text-sm text-white leading-relaxed border-t" style={{ borderColor: `${categoryColor}30` }}>
              <span className="font-semibold" style={{ color: categoryColor }}>📖 한 줄 요약 · </span>
              <HL text={school.middleSchoolGuide.oneLineAbout} />
            </p>
          )}
        </div>

        {/* ── 1-1. 학과·과정 — 개설 학과 이름과 실제로 어떻게 나뉘는지 ── */}
        {school.departments && school.departments.length > 0 && (
          <div
            className="rounded-2xl p-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${categoryColor}30` }}
          >
            <p className="text-xs font-bold mb-2" style={{ color: categoryColor }}>
              🎓 {school.departmentsLabel ?? '학과·과정'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {school.departments.map((dept) => {
                const deptName = typeof dept === 'string' ? dept : dept?.name ?? '';
                return (
                  <span
                    key={deptName}
                    className="text-sm px-2.5 py-1 rounded-lg font-bold"
                    style={{ background: `${categoryColor}20`, border: `1px solid ${categoryColor}50`, color: '#f9fafb' }}
                  >
                    {deptName}
                  </span>
                );
              })}
            </div>
            {school.departmentsNote && (
              <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                <HL text={school.departmentsNote} />
              </p>
            )}
            {school.departmentsSource && (
              <p className="mt-1.5 text-[11px] text-gray-500">
                출처:{' '}
                {school.departmentsSourceUrl ? (
                  <a
                    href={school.departmentsSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-400"
                  >
                    {school.departmentsSource}
                  </a>
                ) : (
                  school.departmentsSource
                )}
              </p>
            )}
          </div>
        )}

        {/* ── 2. 학교 기본 정보 그리드 ── */}
        {infoCard && (
          <div
            className="rounded-2xl p-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${categoryColor}25` }}
          >
            <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: categoryColor }}>
              <Users className="w-3.5 h-3.5" />
              학교 기본 정보
            </p>
            <div className="grid grid-cols-2 gap-2">
              {!admissionHandledElsewhere && (
                <>
                  <div
                    className="rounded-xl p-2.5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p className="text-xs text-gray-500 mb-0.5">📍 위치·통학</p>
                    <p className="text-sm font-semibold text-gray-200 leading-snug"><HL text={infoCard.regionScope} /></p>
                  </div>
                  <div
                    className="rounded-xl p-2.5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p className="text-xs text-gray-500 mb-0.5">👥 정원·규모</p>
                    <p className="text-sm font-semibold text-gray-200 leading-snug"><HL text={infoCard.capacity} /></p>
                  </div>
                </>
              )}
              <div
                className="rounded-xl p-2.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-xs text-gray-500 mb-0.5">⚖️ 남녀 비율</p>
                <p className="text-sm font-semibold text-gray-200 leading-snug"><HL text={infoCard.genderRatio} /></p>
              </div>
              <div
                className="rounded-xl p-2.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-xs text-gray-500 mb-0.5">🏠 기숙사</p>
                <p className="text-sm font-semibold text-gray-200 leading-snug"><HL text={infoCard.dormitoryType} /></p>
              </div>
              {/* 경쟁률 · 졸업생 진로 — 넓으면 좌우, 좁으면 위아래 */}
              {(competition || hasGraduateCareer) && (
                <div className="col-span-2 @container">
                  <div className={`grid grid-cols-1 gap-2 ${competition && hasGraduateCareer ? '@lg:grid-cols-2' : ''}`}>
                    {competition && (
                      <CompetitionCard
                        competition={competition}
                        source={school.competitionLevelSource}
                        categoryColor={categoryColor}
                      />
                    )}
                    {hasGraduateCareer && (
                      <GraduateCareerCard career={school.graduateCareer} categoryColor={categoryColor} />
                    )}
                  </div>
                </div>
              )}
              {!costHandledElsewhere && (
                <>
                  <div
                    className="rounded-xl p-2.5 col-span-2"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p className="text-xs text-gray-500 mb-0.5">💰 연간 총 비용 (등록금+기숙사)</p>
                    <p className="text-sm font-semibold text-gray-200 leading-snug"><HL text={infoCard.costPerYear} /></p>
                  </div>
                  <div
                    className="rounded-xl p-2.5 col-span-2"
                    style={{ background: `${categoryColor}10`, border: `1px solid ${categoryColor}30` }}
                  >
                    <p className="text-xs mb-0.5" style={{ color: categoryColor }}>🎓 장학금·소득 지원</p>
                    <p className="text-sm font-semibold text-gray-200 leading-snug"><HL text={infoCard.scholarship} /></p>
                  </div>
                </>
              )}
            </div>
            {infoCard.lowIncomeAdvice && !costHandledElsewhere && (
              <div
                className="mt-2 p-2.5 rounded-xl"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
              >
                <p className="text-xs font-bold text-yellow-400 mb-0.5">💡 소득 하위 가정 조언</p>
                <p className="text-sm text-gray-200 leading-relaxed"><HL text={infoCard.lowIncomeAdvice} /></p>
              </div>
            )}
          </div>
        )}

        {!infoCard && hasGraduateCareer && (
          <GraduateCareerCard career={school.graduateCareer} categoryColor={categoryColor} />
        )}

        {/* ── 2-1. 등록금 구조·입시 팩트·진학 추이·지역 연계 (웹 검증 데이터) ── */}
        <SchoolCostOutcomeSections school={school} color={categoryColor} />

        {/* ── 3. 대표 프로그램 ── */}
        {school.famousPrograms && school.famousPrograms.length > 0 && (
          <div
            className="rounded-2xl p-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              대표 프로그램
            </p>
            <div className="flex flex-wrap gap-1.5">
              {school.famousPrograms.map((prog, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{ background: `${categoryColor}20`, color: categoryColor }}
                >
                  {prog}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. 입학 자격 요약 — jagonggoProfile이 있으면 아래 통합 카드로 병합 ── */}
        {qualifications && !admissionHandledElsewhere && (
          <div
            className="rounded-2xl p-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              입학 자격 요약
            </p>
            <div className="mb-2">
              <p className="text-xs font-bold text-red-400 mb-1">✅ 필수 조건 (없으면 불합격)</p>
              <ul className="space-y-1">
                {qualifications.mandatory.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-gray-200 leading-snug">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">▸</span>
                    <span><HL text={item} /></span>
                  </li>
                ))}
              </ul>
            </div>
            {qualifications.recommended && qualifications.recommended.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-bold text-blue-400 mb-1">⭐ 우대 조건 (있으면 유리)</p>
                <ul className="space-y-1">
                  {qualifications.recommended.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-300 leading-snug">
                      <span className="text-blue-400 flex-shrink-0 mt-0.5">▸</span>
                      <span><HL text={item} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {qualifications.interviewFormat && (
                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#d1d5db' }}
                >
                  🎤 {qualifications.interviewFormat}
                </span>
              )}
              {qualifications.competitionRate && (
                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{ background: `${categoryColor}20`, color: categoryColor }}
                >
                  🏆 경쟁률 {qualifications.competitionRate}
                </span>
              )}
            </div>
            {qualifications.aiTip && (
              <div
                className="mt-2 p-2.5 rounded-xl"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                <p className="text-xs font-bold text-purple-400 mb-0.5">🤖 AI 세특 전형 팁</p>
                <p className="text-sm text-gray-200 leading-relaxed"><HL text={qualifications.aiTip} /></p>
              </div>
            )}
          </div>
        )}

        {/* ── 5. 자공고 2.0 프로필 · 입학/진학 실적 ── */}
        <SchoolJagonggoSections
          school={school}
          categoryColor={categoryColor}
          categoryBgColor={categoryBgColor}
          qualifications={qualifications}
        />
      </div>
    );
  }

  // section === 'extra' : 세부 정보 (입학 전형 이후에 표시)
  return (
    <div className="px-5 py-4 space-y-3">

      {/* ── 중학생을 위한 고입 가이드 (2028 + AI) ── */}
      {school.middleSchoolGuide && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: `linear-gradient(135deg, rgba(96,165,250,0.10) 0%, rgba(167,139,250,0.10) 100%)`,
            border: `1px solid ${categoryColor}40`,
          }}
        >
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: categoryColor }}>
            🎯 중학생을 위한 고입 가이드
          </p>

          {/* 잘 맞는 친구 / 다시 생각해 봐요 */}
          <div className="grid grid-cols-1 gap-2">
            <div className="rounded-xl p-2.5" style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.30)' }}>
              <p className="text-xs font-bold mb-1.5 text-green-300">✅ 이런 친구한테 잘 맞아요</p>
              <ul className="space-y-1">
                {(school.middleSchoolGuide.goodFor ?? []).map((item, i) => (
                  <li key={i} className="text-sm text-gray-200 leading-snug pl-3 relative">
                    <span className="absolute left-0 text-green-400">·</span>
                    <HL text={item} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <p className="text-xs font-bold mb-1.5 text-red-300">⚠️ 이런 친구는 다시 생각해 봐요</p>
              <ul className="space-y-1">
                {(school.middleSchoolGuide.notForYouIf ?? []).map((item, i) => (
                  <li key={i} className="text-sm text-gray-200 leading-snug pl-3 relative">
                    <span className="absolute left-0 text-red-400">·</span>
                    <HL text={item} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 지금 뭘 해야 해요 */}
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${categoryColor}30` }}>
            <p className="text-xs font-bold mb-1.5" style={{ color: categoryColor }}>📋 지금(중학생 때) 뭘 해야 해요?</p>
            <ul className="space-y-1">
              {(school.middleSchoolGuide.whatToDoNow ?? []).map((item, i) => (
                <li key={i} className="text-sm text-gray-200 leading-snug pl-4 relative">
                  <span className="absolute left-0 text-xs" style={{ color: categoryColor }}>{i + 1}.</span>
                  <HL text={item} />
                </li>
              ))}
            </ul>
          </div>

          {/* 입시 핵심 정보 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-gray-500 mb-0.5">📅 입시 일정</p>
              <p className="text-sm font-semibold text-gray-200 leading-snug"><HL text={school.middleSchoolGuide.admissionTimeline} /></p>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-gray-500 mb-0.5">📊 경쟁률</p>
              <p className="text-sm font-semibold text-gray-200 leading-snug"><HL text={school.middleSchoolGuide.competitionRate} /></p>
            </div>
          </div>

          {/* 학교가 보는 것 */}
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${categoryColor}30` }}>
            <p className="text-xs font-bold mb-1.5" style={{ color: categoryColor }}>🔍 학교가 뭘 봐요?</p>
            <ul className="space-y-1">
              {(school.middleSchoolGuide.whatTheyCheck ?? []).map((item, i) => (
                <li key={i} className="text-sm text-gray-200 leading-snug pl-3 relative">
                  <span className="absolute left-0">·</span>
                  <HL text={item} />
                </li>
              ))}
            </ul>
          </div>

          {/* AI 팁 + 홈페이지에서 확인할 것 */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.30)' }}>
            <p className="text-xs font-bold mb-1 text-purple-300">🤖 AI 시대 한 줄 조언</p>
            <p className="text-sm text-gray-200 leading-relaxed mb-2"><HL text={school.middleSchoolGuide.aiTipForMiddleSchooler} /></p>
            <p className="text-xs font-bold mb-1 text-blue-300">🌐 홈페이지에서 꼭 확인하세요</p>
            <p className="text-sm text-gray-200 leading-relaxed"><HL text={school.middleSchoolGuide.homepageMustCheck} /></p>
          </div>

        </div>
      )}

      {/* ── 2028 개편 + AI 시대 주의점 ── */}
      {school.update2028AI && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: `linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(16,185,129,0.08) 100%)`,
            border: '1px solid rgba(234,179,8,0.30)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-yellow-300">
            ⚠️ 2028 입시 개편 + AI 시대 주의점
          </p>
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.25)' }}>
            <p className="text-xs font-bold mb-1 text-yellow-300">📰 2028 개편 영향</p>
            <p className="text-sm text-gray-200 leading-relaxed"><HL text={school.update2028AI.policy2028} /></p>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <p className="text-xs font-bold mb-1 text-emerald-300">🤖 AI 시대 영향</p>
            <p className="text-sm text-gray-200 leading-relaxed"><HL text={school.update2028AI.aiEra} /></p>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <p className="text-xs font-bold mb-1.5 text-red-300">🚨 꼭 챙겨야 할 점</p>
            <ul className="space-y-1">
              {(school.update2028AI.cautionPoints ?? []).map((item, i) => (
                <li key={i} className="text-sm text-gray-200 leading-snug pl-3 relative">
                  <span className="absolute left-0 text-red-400">·</span>
                  <HL text={item} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── 교육 방식 ── */}
      {school.teachingMethod && (
        <InfoBlock
          icon={<BookOpen className="w-4 h-4" />}
          title="교육 방식"
          content={school.teachingMethod}
          color={categoryColor}
        />
      )}

      {/* ── 학습 방식 상세 ── */}
      {school.studyStyleDetail && (
        <InfoBlock
          icon={<Clock className="w-4 h-4" />}
          title="이 학교는 이렇게 공부해요"
          content={school.studyStyleDetail}
          color={categoryColor}
        />
      )}

      {/* ── 미래 전망 ── */}
      {school.futureOutlook && (
        <InfoBlock
          icon={<TrendingUp className="w-4 h-4" />}
          title="미래 전망"
          content={school.futureOutlook}
          color={categoryColor}
        />
      )}

    </div>
  );
}

function AdmissionTab({
  school,
  categoryColor,
  categoryBgColor,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
}) {
  const admissionProcess = school.admissionProcess;
  const isArrayProcess = Array.isArray(admissionProcess);

  return (
    <div className="px-5 py-4 space-y-3">
      {/* 입시 전형 */}
      <div
        className="rounded-2xl p-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          입학 전형
        </p>
        {isArrayProcess ? (
          <div className="space-y-2">
            {admissionProcess.map((step: { step: string; title: string; detail: string; icon: string }, i: number) => (
              <div
                key={step.step}
                className="flex items-start gap-2.5 p-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: categoryBgColor, border: `1px solid ${categoryColor}40` }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{step.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed"><HL text={step.detail} /></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-200 leading-relaxed"><HL text={admissionProcess as string} /></p>
        )}
      </div>

      {school.keyActivities && Object.keys(school.keyActivities).length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            핵심 활동 비중
          </p>
          <div className="space-y-1.5">
            {Object.entries(school.keyActivities).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[12px] text-gray-400 flex-1">{key}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${value}%`,
                      background: categoryColor,
                      boxShadow: `0 0 6px ${categoryColor}`,
                    }}
                  />
                </div>
                <span className="text-[12px] font-bold" style={{ color: categoryColor }}>
                  {value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {school.admissionTip && (
        <div
          className="rounded-2xl p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(217,119,6,0.08) 100%)',
            border: '1px solid rgba(251,191,36,0.35)',
          }}
        >
          <p className="text-xs font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            합격 전략 TIP
          </p>
          <p className="text-sm text-gray-200 leading-relaxed"><HL text={school.admissionTip} /></p>
        </div>
      )}
    </div>
  );
}

const CHALLENGE_META: Record<SchoolRoadmapChallenge['kind'], { label: string; emoji: string; color: string }> = {
  camp: { label: '캠프·체험', emoji: '🏕️', color: '#34d399' },
  contest: { label: '대회·공모전', emoji: '🏆', color: '#fbbf24' },
  cert: { label: '자격증', emoji: '📜', color: '#60a5fa' },
};

const CHALLENGE_ORDER: SchoolRoadmapChallenge['kind'][] = ['camp', 'contest', 'cert'];

function RoadmapChallenges({ items }: { items: SchoolRoadmapChallenge[] }) {
  const groups = CHALLENGE_ORDER
    .map((kind) => ({ kind, meta: CHALLENGE_META[kind], list: items.filter((c) => c.kind === kind) }))
    .filter((g) => g.list.length > 0);
  if (groups.length === 0) return null;
  return (
    <div className="space-y-2 mb-3">
      {groups.map(({ kind, meta, list }) => (
        <div key={kind} className="space-y-1">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold"
            style={{ backgroundColor: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}55` }}
          >
            {meta.emoji} {meta.label}
          </span>
          <ul className="space-y-1">
            {list.map((c) => (
              <li
                key={c.name}
                className="rounded-xl px-2.5 py-2"
                style={{ background: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${meta.color}` }}
              >
                <p className="text-xs font-bold text-gray-100 leading-snug"><HL text={c.name} /></p>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5"><HL text={c.note} /></p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function CareerPathTab({
  school,
  categoryColor,
  categoryBgColor,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
}) {
  const hasDetails = !!school.careerPathDetails;
  const basicSteps = school.careerPath ? [
    { period: '중학교 1학년', content: school.careerPath.middle1, icon: '🌱' },
    { period: '중학교 2학년', content: school.careerPath.middle2, icon: '🌿' },
    { period: '중학교 3학년', content: school.careerPath.middle3, icon: '🌳' },
  ] : [];

  return (
    <div className="px-5 py-4 space-y-3">
      {/* 인트로 */}
      <div
        className="p-3 rounded-2xl"
        style={{ background: categoryBgColor, border: `1px solid ${categoryColor}30` }}
      >
        <p className="text-[12px] font-bold mb-1" style={{ color: categoryColor }}>
          🗓️ {school.name} 합격을 위한 3년 로드맵
        </p>
        <p className="text-xs text-gray-300 leading-relaxed">
          <HL
            text={
              school.careerPathDetails?.some((d) => d.challenges?.length)
                ? '중학교 3년 동안 무엇을 어떻게 준비해야 하는지 단계별로 알려드려요. 학년마다 ==실제로 도전할 수 있는 캠프·대회·자격증==을 함께 담았어요.'
                : school.campPrograms?.length
                  ? '중학교 3년 동안 무엇을 어떻게 준비해야 하는지 단계별로 알려드려요. ==실제로 열리는 캠프·교육 일정==도 함께 담았어요.'
                  : '중학교 3년 동안 무엇을 어떻게 준비해야 하는지 단계별로 알려드려요.'
            }
          />
        </p>
      </div>

      {/* 캠프·교육 일정표 */}
      {school.campPrograms && school.campPrograms.length > 0 && (
        <CampScheduleSection programs={school.campPrograms} accentColor={categoryColor} />
      )}

      {/* 상세 로드맵 */}
      {hasDetails && school.careerPathDetails ? (
        <div className="relative pl-0.5">
          <div
            className="absolute left-[22px] top-5 bottom-0 w-0.5 -translate-x-1/2"
            style={{
              backgroundColor: categoryColor,
              opacity: 0.5,
              boxShadow: `0 0 8px ${categoryColor}50`,
            }}
          />
          <div className="relative space-y-0">
            {school.careerPathDetails.map((step: SchoolCareerPathDetail, i: number) => (
              <div key={step.grade} className="relative flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 z-10"
                    style={{
                      background: `${categoryColor}20`,
                      borderColor: categoryColor,
                      boxShadow: `0 0 12px ${categoryColor}50`,
                    }}
                  >
                    {step.icon}
                  </div>
                  {i < school.careerPathDetails!.length - 1 && (
                    <div
                      className="flex-1 w-0.5 min-h-8 mt-1"
                      style={{ backgroundColor: categoryColor, opacity: 0.4 }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-8">
                  <span
                    className="inline-block px-3 py-1.5 rounded-full text-xs font-extrabold mb-2"
                    style={{
                      backgroundColor: `${categoryColor}15`,
                      color: categoryColor,
                      border: `1px solid ${categoryColor}40`,
                    }}
                  >
                    {step.grade}
                  </span>
                  <ul className="space-y-1 mb-3">
                    {step.tasks.map((task: string) => (
                      <li key={task} className="text-xs text-gray-300 leading-relaxed flex items-start gap-2">
                        <span className="text-gray-500 flex-shrink-0 mt-0.5">•</span>
                        <span><HL text={task} /></span>
                      </li>
                    ))}
                  </ul>
                  {step.challenges && step.challenges.length > 0 && (
                    <RoadmapChallenges items={step.challenges} />
                  )}
                  <div
                    className="p-2.5 rounded-xl"
                    style={{
                      background: 'rgba(251,191,36,0.1)',
                      border: '1px solid rgba(251,191,36,0.3)',
                    }}
                  >
                    <p className="text-xs font-bold text-yellow-400 mb-0.5">💡 이 시기의 핵심</p>
                    <p className="text-sm text-gray-200 leading-relaxed"><HL text={step.keyPoint} /></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : basicSteps.length > 0 ? (
        <div className="space-y-2">
          {basicSteps.map((step) => (
            <div
              key={step.period}
              className="rounded-xl p-3"
              style={{
                background: `${categoryColor}08`,
                border: `1px solid ${categoryColor}20`,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{step.icon}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${categoryColor}30`, color: categoryColor }}
                >
                  {step.period}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed"><HL text={step.content} /></p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SurvivalTab({
  school,
  categoryColor,
  categoryBgColor,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
}) {
  return (
    <div className="px-5 py-4 space-y-3">
      {/* 일과표 */}
      {school.dailySchedule && school.dailySchedule.length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            재학 중 하루 일과
          </p>
          <div className="space-y-1.5">
            {school.dailySchedule.map((item: { time: string; activity: string; emoji: string }) => (
              <div
                key={item.time}
                className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <span className="text-base flex-shrink-0">{item.emoji}</span>
                <span
                  className="text-xs font-bold flex-shrink-0 w-10"
                  style={{ color: categoryColor }}
                >
                  {item.time}
                </span>
                <span className="text-xs text-gray-300">{item.activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {school.pros && school.pros.length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(22,163,74,0.06) 100%)',
            border: '1px solid rgba(34,197,94,0.3)',
          }}
        >
          <p className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            장점
          </p>
          <ul className="space-y-1.5">
            {school.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-200 leading-relaxed">
                <span className="text-green-400 flex-shrink-0">✓</span>
                <span><HL text={pro} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {school.cons && school.cons.length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(185,28,28,0.06) 100%)',
            border: '1px solid rgba(239,68,68,0.3)',
          }}
        >
          <p className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            단점
          </p>
          <ul className="space-y-1.5">
            {school.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-200 leading-relaxed">
                <span className="text-red-400 flex-shrink-0">✗</span>
                <span><HL text={con} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {school.survivalTips && school.survivalTips.length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            생존 팁
          </p>
          <div className="space-y-2">
            {school.survivalTips.map((tip: { emoji: string; tip: string } | string, i: number) => {
              const isObject = typeof tip === 'object' && tip !== null;
              const emoji = isObject ? tip.emoji : '▸';
              const text = isObject ? tip.tip : tip;
              
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${categoryColor}20`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${categoryColor}15` }}
                  >
                    {emoji}
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed"><HL text={typeof text === 'string' ? text : String(text)} /></p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RealLifeTab({
  school,
  categoryColor,
  categoryBgColor,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
}) {
  if ((!school.realTalk || school.realTalk.length === 0) && !school.webReview) {
    return (
      <div className="px-5 py-4 space-y-3">
        <div
          className="p-4 rounded-2xl text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-3xl mb-2">💬</div>
          <p className="text-sm font-bold text-white mb-1">솔직 후기 준비 중</p>
          <p className="text-[12px] text-gray-400">이 학교의 상세 후기를 준비 중이에요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-3">
      {/* 인트로 */}
      <div
        className="p-3 rounded-2xl"
        style={{ background: categoryBgColor, border: `1px solid ${categoryColor}30` }}
      >
        <p className="text-[12px] font-bold mb-1" style={{ color: categoryColor }}>
          💬 중학생 눈높이 솔직 후기
        </p>
        <p className="text-xs text-gray-300 leading-relaxed">
          이 학교에 대한 솔직한 이야기를 들어보세요.
        </p>
      </div>

      {/* 웹 조사 — 홈페이지·기사·졸업생 후기 (출처 링크) */}
      <SchoolWebReviewSection review={school.webReview} color={categoryColor} />

      {/* 솔직 후기 카드들 */}
      {(school.realTalk ?? []).map((item: { emoji: string; title: string; content: string }, i: number) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="px-3 py-2.5 flex items-center gap-2"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <span className="text-xl">{item.emoji}</span>
            <p className="text-xs font-bold text-white">{item.title}</p>
          </div>
          <div className="px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-sm text-gray-200 leading-relaxed"><HL text={item.content} /></p>
          </div>
        </div>
      ))}

      {school.selectionInsights && (
        <SchoolSelectionInsightSection
          insights={school.selectionInsights}
          categoryColor={categoryColor}
        />
      )}

      {school.comments && school.comments.length > 0 && (
        <SchoolCommentSharePanel
          comments={school.comments}
          categoryColor={categoryColor}
        />
      )}
    </div>
  );
}

function InfoBlock({
  icon,
  title,
  content,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
        {icon}
        {title}
      </p>
      <p className="text-xs text-gray-300 leading-relaxed"><HL text={content} /></p>
    </div>
  );
}

/** 자공고 2.0 지정·협약·특화 트랙 + 입학 방식·경쟁률·진학 추이 */
function SchoolJagonggoSections({
  school,
  categoryColor,
  categoryBgColor,
  qualifications,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
  qualifications?: HighSchoolDetail['admissionQualifications'];
}) {
  const profile = school.jagonggoProfile;
  if (!profile) return null;

  const cardStyle = {
    background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.3) 100%)`,
    border: `1px solid ${categoryColor}30`,
  } as const;

  return (
    <>
      {/* 지정 정보 · 협약 · 특화 트랙 */}
      {profile && (
        <div className="rounded-2xl p-4 space-y-3" style={cardStyle}>
          <p className="text-sm font-bold flex items-center gap-1.5" style={{ color: categoryColor }}>
            {profile.profileTitle ?? '🏛️ 자공고 2.0 프로필'}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: profile.cohortLabel ?? '지정 차수', value: profile.cohort, emoji: '🗓️' },
              { label: profile.designationPeriodLabel ?? '지정 기간', value: profile.designationPeriod, emoji: '📆' },
              { label: profile.zoneLabel ?? '권역', value: profile.zone, emoji: '📍' },
              { label: '선택과제', value: profile.selectiveTask, emoji: '🎯' },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <div key={item.label} className="rounded-xl px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-[11px] text-gray-400 mb-0.5">{item.emoji} {item.label}</p>
                  <p className="text-[12px] font-bold text-white leading-snug">{item.value}</p>
                </div>
              ))}
          </div>

          {profile.brand && (
            <div
              className="rounded-xl px-3 py-2.5"
              style={{ background: `${categoryColor}1a`, border: `1px solid ${categoryColor}40` }}
            >
              <p className="text-[11px] font-bold mb-0.5" style={{ color: categoryColor }}>학교 브랜드</p>
              <p className="text-[13px] font-bold text-white leading-relaxed"><HL text={profile.brand} /></p>
              {profile.vision && <p className="text-[12px] text-gray-300 leading-relaxed mt-1"><HL text={profile.vision} /></p>}
            </div>
          )}

          {profile.focusTracks && profile.focusTracks.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-gray-300 mb-1.5">🧭 특화 트랙</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.focusTracks.map((track) => (
                  <span
                    key={track.name}
                    className="text-[12px] font-bold rounded-lg px-2.5 py-1"
                    style={{ background: `${categoryColor}22`, border: `1px solid ${categoryColor}44`, color: '#fff' }}
                  >
                    {track.emoji} {track.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.coreCurriculum && profile.coreCurriculum.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-gray-300 mb-1.5">📚 중점 교육과정</p>
              <ul className="space-y-1">
                {profile.coreCurriculum.map((item) => (
                  <li key={item} className="text-[13px] text-gray-100 leading-relaxed flex gap-1.5">
                    <span style={{ color: categoryColor }}>·</span>
                    <span className="flex-1"><HL text={item} /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.signaturePrograms && profile.signaturePrograms.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-gray-300 mb-1.5">✨ 특색 프로그램</p>
              <ul className="space-y-1">
                {profile.signaturePrograms.map((item) => (
                  <li key={item} className="text-[13px] text-gray-100 leading-relaxed flex gap-1.5">
                    <span style={{ color: categoryColor }}>·</span>
                    <span className="flex-1"><HL text={item} /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.partners && profile.partners.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-gray-300 mb-1.5">🤝 협약 기관</p>
              <div className="space-y-1.5">
                {profile.partners.map((partner) => (
                  <div key={partner.name} className="rounded-xl px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-[12px] font-bold text-white">
                      {partner.name} <span className="text-[11px] font-semibold" style={{ color: categoryColor }}>{partner.type}</span>
                    </p>
                    <p className="text-[12px] text-gray-300 leading-relaxed mt-0.5">{partner.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.requiredTask && (
            <div className="rounded-xl px-2.5 py-2" style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)' }}>
              <p className="text-[11px] font-bold text-blue-300 mb-0.5">
                📌 {profile.requiredTaskLabel ?? '모든 지정교 공통 필수과제'}
              </p>
              <p className="text-[12px] text-gray-200 leading-relaxed"><HL text={profile.requiredTask} /></p>
            </div>
          )}
        </div>
      )}

      {/* 지역 연계 → 세특 */}
      {profile?.sseteukLinkage && (
        <div
          className="rounded-2xl p-4"
          style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(0,0,0,0.3) 100%)', border: '1px solid rgba(167,139,250,0.35)' }}
        >
          <p className="text-sm font-bold mb-2" style={{ color: '#c4b5fd' }}>🔗 지역 연계 · 특화 과목 · 세특</p>
          <p className="text-[13px] font-bold text-white leading-relaxed mb-2.5">
            <HL text={profile.sseteukLinkage.headline} />
          </p>
          {profile.regionAssets && (
            <div
              className="rounded-xl px-3 py-2 mb-2"
              style={{ background: 'rgba(167,139,250,0.12)', border: '1px dashed rgba(167,139,250,0.45)' }}
            >
              <p className="text-[11px] font-bold mb-0.5" style={{ color: '#c4b5fd' }}>📍 이 지역에만 있는 자원</p>
              <p className="text-[13px] text-gray-100 leading-relaxed"><HL text={profile.regionAssets} /></p>
            </div>
          )}
          <div className="space-y-2">
            {profile.sseteukLinkage.items.map((item) => (
              <div key={item.track} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-[12px] font-bold text-white mb-1">{item.emoji} {item.track}</p>
                {item.subjects && item.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {item.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                        style={{ background: 'rgba(167,139,250,0.2)', color: '#ddd6fe' }}
                      >
                        📘 {subject}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[13px] text-gray-200 leading-relaxed">
                  <span className="font-bold" style={{ color: '#c4b5fd' }}>세특 </span>
                  <HL text={item.how} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 다른 자공고 2.0과의 차이 */}
      {profile?.vsOtherJagonggo && (
        <div className="rounded-2xl p-4" style={cardStyle}>
          <p className="text-sm font-bold mb-2" style={{ color: categoryColor }}>
            {profile.vsTitle ?? '🆚 다른 자공고 2.0과 무엇이 다른가'}
          </p>
          <p className="text-[13px] font-bold text-white leading-relaxed mb-2">
            <HL text={profile.vsOtherJagonggo.headline} />
          </p>
          <ul className="space-y-1.5">
            {profile.vsOtherJagonggo.points.map((point) => (
              <li key={point} className="text-[13px] text-gray-200 leading-relaxed flex gap-1.5">
                <span style={{ color: categoryColor }}>▸</span>
                <span className="flex-1"><HL text={point} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 선발 방식 · 입학 인원 · 경쟁률 */}
      {profile && (profile.admissionType || profile.intake || profile.competition || profile.cutline) && (
        <div className="rounded-2xl p-4" style={cardStyle}>
          <p className="text-sm font-bold mb-2" style={{ color: categoryColor }}>📊 선발 방식 · 입학 인원 · 경쟁률</p>
          <div className="space-y-1.5">
            {[
              { label: '선발 방식', value: profile.admissionType, emoji: '🎲' },
              { label: '입학 인원', value: profile.intake, emoji: '👥' },
              { label: '경쟁률', value: profile.competition, emoji: '🔥' },
              { label: '커트라인', value: profile.cutline, emoji: '📏' },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <div key={item.label} className="rounded-xl px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-[11px] text-gray-400 mb-0.5">{item.emoji} {item.label}</p>
                  <p className="text-[13px] text-gray-100 leading-relaxed"><HL text={item.value as string} /></p>
                </div>
              ))}
          </div>

          {/* 입학 자격 — 별도 섹션을 이 카드로 병합 */}
          {qualifications && (
            <div className="mt-2.5 pt-2.5 space-y-2" style={{ borderTop: `1px dashed ${categoryColor}33` }}>
              {qualifications.mandatory && qualifications.mandatory.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-red-400 mb-1">✅ 필수 조건</p>
                  <ul className="space-y-1">
                    {qualifications.mandatory.map((item) => (
                      <li key={item} className="text-[13px] text-gray-200 leading-relaxed flex gap-1.5">
                        <span className="text-red-400">·</span>
                        <span className="flex-1"><HL text={item} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {qualifications.recommended && qualifications.recommended.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-emerald-400 mb-1">⭐ 우대 조건</p>
                  <div className="flex flex-wrap gap-1">
                    {qualifications.recommended.map((item) => (
                      <span
                        key={item}
                        className="text-[12px] px-2 py-0.5 rounded-full text-gray-200"
                        style={{ background: 'rgba(52,211,153,0.14)' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {qualifications.interviewFormat && (
                <p className="text-[12px] text-gray-300 leading-relaxed">
                  <span className="text-gray-500">🎤 면접 · </span>
                  <HL text={qualifications.interviewFormat} />
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 어떻게 공부해서 들어가나 */}
      {profile?.howToGetIn && profile.howToGetIn.length > 0 && (
        <div className="rounded-2xl p-4" style={cardStyle}>
          <p className="text-sm font-bold mb-2" style={{ color: categoryColor }}>🧗 어떻게 공부해서 들어가나</p>
          <div className="space-y-2">
            {profile.howToGetIn.map((stage) => (
              <div key={stage.stage} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5"
                  style={{ background: `${categoryColor}28`, color: categoryColor }}
                >
                  {stage.stage}
                </p>
                <ul className="space-y-1">
                  {stage.items.map((item) => (
                    <li key={item} className="text-[13px] text-gray-200 leading-relaxed flex gap-1.5">
                      <span style={{ color: categoryColor }}>·</span>
                      <span className="flex-1"><HL text={item} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

    </>
  );
}
