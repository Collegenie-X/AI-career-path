'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import youthData from '@/data/high-school/youth-programs.json';

type CategoryId = 'contest' | 'camp' | 'exhibition' | 'volunteer';
type Scope = 'domestic' | 'international';
type ViewMode = 'month' | 'region' | 'scope';

type Program = {
  id: string;
  name: string;
  host: string;
  category: CategoryId;
  scope: Scope;
  regionGroup: string;
  emoji?: string;
  grades: string;
  cost?: string;
  format?: string;
  months: number[];
  always?: boolean;
  when?: string;
  region?: string;
  url?: string;
  summary: string;
  goodFor?: string;
  prepare?: string;
  highlights?: string[];
  featured?: boolean;
};

type AreaGuide = {
  emoji: string;
  title: string;
  color: string;
  tagline: string;
  description: string;
  why: string;
  how: string[];
  gains: string[];
  perspective: string;
  recognition: string;
  yearCycle: { period: string; focus: string; picks: string[] }[];
  mustSee: string[];
};

type YouthData = {
  meta: { emoji: string; title: string; subtitle: string; description: string; asOf: string; factCheck: string };
  areaGuides: Record<string, AreaGuide>;
  programs: Program[];
};

const DATA = youthData as unknown as YouthData;

const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const REGION_ORDER = ['수도권', '충청', '영남', '호남', '강원·제주', '전국·온라인', '해외'];
const REGION_EMOJI: Record<string, string> = {
  수도권: '🏙️', 충청: '🏞️', 영남: '🌊', 호남: '🌾', '강원·제주': '⛰️', '전국·온라인': '🇰🇷', 해외: '🌍',
};
const VIEW_MODES: { id: ViewMode; label: string; emoji: string }[] = [
  { id: 'month', label: '월별', emoji: '📅' },
  { id: 'region', label: '지역별', emoji: '📍' },
  { id: 'scope', label: '국내·국외', emoji: '🌐' },
];
const SCOPE_META: Record<Scope, { flag: string; label: string; color: string }> = {
  domestic: { flag: '🇰🇷', label: '국내', color: '#60A5FA' },
  international: { flag: '🌍', label: '국외 · 전세계', color: '#34D399' },
};
const FORMAT_META: Record<string, { emoji: string; color: string }> = {
  온라인: { emoji: '💻', color: '#22D3EE' },
  오프라인: { emoji: '🏫', color: '#FB923C' },
  '온·오프': { emoji: '🔀', color: '#C084FC' },
};

