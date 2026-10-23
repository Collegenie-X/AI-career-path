'use client';

import { useMemo, useState } from 'react';
import type { HighSchoolCategory, HighSchoolDetail } from '../../types';
import { Pin } from 'lucide-react';
import { clearFavorites, togglePinSchool, togglePinYouth, useHighSchoolFavorites } from './favorites-storage';
import { SchoolListCard } from './SchoolCategoryView';
import { GlossaryText } from '@/components/shared/GlossaryText';
import { ProgramCard, YOUTH_PROGRAM_BY_ID, youthAreaColor, type YouthProgram } from './YouthProgramsView';

type YouthArea = { cat: YouthProgram['category']; emoji: string; label: string; color: string };
type Tab = 'schools' | 'youth';
type SchoolItem = { category: HighSchoolCategory; school: HighSchoolDetail; addedAt: string; pinnedAt?: string };
type YouthItem = { program: YouthProgram; addedAt: string; pinnedAt?: string };

const PIN_COLOR = '#FB923C';
const byPinnedDesc = (a: { pinnedAt?: string }, b: { pinnedAt?: string }) => (b.pinnedAt ?? '').localeCompare(a.pinnedAt ?? '');

const pill = (bg: string, fg: string, bd: string) => ({ background: bg, color: fg, border: `1px solid ${bd}` }) as React.CSSProperties;

/**
 * ⭐ 즐겨찾기 — 별을 눌러 모은 학교(유형별)와 청소년 활동(5대 영역별)을 한곳에서 관리.
 * 학교는 누르면 상세 다이얼로그, 활동은 누르면 공식 페이지. 별을 다시 누르면 빠진다.
 * 📌 를 누르면 카톡 대화방처럼 맨 위 '고정' 묶음으로 올라간다(나중에 고정한 것이 위).
 */
