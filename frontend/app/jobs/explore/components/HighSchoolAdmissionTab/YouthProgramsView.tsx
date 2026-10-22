'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import youthData from '@/data/high-school/youth-programs.json';
import { FavoriteStar } from './FavoriteStar';
import { toggleFavoriteYouth, useHighSchoolFavorites } from './favorites-storage';

type CategoryId = 'contest' | 'camp' | 'bigtech' | 'exhibition' | 'volunteer';
type Scope = 'domestic' | 'international';
type ViewMode = 'guide' | 'field' | 'month' | 'region' | 'scope';

export type YouthProgram = Program;
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
  status2026?: Status2026;
  /** 대회 영상(유튜브 watch 링크) — 근거 옆에 '영상 ▶'으로 연다 */
  videoUrl?: string;
  /** 중·고 청소년 참여 가능 여부 — 없으면 'ok'(원래 청소년 대상 목록) */
  youth?: Youth;
  /** 세부 분야 (과학·AI·디자인 등) — fields[]의 id */
  field?: string;
  /** 이 프로그램을 다룬 언론 기사 */
  articleUrl?: string;
  articleTitle?: string;
  /** 접수처: 실제로 신청·가입하는 페이지 */
  applyUrl?: string;
  applyLabel?: string;
  applyKind?: ApplyKind;
  /** 참여 방법 한 줄 (예: '개인 지원 · 아이디어 영상 제출') */
  joinHint?: string;
  /** 중학생 참가 제한 안내 (고교 전용·대학생 전용 등) */
  youthNote?: string;
};

type ApplyKind = 'apply' | 'notice' | 'program' | 'school' | 'homepage';
const APPLY_KIND_LABEL: Record<ApplyKind, string> = {
  apply: '바로 신청',
  notice: '모집 공고',
  program: '프로그램 안내',
  school: '학교 통해 참여',
  homepage: '기관 홈페이지',
};

type Field = { id: string; label: string; emoji: string; color: string };

type Youth = 'ok' | 'no' | 'check';

type StatusState = 'confirmed' | 'expected' | 'paused' | 'unverified';
/** 2026년 운영 여부 — 웹 검색으로 확인한 근거(sourceUrl)와 함께 기록 */
type Status2026 = { state: StatusState; note: string; sourceUrl?: string | null; checked?: string };

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
  yearCycle: { period: string; focus: string; months: number[]; pickIds: string[] }[];
  mustSee: string[];
};

type YouthData = {
  meta: { emoji: string; title: string; subtitle: string; description: string; asOf: string; factCheck: string };
  areaGuides: Record<string, AreaGuide>;
  fields?: Field[];
  programs: Program[];
};

const DATA = youthData as unknown as YouthData;
const PROGRAM_BY_ID: Record<string, Program> = Object.fromEntries(DATA.programs.map((p) => [p.id, p]));
const FIELDS: Field[] = DATA.fields ?? [];
/** 즐겨찾기 화면에서 id로 프로그램과 영역 색을 찾는다 */
export const YOUTH_PROGRAM_BY_ID = PROGRAM_BY_ID;
export const youthAreaColor = (cat: CategoryId) => DATA.areaGuides[cat]?.color ?? '#94A3B8';
const FIELD_BY_ID: Record<string, Field> = Object.fromEntries(FIELDS.map((f) => [f.id, f]));

