'use client';

import { useMemo, useState } from 'react';
import type { HighSchoolCategory, HighSchoolDetail } from '../../types';
import { clearFavorites, useHighSchoolFavorites } from './favorites-storage';
import { SchoolListCard } from './SchoolCategoryView';
import { GlossaryText } from '@/components/shared/GlossaryText';
import { ProgramCard, YOUTH_PROGRAM_BY_ID, youthAreaColor, type YouthProgram } from './YouthProgramsView';

type YouthArea = { cat: YouthProgram['category']; emoji: string; label: string; color: string };
type Tab = 'schools' | 'youth';

const pill = (bg: string, fg: string, bd: string) => ({ background: bg, color: fg, border: `1px solid ${bd}` }) as React.CSSProperties;

/**
 * ⭐ 즐겨찾기 — 별을 눌러 모은 학교(유형별)와 청소년 활동(5대 영역별)을 한곳에서 관리.
 * 학교는 누르면 상세 다이얼로그, 활동은 누르면 공식 페이지. 별을 다시 누르면 빠진다.
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

  // 카테고리 순서대로 묶되, 각 묶음 안은 최근에 담은 순
  const schoolGroups = useMemo(() => {
    return categories
      .map((category) => {
        const byId = new Map(category.schools.map((s) => [s.id, s]));
        const items = favorites.schools
          .filter((f) => f.categoryId === category.id)
          .map((f) => {
            const school = byId.get(f.schoolId);
            return school ? { school, addedAt: f.addedAt } : null;
          })
          .filter((x): x is { school: HighSchoolDetail; addedAt: string } => x !== null);
        return { category, items };
      })
      .filter((g) => g.items.length > 0);
  }, [categories, favorites.schools]);

  const youthGroups = useMemo(() => {
    return youthAreas
      .map((area) => ({
        area,
        items: favorites.youth
          .map((f) => YOUTH_PROGRAM_BY_ID[f.programId])
          .filter((p): p is YouthProgram => Boolean(p) && p.category === area.cat),
      }))
      .filter((g) => g.items.length > 0);
  }, [youthAreas, favorites.youth]);

  const schoolCount = schoolGroups.reduce((n, g) => n + g.items.length, 0);
  const youthCount = youthGroups.reduce((n, g) => n + g.items.length, 0);

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
        schoolGroups.length === 0 ? (
          <EmptyState
            emoji="🏫"
            title="아직 담은 학교가 없어요"
            hint="학교 유형(행성)을 고른 뒤, 학교 카드 오른쪽 ☆ 를 눌러 담아 보세요."
            actions={categories.slice(0, 4).map((c) => ({ key: c.id, label: `${c.emoji} ${c.name}`, color: c.color, onClick: () => onOpenCategory(c) }))}
          />
        ) : (
          <div className="space-y-3">
            {schoolGroups.map(({ category, items }) => (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[13px] font-black text-white px-2.5 py-1 rounded-lg" style={{ background: `linear-gradient(135deg, ${category.color}55, ${category.color}22)` }}>
                    {category.emoji} {category.name}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={pill(`${category.color}22`, category.color, `${category.color}55`)}>{items.length}개교</span>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${category.color}55, transparent)` }} />
                </div>
                <div className="space-y-2">
                  {items.map(({ school, addedAt }) => (
                    <SchoolListCard
                      key={school.id}
                      school={school}
                      categoryId={category.id}
                      categoryColor={category.color}
                      categoryBgColor={category.bgColor}
                      onClick={() => onSelectSchool(category, school)}
                      footer={<FavoriteSchoolFacts school={school} addedAt={addedAt} color={category.color} />}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'youth' && (
        youthGroups.length === 0 ? (
          <EmptyState
            emoji="🗓️"
            title="아직 담은 활동이 없어요"
            hint="청소년 활동 5대 영역에서 대회·캠프 카드의 ☆ 를 눌러 담아 보세요."
            actions={youthAreas.map((a) => ({ key: a.cat, label: `${a.emoji} ${a.label}`, color: a.color, onClick: () => onOpenYouthArea(a.cat) }))}
          />
        ) : (
          <div className="space-y-3">
            {youthGroups.map(({ area, items }) => (
              <div key={area.cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[13px] font-black text-white px-2.5 py-1 rounded-lg" style={{ background: `linear-gradient(135deg, ${area.color}55, ${area.color}22)` }}>
                    {area.emoji} {area.label}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={pill(`${area.color}22`, area.color, `${area.color}55`)}>{items.length}개</span>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${area.color}55, transparent)` }} />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {items.map((p) => <ProgramCard key={p.id} program={p} color={youthAreaColor(p.category)} />)}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <p className="text-[11px] text-white/40 leading-relaxed text-center px-2 pt-1">💾 즐겨찾기는 지금 쓰는 이 브라우저에 저장돼요.</p>
    </div>
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

/** 보관함 전용 한 줄 — 비교할 때 자주 보는 등록금·기숙사·지정 분야 + 담은 날짜 */
function FavoriteSchoolFacts({ school, addedAt, color }: { readonly school: HighSchoolDetail; readonly addedAt: string; readonly color: string }) {
  const added = formatAddedAt(addedAt);
  const facts: { key: string; label: string; value: string }[] = [];
  if (school.tuition) facts.push({ key: 'tuition', label: '💰 등록금', value: school.tuition });
  if (school.dormitory !== null && school.dormitory !== undefined) {
    facts.push({ key: 'dorm', label: '🏠 기숙사', value: school.dormitory ? '있음' : '없음 (통학)' });
  }
  if (school.specialCertification) facts.push({ key: 'cert', label: '🏅 지정', value: school.specialCertification });
  if (facts.length === 0 && !added) return null;
  return (
    <div className="px-3 pb-3 pt-2 space-y-1" style={{ background: `${color}0d`, borderTop: `1px dashed ${color}33` }}>
      {facts.map((f) => (
        <p key={f.key} className="text-[11.5px] leading-relaxed text-gray-300 flex gap-1.5">
          <span className="font-bold flex-shrink-0" style={{ color }}>{f.label}</span>
          <span className="min-w-0"><GlossaryText>{f.value}</GlossaryText></span>
        </p>
      ))}
      {added && <p className="text-[10.5px] text-yellow-200/60 text-right">⭐ {added}에 담음</p>}
    </div>
  );
}