export function FavoritesView({
  categories,
  youthAreas,
  onSelectSchool,
  onOpenCategory,
  onOpenYouthArea,
}: {
  readonly categories: HighSchoolCategory[];
  readonly youthAreas: YouthArea[];
  readonly onSelectSchool: (category: HighSchoolCategory, school: HighSchoolDetail) => void;
  readonly onOpenCategory: (category: HighSchoolCategory) => void;
  readonly onOpenYouthArea: (cat: YouthArea['cat']) => void;
}) {
  const { favorites } = useHighSchoolFavorites();
  const [tab, setTab] = useState<Tab>(() => (favorites.schools.length === 0 && favorites.youth.length > 0 ? 'youth' : 'schools'));
  const [confirmClear, setConfirmClear] = useState(false);

  // 고정한 것은 맨 위로 빼고, 나머지는 카테고리 순서대로 묶되 각 묶음 안은 최근에 담은 순
  const { pinnedSchools, schoolGroups } = useMemo(() => {
    const all: SchoolItem[] = categories.flatMap((category) => {
      const byId = new Map(category.schools.map((s) => [s.id, s]));
      return favorites.schools
        .filter((f) => f.categoryId === category.id)
        .flatMap((f) => {
          const school = byId.get(f.schoolId);
          return school ? [{ category, school, addedAt: f.addedAt, pinnedAt: f.pinnedAt }] : [];
        });
    });
    return {
      pinnedSchools: all.filter((x) => x.pinnedAt).sort(byPinnedDesc),
      schoolGroups: categories
        .map((category) => ({ category, items: all.filter((x) => !x.pinnedAt && x.category.id === category.id) }))
        .filter((g) => g.items.length > 0),
    };
  }, [categories, favorites.schools]);

  const { pinnedYouth, youthGroups } = useMemo(() => {
    const all: YouthItem[] = favorites.youth.flatMap((f) => {
      const program = YOUTH_PROGRAM_BY_ID[f.programId];
      return program ? [{ program, addedAt: f.addedAt, pinnedAt: f.pinnedAt }] : [];
    });
    return {
      pinnedYouth: all.filter((x) => x.pinnedAt).sort(byPinnedDesc),
      youthGroups: youthAreas
        .map((area) => ({ area, items: all.filter((x) => !x.pinnedAt && x.program.category === area.cat) }))
        .filter((g) => g.items.length > 0),
    };
  }, [youthAreas, favorites.youth]);

  const schoolCount = pinnedSchools.length + schoolGroups.reduce((n, g) => n + g.items.length, 0);
  const youthCount = pinnedYouth.length + youthGroups.reduce((n, g) => n + g.items.length, 0);

  const renderSchool = ({ category, school, addedAt, pinnedAt }: SchoolItem, showCategory: boolean) => (
    <SchoolListCard
      key={`${category.id}:${school.id}`}
      school={school}
      categoryId={category.id}
      categoryColor={category.color}
      categoryBgColor={category.bgColor}
      onClick={() => onSelectSchool(category, school)}
      highlightColor={pinnedAt ? PIN_COLOR : undefined}
      headerAction={<PinToggle variant="icon" pinned={Boolean(pinnedAt)} onToggle={() => togglePinSchool(category.id, school.id)} label={school.name} />}
      footer={
        <FavoriteSchoolFacts
          school={school}
          addedAt={addedAt}
          color={category.color}
          categoryLabel={showCategory ? `${category.emoji} ${category.name}` : undefined}
          pinned={Boolean(pinnedAt)}
          onTogglePin={() => togglePinSchool(category.id, school.id)}
        />
      }
    />
  );

  const renderYouth = ({ program, addedAt, pinnedAt }: YouthItem) => (
    <div
      key={program.id}
      className="space-y-1.5 rounded-2xl"
      style={pinnedAt ? { padding: 3, border: `1px solid ${PIN_COLOR}66` } : undefined}
    >
      <ProgramCard program={program} color={youthAreaColor(program.category)} />
      <div className="flex items-center justify-between gap-2 px-1">
        <PinToggle pinned={Boolean(pinnedAt)} onToggle={() => togglePinYouth(program.id)} label={program.name} />
        {formatAddedAt(addedAt) && <span className="text-[10.5px] text-yellow-200/60">⭐ {formatAddedAt(addedAt)}에 담음</span>}
      </div>
    </div>
  );

  const TABS: { id: Tab; emoji: string; label: string; count: number; color: string }[] = [
    { id: 'schools', emoji: '🏫', label: '내 학교', count: schoolCount, color: '#60A5FA' },
    { id: 'youth', emoji: '🗓️', label: '내 활동', count: youthCount, color: '#34D399' },
  ];

  return (
    <div className="px-4 pb-6 pt-3 space-y-4">
      {/* 헤더 */}
      <div
        className="flex items-center gap-2 rounded-2xl p-3"
        style={{ background: 'linear-gradient(135deg, rgba(250,204,21,0.2) 0%, rgba(15,23,42,0.5) 100%)', border: '1px solid rgba(250,204,21,0.45)' }}
      >
        <span className="text-2xl" aria-hidden>⭐</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-white leading-tight">내 즐겨찾기 보관함</h3>
          <p className="text-[11px] font-semibold text-yellow-200/80">카드의 ☆ 를 누르면 여기로 모여요</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={pill('rgba(250,204,21,0.2)', '#FDE047', 'rgba(250,204,21,0.5)')}>
          {schoolCount + youthCount}개
        </span>
      </div>

      {/* 탭 */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTab(t.id); setConfirmClear(false); }}
                aria-pressed={on}
                className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-lg transition-all"
                style={on ? { background: t.color, color: '#0f172a' } : { background: 'transparent', color: 'rgba(255,255,255,0.7)' }}
              >
                {t.emoji} {t.label}
                <span className="text-[10px] font-black px-1.5 rounded-full" style={on ? { background: 'rgba(15,23,42,0.2)' } : { background: `${t.color}33`, color: t.color }}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
        {(tab === 'schools' ? schoolCount : youthCount) > 0 && (
          <button
            type="button"
            onClick={() => {
              if (!confirmClear) { setConfirmClear(true); return; }
              clearFavorites(tab);
              setConfirmClear(false);
            }}
            className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
            style={confirmClear ? pill('rgba(248,113,113,0.22)', '#FCA5A5', 'rgba(248,113,113,0.6)') : pill('rgba(255,255,255,0.05)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.12)')}
          >
            {confirmClear ? '한 번 더 누르면 전부 비워요' : '🧹 전체 비우기'}
          </button>
        )}
      </div>

      {tab === 'schools' && (
        schoolCount === 0 ? (
          <EmptyState
            emoji="🏫"
            title="아직 담은 학교가 없어요"
            hint="학교 유형(행성)을 고른 뒤, 학교 카드 오른쪽 ☆ 를 눌러 담아 보세요."
            actions={categories.slice(0, 4).map((c) => ({ key: c.id, label: `${c.emoji} ${c.name}`, color: c.color, onClick: () => onOpenCategory(c) }))}
          />
        ) : (
          <div className="space-y-3">
            {pinnedSchools.length > 0 && (
              <PinnedSection count={pinnedSchools.length} unit="개교">
                {pinnedSchools.map((item) => renderSchool(item, true))}
              </PinnedSection>
            )}
            {schoolGroups.map(({ category, items }) => (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[13px] font-black text-white px-2.5 py-1 rounded-lg" style={{ background: `linear-gradient(135deg, ${category.color}55, ${category.color}22)` }}>
                    {category.emoji} {category.name}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={pill(`${category.color}22`, category.color, `${category.color}55`)}>{items.length}개교</span>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${category.color}55, transparent)` }} />
                </div>
                <div className="space-y-2">{items.map((item) => renderSchool(item, false))}</div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'youth' && (
        youthCount === 0 ? (
          <EmptyState
            emoji="🗓️"
            title="아직 담은 활동이 없어요"
            hint="청소년 활동 5대 영역에서 대회·캠프 카드의 ☆ 를 눌러 담아 보세요."
            actions={youthAreas.map((a) => ({ key: a.cat, label: `${a.emoji} ${a.label}`, color: a.color, onClick: () => onOpenYouthArea(a.cat) }))}
          />
        ) : (
          <div className="space-y-3">
            {pinnedYouth.length > 0 && (
              <PinnedSection count={pinnedYouth.length} unit="개">
                {pinnedYouth.map(renderYouth)}
              </PinnedSection>
            )}
            {youthGroups.map(({ area, items }) => (
              <div key={area.cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[13px] font-black text-white px-2.5 py-1 rounded-lg" style={{ background: `linear-gradient(135deg, ${area.color}55, ${area.color}22)` }}>
                    {area.emoji} {area.label}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={pill(`${area.color}22`, area.color, `${area.color}55`)}>{items.length}개</span>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${area.color}55, transparent)` }} />
                </div>
                <div className="grid grid-cols-1 gap-2">{items.map(renderYouth)}</div>
              </div>
            ))}
          </div>
        )
      )}

      <p className="text-[11px] text-white/40 leading-relaxed text-center px-2 pt-1">💾 즐겨찾기는 지금 쓰는 이 브라우저에 저장돼요.</p>
    </div>
  );
}