const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const REGION_ORDER = ['수도권', '충청', '영남', '호남', '강원·제주', '전국·온라인', '해외'];
const REGION_EMOJI: Record<string, string> = {
  수도권: '🏙️', 충청: '🏞️', 영남: '🌊', 호남: '🌾', '강원·제주': '⛰️', '전국·온라인': '🇰🇷', 해외: '🌍',
};
const VIEW_MODES: { id: ViewMode; label: string; emoji: string }[] = [
  { id: 'guide', label: '준비 커리큘럼', emoji: '🗺️' },
  { id: 'field', label: '분야별', emoji: '🧩' },
  { id: 'month', label: '월별', emoji: '📅' },
  { id: 'region', label: '지역별', emoji: '📍' },
  { id: 'scope', label: '국내·국외', emoji: '🌐' },
];
const SCOPE_META: Record<Scope, { flag: string; label: string; color: string }> = {
  domestic: { flag: '🇰🇷', label: '국내', color: '#60A5FA' },
  international: { flag: '🌍', label: '국외 · 전세계', color: '#34D399' },
};
const STATUS_META: Record<StatusState, { emoji: string; label: string; color: string }> = {
  confirmed: { emoji: '✅', label: '2026 운영 확인', color: '#4ADE80' },
  expected: { emoji: '🕐', label: '2026 공고 대기', color: '#FBBF24' },
  paused: { emoji: '⛔', label: '2026 미운영', color: '#F87171' },
  unverified: { emoji: '❔', label: '운영 확인 필요', color: '#94A3B8' },
};
const YOUTH_META: Record<Youth, { emoji: string; label: string; color: string }> = {
  ok: { emoji: '🙋', label: '청소년 참여 가능', color: '#FACC15' },
  check: { emoji: '❓', label: '청소년 참여 확인 필요', color: '#94A3B8' },
  no: { emoji: '🚫', label: '대학생·성인 전용', color: '#F87171' },
};
const youthOf = (p: Program): Youth => p.youth ?? 'ok';

/** 청소년 참여 가능 여부 — 이름 옆에 크게. 가능하면 노란 빛으로 강조 */
function YouthBadge({ program, size = 'md' }: { readonly program: Program; readonly size?: 'sm' | 'md' }) {
  const y = youthOf(program);
  const m = YOUTH_META[y];
  const text = size === 'md' ? 'text-[11px] px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5';
  const style: React.CSSProperties = y === 'ok'
    ? { background: 'linear-gradient(135deg, rgba(250,204,21,0.32) 0%, rgba(251,146,60,0.26) 100%)', color: '#FEF08A', border: '1px solid rgba(250,204,21,0.7)', boxShadow: '0 0 10px rgba(250,204,21,0.35)' }
    : pill(`${m.color}1f`, m.color, `${m.color}66`);
  return (
    <span className={`${text} font-extrabold rounded-full whitespace-nowrap flex-shrink-0`} style={style}>
      {m.emoji} {m.label}
    </span>
  );
}

const STATUS_ORDER: StatusState[] = ['confirmed', 'expected', 'unverified', 'paused'];

function FieldBadge({ field, className }: { readonly field?: string; readonly className: string }) {
  const f = field ? FIELD_BY_ID[field] : undefined;
  if (!f) return null;
  return <span className={className} style={pill(`${f.color}1f`, f.color, `${f.color}55`)}>{f.emoji} {f.label}</span>;
}

function StatusBadge({ status, className }: { readonly status?: Status2026; readonly className: string }) {
  if (!status) return null;
  const m = STATUS_META[status.state];
  return (
    <span className={className} style={pill(`${m.color}1f`, m.color, `${m.color}55`)} title={status.note}>
      {m.emoji} {m.label}
    </span>
  );
}

/** 운영 여부 근거 한 줄 — 카드가 링크(<a>)라서 근거 링크는 버튼으로 새 탭을 연다 */
function StatusNote({ status, videoUrl }: { readonly status?: Status2026; readonly videoUrl?: string }) {
  if (!status) return null;
  const m = STATUS_META[status.state];
  const src = status.sourceUrl;
  const openUrl = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const openSource = src ? openUrl(src) : () => {};
  return (
    <p className="text-[10.5px] leading-relaxed mt-1.5 flex items-start gap-1" style={{ color: `${m.color}dd` }}>
      <span aria-hidden>{m.emoji}</span>
      <span className="flex-1 min-w-0">
        {status.note}
        {src && (
          <span role="link" tabIndex={0} onClick={openSource} onKeyDown={(e) => { if (e.key === 'Enter') openSource(e as unknown as React.MouseEvent); }} className="ml-1 underline cursor-pointer opacity-80 hover:opacity-100">
            근거 ↗
          </span>
        )}
        {videoUrl && (
          <span role="link" tabIndex={0} onClick={openUrl(videoUrl)} onKeyDown={(e) => { if (e.key === 'Enter') openUrl(videoUrl)(e as unknown as React.MouseEvent); }} className="ml-1 underline cursor-pointer opacity-80 hover:opacity-100">
            영상 ▶
          </span>
        )}
      </span>
    </p>
  );
}

/** 카드를 누르면 가는 곳 — 접수처가 있으면 접수처, 없으면 요강 */
const primaryUrl = (p: Program) => p.applyUrl ?? p.url;