function HL({ text }: { readonly text: string }) {
  const parts = text.split(/==(.+?)==/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm px-0.5 font-medium not-italic" style={{ background: 'rgba(250,204,21,0.14)', color: 'inherit' }}>{part}</mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function monthBadge(p: Program): string {
  if (p.always || p.months.length === 0) return '상시·연중';
  return `${[...p.months].sort((a, b) => a - b).join('·')}월`;
}
function firstMonth(p: Program): number {
  if (p.always || p.months.length === 0) return 99;
  return Math.min(...p.months);
}
const sortByMonth = (a: Program, b: Program) => firstMonth(a) - firstMonth(b) || a.name.localeCompare(b.name, 'ko');

function costTier(cost?: string): { label: string; color: string } {
  if (!cost) return { label: '확인 필요', color: '#94A3B8' };
  if (/무료|무상|정부지원|국가대표/.test(cost)) return { label: '무료', color: '#4ADE80' };
  if (/유료|응시료|참가비|자부담|\$|₩|€|원|장학/.test(cost)) return { label: '유료', color: '#FB7185' };
  return { label: cost, color: '#94A3B8' };
}

function BadgeRow({ program }: { readonly program: Program }) {
  const scope = SCOPE_META[program.scope];
  const fmt = program.format ? FORMAT_META[program.format] : undefined;
  const ct = costTier(program.cost);
  const pill = (bg: string, fg: string, bd: string) => ({ background: bg, color: fg, border: `1px solid ${bd}` }) as React.CSSProperties;
  return (
    <div className="flex flex-wrap items-center gap-1 mt-1.5">
      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={pill(`${scope.color}22`, scope.color, `${scope.color}55`)}>
        {scope.flag} {program.scope === 'domestic' ? '국내' : '국외'}
      </span>
      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={pill('rgba(148,163,184,0.16)', '#cbd5e1', 'rgba(148,163,184,0.35)')}>
        {REGION_EMOJI[program.regionGroup] ?? '📍'} {program.regionGroup}
      </span>
      {program.format && fmt && (
        <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={pill(`${fmt.color}22`, fmt.color, `${fmt.color}55`)}>
          {fmt.emoji} {program.format}
        </span>
      )}
      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={pill(`${ct.color}22`, ct.color, `${ct.color}55`)}>
        💰 {ct.label}
      </span>
    </div>
  );
}

function ProgramCard({ program, color }: { readonly program: Program; readonly color: string }) {
  const isLink = Boolean(program.url);
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {program.emoji && <span className="text-sm" aria-hidden>{program.emoji}</span>}
            <span className="text-[13px] font-bold text-white/95 leading-tight">{program.name}</span>
            {program.featured && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(250,204,21,0.18)', color: '#FDE047', border: '1px solid rgba(250,204,21,0.4)' }}>⭐ 추천</span>
            )}
          </div>
          <p className="text-[11px] text-white/55 leading-tight mt-1">{program.host}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>🗓️ {monthBadge(program)}</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>{program.grades}</span>
        </div>
      </div>

      <BadgeRow program={program} />

      <p className="text-[11.5px] text-white/70 leading-relaxed mt-1.5">{program.summary}</p>

      {(program.goodFor || program.prepare) && (
        <div className="mt-2 rounded-lg p-2 space-y-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {program.goodFor && (
            <p className="text-[11px] text-white/75 leading-relaxed">
              <span className="font-bold" style={{ color: '#4ADE80' }}>✅ 이런 점이 좋아요 </span>{program.goodFor}
            </p>
          )}
          {program.prepare && (
            <p className="text-[11px] text-white/75 leading-relaxed">
              <span className="font-bold" style={{ color: '#7DD3FC' }}>🧭 이렇게 준비 </span>{program.prepare}
            </p>
          )}
        </div>
      )}

      {program.highlights && program.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {program.highlights.map((h, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: `${color}14`, color: 'rgba(255,255,255,0.75)', border: `1px solid ${color}30` }}>{h}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap text-[10.5px] text-white/50">
          {program.when && <span>📅 {program.when}</span>}
          {program.region && <span>📍 {program.region}</span>}
        </div>
        {isLink && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 group-hover:underline" style={{ color, background: `${color}15`, border: `1px solid ${color}44` }}>공식 페이지 ↗</span>
        )}
      </div>
    </>
  );
  const cardClass = 'group block rounded-xl p-3 text-left transition-all hover:scale-[1.005] active:scale-[0.995]';
  const cardStyle: React.CSSProperties = {
    background: program.featured ? `linear-gradient(135deg, ${color}1f 0%, rgba(0,0,0,0.25) 100%)` : 'rgba(255,255,255,0.04)',
    border: `1px solid ${program.featured ? `${color}55` : `${color}2e`}`,
  };
  return isLink ? (
    <a href={program.url} target="_blank" rel="noopener noreferrer" className={cardClass} style={cardStyle}>{inner}</a>
  ) : (
    <div className={cardClass.replace('hover:scale-[1.005] active:scale-[0.995]', '')} style={cardStyle}>{inner}</div>
  );
}

type Section = { key: string; label: string; emoji?: string; color: string; items: Program[] };