/** 카톡 '고정된 채팅'처럼 맨 위에 따로 모아 보여 주는 묶음 */
function PinnedSection({ count, unit, children }: { readonly count: number; readonly unit: string; readonly children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-3 space-y-2.5"
      style={{ background: `${PIN_COLOR}12`, border: `1px solid ${PIN_COLOR}77` }}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-black px-2.5 py-1 rounded-lg" style={{ background: `${PIN_COLOR}33`, color: '#FED7AA', border: `1px solid ${PIN_COLOR}77` }}>
          <Pin className="w-3.5 h-3.5 -rotate-45" style={{ fill: '#FDBA74', color: '#FDBA74' }} /> 상단 고정
        </span>
        <span className="text-[12px] font-black px-2.5 py-0.5 rounded-full" style={pill(`${PIN_COLOR}1f`, '#FDBA74', `${PIN_COLOR}55`)}>{count}{unit}</span>
        <span className="text-[11px] font-semibold text-orange-200/60 truncate">📌 를 다시 누르면 풀려요</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/**
 * 📌 고정 토글. 학교 카드(<button>) 안 footer 에도 들어가므로
 * FavoriteStar 처럼 role="button" span 으로 두고 클릭이 카드로 번지지 않게 막는다.
 */
function PinToggle({
  pinned,
  onToggle,
  label,
  variant = 'pill',
}: {
  readonly pinned: boolean;
  readonly onToggle: () => void;
  readonly label: string;
  /** 'icon': 카드 윗줄 별 옆 동그란 버튼 · 'pill': 글자 달린 버튼 */
  readonly variant?: 'icon' | 'pill';
}) {
  const fire = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };
  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={pinned}
      aria-label={pinned ? `${label} 상단 고정 해제` : `${label} 상단 고정`}
      onClick={fire}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') fire(e);
      }}
      title={pinned ? '상단 고정 해제' : '맨 위에 고정'}
      className={
        variant === 'icon'
          ? 'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all hover:scale-110 active:scale-90'
          : 'inline-flex items-center gap-1.5 text-[12px] font-black px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105 active:scale-95'
      }
      style={
        pinned
          ? pill(`${PIN_COLOR}33`, '#FDBA74', `${PIN_COLOR}99`)
          : pill('rgba(255,255,255,0.06)', 'rgba(253,186,116,0.75)', `${PIN_COLOR}44`)
      }
    >
      <Pin
        className={`${variant === 'icon' ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${pinned ? '-rotate-45' : ''} transition-transform`}
        style={{ fill: pinned ? '#FDBA74' : 'transparent' }}
      />
      {variant === 'pill' && (pinned ? '고정 해제' : '맨 위에 고정')}
    </span>
  );
}