/** 접수처 · 요강 · 기사 링크 — 카드가 링크(<a>)라서 버튼으로 새 탭을 연다 */
function ProgramLinks({ program, color }: { readonly program: Program; readonly color: string }) {
  const guideUrl = program.url && program.url !== program.applyUrl ? program.url : undefined;
  if (!program.applyUrl && !program.articleUrl && !program.joinHint && !program.youthNote) return null;
  const open = (url: string) => (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const btn = (url: string, title: string, sub: string | undefined, style: React.CSSProperties, grow = 'flex-1') => (
    <span
      role="link"
      tabIndex={0}
      onClick={open(url)}
      onKeyDown={(e) => { if (e.key === 'Enter') open(url)(e); }}
      className={`${grow} min-w-0 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold cursor-pointer hover:brightness-125`}
      style={style}
    >
      <span className="block">{title}</span>
      {sub && <span className="block text-[10px] font-bold text-white/65 leading-snug">{sub}</span>}
    </span>
  );
  const kind = program.applyKind ? ` · ${APPLY_KIND_LABEL[program.applyKind]}` : '';
  const applyTitle = program.applyKind === 'school' ? `🏫 참여 방법 보기${kind} ↗` : `📝 접수처로 가기${kind} ↗`;
  const neutral = pill('rgba(255,255,255,0.05)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.14)');
  return (
    <div className="mt-2 space-y-1.5">
      {program.joinHint && (
        <p className="text-[11px] font-bold leading-snug" style={{ color }}>🙋 참여 방법 · <span className="text-white/85">{program.joinHint}</span></p>
      )}
      {program.youthNote && (
        <p className="text-[11px] font-bold leading-snug rounded-md px-2 py-1" style={pill('rgba(251,146,60,0.12)', '#FDBA74', 'rgba(251,146,60,0.35)')}>⚠️ 중학생은 · <span className="text-white/85">{program.youthNote}</span></p>
      )}
      {program.applyUrl && btn(program.applyUrl, applyTitle, program.applyLabel, pill(`${color}26`, color, `${color}80`), 'block w-full')}
      {(guideUrl || program.articleUrl) && (
        <div className="flex flex-col sm:flex-row gap-1.5">
          {guideUrl && btn(guideUrl, '📄 요강·소개 보기 ↗', undefined, neutral)}
          {program.articleUrl && btn(program.articleUrl, '📰 기사 보기 ↗', program.articleTitle, pill('rgba(56,189,248,0.1)', '#7DD3FC', 'rgba(56,189,248,0.3)'))}
        </div>
      )}
    </div>
  );
}

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

const pill = (bg: string, fg: string, bd: string) => ({ background: bg, color: fg, border: `1px solid ${bd}` }) as React.CSSProperties;

function BadgeRow({ program }: { readonly program: Program }) {
  const scope = SCOPE_META[program.scope];
  const fmt = program.format ? FORMAT_META[program.format] : undefined;
  const ct = costTier(program.cost);
  return (
    <div className="flex flex-wrap items-center gap-1 mt-1.5">
      <StatusBadge status={program.status2026} className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" />
      <FieldBadge field={program.field} className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" />
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

/** 로드맵·목록용 상세 뱃지 (시기 · 형식 · 지역 · 주최 · 대상 · 비용) */
function MiniBadges({ program }: { readonly program: Program }) {
  const scope = SCOPE_META[program.scope];
  const fmt = program.format ? FORMAT_META[program.format] : undefined;
  const ct = costTier(program.cost);
  const cls = 'text-[9.5px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap';
  const neutral = pill('rgba(255,255,255,0.06)', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.13)');
  return (
    <div className="flex flex-wrap items-center gap-1 mt-1.5">
      <StatusBadge status={program.status2026} className={cls} />
      <FieldBadge field={program.field} className={cls} />
      <span className={cls} style={pill('rgba(250,204,21,0.14)', '#FDE68A', 'rgba(250,204,21,0.32)')}>🗓️ {monthBadge(program)}</span>
      {program.format && fmt && (
        <span className={cls} style={pill(`${fmt.color}22`, fmt.color, `${fmt.color}55`)}>{fmt.emoji} {program.format}</span>
      )}
      <span className={cls} style={pill('rgba(148,163,184,0.16)', '#cbd5e1', 'rgba(148,163,184,0.35)')}>
        {REGION_EMOJI[program.regionGroup] ?? '📍'} {program.regionGroup}
      </span>
      <span className={cls} style={pill(`${scope.color}1a`, scope.color, `${scope.color}44`)}>
        {scope.flag} {program.scope === 'domestic' ? '국내' : '국외'}
      </span>
      <span className={cls} style={neutral}>🏛️ {program.host}</span>
      <span className={cls} style={neutral}>🎓 {program.grades}</span>
      <span className={cls} style={pill(`${ct.color}1f`, ct.color, `${ct.color}4d`)}>💰 {ct.label}</span>
      {program.region && <span className={cls} style={neutral}>📌 {program.region}</span>}
    </div>
  );
}

function ProgramFavoriteStar({ program, size = 'sm' }: { readonly program: Program; readonly size?: 'sm' | 'md' }) {
  const { isYouthFavorite } = useHighSchoolFavorites();
  return (
    <FavoriteStar
      active={isYouthFavorite(program.id)}
      onToggle={() => toggleFavoriteYouth(program.id)}
      label={program.name}
      size={size}
    />
  );
}

/** 로드맵 안에서 프로그램 하나 — 누르면 접수처(없으면 공식 페이지)로 이동 */
function RoadmapProgramRow({ program, color, detailed = false }: {
  readonly program: Program; readonly color: string; readonly detailed?: boolean;
}) {
  const href = primaryUrl(program);
  const isLink = Boolean(href);
  const inner = (
    <>
      <div className="flex items-start gap-1.5">
        {program.emoji && <span className="text-[13px] leading-none mt-[1px]" aria-hidden>{program.emoji}</span>}
        <span className="text-[12px] font-bold text-white/95 leading-snug flex-1 min-w-0 group-hover:underline">{program.name}</span>
        <YouthBadge program={program} size="sm" />
        {program.featured && (
          <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={pill('rgba(250,204,21,0.18)', '#FDE047', 'rgba(250,204,21,0.4)')}>⭐ 추천</span>
        )}
        {isLink && (
          <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={pill(`${color}1f`, color, `${color}4d`)}>{program.applyUrl ? (program.applyKind === 'school' ? '참여 방법 ↗' : '접수처 ↗') : '바로가기 ↗'}</span>
        )}
        <ProgramFavoriteStar program={program} />
      </div>
      <MiniBadges program={program} />
      {detailed && (
        <p className="text-[10.5px] text-white/60 leading-relaxed mt-1.5" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {program.summary}
        </p>
      )}
      {detailed && program.when && <p className="text-[10px] text-white/45 leading-tight mt-1">📅 {program.when}</p>}
      {detailed && <StatusNote status={program.status2026} videoUrl={program.videoUrl} />}
      {detailed && <ProgramLinks program={program} color={color} />}
    </>
  );
  const cls = 'group block w-full text-left rounded-xl p-2.5 transition-all hover:bg-white/[0.07]';
  const style: React.CSSProperties = { background: 'rgba(255,255,255,0.035)', border: `1px solid ${color}2e` };
  return isLink ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>{inner}</a>
  ) : (
    <div className={cls.replace(' hover:bg-white/[0.07]', '')} style={style}>{inner}</div>
  );
}

/** 1년 로드맵의 계절 한 칸 — 추천 프로그램 + 같은 시기 나머지 프로그램 더보기 */
function YearCycleBlock({ cycle, color, categoryPrograms, isLast }: {
  readonly cycle: AreaGuide['yearCycle'][number];
  readonly color: string;
  readonly categoryPrograms: Program[];
  readonly isLast: boolean;
}) {
  const [showMore, setShowMore] = useState(false);
  const picks = cycle.pickIds.map((id) => PROGRAM_BY_ID[id]).filter(Boolean);
  const pickIdSet = new Set(cycle.pickIds);
  const inPeriod = (p: Program) => (
    cycle.months.length === 0
      ? Boolean(p.always) || p.months.length === 0
      : p.months.some((m) => cycle.months.includes(m))
  );
  const more = categoryPrograms.filter((p) => !pickIdSet.has(p.id) && inPeriod(p)).sort(sortByMonth);

  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center flex-shrink-0">
        <span className="w-2.5 h-2.5 rounded-full mt-1" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        {!isLast && <span className="w-px flex-1 mt-1" style={{ background: `${color}44` }} />}
      </div>
      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-[12px] font-black text-white leading-tight">{cycle.period}</p>
          <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={pill(`${color}1f`, color, `${color}44`)}>
            {picks.length + more.length}개
          </span>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed mt-0.5">{cycle.focus}</p>

        <div className="grid grid-cols-1 gap-1.5 mt-2">
          {picks.map((p) => <RoadmapProgramRow key={p.id} program={p} color={color} detailed />)}
        </div>

        {more.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              aria-expanded={showMore}
              className="mt-1.5 text-[10.5px] font-bold px-2 py-1 rounded-lg transition-all"
              style={pill('rgba(255,255,255,0.05)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0.12)')}
            >
              {showMore ? '이 시기 다른 프로그램 접기 ▲' : `이 시기 다른 프로그램 ${more.length}개 더 보기 ▼`}
            </button>
            {showMore && (
              <div className="grid grid-cols-1 gap-1.5 mt-1.5">
                {more.map((p) => <RoadmapProgramRow key={p.id} program={p} color={color} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function ProgramCard({ program, color }: { readonly program: Program; readonly color: string }) {
  const href = primaryUrl(program);
  const isLink = Boolean(href);
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {program.emoji && <span className="text-sm" aria-hidden>{program.emoji}</span>}
            <span className="text-[13px] font-bold text-white/95 leading-tight">{program.name}</span>
            <YouthBadge program={program} />
            {program.featured && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(250,204,21,0.18)', color: '#FDE047', border: '1px solid rgba(250,204,21,0.4)' }}>⭐ 추천</span>
            )}
          </div>
          <p className="text-[11px] text-white/55 leading-tight mt-1">{program.host}</p>
        </div>
        <ProgramFavoriteStar program={program} size="md" />
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>🗓️ {monthBadge(program)}</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>{program.grades}</span>
        </div>
      </div>

      <BadgeRow program={program} />

      <p className="text-[11.5px] text-white/70 leading-relaxed mt-1.5">{program.summary}</p>
      <StatusNote status={program.status2026} videoUrl={program.videoUrl} />
      <ProgramLinks program={program} color={color} />

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
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 group-hover:underline" style={{ color, background: `${color}15`, border: `1px solid ${color}44` }}>{program.applyUrl ? (program.applyKind === 'school' ? '참여 방법 ↗' : '접수처 ↗') : '요강·자료 보기 ↗'}</span>
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
    <a href={href} target="_blank" rel="noopener noreferrer" className={cardClass} style={cardStyle}>{inner}</a>
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
function AreaGuideIntro({ guide, programs }: { readonly guide: AreaGuide; readonly programs: Program[] }) {
  const c = guide.color;
  const [open, setOpen] = useState(true);
  // 계절 로드맵 + (상시 프로그램이 따로 남으면) 연중 상시 칸을 마지막에 붙인다
  const cycles = useMemo(() => {
    const hasAlwaysCycle = guide.yearCycle.some((cyc) => cyc.months.length === 0);
    const alwaysCount = programs.filter((p) => p.always || p.months.length === 0).length;
    if (hasAlwaysCycle || alwaysCount === 0) return guide.yearCycle;
    return [
      ...guide.yearCycle,
      { period: '♾️ 상시 · 연중', focus: '모집 시기 없이 아무 때나 시작할 수 있는 온라인 교육·플랫폼이에요.', months: [], pickIds: [] },
    ];
  }, [guide.yearCycle, programs]);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${c}22 0%, rgba(15,23,42,0.5) 100%)`, border: `1px solid ${c}55` }}>
      <div className="p-4">
        <p className="text-[13px] font-black text-white mb-1">🗺️ {guide.title} 준비 커리큘럼</p>
        <p className="text-xs text-white/75 leading-relaxed">{guide.description}</p>

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
        <div className="px-4 pb-4 pt-3 space-y-1">
          {cycles.map((cyc, i) => (
            <YearCycleBlock
              key={cyc.period}
              cycle={cyc}
              color={c}
              categoryPrograms={programs}
              isLast={i === cycles.length - 1}
            />
          ))}
          <p className="text-[10.5px] text-white/40 leading-relaxed pt-1">💡 프로그램을 누르면 공식 페이지가 새 탭으로 열려요.</p>
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
  // 진입 시 준비 커리큘럼(생애주기 로드맵)을 먼저 보여주고, 탭으로 목록 보기로 이동
  const [viewMode, setViewMode] = useState<ViewMode>('guide');
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [onlyConfirmed, setOnlyConfirmed] = useState(false);
  const [onlyYouth, setOnlyYouth] = useState(false);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const allInCat = useMemo(() => programs.filter((p) => p.category === category), [category, programs]);
  useEffect(() => { setFieldFilter(null); }, [category]);
  const statusCounts = useMemo(() => {
    const c: Partial<Record<StatusState, number>> = {};
    for (const p of allInCat) if (p.status2026) c[p.status2026.state] = (c[p.status2026.state] ?? 0) + 1;
    return c;
  }, [allInCat]);
  const hasStatus = Object.keys(statusCounts).length > 0;
  const youthOkCount = useMemo(() => allInCat.filter((p) => youthOf(p) === 'ok').length, [allInCat]);
  const hasNonYouth = youthOkCount < allInCat.length;
  // 목록 보기에서만 '2026 운영 확인' 필터 적용 (준비 커리큘럼은 전체 유지)
  // 이 영역에 실제로 쓰인 분야만 칩으로 노출 (개수 포함)
  const fieldCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of allInCat) if (p.field && FIELD_BY_ID[p.field]) c[p.field] = (c[p.field] ?? 0) + 1;
    return c;
  }, [allInCat]);
  const usedFields = FIELDS.filter((f) => fieldCounts[f.id]);
  const inCat = useMemo(() => {
    if (viewMode === 'guide') return allInCat;
    return allInCat.filter((p) => (
      (!onlyConfirmed || p.status2026?.state === 'confirmed')
      && (!onlyYouth || youthOf(p) === 'ok')
      && (!fieldFilter || p.field === fieldFilter)
    ));
  }, [allInCat, onlyConfirmed, onlyYouth, fieldFilter, viewMode]);

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
    if (viewMode === 'guide') return [];
    if (viewMode === 'field') {
      const secs: Section[] = FIELDS
        .map((f) => ({ key: `f-${f.id}`, label: f.label, emoji: f.emoji, color: f.color, items: inCat.filter((p) => p.field === f.id).sort(sortByMonth) }))
        .filter((sec) => sec.items.length > 0);
      const etc = inCat.filter((p) => !p.field || !FIELD_BY_ID[p.field]).sort(sortByMonth);
      if (etc.length) secs.push({ key: 'f-etc', label: '기타', emoji: '📦', color: activeColor, items: etc });
      return secs;
    }
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
      .map((s) => ({
        key: `s-${s}`,
        label: category === 'bigtech' ? (s === 'domestic' ? '국내 기업' : '글로벌 빅테크') : SCOPE_META[s].label,
        emoji: SCOPE_META[s].flag,
        color: SCOPE_META[s].color,
        items: inCat.filter((p) => p.scope === s).sort(sortByMonth),
      }))
      .filter((s) => s.items.length > 0);
  }, [viewMode, inCat, activeColor, category]);

  const orderedKeys = sections.map((s) => s.key);
  useEffect(() => {
    setOpenKeys(new Set(orderedKeys.slice(0, 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, viewMode, onlyConfirmed, onlyYouth, fieldFilter]);

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
      {/* 컴팩트 영역 헤더 (항상 표시) */}
      <div className="flex items-center gap-2 rounded-2xl p-3" style={{ background: `linear-gradient(135deg, ${activeColor}22 0%, rgba(15,23,42,0.5) 100%)`, border: `1px solid ${activeColor}55` }}>
        <span className="text-2xl" aria-hidden>{guide.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-white leading-tight">{guide.title}</h3>
          <p className="text-[11px] font-semibold" style={{ color: activeColor }}>{guide.tagline}</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${activeColor}22`, color: activeColor, border: `1px solid ${activeColor}55` }}>{allInCat.length}개</span>
      </div>

      {/* 2026 운영 여부 요약 (웹 검색 확인 기준) */}
      {hasStatus && (
        <div className="flex flex-wrap items-center gap-1 -mt-2">
          <span className="text-[10px] text-white/45 mr-0.5">2026 운영 체크</span>
          {STATUS_ORDER.filter((st) => statusCounts[st]).map((st) => {
            const m = STATUS_META[st];
            return (
              <span key={st} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={pill(`${m.color}1a`, m.color, `${m.color}44`)}>
                {m.emoji} {m.label} {statusCounts[st]}
              </span>
            );
          })}
        </div>
      )}

      {/* 탭: 준비 커리큘럼 + 목록 보기(월별/지역별/국내외) */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {VIEW_MODES.filter((v) => v.id !== 'field' || usedFields.length > 0).map((v) => {
            const on = viewMode === v.id;
            const isGuide = v.id === 'guide';
            return (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className="text-[11.5px] font-bold px-3 py-1.5 rounded-lg transition-all"
                style={
                  on
                    ? { background: isGuide ? activeColor : 'rgba(255,255,255,0.92)', color: '#0f172a' }
                    : { background: isGuide ? `${activeColor}1f` : 'transparent', color: isGuide ? activeColor : 'rgba(255,255,255,0.65)' }
                }
              >
                {v.emoji} {v.label}
              </button>
            );
          })}
        </div>
        {viewMode !== 'guide' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {hasNonYouth && (
              <button
                type="button"
                onClick={() => setOnlyYouth((v) => !v)}
                aria-pressed={onlyYouth}
                className="text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg transition-all"
                style={onlyYouth
                  ? { background: 'linear-gradient(135deg, rgba(250,204,21,0.35) 0%, rgba(251,146,60,0.3) 100%)', color: '#FEF08A', border: '1px solid rgba(250,204,21,0.75)', boxShadow: '0 0 10px rgba(250,204,21,0.35)' }
                  : pill('rgba(250,204,21,0.1)', '#FDE68A', 'rgba(250,204,21,0.35)')}
              >
                🙋 청소년 가능만 {youthOkCount}
              </button>
            )}
            {hasStatus && (
              <button
                type="button"
                onClick={() => setOnlyConfirmed((v) => !v)}
                aria-pressed={onlyConfirmed}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                style={onlyConfirmed ? pill('rgba(74,222,128,0.22)', '#4ADE80', 'rgba(74,222,128,0.55)') : pill('rgba(255,255,255,0.06)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.12)')}
              >
                ✅ 2026 확인만
              </button>
            )}
            <button onClick={toggleAll} className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
              {allOpen ? '모두 접기 ▲' : '모두 펼치기 ▼'}
            </button>
          </div>
        )}
      </div>

      {/* 분야 칩 필터 (목록 보기에서만) */}
      {viewMode !== 'guide' && usedFields.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setFieldFilter(null)}
            aria-pressed={fieldFilter === null}
            className="text-[10.5px] font-bold px-2 py-1 rounded-lg transition-all"
            style={fieldFilter === null ? pill('rgba(255,255,255,0.92)', '#0f172a', 'rgba(255,255,255,0.92)') : pill('rgba(255,255,255,0.05)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0.12)')}
          >
            전체 {allInCat.length}
          </button>
          {usedFields.map((f) => {
            const on = fieldFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFieldFilter(on ? null : f.id)}
                aria-pressed={on}
                className="text-[10.5px] font-bold px-2 py-1 rounded-lg transition-all"
                style={on ? pill(`${f.color}40`, '#fff', f.color) : pill(`${f.color}14`, f.color, `${f.color}44`)}
              >
                {f.emoji} {f.label} {fieldCounts[f.id]}
              </button>
            );
          })}
        </div>
      )}

      {/* 준비 커리큘럼 탭 (생애주기 로드맵) */}
      {viewMode === 'guide' && <AreaGuideIntro guide={guide} programs={inCat} />}

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

      {/* 아코디언 섹션 (목록 보기에서만) */}
      {viewMode !== 'guide' && (sections.length === 0 ? (
        <p className="text-center text-xs text-white/45 py-8">해당 분류의 프로그램이 없어요.</p>
      ) : (
        sections.map((s) => (
          <AccordionSection key={s.key} section={s} open={openKeys.has(s.key)} onToggle={() => toggleSection(s.key)} cardColor={activeColor} innerRef={(el) => { sectionRefs.current[s.key] = el; }} />
        ))
      ))}

      <p className="text-[11px] text-white/40 leading-relaxed text-center px-2 pt-1">⚠️ {meta.factCheck}</p>
    </div>
  );
}