function AccordionSection({ section, open, onToggle, cardColor, innerRef }: {
  readonly section: Section; readonly open: boolean; readonly onToggle: () => void; readonly cardColor: string; readonly innerRef?: (el: HTMLDivElement | null) => void;
}) {
  const { label, emoji, color, items } = section;
  return (
    <div ref={innerRef} className="scroll-mt-4">
      <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-2 mb-2 group/acc">
        <span className="text-[11px] text-white/50 w-3 flex-shrink-0 transition-transform duration-150" style={{ transform: open ? 'rotate(90deg)' : 'none' }} aria-hidden>▶</span>
        <span className="text-[13px] font-black text-white px-2.5 py-1 rounded-lg" style={{ background: `linear-gradient(135deg, ${color}55, ${color}22)` }}>{emoji ? `${emoji} ` : ''}{label}</span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>{items.length}개</span>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}55, transparent)` }} />
        <span className="text-[10px] text-white/40 flex-shrink-0 group-hover/acc:text-white/70">{open ? '접기 ▲' : '펼치기 ▼'}</span>
      </button>
      {open && (
        <div className="grid grid-cols-1 gap-2 mb-3">
          {items.map((p) => <ProgramCard key={p.id} program={p} color={cardColor} />)}
        </div>
      )}
    </div>
  );
}

/** 영역별 안내: 설명 · 관점 · 인정 포인트 · 1년 로드맵 · 꼭 봐야 할 추천 */
function AreaGuideIntro({ guide, total }: { readonly guide: AreaGuide; readonly total: number }) {
  const c = guide.color;
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${c}22 0%, rgba(15,23,42,0.5) 100%)`, border: `1px solid ${c}55` }}>
      {/* 타이틀 */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{guide.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-white leading-tight">{guide.title}</h3>
            <p className="text-[11px] font-semibold" style={{ color: c }}>{guide.tagline}</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${c}22`, color: c, border: `1px solid ${c}55` }}>{total}개</span>
        </div>
        <p className="text-xs text-white/75 leading-relaxed mt-2">{guide.description}</p>

        {/* 왜 · 어떻게 · 무엇 */}
        <div className="grid grid-cols-1 gap-2 mt-3">
          <div className="rounded-xl p-2.5" style={{ background: `${c}14`, border: `1px solid ${c}33` }}>
            <p className="text-[11px] font-bold text-white/90 mb-0.5">💡 왜 지금 챙겨야 할까</p>
            <p className="text-[11px] text-white/70 leading-relaxed">{guide.why}</p>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] font-bold text-white/90 mb-1">🧭 어떻게 준비할까</p>
            <ul className="space-y-0.5">
              {guide.how.map((h, i) => (
                <li key={i} className="text-[11px] text-white/70 leading-relaxed flex gap-1"><span style={{ color: c }}>{i + 1}.</span><span>{h}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] font-bold text-white/90 mb-1">🎁 무엇을 얻나</p>
            <div className="flex flex-wrap gap-1">
              {guide.gains.map((g2, i) => (
                <span key={i} className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: `${c}1f`, color: '#fff', border: `1px solid ${c}44` }}>{g2}</span>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] font-bold text-white/90 mb-0.5">🏅 인정 포인트 (고입 관점)</p>
            <p className="text-[11px] text-white/65 leading-relaxed">{guide.recognition}</p>
          </div>
        </div>

        {/* 꼭 봐야 할 추천 */}
        <div className="rounded-xl p-2.5 mt-2" style={{ background: `${c}18`, border: `1px solid ${c}44` }}>
          <p className="text-[11px] font-bold text-white/90 mb-1">⭐ 1년에 꼭 챙길 것</p>
          <ul className="space-y-0.5">
            {guide.mustSee.map((m, i) => (
              <li key={i} className="text-[11px] text-white/75 leading-relaxed flex gap-1"><span style={{ color: c }}>•</span><span>{m}</span></li>
            ))}
          </ul>
        </div>
      </div>

      {/* 1년 주기 로드맵 (접이식) */}
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-4 py-2 border-t" style={{ borderColor: `${c}33`, background: 'rgba(0,0,0,0.15)' }}>
        <span className="text-[12px] font-black text-white">🗓️ 1년 주기 로드맵</span>
        <span className="text-[10px] text-white/45">계절별 흐름</span>
        <div className="flex-1" />
        <span className="text-[11px] text-white/50">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-2">
          {guide.yearCycle.map((cyc, i) => (
            <div key={i} className="flex gap-2.5">
              <div className="flex flex-col items-center flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full mt-1" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
                {i < guide.yearCycle.length - 1 && <span className="w-px flex-1 mt-1" style={{ background: `${c}44` }} />}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-[12px] font-black text-white leading-tight">{cyc.period}</p>
                <p className="text-[11px] text-white/60 leading-relaxed mt-0.5">{cyc.focus}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {cyc.picks.map((pk, j) => (
                    <span key={j} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: `${c}1f`, color: '#fff', border: `1px solid ${c}44` }}>{pk}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 청소년 활동 — 한 영역(대회/캠프/전시회/봉사)만 담당.
 * 상단 영역 안내(설명·관점·인정·1년 로드맵) + 월별/지역별/국내외 아코디언 목록.
 * 대입 Admission2027View처럼 오른쪽 상세 패널에 렌더링된다.
 */
export function YouthProgramsView({ category }: { readonly category: CategoryId }) {
  const { meta, programs, areaGuides } = DATA;
  const guide = areaGuides[category];
  const activeColor = guide?.color ?? '#94A3B8';
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const inCat = useMemo(() => programs.filter((p) => p.category === category), [category, programs]);

  const monthCounts = useMemo(() => {
    const counts = new Array(13).fill(0);
    let always = 0;
    for (const p of inCat) {
      if (p.always || p.months.length === 0) { always += 1; continue; }
      for (const m of p.months) if (m >= 1 && m <= 12) counts[m] += 1;
    }
    return { counts, always };
  }, [inCat]);

  const sections: Section[] = useMemo(() => {
    if (viewMode === 'month') {
      const byMonth: Record<number, Program[]> = {};
      for (let m = 1; m <= 12; m += 1) byMonth[m] = [];
      const always: Program[] = [];
      for (const p of inCat) {
        if (p.always || p.months.length === 0) { always.push(p); continue; }
        for (const m of p.months) if (m >= 1 && m <= 12) byMonth[m].push(p);
      }
      const secs: Section[] = [];
      for (let m = 1; m <= 12; m += 1) if (byMonth[m].length) secs.push({ key: `m-${m}`, label: MONTH_LABELS[m - 1], color: activeColor, items: byMonth[m] });
      if (always.length) secs.push({ key: 'm-always', label: '상시 · 연중', emoji: '♾️', color: '#34D399', items: always });
      return secs;
    }
    if (viewMode === 'region') {
      return REGION_ORDER
        .map((r) => ({ key: `r-${r}`, label: r, emoji: REGION_EMOJI[r], color: activeColor, items: inCat.filter((p) => p.regionGroup === r).sort(sortByMonth) }))
        .filter((s) => s.items.length > 0);
    }
    return (['domestic', 'international'] as Scope[])
      .map((s) => ({ key: `s-${s}`, label: SCOPE_META[s].label, emoji: SCOPE_META[s].flag, color: SCOPE_META[s].color, items: inCat.filter((p) => p.scope === s).sort(sortByMonth) }))
      .filter((s) => s.items.length > 0);
  }, [viewMode, inCat, activeColor]);

  const orderedKeys = sections.map((s) => s.key);
  useEffect(() => {
    setOpenKeys(new Set(orderedKeys.slice(0, 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, viewMode]);

  const toggleSection = (key: string) => setOpenKeys((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const allOpen = orderedKeys.length > 0 && orderedKeys.every((k) => openKeys.has(k));
  const toggleAll = () => setOpenKeys(allOpen ? new Set() : new Set(orderedKeys));
  const jumpToMonth = (key: string) => {
    setOpenKeys((prev) => new Set(prev).add(key));
    requestAnimationFrame(() => sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  if (!guide) return null;

  return (
    <div className="px-4 pb-6 pt-3 space-y-4">
      {/* 영역 안내 (설명·관점·인정·1년 로드맵·추천) */}
      <AreaGuideIntro guide={guide} total={inCat.length} />

      {/* 보기 방식 + 모두 펼치기/접기 */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {VIEW_MODES.map((v) => {
            const on = viewMode === v.id;
            return (
              <button key={v.id} onClick={() => setViewMode(v.id)} className="text-[11.5px] font-bold px-3 py-1.5 rounded-lg transition-all" style={on ? { background: 'rgba(255,255,255,0.92)', color: '#0f172a' } : { background: 'transparent', color: 'rgba(255,255,255,0.65)' }}>
                {v.emoji} {v.label}
              </button>
            );
          })}
        </div>
        <button onClick={toggleAll} className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
          {allOpen ? '모두 접기 ▲' : '모두 펼치기 ▼'}
        </button>
      </div>

      {/* 월별: 빠른 이동 (개수 배지) */}
      {viewMode === 'month' && (
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
          {MONTH_LABELS.map((lbl, i) => {
            const m = i + 1;
            const cnt = monthCounts.counts[m];
            if (!cnt) return null;
            return (
              <button key={m} onClick={() => jumpToMonth(`m-${m}`)} className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)', color: '#c7d2fe', border: '1px solid rgba(129,140,248,0.3)' }}>
                {lbl}<span className="text-[9px] font-black px-1 rounded-full" style={{ background: 'rgba(129,140,248,0.5)', color: '#fff' }}>{cnt}</span>
              </button>
            );
          })}
          {monthCounts.always > 0 && (
            <button onClick={() => jumpToMonth('m-always')} className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>
              상시<span className="text-[9px] font-black px-1 rounded-full" style={{ background: 'rgba(16,185,129,0.5)', color: '#fff' }}>{monthCounts.always}</span>
            </button>
          )}
        </div>
      )}

      {/* 아코디언 섹션 */}
      {sections.length === 0 ? (
        <p className="text-center text-xs text-white/45 py-8">해당 분류의 프로그램이 없어요.</p>
      ) : (
        sections.map((s) => (
          <AccordionSection key={s.key} section={s} open={openKeys.has(s.key)} onToggle={() => toggleSection(s.key)} cardColor={activeColor} innerRef={(el) => { sectionRefs.current[s.key] = el; }} />
        ))
      )}

      <p className="text-[11px] text-white/40 leading-relaxed text-center px-2 pt-1">⚠️ {meta.factCheck}</p>
    </div>
  );
}