function EmptyState({
  emoji,
  title,
  hint,
  actions,
}: {
  readonly emoji: string;
  readonly title: string;
  readonly hint: string;
  readonly actions: { key: string; label: string; color: string; onClick: () => void }[];
}) {
  return (
    <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.18)' }}>
      <p className="text-3xl mb-1" aria-hidden>{emoji}</p>
      <p className="text-sm font-black text-white">{title}</p>
      <p className="text-[11.5px] text-white/55 leading-relaxed mt-1">{hint}</p>
      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
        {actions.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={a.onClick}
            className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:scale-[1.03]"
            style={pill(`${a.color}1a`, '#fff', `${a.color}55`)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatAddedAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 보관함 전용 한 줄 — 비교할 때 자주 보는 등록금·기숙사·지정 분야 + 고정 토글·담은 날짜 */
function FavoriteSchoolFacts({
  school,
  addedAt,
  color,
  categoryLabel,
  pinned,
  onTogglePin,
}: {
  readonly school: HighSchoolDetail;
  readonly addedAt: string;
  readonly color: string;
  /** 고정 묶음에서는 학교 유형 묶음 밖이라 유형을 함께 보여 준다 */
  readonly categoryLabel?: string;
  readonly pinned: boolean;
  readonly onTogglePin: () => void;
}) {
  const added = formatAddedAt(addedAt);
  const facts: { key: string; label: string; value: string }[] = [];
  if (school.tuition) facts.push({ key: 'tuition', label: '💰 등록금', value: school.tuition });
  if (school.dormitory !== null && school.dormitory !== undefined) {
    facts.push({ key: 'dorm', label: '🏠 기숙사', value: school.dormitory ? '있음' : '없음 (통학)' });
  }
  if (school.specialCertification) facts.push({ key: 'cert', label: '🏅 지정', value: school.specialCertification });
  return (
    <div className="px-3 pb-3 pt-2 space-y-1" style={{ background: `${color}0d`, borderTop: `1px dashed ${color}33` }}>
      {facts.map((f) => (
        <p key={f.key} className="text-[11.5px] leading-relaxed text-gray-300 flex gap-1.5">
          <span className="font-bold flex-shrink-0" style={{ color }}>{f.label}</span>
          <span className="min-w-0"><GlossaryText>{f.value}</GlossaryText></span>
        </p>
      ))}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <PinToggle pinned={pinned} onToggle={onTogglePin} label={school.name} />
          {categoryLabel && (
            <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-md truncate" style={pill(`${color}1f`, color, `${color}55`)}>{categoryLabel}</span>
          )}
        </div>
        {added && <span className="text-[10.5px] text-yellow-200/60 flex-shrink-0">⭐ {added}에 담음</span>}
      </div>
    </div>
  );
}
