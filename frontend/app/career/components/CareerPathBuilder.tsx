'use client';

import { useState, useRef, useMemo, type CSSProperties } from 'react';
import {
  X, ChevronRight, ChevronLeft, Check, Plus, Trash2,
  Wand2, Pencil, Target, Lightbulb, Sparkles,
  Calendar, ArrowRight,
  CheckCircle2, ChevronDown, ChevronUp, Flame,
  FileText, DollarSign, Building2, Search, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ITEM_TYPES, GRADE_YEARS, SEMESTER_OPTIONS, CAREER_PATH_BUILDER_DIALOG, GOAL_TEMPLATE_SELECTOR_DIALOG, LABELS } from '../config';
import { CAREER_PATH_NESTED_OVERLAY_Z_INDEX } from './expandable-detail/careerPathExpandDialog.constants';
import { CareerPathBuilderDawnSky } from './CareerPathBuilderDawnSky';
import type { ShareType, ShareChannel } from './community/types';
import careerMaker from '@/data/career-maker.json';
import { loadKingdomJobsByKingdomId, type JobData } from '@/lib/data/loadAllKingdomJobs';
import portfolioItems from '@/data/portfolio-items.json';
import goalRecommendedItems from '@/data/goal-recommended-items.json';
import { GoalTemplateSelector } from './GoalTemplateSelector';
import { CareerPathTimelinePreview } from './CareerPathTimelinePreview';
import { buildStructuredCareerItem, type CareerItemCategoryTag, type CareerActivitySubtype, type CareerItemLink } from '@/data/path-templates/career-item-structure';

/* ─── Types ─── */
export type ItemType = 'activity' | 'award' | 'portfolio' | 'certification';

/** 빌더에서 다루는 직업 표시용 최소 형태 (전체 카탈로그·대표 직업 공통) */
type BuilderJob = { id: string; name: string; icon: string; description: string };

/** 학기 옵션: both=통합, first=1학기, second=2학기, split=분리, ''=미선택 */
export type SemesterOption = 'both' | 'first' | 'second' | 'split' | '';

/** 활동 하위의 작은 실행 단위 */
export type SubItem = {
  id: string;
  title: string;
  done?: boolean;
  url?: string;
  description?: string;
};

export type PlanItem = {
  id: string;
  type: ItemType;
  title: string;
  months: number[];
  difficulty: number;
  cost: string;
  organizer: string;
  url?: string;
  links?: CareerItemLink[];
  description?: string;
  categoryTags?: CareerItemCategoryTag[];
  activitySubtype?: CareerActivitySubtype;
  custom?: boolean;
  /** 서버 is_done — 타임라인·체크리스트 상위 항목 완료 */
  checked?: boolean;
  /** 이 활동을 구성하는 하위 실행 항목들 */
  subItems?: SubItem[];
};

/** 목표 하나 + 그 목표에 연결된 세부활동 묶음 */
export type GoalActivityGroup = {
  id: string;
  goal: string;
  items: PlanItem[];
  isExpanded?: boolean;
};

/** 학기별 계획 단위 */
export type SemesterPlan = {
  semesterId: 'first' | 'second';
  semesterLabel: string;
  goalGroups: GoalActivityGroup[];
  ungroupedItems: PlanItem[];
};

export type PlanGroup = {
  id: string;
  label: string;
  items: PlanItem[];
};

export type YearPlan = {
  /** 서버 PlanYear UUID — 저장 시 포함해야 동일 학년 행이 유지됩니다 */
  yearId?: string;
  gradeId: string;
  gradeLabel: string;
  semester: SemesterOption;
  goals: string[];
  items: PlanItem[];
  groups?: PlanGroup[];
  /** 목표-활동 그룹핑 구조 (semester=split이면 학기별로 2개, 아니면 1개) */
  semesterPlans?: SemesterPlan[];
  goalGroups?: GoalActivityGroup[];
};

export type CareerPlan = {
  id: string;
  starId: string;
  starName: string;
  starEmoji: string;
  starColor: string;
  jobId: string;
  jobName: string;
  jobEmoji: string;
  years: YearPlan[];
  createdAt: string;
  title: string;
  description?: string;
  isPublic?: boolean;
  shareType?: ShareType;
  shareChannels?: ShareChannel[];
  shareGroupIds?: string[];
  sharedAt?: string;
};

type Props = {
  initialPlan?: CareerPlan | null;
  initialStep?: number;
  onSave: (plan: CareerPlan) => void | Promise<void>;
  onClose: () => void;
};

/* ─── Step config ─── */
const STEPS = [
  { id: 1, title: '왕국',  emoji: '🌟' },
  { id: 2, title: '직업',  emoji: '🎯' },
  { id: 3, title: '여정',  emoji: '🗺️' },
  { id: 4, title: '완성',  emoji: '🏆' },
] as const;

/* ─── Tip box ─── */
function TipBox({ text }: { text: string }) {
  return (
    <div
      className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
      style={{ backgroundColor: 'rgba(108,92,231,0.12)', border: '1px solid rgba(108,92,231,0.25)' }}
    >
      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#a78bfa' }} />
      <p className="text-xs leading-relaxed" style={{ color: '#c4b5fd' }}>{text}</p>
    </div>
  );
}

/* ─── Quest journey track (stage map) ─── */
function QuestTrack({ current, color, onStepClick }: { current: number; color: string; onStepClick?: (step: number) => void }) {
  return (
    <div className="flex items-end justify-center">
      {STEPS.map((s, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        const clickable = done && !!onStepClick;
        return (
          <div key={s.id} className="flex items-end">
            <div
              className={`flex flex-col items-center gap-1${clickable ? ' cursor-pointer' : ''}`}
              style={{ width: 50 }}
              onClick={clickable ? () => onStepClick(stepNum) : undefined}
            >
              <motion.div
                className="rounded-full flex items-center justify-center flex-shrink-0"
                animate={{ scale: active ? 1.12 : 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                style={{
                  width: 28, height: 28, fontSize: 13, lineHeight: 1,
                  background: done || active ? `linear-gradient(135deg, ${color}, ${color}bb)` : 'rgba(255,255,255,0.07)',
                  border: active ? '2px solid #fff' : done ? `1.5px solid ${color}` : '1.5px solid rgba(255,255,255,0.14)',
                  boxShadow: active ? `0 0 14px ${color}aa, 0 0 28px ${color}55` : clickable ? `0 0 8px ${color}66` : 'none',
                }}
              >
                {done ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} /> : <span>{s.emoji}</span>}
              </motion.div>
              <span
                className="text-[10px] font-bold leading-none whitespace-nowrap transition-colors"
                style={{ color: active ? '#fff' : done ? `${color}dd` : 'rgba(255,255,255,0.32)' }}
              >
                {s.title}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="rounded-full mb-[18px] transition-colors duration-300"
                style={{ width: 16, height: 3, background: done ? color : 'rgba(255,255,255,0.14)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Journey path connector (between quest stations) ─── */
function JourneyConnector({ color, filled }: { color: string; filled?: boolean }) {
  return (
    <div className="relative h-3.5" aria-hidden>
      <div
        className="absolute top-0 rounded-full"
        style={{
          left: 37,
          width: 2,
          height: '100%',
          background: filled ? `linear-gradient(${color}, ${color}aa)` : 'rgba(255,255,255,0.12)',
          boxShadow: filled ? `0 0 8px ${color}55` : 'none',
        }}
      />
    </div>
  );
}

/* ─── Month chips (multi-select) ─── */
function MonthPicker({
  selected, onChange, color, presetMonths,
}: {
  selected: number[];
  onChange: (months: number[]) => void;
  color: string;
  presetMonths?: number[];
}) {
  const toggle = (m: number) => {
    onChange(selected.includes(m) ? selected.filter(x => x !== m) : [...selected, m].sort((a, b) => a - b));
  };

  const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-2">
      {/* Quick presets from suggested item */}
      {presetMonths && presetMonths.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-gray-500">추천:</span>
          <button
            onClick={() => onChange([...presetMonths].sort((a, b) => a - b))}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all"
            style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            {presetMonths.map(m => `${m}월`).join(', ')} 선택
          </button>
          <button
            onClick={() => onChange([])}
            className="text-[12px] text-gray-600 underline"
          >
            초기화
          </button>
        </div>
      )}

      {/* Month grid */}
      <div className="grid grid-cols-6 gap-1.5">
        {allMonths.map(m => {
          const isSelected = selected.includes(m);
          const isPreset = presetMonths?.includes(m) ?? false;
          return (
            <button
              key={m}
              onClick={() => toggle(m)}
              className="relative h-10 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={isSelected
                ? { backgroundColor: color, color: '#fff', boxShadow: `0 2px 8px ${color}44` }
                : isPreset
                ? { backgroundColor: `${color}18`, color, border: `1px solid ${color}40` }
                : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
            >
              {m}월
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                  <Check className="w-2 h-2" style={{ color }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="text-[12px] text-gray-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-green-400" />
          선택된 월: <span className="font-bold text-white">{selected.map(m => `${m}월`).join(', ')}</span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   STEP 1 — Kingdom
══════════════════════════════════════════ */
function Step1Kingdom({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <TipBox text="8개의 별은 각각 다른 직업 세계예요. 나의 관심사와 가장 잘 맞는 왕국을 선택해 보세요!" />
      <div className="grid grid-cols-2 gap-3">
        {careerMaker.kingdoms.map((k, kingdomIndex) => {
          const isKingdomSelected = selectedId === k.id;
          const kingdomHoverGlow = `0 0 22px ${k.color}77, 0 0 52px ${k.color}44, 0 10px 36px rgba(0,0,0,0.45), inset 0 0 24px ${k.color}22`;
          const kingdomSelectedHoverGlow = `0 0 36px ${k.color}77, 0 0 64px ${k.color}55, 0 0 2px ${k.color}, inset 0 1px 0 rgba(255,255,255,0.14)`;
          return (
            <motion.button
              key={k.id}
              type="button"
              onClick={() => onSelect(k.id)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: kingdomIndex * 0.045,
                type: 'spring',
                stiffness: 420,
                damping: 24,
              }}
              whileHover={
                isKingdomSelected
                  ? { scale: 1.025, y: -2, boxShadow: kingdomSelectedHoverGlow }
                  : { scale: 1.045, y: -5, boxShadow: kingdomHoverGlow, border: `2px solid ${k.color}` }
              }
              whileTap={{ scale: 0.97 }}
              className="kingdom-choice-card relative flex flex-col items-center gap-2.5 p-4 rounded-2xl overflow-hidden transition-[box-shadow,border-color] duration-300"
              style={
                {
                  ['--kingdom-accent' as string]: k.color,
                  ...(isKingdomSelected
                    ? {
                        background: `linear-gradient(145deg, ${k.color}50, ${k.color}24)`,
                        border: `2px solid ${k.color}`,
                        boxShadow: `0 0 28px ${k.color}55, 0 0 2px ${k.color}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                      }
                    : {
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1.5px solid rgba(255,255,255,0.12)',
                        boxShadow: `0 4px 20px rgba(0,0,0,0.25), 0 0 0 1px ${k.color}22`,
                      }),
                } as CSSProperties
              }
            >
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl" aria-hidden>
                <div
                  className="kingdom-card-glint-stripe absolute left-0 top-0 h-full w-[55%]"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${k.color}00 18%, ${k.color}aa 48%, ${k.color}ff 52%, ${k.color}aa 58%, ${k.color}00 85%, transparent 100%)`,
                  }}
                />
              </div>
              <AnimatePresence>
                {isKingdomSelected && (
                  <motion.div
                    key={`kingdom-check-${k.id}`}
                    initial={{ scale: 0, rotate: -50 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                    className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-white/90"
                    style={{
                      backgroundColor: k.color,
                      boxShadow: `0 0 16px ${k.color}, 0 0 28px ${k.color}99`,
                    }}
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.span
                className="kingdom-card-emoji-wrap relative z-10 text-3xl"
                animate={isKingdomSelected ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : {}}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                {k.emoji}
              </motion.span>
              <div className="text-center relative z-10">
                <div
                  className="text-sm font-bold"
                  style={{ color: isKingdomSelected ? k.color : 'rgba(255,255,255,0.88)' }}
                >
                  {k.name}
                </div>
                <div className="text-[12px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {k.description.slice(0, 22)}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   STEP 2 — Job
══════════════════════════════════════════ */
function Step2Job({ kingdom, selectedJobId, onSelect }: { kingdom: typeof careerMaker.kingdoms[0]; selectedJobId: string; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState('');

  const allJobs = useMemo<JobData[]>(() => loadKingdomJobsByKingdomId(kingdom.id), [kingdom.id]);
  const repIds = useMemo(() => new Set(kingdom.representativeJobs.map(j => j.id)), [kingdom]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allJobs;
    return allJobs.filter(j =>
      j.name.toLowerCase().includes(q) ||
      (j.shortDescription ?? '').toLowerCase().includes(q) ||
      (j.description ?? '').toLowerCase().includes(q)
    );
  }, [allJobs, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
        style={{ background: `linear-gradient(135deg, ${kingdom.color}22, ${kingdom.color}08)`, border: `1px solid ${kingdom.color}33` }}>
        <span className="text-xl">{kingdom.emoji}</span>
        <div>
          <div className="text-sm font-bold text-white">{kingdom.name}</div>
          <div className="text-xs text-gray-400">{kingdom.description}</div>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`${kingdom.name} 직업 ${allJobs.length}개 검색`}
          className="w-full h-11 pl-10 pr-3 rounded-xl text-sm text-white placeholder:text-gray-500 outline-none transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-gray-500">{filtered.length}개 직업 · 마음에 드는 직업을 하나 골라보세요</span>
        <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: `${kingdom.color}cc` }}>
          <Sparkles className="w-3 h-3" /> 추천
        </span>
      </div>

      <div className="space-y-2.5">
        {filtered.map(job => {
          const selected = selectedJobId === job.id;
          return (
            <button key={job.id} onClick={() => onSelect(job.id)}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all duration-200 active:scale-[0.99]"
              style={selected
                ? { background: `linear-gradient(135deg, ${kingdom.color}25, ${kingdom.color}10)`, border: `2px solid ${kingdom.color}` }
                : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: selected ? `linear-gradient(135deg, ${kingdom.color}33, ${kingdom.color}18)` : 'rgba(255,255,255,0.06)' }}>
                {job.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base truncate" style={{ color: selected ? kingdom.color : 'white' }}>{job.name}</span>
                  {repIds.has(job.id) && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: `${kingdom.color}22`, color: `${kingdom.color}dd` }}>
                      <Sparkles className="w-2.5 h-2.5" /> 추천
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{job.shortDescription || job.description}</div>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={selected ? { backgroundColor: kingdom.color } : { border: '1.5px solid rgba(255,255,255,0.15)' }}>
                {selected ? <Check className="w-4 h-4 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-8">
            ‘{query}’에 맞는 직업이 없어요. 다른 검색어를 입력해 보세요.
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Add Item bottom sheet — 4 types + months
══════════════════════════════════════════ */
type SuggestedItem = {
  id: string;
  type: string;
  title: string;
  months: number[];
  difficulty: number;
  cost: string;
  organizer?: string;
  subtitle?: string;
  tip?: string;
  url?: string;
  description?: string;
};

function AddItemSheet({
  starId, color, onAdd, onClose, linkedGoalText,
}: {
  starId: string; color: string;
  onAdd: (item: Omit<PlanItem, 'id'>) => void;
  onClose: () => void;
  /** 목표-활동 그룹에서 열 때: 추천 항목이 어떤 목표에 붙는지 표시 */
  linkedGoalText?: string;
}) {
  const [mode, setMode] = useState<'pick' | 'custom'>('pick');
  const [filterType, setFilterType] = useState('all');
  const [scopedToGoalRaw, setScopedToGoalRaw] = useState<boolean>(true);
  /** 추천 목록: 아코디언으로 상세 노출 후 버튼으로 확정 (호버 대신) */
  const [expandedSuggestItemId, setExpandedSuggestItemId] = useState<string | null>(null);

  // Recommend mode state
  const [selectedSuggest, setSelectedSuggest] = useState<SuggestedItem | null>(null);
  const [suggestMonths, setSuggestMonths] = useState<number[]>([]);
  // 추천 선택 시 수정 가능한 필드
  const [editTitle, setEditTitle] = useState('');
  const [editOrganizer, setEditOrganizer] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDifficulty, setEditDifficulty] = useState(2);
  const [editCost, setEditCost] = useState('무료');

  // Custom mode state
  const [customType, setCustomType] = useState<ItemType>('activity');
  const [customTitle, setCustomTitle] = useState('');
  const [customMonths, setCustomMonths] = useState<number[]>([3]);
  const [customDifficulty, setCustomDifficulty] = useState(2);
  const [customCost, setCustomCost] = useState('무료');
  const [customOrganizer, setCustomOrganizer] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  const kingdom = careerMaker.kingdoms.find(k => k.id === starId);

  // Merge careerItems + portfolioItems for this kingdom
  const careerItems: SuggestedItem[] = (kingdom?.careerItems ?? []).map(it => ({
    id: it.id,
    type: it.type,
    title: it.title,
    months: it.months,
    difficulty: it.difficulty,
    cost: it.cost,
    organizer: it.organizer,
    url: (it as { url?: string }).url,
    description: (it as { description?: string }).description,
  }));

  const portItems: SuggestedItem[] = (
    (portfolioItems.kingdoms as Record<string, typeof portfolioItems.kingdoms.explore>)[starId] ?? []
  ).map(it => ({
    id: it.id,
    type: 'portfolio',
    title: it.title,
    months: it.months,
    difficulty: it.difficulty,
    cost: '자체 제작',
    organizer: '개인',
    subtitle: it.subtitle,
    tip: it.tip,
    url: (it as { url?: string }).url,
    description: (it as { tip?: string }).tip,
  }));

  const allItems: SuggestedItem[] = [...careerItems, ...portItems];

  /* ── 목표 맞춤 추천: goal-recommended-items.json에서 linkedGoalText에 해당하는 그룹 찾기 ── */
  type Phase = 'prep' | 'execute' | 'compete' | 'output' | 'cert' | 'archive';
  type GoalRecGroup = { label: string; phase?: Phase; items: SuggestedItem[] };
  const goalRecData = (goalRecommendedItems as {
    fallback?: { keywordRules?: { match: string[]; tags: string[] }[] };
    taxonomy?: {
      phases?: { key: Phase; label: string }[];
      categories?: Record<string, { label: string; color: string; order: number }>;
    };
    goals: Record<string, {
      tagline?: string;
      keywords?: string[];
      category?: string;
      groups: Record<string, { label: string; phase?: Phase; items: Array<Omit<SuggestedItem, 'subtitle' | 'tip'> & { description?: string }> }>;
    }>;
  });
  const PHASE_ORDER: Phase[] = ['prep','execute','compete','output','cert','archive'];
  const phaseLabels: Record<Phase, string> = Object.fromEntries(
    (goalRecData.taxonomy?.phases ?? []).map(p => [p.key, p.label])
  ) as Record<Phase, string>;
  const sortGroupsByPhase = <T extends { phase?: Phase }>(arr: T[]): T[] =>
    [...arr].sort((a,b) => PHASE_ORDER.indexOf(a.phase ?? 'execute') - PHASE_ORDER.indexOf(b.phase ?? 'execute'));
  const linkedGoalKey = linkedGoalText?.trim() ?? '';
  const exactMatchedGoalEntry = linkedGoalKey ? goalRecData.goals[linkedGoalKey] : undefined;

  /* 느슨한 매칭: 토큰화 후 모든 정의된 목표의 keywords/label/tagline과 점수 비교. 정확 매칭이 없을 때 사용. */
  const tokenize = (s: string) => s
    .replace(/[!,·…•\-—()\[\]{}"'`?·]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2);
  const linkedTokens = tokenize(linkedGoalKey);
  type ScoredGoal = { key: string; score: number; entry: typeof goalRecData.goals[string] };
  const looseMatches: ScoredGoal[] = !exactMatchedGoalEntry && linkedGoalKey
    ? Object.entries(goalRecData.goals).map(([key, entry]) => {
        const haystack = `${key} ${entry.tagline ?? ''} ${(entry.keywords ?? []).join(' ')}`;
        let score = 0;
        for (const tok of linkedTokens) if (haystack.includes(tok)) score += 2;
        for (const kw of entry.keywords ?? []) if (linkedGoalKey.includes(kw)) score += 3;
        if (linkedGoalKey.includes(key) || key.includes(linkedGoalKey)) score += 5;
        return { key, score, entry };
      })
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];

  /* 그룹: 정확 매치면 단일 목표의 그룹들(phase 순), 아니면 상위 매칭 목표들의 그룹을 모두 펼침(중복 허용) */
  let goalScopedGroups: GoalRecGroup[] = [];
  if (exactMatchedGoalEntry) {
    goalScopedGroups = sortGroupsByPhase(Object.values(exactMatchedGoalEntry.groups))
      .map(g => ({ label: g.label, phase: g.phase, items: g.items as SuggestedItem[] }));
  } else if (looseMatches.length > 0) {
    for (const m of looseMatches) {
      const sorted = sortGroupsByPhase(Object.values(m.entry.groups));
      for (const g of sorted) {
        goalScopedGroups.push({ label: `${m.key} · ${g.label}`, phase: g.phase, items: g.items as SuggestedItem[] });
      }
    }
  }

  /* 키워드 기반 careerMaker 항목 보충 — 여러 룰을 모두 합치고, 정의된 목표 매치가 없을 때만 사용 */
  const keywordRules = goalRecData.fallback?.keywordRules ?? [];
  const matchedKeywordTags = (goalScopedGroups.length === 0 && linkedGoalKey)
    ? keywordRules
        .filter(r => r.match.some(k => linkedGoalKey.includes(k)))
        .flatMap(r => r.tags)
    : [];
  const keywordScopedItems: SuggestedItem[] = matchedKeywordTags.length > 0
    ? allItems.filter(it => {
        const tagsArr = ((kingdom?.careerItems ?? []).find(c => c.id === it.id)?.tags as string[] | undefined) ?? [];
        return matchedKeywordTags.some(t =>
          tagsArr.includes(t) || it.title.includes(t) || (it.description ?? '').includes(t)
        );
      })
    : [];

  /* 마지막 폴백: 위 두 방법 모두 비었을 때, 토큰을 careerMaker 제목·설명에서 직접 부분 매칭 */
  const looseTokenItems: SuggestedItem[] = (goalScopedGroups.length === 0 && keywordScopedItems.length === 0 && linkedTokens.length > 0)
    ? allItems.filter(it => {
        const blob = `${it.title} ${it.description ?? ''} ${(it as SuggestedItem).subtitle ?? ''}`;
        return linkedTokens.some(t => blob.includes(t));
      })
    : [];

  const hasGoalScoped = goalScopedGroups.length > 0 || keywordScopedItems.length > 0 || looseTokenItems.length > 0;
  const matchMode: 'exact' | 'loose-goal' | 'keyword' | 'token' | 'none' =
    exactMatchedGoalEntry ? 'exact'
    : looseMatches.length > 0 ? 'loose-goal'
    : keywordScopedItems.length > 0 ? 'keyword'
    : looseTokenItems.length > 0 ? 'token'
    : 'none';
  const scopedToGoal = hasGoalScoped ? scopedToGoalRaw : false;
  const setScopedToGoal = setScopedToGoalRaw;

  const visibleSource: SuggestedItem[] = scopedToGoal && hasGoalScoped
    ? (goalScopedGroups.length > 0
        ? goalScopedGroups.flatMap(g => g.items)
        : (keywordScopedItems.length > 0 ? keywordScopedItems : looseTokenItems))
    : allItems;
  const filtered = filterType === 'all' ? visibleSource : visibleSource.filter(it => it.type === filterType);

  /** 항목 id → 소속 그룹 라벨 (목표 맞춤 모드에서만), 그리고 phase로 group divider 색·아이콘 */
  const itemGroupLabelById: Record<string, string> = {};
  const itemGroupPhaseById: Record<string, Phase | undefined> = {};
  if (scopedToGoal) {
    if (goalScopedGroups.length > 0) {
      for (const g of goalScopedGroups) for (const it of g.items) {
        const phaseEmoji = g.phase ? (phaseLabels[g.phase] ?? '').split(' ')[0] : '';
        itemGroupLabelById[it.id] = phaseEmoji ? `${phaseEmoji} ${g.label}` : g.label;
        itemGroupPhaseById[it.id] = g.phase;
      }
    } else if (keywordScopedItems.length > 0) {
      for (const it of keywordScopedItems) itemGroupLabelById[it.id] = '🔑 키워드 매칭';
    } else if (looseTokenItems.length > 0) {
      for (const it of looseTokenItems) itemGroupLabelById[it.id] = '🪄 느슨한 매칭';
    }
  }

  /** 연결된 목표의 카테고리 메타 (정확 매치 시) */
  const goalCategoryKey = exactMatchedGoalEntry?.category;
  const goalCategoryMeta = goalCategoryKey
    ? goalRecData.taxonomy?.categories?.[goalCategoryKey]
    : undefined;

  const handleSelectSuggest = (item: SuggestedItem) => {
    setSelectedSuggest(item);
    setSuggestMonths([...item.months].sort((a, b) => a - b));
    setEditTitle(item.title);
    setEditOrganizer(item.organizer ?? '');
    setEditUrl(item.url ?? '');
    setEditDescription(item.description ?? '');
    setEditDifficulty(item.difficulty ?? 2);
    setEditCost(item.cost ?? '무료');
  };

  const handleAddSuggest = () => {
    if (!selectedSuggest || suggestMonths.length === 0 || !editTitle.trim()) return;
    onAdd(buildStructuredCareerItem({
      type: selectedSuggest.type as ItemType,
      title: editTitle.trim(),
      months: suggestMonths,
      difficulty: editDifficulty,
      cost: editCost.trim() || '무료',
      organizer: editOrganizer.trim() || '',
      url: editUrl.trim() || undefined,
      description: editDescription.trim() || undefined,
    }));
    onClose();
  };

  const addItemDialogTheme = GOAL_TEMPLATE_SELECTOR_DIALOG;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col justify-end"
      style={{
        backgroundColor: `rgba(0,0,0,${addItemDialogTheme.backdropOverlayOpacity})`,
        backdropFilter: `blur(${addItemDialogTheme.backdropBlurPx}px)`,
        WebkitBackdropFilter: `blur(${addItemDialogTheme.backdropBlurPx}px)`,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full mx-auto rounded-t-3xl flex flex-col"
        style={{
          maxWidth: `min(100%, ${addItemDialogTheme.maxWidthPx}px)`,
          maxHeight: '88vh',
          background: `linear-gradient(180deg, ${addItemDialogTheme.skyGradientTop} 0%, ${addItemDialogTheme.skyGradientBottom} 100%)`,
          border: `1px solid ${addItemDialogTheme.panelBorderGlow}`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 0 60px rgba(124,77,255,0.12), 0 20px 50px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b flex-shrink-0"
          style={{
            borderColor: 'rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(12, 6, 32, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="text-base font-bold text-white">
            {selectedSuggest && mode === 'pick' ? '📅 목표 월 설정' : '항목 추가'}
          </div>
          <div className="flex items-center gap-2">
            {selectedSuggest && mode === 'pick' && (
              <button onClick={() => setSelectedSuggest(null)}
                className="text-xs text-gray-500 underline">목록으로</button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 px-5 pt-3 pb-2 flex-shrink-0">
          {(['pick', 'custom'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setSelectedSuggest(null); setExpandedSuggestItemId(null); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={mode === m ? { backgroundColor: color, color: '#fff' } : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
              {m === 'pick' ? <><Wand2 className="w-4 h-4" />추천 선택</> : <><Pencil className="w-4 h-4" />직접 입력</>}
            </button>
          ))}
        </div>

        {/* 연결 목표 — 추천 항목과 계획 맥락 연결 */}
        {linkedGoalText?.trim() && (
          <div
            className="mx-5 mb-2 flex-shrink-0 rounded-2xl px-3.5 py-3"
            style={{
              background: `linear-gradient(135deg, ${color}28 0%, ${color}10 55%, rgba(12,8,32,0.92) 100%)`,
              border: `1.5px solid ${color}55`,
              boxShadow: `0 0 24px ${color}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}35`, border: `1px solid ${color}50` }}
              >
                <Target className="w-4 h-4" style={{ color: '#fff' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: `${color}dd` }}>
                  {LABELS.builder_add_item_linked_goal_eyebrow}
                </p>
                <p className="text-sm font-bold text-white leading-snug break-words">
                  {linkedGoalText.trim()}
                </p>
                {goalCategoryMeta && (
                  <span
                    className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold"
                    style={{ backgroundColor: `${goalCategoryMeta.color}28`, border: `1px solid ${goalCategoryMeta.color}55`, color: goalCategoryMeta.color }}
                  >
                    {goalCategoryMeta.label}
                  </span>
                )}
                <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                  {LABELS.builder_add_item_linked_goal_hint}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {/* ── Recommend mode ── */}
          {mode === 'pick' && !selectedSuggest && (
            <div className="space-y-2.5 pt-1">
              {/* 목표 범위 토글 — 연결된 목표가 있을 때만 노출 */}
              {hasGoalScoped && (
                <div className="flex items-center gap-2 rounded-xl p-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {[
                    {
                      value: true,
                      label: matchMode === 'exact' ? '🎯 목표 맞춤'
                        : matchMode === 'loose-goal' ? '🧭 유사 목표'
                        : matchMode === 'keyword' ? '🔑 키워드 매칭'
                        : '🪄 느슨한 매칭',
                      desc: matchMode === 'exact' ? '연결된 목표 전용 추천'
                        : matchMode === 'loose-goal' ? '비슷한 목표들의 추천을 모아 보여줌'
                        : matchMode === 'keyword' ? '제목·태그 기반 추천'
                        : '키워드 부분 매칭 추천',
                    },
                    { value: false, label: '🌐 전체 보기', desc: '왕국 전체 항목' },
                  ].map(opt => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => { setScopedToGoal(opt.value); setExpandedSuggestItemId(null); setFilterType('all'); }}
                      className="flex-1 py-2 rounded-lg text-[12px] font-bold transition-all"
                      style={scopedToGoal === opt.value
                        ? { backgroundColor: color, color: '#fff' }
                        : { color: 'rgba(255,255,255,0.5)' }}
                      title={opt.desc}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Type filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {[{ value: 'all', label: '전체', emoji: '✨' }, ...ITEM_TYPES.map(t => ({ value: t.value, label: t.label, emoji: t.emoji }))].map(t => (
                  <motion.button
                    key={t.value}
                    onClick={() => { setFilterType(t.value); setExpandedSuggestItemId(null); }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={filterType === t.value ? { backgroundColor: color, color: '#fff' } : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    {t.emoji} {t.label}
                  </motion.button>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="py-10 text-center text-sm text-gray-500">항목이 없어요</div>
              )}

              {filtered.map((item, idx) => {
                const tc = ITEM_TYPES.find(t => t.value === item.type)!;
                const itemColor = tc?.color ?? color;
                const groupLabel = itemGroupLabelById[item.id];
                const prevGroupLabel = idx > 0 ? itemGroupLabelById[filtered[idx - 1].id] : undefined;
                const showGroupHeader = !!groupLabel && groupLabel !== prevGroupLabel;
                const diffLabel = item.difficulty === 1 ? '매우 쉬움' : item.difficulty === 2 ? '쉬움' : item.difficulty === 3 ? '보통' : item.difficulty === 4 ? '어려움' : '매우 어려움';
                const isSuggestAccordionExpanded = expandedSuggestItemId === item.id;
                const detailBodyId = `add-item-suggest-detail-${item.id}`;
                const periodText =
                  `${item.months.slice(0, 3).map(m => `${m}월`).join(', ')}${item.months.length > 3 ? ' 외' : ''}`;
                const detailText = item.description || (item as SuggestedItem).tip || '';

                return (
                  <div key={item.id}>
                    {showGroupHeader && (
                      <div className="flex items-center gap-2 px-1 pt-2 pb-1.5">
                        <div className="h-[1px] flex-1" style={{ background: `linear-gradient(90deg, ${color}50 0%, transparent 100%)` }} />
                        <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: `${color}dd` }}>
                          {groupLabel}
                        </span>
                        <div className="h-[1px] flex-1" style={{ background: `linear-gradient(90deg, transparent 0%, ${color}50 100%)` }} />
                      </div>
                    )}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02, type: 'spring', stiffness: 400, damping: 24 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      border: `1.5px solid ${isSuggestAccordionExpanded ? itemColor : 'rgba(255,255,255,0.08)'}`,
                      backgroundColor: isSuggestAccordionExpanded ? `${itemColor}12` : 'rgba(255,255,255,0.03)',
                      boxShadow: isSuggestAccordionExpanded ? `0 0 24px ${itemColor}28` : undefined,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSuggestItemId(prev => (prev === item.id ? null : item.id))
                      }
                      className="w-full flex items-center gap-3 p-3.5 text-left transition-colors active:scale-[0.99]"
                      aria-expanded={isSuggestAccordionExpanded}
                      aria-controls={detailBodyId}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: `${itemColor}18`, border: `1px solid ${itemColor}30` }}
                        aria-hidden
                      >
                        {tc?.emoji ?? '📌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white leading-snug">{item.title}</div>
                        {(item as SuggestedItem).subtitle && (
                          <div className="text-[12px] text-gray-500 mt-0.5 line-clamp-1">{(item as SuggestedItem).subtitle}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[12px] font-bold" style={{ color: itemColor }}>{tc?.label}</span>
                          <span className="text-[12px] text-gray-500">
                            {item.months.slice(0, 3).map(m => `${m}월`).join('·')}
                            {item.months.length > 3 ? ' 외' : ''}
                          </span>
                          {'organizer' in item && item.organizer && item.organizer !== '개인' && (
                            <span className="text-[12px] text-gray-600">{item.organizer}</span>
                          )}
                        </div>
                      </div>
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center self-center"
                        style={{
                          backgroundColor: isSuggestAccordionExpanded ? `${itemColor}35` : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${isSuggestAccordionExpanded ? `${itemColor}55` : 'rgba(255,255,255,0.1)'}`,
                        }}
                        aria-hidden
                      >
                        {isSuggestAccordionExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-white" strokeWidth={2.25} />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" strokeWidth={2.25} />
                        )}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isSuggestAccordionExpanded && (
                        <motion.div
                          id={detailBodyId}
                          role="region"
                          aria-label={item.title}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div
                            className="px-3.5 pb-3.5 pt-1 space-y-3 border-t"
                            style={{ borderColor: `${itemColor}35` }}
                          >
                            {/* 메타: 가로 배치 아이콘 + 텍스트 칩 */}
                            <div className="flex flex-row flex-wrap gap-2">
                              {[
                                {
                                  icon: <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: itemColor }} />,
                                  label: LABELS.builder_add_item_meta_period,
                                  value: periodText,
                                },
                                {
                                  icon: <Flame className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} />,
                                  label: LABELS.builder_add_item_meta_difficulty,
                                  value: `${'★'.repeat(item.difficulty)} ${diffLabel}`,
                                },
                                {
                                  icon: <DollarSign className="w-4 h-4 flex-shrink-0" style={{ color: '#22c55e' }} />,
                                  label: LABELS.builder_add_item_meta_cost,
                                  value: item.cost ?? '',
                                },
                                {
                                  icon: <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />,
                                  label: LABELS.builder_add_item_meta_organizer,
                                  value: item.organizer?.trim() || LABELS.builder_add_item_meta_unknown,
                                },
                              ].map((chip, chipIdx) => (
                                <div
                                  key={`${item.id}-meta-${chipIdx}`}
                                  className="flex items-center gap-2 min-w-0 rounded-xl px-2.5 py-2 flex-1 basis-[calc(50%-0.25rem)] sm:basis-[calc(25%-0.25rem)] sm:flex-initial sm:min-w-[140px]"
                                  style={{
                                    backgroundColor: `${itemColor}18`,
                                    border: `1px solid ${itemColor}40`,
                                  }}
                                >
                                  {chip.icon}
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                      {chip.label}
                                    </div>
                                    <div className="text-[11px] font-semibold text-white leading-snug break-words">
                                      {chip.value}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {detailText.trim() && (
                              <div
                                className="rounded-xl p-3 space-y-1.5"
                                style={{
                                  background: `linear-gradient(180deg, ${itemColor}22 0%, rgba(0,0,0,0.35) 100%)`,
                                  border: `1.5px solid ${itemColor}55`,
                                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)`,
                                }}
                              >
                                <div
                                  className="flex flex-row items-center gap-2 text-xs font-bold"
                                  style={{ color: itemColor }}
                                >
                                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: itemColor }} />
                                  {LABELS.builder_add_item_detail_section_label}
                                </div>
                                <p className="text-xs text-white/95 leading-relaxed font-medium whitespace-pre-wrap">
                                  {detailText}
                                </p>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                handleSelectSuggest(item);
                                setExpandedSuggestItemId(null);
                              }}
                              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
                              style={{
                                background: `linear-gradient(135deg, ${itemColor}, ${itemColor}cc)`,
                                boxShadow: `0 6px 24px ${itemColor}44`,
                              }}
                            >
                              {LABELS.builder_add_item_select_this}
                            </button>
                            <p className="text-center text-[10px] text-gray-500 px-1">
                              {LABELS.builder_add_item_select_hint}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              );
            })}
          </div>
          )}

          {/* ── Recommend mode: month picker ── */}
          {mode === 'pick' && selectedSuggest && (
            <div className="space-y-4 pt-2">
              {/* 수정 가능한 필드 */}
              <div className="rounded-2xl p-4 space-y-4"
                style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                <div className="relative rounded-xl transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-400">🎯 항목명</span>
                    {!editTitle.trim() && (
                      <Pencil className="w-3.5 h-3.5 input-hint-icon-empty" style={{ color }} />
                    )}
                  </div>
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="항목명을 입력하세요"
                    className="w-full h-12 px-4 rounded-xl text-base text-white placeholder-gray-500 bg-white/8 border border-white/15 outline-none focus:border-2 focus:border-opacity-60 transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 mb-2">🏢 주관/출처</div>
                  <input
                    value={editOrganizer}
                    onChange={e => setEditOrganizer(e.target.value)}
                    placeholder="주관/출처"
                    className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-500 bg-white/8 border border-white/15 outline-none focus:border-2 transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 mb-2">💰 비용</div>
                  <input
                    value={editCost}
                    onChange={e => setEditCost(e.target.value)}
                    placeholder="비용"
                    className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-500 bg-white/8 border border-white/15 outline-none focus:border-2 transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                  />
                </div>
              </div>

              {/* 난이도 - 수정 가능 */}
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-xs font-bold text-gray-400 mb-1.5">🔥 난이도</div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setEditDifficulty(d)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                      style={editDifficulty === d ? { backgroundColor: color, color: '#fff' } : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
                    >
                      {'★'.repeat(d)}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {editDifficulty === 1 && '매우 쉬움'}
                  {editDifficulty === 2 && '쉬움'}
                  {editDifficulty === 3 && '보통'}
                  {editDifficulty === 4 && '어려움'}
                  {editDifficulty === 5 && '매우 어려움'}
                </div>
              </div>

              {/* URL - 수정 가능 */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-xs font-bold text-gray-400 mb-2">🔗 공식 사이트</div>
                <input
                  type="url"
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-500 bg-white/8 border border-white/15 outline-none focus:border-2 transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                />
                {editUrl.trim() && (
                  <a href={editUrl.trim()} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-400 underline mt-1 inline-block">브라우저에서 열기</a>
                )}
              </div>

              {/* 설명 - 수정 가능 */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-xs font-bold text-gray-400 mb-2">📝 상세 설명</div>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="상세 설명 (선택)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 bg-white/8 border border-white/15 outline-none resize-none focus:border-2 transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                />
              </div>

              {/* Month picker */}
              <div>
                <div className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" style={{ color }} />
                  목표 월 선택 <span className="text-gray-500 font-normal">(다중 선택 가능)</span>
                </div>
                <MonthPicker
                  selected={suggestMonths}
                  onChange={setSuggestMonths}
                  color={color}
                  presetMonths={selectedSuggest.months}
                />
              </div>

              <button
                disabled={suggestMonths.length === 0 || !editTitle.trim()}
                onClick={handleAddSuggest}
                className="w-full h-12 rounded-xl font-bold text-white transition-all disabled:opacity-40"
                style={suggestMonths.length > 0 && editTitle.trim()
                  ? { background: `linear-gradient(135deg, ${color}, ${color}aa)`, boxShadow: `0 4px 14px ${color}44` }
                  : { backgroundColor: 'rgba(255,255,255,0.08)' }}>
                {suggestMonths.length > 0 && editTitle.trim()
                  ? `${suggestMonths.map(m => `${m}월`).join(', ')} — 추가하기`
                  : !editTitle.trim()
                    ? '제목을 입력하세요'
                    : '월을 선택하세요'}
              </button>
            </div>
          )}

          {/* ── Custom mode ── */}
          {mode === 'custom' && (
            <div className="space-y-4 pt-1">
              {/* Type */}
              <div>
                <div className="text-xs text-gray-400 mb-2 font-semibold">유형 *</div>
                <div className="grid grid-cols-2 gap-2">
                  {ITEM_TYPES.map(t => (
                    <button key={t.value} onClick={() => setCustomType(t.value)}
                      className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-bold transition-all"
                      style={customType === t.value ? { backgroundColor: t.color, color: '#fff' } : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                      <span className="text-xl">{t.emoji}</span>{t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-400">이름 *</span>
                  {!customTitle.trim() && (
                    <Pencil className="w-3.5 h-3.5 input-hint-icon-empty" style={{ color }} />
                  )}
                </div>
                <input type="text" value={customTitle} onChange={e => setCustomTitle(e.target.value)}
                  placeholder={
                    customType === 'activity' ? '예: 전국 AI 해커톤 참가' :
                    customType === 'award' ? '예: 교내 과학탐구대회 금상' :
                    customType === 'portfolio' ? '예: 기후변화 탐구 보고서' :
                    '예: 컴퓨터활용능력 1급'
                  }
                  className="w-full h-12 px-4 rounded-xl text-base text-white placeholder-gray-500 outline-none focus:border-2 transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }} />
              </div>

              {/* Months */}
              <div>
                <div className="text-xs text-gray-400 mb-2 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  목표 월 <span className="text-gray-600">(다중 선택 가능)</span>
                </div>
                <MonthPicker selected={customMonths} onChange={setCustomMonths} color={color} />
              </div>

              {/* Difficulty */}
              <div>
                <div className="text-xs text-gray-400 mb-2 font-semibold">난이도</div>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(d => (
                    <button key={d} onClick={() => setCustomDifficulty(d)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={customDifficulty === d ? { backgroundColor: color, color: '#fff' } : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                      {'★'.repeat(d)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost & Organizer */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-400 mb-2 font-semibold">비용</div>
                  <input type="text" value={customCost} onChange={e => setCustomCost(e.target.value)} placeholder="무료"
                    className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-2 transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-2 font-semibold">주관 / 출처</div>
                  <input type="text" value={customOrganizer} onChange={e => setCustomOrganizer(e.target.value)} placeholder="예: 학교·자체"
                    className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-2 transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }} />
                </div>
              </div>

              {/* Optional Section Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <span className="text-xs font-bold text-gray-500">추가 정보 (선택)</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* URL */}
              <div>
                <div className="text-xs text-gray-400 mb-2 font-semibold">🔗 URL</div>
                <input
                  type="url"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-2 transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }}
                />
              </div>

              {/* Description */}
              <div>
                <div className="text-xs text-gray-400 mb-2 font-semibold">📝 설명</div>
                <textarea
                  value={customDescription}
                  onChange={e => setCustomDescription(e.target.value)}
                  placeholder="대회 소개, 참가 방법, 준비 사항 등"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none resize-none focus:border-2 transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }}
                />
              </div>

              <button
                disabled={!customTitle.trim() || customMonths.length === 0}
                onClick={() => {
                  if (!customTitle.trim() || customMonths.length === 0) return;
                  onAdd(buildStructuredCareerItem({ 
                    type: customType, 
                    title: customTitle.trim(), 
                    months: customMonths, 
                    difficulty: customDifficulty, 
                    cost: customCost, 
                    organizer: customOrganizer, 
                    url: customUrl.trim() || undefined,
                    description: customDescription.trim() || undefined,
                    custom: true 
                  }));
                  onClose();
                }}
                className="w-full h-12 rounded-xl font-bold text-white transition-all disabled:opacity-40"
                style={customTitle.trim() && customMonths.length > 0
                  ? { background: `linear-gradient(135deg, ${color}, ${color}aa)` }
                  : { backgroundColor: 'rgba(255,255,255,0.08)' }}>
                추가하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   EditItemSheet — 세부활동 수정 다이얼로그
══════════════════════════════════════════ */
function EditItemSheet({
  item, color, onUpdate, onClose,
}: {
  item: PlanItem;
  color: string;
  onUpdate: (updated: PlanItem) => void;
  onClose: () => void;
}) {
  const [editType, setEditType] = useState<ItemType>(item.type);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editMonths, setEditMonths] = useState<number[]>(item.months.length > 0 ? [...item.months] : [3]);
  const [editDifficulty, setEditDifficulty] = useState(item.difficulty ?? 2);
  const [editCost, setEditCost] = useState(item.cost ?? '무료');
  const [editOrganizer, setEditOrganizer] = useState(item.organizer ?? '');
  const [editUrl, setEditUrl] = useState(item.url ?? '');
  const [editDescription, setEditDescription] = useState(item.description ?? '');

  const handleSave = () => {
    if (!editTitle.trim() || editMonths.length === 0) return;
    onUpdate(buildStructuredCareerItem({
      ...item,
      type: editType,
      title: editTitle.trim(),
      months: editMonths,
      difficulty: editDifficulty,
      cost: editCost.trim() || '무료',
      organizer: editOrganizer.trim() || '',
      url: editUrl.trim() || undefined,
      description: editDescription.trim() || undefined,
    }));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[430px] mx-auto rounded-t-3xl flex flex-col"
        style={{ backgroundColor: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '88vh' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/8 flex-shrink-0">
          <div className="text-base font-bold text-white">항목 수정</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div>
            <div className="text-xs text-gray-400 mb-2 font-semibold">유형</div>
            <div className="grid grid-cols-2 gap-2">
              {ITEM_TYPES.map(t => (
                <button key={t.value} onClick={() => setEditType(t.value as ItemType)}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-bold transition-all"
                  style={editType === t.value ? { backgroundColor: t.color, color: '#fff' } : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                  <span className="text-xl">{t.emoji}</span>{t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-400">이름 *</span>
              {!editTitle.trim() && (
                <Pencil className="w-3.5 h-3.5 input-hint-icon-empty" style={{ color }} />
              )}
            </div>
            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
              placeholder="항목명을 입력하세요"
              className="w-full h-12 px-4 rounded-xl text-base text-white placeholder-gray-500 outline-none focus:border-2 transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }} />
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-2 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              목표 월 <span className="text-gray-600">(다중 선택 가능)</span>
            </div>
            <MonthPicker selected={editMonths} onChange={setEditMonths} color={color} />
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-2 font-semibold">난이도</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(d => (
                <button key={d} onClick={() => setEditDifficulty(d)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={editDifficulty === d ? { backgroundColor: color, color: '#fff' } : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                  {'★'.repeat(d)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-400 mb-2 font-semibold">비용</div>
              <input type="text" value={editCost} onChange={e => setEditCost(e.target.value)} placeholder="무료"
                className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-2 transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }} />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-2 font-semibold">주관 / 출처</div>
              <input type="text" value={editOrganizer} onChange={e => setEditOrganizer(e.target.value)} placeholder="예: 학교·자체"
                className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-2 transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }} />
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-2 font-semibold">🔗 URL</div>
            <input type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-2 transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }} />
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-2 font-semibold">📝 설명</div>
            <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)}
              placeholder="대회 소개, 참가 방법, 준비 사항 등"
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none resize-none focus:border-2 transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }} />
          </div>

          <button
            disabled={!editTitle.trim() || editMonths.length === 0}
            onClick={handleSave}
            className="w-full h-12 rounded-xl font-bold text-white transition-all disabled:opacity-40"
            style={editTitle.trim() && editMonths.length > 0
              ? { background: `linear-gradient(135deg, ${color}, ${color}aa)` }
              : { backgroundColor: 'rgba(255,255,255,0.08)' }}>
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ActivityBuildSheet — 활동 클릭 시 열리는 빌드 탭
   (① 연계 목표 다시 고르기 ② 활동 퀘스트 템플릿 고르기 ③ 직접 수정)
══════════════════════════════════════════ */
type ActivityRecItem = {
  id?: string;
  type?: ItemType;
  title: string;
  months?: number[];
  difficulty?: number;
  cost?: string;
  organizer?: string;
  description?: string;
};

const ACTIVITY_TIER_BY_DIFFICULTY: Record<number, { label: string; color: string; glow: string }> = {
  1: { label: 'E', color: '#94A3B8', glow: 'rgba(148,163,184,0.45)' },
  2: { label: 'D', color: '#34D399', glow: 'rgba(52,211,153,0.45)' },
  3: { label: 'C', color: '#60A5FA', glow: 'rgba(96,165,250,0.5)' },
  4: { label: 'B', color: '#A78BFA', glow: 'rgba(167,139,250,0.55)' },
  5: { label: 'A', color: '#FBBF24', glow: 'rgba(251,191,36,0.7)' },
};

function ActivityBuildSheet({
  item, color, starId, linkedGoalText, onUpdate, onChangeGoal, onClose,
}: {
  item: PlanItem;
  color: string;
  starId: string;
  linkedGoalText: string;
  onUpdate: (updated: PlanItem) => void;
  onChangeGoal: (goal: string) => void;
  onClose: () => void;
}) {
  const [view, setView] = useState<'hub' | 'goal' | 'form'>('hub');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const dialogTheme = GOAL_TEMPLATE_SELECTOR_DIALOG;

  /** 연계 목표에 맞는 추천 활동 그룹 (goal-recommended-items.json) */
  const recGroups = useMemo<{ label: string; items: ActivityRecItem[] }[]>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = goalRecommendedItems as any;
    const goals = data.goals ?? {};
    const key = linkedGoalText.trim();
    let entry = key ? goals[key] : undefined;
    if (!entry && key) {
      const found = Object.keys(goals).find((k) => key.includes(k) || k.includes(key));
      if (found) entry = goals[found];
    }
    if (entry?.groups) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Object.values(entry.groups).map((g: any) => ({
        label: g.label as string,
        items: (g.items ?? []) as ActivityRecItem[],
      }));
    }
    // 폴백: 왕국 추천 활동
    const kingdom = careerMaker.kingdoms.find((k) => k.id === starId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = ((kingdom?.careerItems ?? []) as any[]).slice(0, 12).map((it) => ({
      id: it.id, type: it.type, title: it.title, months: it.months,
      difficulty: it.difficulty, cost: it.cost, organizer: it.organizer, description: it.description,
    })) as ActivityRecItem[];
    return items.length ? [{ label: `${kingdom?.name ?? '추천'} 활동`, items }] : [];
  }, [linkedGoalText, starId]);

  const applyTemplate = (rec: ActivityRecItem) => {
    if (confirmingId) return;
    const cid = rec.id ?? rec.title;
    setConfirmingId(cid);
    setTimeout(() => {
      onUpdate(buildStructuredCareerItem({
        ...item,
        type: (rec.type as ItemType) ?? item.type,
        title: rec.title,
        months: rec.months && rec.months.length > 0 ? rec.months : item.months,
        difficulty: rec.difficulty ?? item.difficulty,
        cost: rec.cost ?? item.cost,
        organizer: rec.organizer ?? item.organizer,
        description: rec.description ?? item.description,
      }) as PlanItem);
      onClose();
    }, 360);
  };

  if (view === 'goal') {
    return (
      <GoalTemplateSelector
        color={color}
        previouslySelected={linkedGoalText ? [linkedGoalText] : []}
        onSelect={(g) => { onChangeGoal(g); setView('hub'); }}
        onClose={() => setView('hub')}
      />
    );
  }

  if (view === 'form') {
    return (
      <EditItemSheet
        item={item}
        color={color}
        onUpdate={(updated) => { onUpdate(updated); onClose(); }}
        onClose={() => setView('hub')}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end justify-center"
      style={{
        backgroundColor: `rgba(0,0,0,${dialogTheme.backdropOverlayOpacity})`,
        backdropFilter: `blur(${dialogTheme.backdropBlurPx}px)`,
        WebkitBackdropFilter: `blur(${dialogTheme.backdropBlurPx}px)`,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full rounded-t-3xl overflow-hidden relative"
        style={{
          maxWidth: `min(100%, ${dialogTheme.maxWidthPx}px)`,
          maxHeight: '85vh',
          background: `linear-gradient(180deg, ${dialogTheme.skyGradientTop} 0%, ${dialogTheme.skyGradientBottom} 100%)`,
          border: `1px solid ${dialogTheme.panelBorderGlow}`,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 0 60px rgba(124,77,255,0.12), 0 20px 50px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b relative z-10"
          style={{
            borderColor: 'rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(12, 6, 32, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color }} />
            <div className="flex flex-col leading-tight min-w-0">
              <h3 className="text-lg font-bold text-white truncate">활동 빌드</h3>
              <span className="text-[10.5px] text-gray-400 truncate">{item.title || '활동을 다듬어 보자!'}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            title="닫기"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 pb-5 relative z-10" style={{ maxHeight: 'calc(85vh - 72px)' }}>
          {/* 현재 연계 목표 + 바꾸기 */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" style={{ color }} />
              <span className="text-xs font-bold text-gray-400">현재 연계 목표</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="flex-1 min-w-0 truncate px-3 py-2 rounded-xl text-sm font-medium text-white"
                style={{ backgroundColor: `${color}18`, border: `1px solid ${color}40` }}
              >
                {linkedGoalText || '연계 목표 없음'}
              </span>
              <button
                onClick={() => setView('goal')}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                style={{ backgroundColor: `${color}25`, border: `1px solid ${color}55`, color }}
              >
                <Pencil className="w-3.5 h-3.5" />
                목표 바꾸기
              </button>
            </div>
          </div>

          {/* 직접 수정 진입 */}
          <button
            onClick={() => setView('form')}
            className="w-full mt-4 flex items-center justify-between px-4 py-3 rounded-2xl transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-gray-300" />
              <span className="text-sm font-semibold text-white">직접 수정하기</span>
              <span className="text-[11px] text-gray-400">유형·월·난이도·URL 등</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* 활동 퀘스트 템플릿 */}
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-2 text-[11px] text-gray-400 px-1">
              <span>⚡ 추천 활동 퀘스트를 누르면 이 활동이 바로 교체돼요</span>
            </div>
            {recGroups.length === 0 ? (
              <div className="text-center text-xs text-gray-500 py-6">
                이 목표에 맞는 추천 활동이 아직 없어요. <br />‘직접 수정하기’로 자유롭게 채워보세요.
              </div>
            ) : (
              recGroups.map((group, gi) => (
                <div key={gi} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black tracking-wide" style={{ color: `${color}cc` }}>
                      {group.label}
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: `${color}1f` }} />
                    <span className="text-[10px] font-bold text-gray-500">{group.items.length} 퀘스트</span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((rec, ri) => {
                      const tier = ACTIVITY_TIER_BY_DIFFICULTY[rec.difficulty ?? 2] ?? ACTIVITY_TIER_BY_DIFFICULTY[2];
                      const tc = ITEM_TYPES.find((t) => t.value === (rec.type ?? 'activity'));
                      const cid = rec.id ?? rec.title;
                      const isConfirming = confirmingId === cid;
                      return (
                        <motion.button
                          key={ri}
                          type="button"
                          disabled={!!confirmingId}
                          whileHover={!confirmingId ? { scale: 1.005, boxShadow: `0 0 16px ${color}33` } : {}}
                          onClick={() => applyTemplate(rec)}
                          animate={isConfirming ? { scale: [1, 1.02, 1.01], boxShadow: ['0 0 0 transparent', `0 0 20px ${color}55`, `0 0 14px ${color}44`] } : {}}
                          transition={{ duration: isConfirming ? 0.36 : 0.2 }}
                          className="relative w-full text-left rounded-xl transition-[box-shadow,border-color] disabled:opacity-95"
                          style={{
                            backgroundColor: isConfirming ? `${color}15` : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isConfirming ? `${color}66` : 'rgba(255,255,255,0.08)'}`,
                          }}
                        >
                          {isConfirming && (
                            <motion.span
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                              className="absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
                            >
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </motion.span>
                          )}
                          <div className="flex items-start gap-3 p-3.5">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                              style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
                            >
                              {tc?.emoji ?? '⚡'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-black flex-shrink-0"
                                  style={{ background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`, color: '#0b0820', boxShadow: `0 0 8px ${tier.glow}` }}
                                  title={`${tier.label}티어`}
                                >
                                  {tier.label}
                                </span>
                                <span className="text-sm font-bold text-white leading-snug">{rec.title}</span>
                                {tc && (
                                  <span
                                    className="text-[10.5px] px-1.5 py-0.5 rounded-md font-medium"
                                    style={{ backgroundColor: `${tc.color}22`, color: '#e9e6ff' }}
                                  >
                                    {tc.label}
                                  </span>
                                )}
                              </div>
                              {rec.description && (
                                <div className="mt-1 leading-relaxed" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.42)', letterSpacing: '0.1px' }}>
                                  {rec.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   ActivityItemCard — 세부활동 하나 + 하위활동 아코디언
══════════════════════════════════════════ */
function ActivityItemCard({
  item, color, starId, linkedGoalText, onUpdate, onChangeGoal, onRemove,
}: {
  item: PlanItem;
  color: string;
  starId: string;
  linkedGoalText: string;
  onUpdate: (updated: PlanItem) => void;
  onChangeGoal: (goal: string) => void;
  onRemove: () => void;
}) {
  const tc = ITEM_TYPES.find(t => t.value === item.type)!;
  const subItems = item.subItems ?? [];
  const [subExpanded, setSubExpanded] = useState(subItems.length > 0);
  const [subInput, setSubInput] = useState('');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubText, setEditingSubText] = useState('');
  const [showBuildSheet, setShowBuildSheet] = useState(false);

  const monthLabel =
    item.months.length === 1
      ? `${item.months[0]}월`
      : item.months.length <= 3
      ? item.months.map(m => `${m}월`).join('·')
      : `${item.months[0]}~${item.months[item.months.length - 1]}월`;

  const addSubItem = () => {
    if (!subInput.trim()) return;
    const newSub: SubItem = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: subInput.trim(),
      done: false,
    };
    onUpdate({ ...item, subItems: [...subItems, newSub] });
    setSubInput('');
    setSubExpanded(true);
  };

  const toggleSubDone = (subId: string) => {
    onUpdate({
      ...item,
      subItems: subItems.map(s => s.id === subId ? { ...s, done: !s.done } : s),
    });
  };

  const removeSubItem = (subId: string) => {
    onUpdate({ ...item, subItems: subItems.filter(s => s.id !== subId) });
  };

  const saveEditSub = (subId: string) => {
    if (!editingSubText.trim()) {
      removeSubItem(subId);
    } else {
      onUpdate({
        ...item,
        subItems: subItems.map(s => s.id === subId ? { ...s, title: editingSubText.trim() } : s),
      });
    }
    setEditingSubId(null);
    setEditingSubText('');
  };

  const doneCount = subItems.filter(s => s.done).length;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{ backgroundColor: `${tc.color}0e`, border: `1px solid ${tc.color}28` }}
    >
      {/* 활동 헤더 행 — 클릭 시 빌드 탭 */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setShowBuildSheet(true)}
          title="클릭하여 빌드 탭 열기"
          className="flex-1 min-w-0 text-left cursor-pointer rounded-lg -m-1 p-1 transition-colors hover:bg-white/5 active:bg-white/8"
        >
          <div className="text-sm font-semibold text-white line-clamp-1">{item.title}</div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[12px] font-bold" style={{ color: tc.color }}>{tc.label}</span>
            <span className="text-[12px] text-gray-500">📅 {monthLabel}</span>
            {item.cost !== '무료' && item.cost !== '자체 제작' && (
              <span className="text-[12px] text-gray-600">{item.cost}</span>
            )}
            {subItems.length > 0 && (
              <span className="text-[12px] text-gray-500">
                {doneCount}/{subItems.length} 완료
              </span>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* 하위활동 토글 */}
          <button
            onClick={() => setSubExpanded(e => !e)}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-[12px] font-bold transition-all"
            style={{
              backgroundColor: subExpanded ? `${tc.color}22` : 'rgba(255,255,255,0.06)',
              color: subExpanded ? tc.color : 'rgba(255,255,255,0.4)',
            }}
          >
            <Plus className="w-2.5 h-2.5" />
            하위
            {subItems.length > 0 && (
              <span className="ml-0.5">{subItems.length}</span>
            )}
          </button>
          <button
            onClick={onRemove}
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            <Trash2 className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 하위활동 패널 — 아코디언 */}
      <AnimatePresence>
        {subExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div
              className="px-3 pb-2.5 space-y-1"
              style={{ borderTop: `1px solid ${tc.color}18` }}
            >
              {/* 하위활동 목록 */}
              {subItems.length > 0 && (
                <div className="pt-2 space-y-1">
                  <AnimatePresence>
                    {subItems.map(sub => (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg group"
                        style={{
                          backgroundColor: sub.done ? `${tc.color}08` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${sub.done ? tc.color + '20' : 'rgba(255,255,255,0.07)'}`,
                        }}
                      >
                        {/* 완료 체크 */}
                        <button
                          onClick={() => toggleSubDone(sub.id)}
                          className="flex-shrink-0 transition-all"
                          style={{ color: sub.done ? tc.color : 'rgba(255,255,255,0.2)' }}
                        >
                          <CheckCircle2 style={{ width: 14, height: 14 }} />
                        </button>

                        {/* 제목 (인라인 편집) */}
                        {editingSubId === sub.id ? (
                          <input
                            type="text"
                            value={editingSubText}
                            onChange={e => setEditingSubText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                saveEditSub(sub.id);
                              }
                              if (e.key === 'Escape') setEditingSubId(null);
                            }}
                            onBlur={() => saveEditSub(sub.id)}
                            autoFocus
                            className="flex-1 bg-transparent text-xs text-white outline-none"
                          />
                        ) : (
                          <span
                            className="flex-1 text-xs text-white cursor-pointer leading-snug"
                            style={{
                              textDecoration: sub.done ? 'line-through' : 'none',
                              color: sub.done ? 'rgba(255,255,255,0.35)' : undefined,
                            }}
                            onClick={() => { setEditingSubId(sub.id); setEditingSubText(sub.title); }}
                          >
                            {sub.title}
                          </span>
                        )}

                        <button
                          onClick={() => removeSubItem(sub.id)}
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-gray-600" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* 하위활동 입력 — min-w-0으로 작은 모바일에서 플러스 버튼 항상 노출 */}
              <div className="flex gap-2 pt-1.5 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    value={subInput}
                    onChange={e => setSubInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        addSubItem();
                      }
                    }}
                    placeholder="하위 활동을 입력하세요"
                    className="w-full h-9 px-3 pr-9 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-2 transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: `1.5px solid ${tc.color}30` }}
                  />
                  {!subInput.trim() && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Pencil className="w-3.5 h-3.5 input-hint-icon-empty" style={{ color: tc.color }} />
                    </div>
                  )}
                </div>
                <button
                  onClick={addSubItem}
                  disabled={!subInput.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shrink-0 disabled:opacity-30 transition-all"
                  style={{ backgroundColor: `${tc.color}25`, color: tc.color }}
                  aria-label="하위 항목 추가"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showBuildSheet && (
        <ActivityBuildSheet
          item={item}
          color={color}
          starId={starId}
          linkedGoalText={linkedGoalText}
          onUpdate={(updated) => { onUpdate(updated); setShowBuildSheet(false); }}
          onChangeGoal={onChangeGoal}
          onClose={() => setShowBuildSheet(false)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   GoalActivityGroupCard — 목표 + 연결된 세부활동 아코디언
══════════════════════════════════════════ */
function GoalActivityGroupCard({
  group, index, color, starId, onUpdate, onRemove,
}: {
  group: GoalActivityGroup;
  index?: number;
  color: string;
  starId: string;
  onUpdate: (updated: GoalActivityGroup) => void;
  onRemove: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(group.isExpanded ?? true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [celebrateItemId, setCelebrateItemId] = useState<string | null>(null);

  const handleAddItem = (item: Omit<PlanItem, 'id'>) => {
    const newItem: PlanItem = { ...item, id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`, subItems: [] };
    onUpdate({ ...group, items: [...group.items, newItem], isExpanded: true });
    setCelebrateItemId(newItem.id);
    setTimeout(() => setCelebrateItemId(null), 1000);
  };

  const handleUpdateItem = (updated: PlanItem) => {
    onUpdate({ ...group, items: group.items.map(it => it.id === updated.id ? updated : it) });
  };

  const handleRemoveItem = (itemId: string) => {
    onUpdate({ ...group, items: group.items.filter(it => it.id !== itemId) });
  };

  const toggleExpanded = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    onUpdate({ ...group, isExpanded: next });
  };

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          border: `1.5px solid ${color}35`,
          background: `linear-gradient(180deg, ${color}14 0%, ${color}06 100%)`,
        }}
      >
        {/* Goal row — 항상 보임 */}
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}25`, border: `1px solid ${color}44` }}
          >
            {typeof index === 'number' ? (
              <span className="text-[11px] font-black" style={{ color }}>{index + 1}</span>
            ) : (
              <Target className="w-3.5 h-3.5" style={{ color }} />
            )}
          </div>

          <span
            className="flex-1 text-sm font-bold text-white cursor-pointer leading-snug truncate"
            onClick={() => setShowGoalPicker(true)}
            title="클릭하여 목표 빌드 탭 열기"
          >
            {group.goal}
          </span>

          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
            style={{ backgroundColor: `${color}20`, color: `${color}e0`, border: `1px solid ${color}40` }}
            title="연결된 세부활동 수"
          >
            활동 {group.items.length}
          </span>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={toggleExpanded}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              {isExpanded
                ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
            </button>
            <button
              onClick={onRemove}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </button>
          </div>
        </div>

        {/* 세부활동 목록 — 아코디언 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className="px-3.5 pb-3 space-y-1.5"
                style={{ borderTop: `1px solid ${color}18` }}
              >
                {/* 세부활동 섹션 라벨 */}
                <div className="flex items-center gap-1.5 pt-2.5">
                  <span className="text-[10px]">⚡</span>
                  <span className="text-[10.5px] font-bold tracking-wide" style={{ color: `${color}cc` }}>
                    세부활동
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: `${color}15` }} />
                </div>

                {/* 활동 목록 — ActivityItemCard로 렌더링 */}
                {group.items.length > 0 && (
                  <div className="pt-1 space-y-1.5">
                    <AnimatePresence>
                      {group.items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: celebrateItemId === item.id ? [1, 1.04, 1] : 1,
                          }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ActivityItemCard
                            item={item}
                            color={color}
                            starId={starId}
                            linkedGoalText={group.goal}
                            onUpdate={handleUpdateItem}
                            onChangeGoal={(g) => onUpdate({ ...group, goal: g })}
                            onRemove={() => handleRemoveItem(item.id)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* 활동 추가 버튼 */}
                <button
                  onClick={() => setShowAddItem(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.99]"
                  style={{
                    border: `1px dashed ${color}30`,
                    color: `${color}80`,
                    backgroundColor: `${color}05`,
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  이 목표에 세부활동 추가
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showAddItem && (
        <AddItemSheet
          starId={starId}
          color={color}
          linkedGoalText={group.goal}
          onAdd={handleAddItem}
          onClose={() => setShowAddItem(false)}
        />
      )}

      {showGoalPicker && (
        <GoalTemplateSelector
          color={color}
          previouslySelected={group.goal ? [group.goal] : []}
          onSelect={(g) => { onUpdate({ ...group, goal: g }); setShowGoalPicker(false); }}
          onClose={() => setShowGoalPicker(false)}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   SemesterSection — 학기 단위 목표-활동 그룹 관리
══════════════════════════════════════════ */
function SemesterSection({
  semesterLabel, semesterEmoji, goalGroups, color, starId,
  onUpdateGoalGroups,
}: {
  semesterLabel: string;
  semesterEmoji: string;
  goalGroups: GoalActivityGroup[];
  color: string;
  starId: string;
  onUpdateGoalGroups: (groups: GoalActivityGroup[]) => void;
}) {
  const [goalInput, setGoalInput] = useState('');
  const [showGoalTemplates, setShowGoalTemplates] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);

  const hasGoals = goalGroups.length > 0;
  // 목표가 없으면 입력창을 바로 보여주고, 있으면 '목표 추가' 버튼을 눌렀을 때만 펼친다.
  const inputOpen = !hasGoals || showGoalInput;

  const addGoalGroup = (goalText: string) => {
    const trimmedGoalText = goalText.trim();
    if (!trimmedGoalText) return;
    const newGroup: GoalActivityGroup = {
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      goal: trimmedGoalText,
      items: [],
      isExpanded: true,
    };
    onUpdateGoalGroups([...goalGroups, newGroup]);
    setGoalInput('');
    setShowGoalInput(false);
  };

  const updateGoalGroup = (updated: GoalActivityGroup) => {
    onUpdateGoalGroups(goalGroups.map((g) => (g.id === updated.id ? updated : g)));
  };

  const removeGoalGroup = (groupId: string) => {
    onUpdateGoalGroups(goalGroups.filter((g) => g.id !== groupId));
  };

  return (
    <div className="space-y-3">
      {/* 학기 헤더 */}
      {semesterLabel && (
        <div className="flex items-center gap-2">
          <span className="text-sm">{semesterEmoji}</span>
          <span className="text-xs font-bold text-white">{semesterLabel}</span>
          <div className="flex-1 h-px" style={{ backgroundColor: `${color}25` }} />
          <span className="text-[12px] text-gray-500">{goalGroups.length}개 목표</span>
        </div>
      )}

      {/* 목표-활동 그룹 목록 */}
      {hasGoals && (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {goalGroups.map((group, idx) => (
              <motion.div
                key={group.id}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -16, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <GoalActivityGroupCard
                  group={group}
                  index={idx}
                  color={color}
                  starId={starId}
                  onUpdate={updateGoalGroup}
                  onRemove={() => removeGoalGroup(group.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 목표 추가 — 목표가 있으면 버튼, 없거나 추가 중이면 입력창 */}
      {hasGoals && !showGoalInput ? (
        <button
          onClick={() => setShowGoalInput(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
          style={{ color: `${color}cc`, backgroundColor: `${color}10`, border: `1.5px dashed ${color}40` }}
        >
          <Plus className="w-3.5 h-3.5" />
          목표 추가
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2.5 min-w-0">
            <input
              type="text"
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addGoalGroup(goalInput);
                if (e.key === 'Escape' && hasGoals) { setGoalInput(''); setShowGoalInput(false); }
              }}
              autoFocus={hasGoals && showGoalInput}
              placeholder={hasGoals ? '추가할 목표를 입력하세요' : '목표를 입력하거나 템플릿에서 선택하세요'}
              className="flex-1 min-w-0 h-12 px-4 rounded-xl text-base text-white placeholder-gray-500 outline-none transition-all focus:border-2"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,255,255,0.12)',
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGoalTemplates(true)}
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}20`, border: `1.5px solid ${color}44`, color }}
              title="목표 템플릿"
            >
              <Sparkles className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addGoalGroup(goalInput)}
              disabled={!goalInput.trim()}
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30"
              style={{ backgroundColor: `${color}25`, border: `1.5px solid ${color}44`, color }}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>

          {hasGoals && showGoalInput && (
            <button
              onClick={() => { setGoalInput(''); setShowGoalInput(false); }}
              className="w-full text-[11px] text-gray-500 hover:text-gray-300 transition-colors py-1"
            >
              취소
            </button>
          )}

          {!hasGoals && (
            <div
              className="rounded-xl py-4 flex flex-col items-center gap-1.5"
              style={{ border: `1.5px dashed ${color}25`, backgroundColor: `${color}05` }}
            >
              <Target className="w-5 h-5" style={{ color: `${color}60` }} />
              <span className="text-xs text-gray-500">목표를 추가하고 세부활동을 연결하세요</span>
            </div>
          )}
        </div>
      )}

      {showGoalTemplates && (
        <GoalTemplateSelector
          onSelect={(goal) => { addGoalGroup(goal); setShowGoalTemplates(false); }}
          onClose={() => setShowGoalTemplates(false)}
          color={color}
          previouslySelected={goalGroups.map((group) => group.goal)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   Single year card
══════════════════════════════════════════ */
function YearPlanCard({
  yearPlan, color, starId, isExpanded, onToggle, onUpdate, onRemove,
}: {
  yearPlan: YearPlan; color: string; starId: string;
  isExpanded: boolean; onToggle: () => void;
  onUpdate: (y: YearPlan) => void; onRemove: () => void;
}) {
  const goalGroups = yearPlan.goalGroups ?? [];
  const semesterPlans = yearPlan.semesterPlans ?? [];
  const semesterConf = SEMESTER_OPTIONS.find(s => s.id === yearPlan.semester);
  const needsSemesterPick = !yearPlan.semester;
  const gradeShortLabel = GRADE_YEARS.find(g => g.id === yearPlan.gradeId)?.label ?? yearPlan.gradeLabel;

  const totalGoals = yearPlan.semester === 'split'
    ? semesterPlans.reduce((s, sp) => s + (sp.goalGroups ?? []).length, 0)
    : goalGroups.length;

  const totalItems = yearPlan.semester === 'split'
    ? semesterPlans.reduce((s, sp) => s + (sp.goalGroups ?? []).reduce((gs, g) => gs + (g.items ?? []).length, 0), 0)
    : goalGroups.reduce((s, g) => s + (g.items ?? []).length, 0);

  const hasContent = totalGoals > 0 || totalItems > 0;

  const handleSemesterSelect = (semester: SemesterOption) => {
    const newSemesterPlans: SemesterPlan[] = semester === 'split'
      ? [
          { semesterId: 'first', semesterLabel: '1학기 (3~8월)', goalGroups: [], ungroupedItems: [] },
          { semesterId: 'second', semesterLabel: '2학기 (9~2월)', goalGroups: [], ungroupedItems: [] },
        ]
      : [];
    onUpdate({ ...yearPlan, semester, semesterPlans: newSemesterPlans, goalGroups: [] });
  };

  const updateGoalGroups = (groups: GoalActivityGroup[]) => {
    onUpdate({ ...yearPlan, goalGroups: groups });
  };

  const updateSemesterPlanGoalGroups = (semesterId: 'first' | 'second', groups: GoalActivityGroup[]) => {
    const updated = semesterPlans.map(sp =>
      sp.semesterId === semesterId ? { ...sp, goalGroups: groups } : sp
    );
    onUpdate({ ...yearPlan, semesterPlans: updated });
  };

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        border: `1.5px solid ${isExpanded ? color : color + '30'}`,
        background: isExpanded ? `linear-gradient(180deg, ${color}18 0%, ${color}08 100%)` : `${color}08`,
      }}>
      {/* Card header — 항상 표시 */}
      <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer" onClick={onToggle}>
        <div className="relative flex-shrink-0">
          <motion.div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black overflow-hidden relative z-10"
            style={
              hasContent || isExpanded
                ? { background: `linear-gradient(135deg, ${color}, ${color}bb)`, color: '#fff', border: '2px solid rgba(255,255,255,0.25)' }
                : { background: `${color}20`, color: '#fff', border: `1.5px dashed ${color}66` }
            }
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              boxShadow: isExpanded
                ? [`0 0 0 0 ${color}66`, `0 0 0 6px ${color}00`, `0 0 0 0 ${color}00`]
                : hasContent
                ? `0 0 14px ${color}66`
                : '0 0 0 transparent',
            }}
            transition={
              isExpanded
                ? { boxShadow: { duration: 1.6, repeat: Infinity, ease: 'easeOut' }, scale: { type: 'spring', stiffness: 520, damping: 18 } }
                : { type: 'spring', stiffness: 520, damping: 18 }
            }
          >
            <motion.span
              key={gradeShortLabel}
              initial={{ scale: 0.2, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 14, delay: 0.08 }}
              className="leading-none"
            >
              {gradeShortLabel}
            </motion.span>
          </motion.div>
          {hasContent && (
            <motion.div
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute -bottom-0.5 -right-0.5 z-20 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0f0f23]"
              style={{ backgroundColor: '#22c55e' }}
            >
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm">
            {yearPlan.gradeLabel}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {needsSemesterPick && (
              <span className="text-[12px]" style={{ color: `${color}bb` }}>학기 구성을 선택하세요</span>
            )}
            {semesterConf && !needsSemesterPick && (
              <span className="text-[12px]" style={{ color: `${color}99` }}>
                {semesterConf.emoji} {semesterConf.label}
              </span>
            )}
            {!needsSemesterPick && totalGoals > 0 && (
              <span className="text-[12px] text-gray-400">🎯 {totalGoals}개 목표</span>
            )}
            {!needsSemesterPick && totalItems > 0 && (
              <span className="text-[12px] text-gray-400">📌 {totalItems}개 활동</span>
            )}
            {!needsSemesterPick && totalGoals === 0 && totalItems === 0 && (
              <span className="text-[12px] text-gray-600">목표를 추가해보세요</span>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4" style={{ borderTop: `1px solid ${color}20` }}>

          {/* ① 학기 선택 — semester 미설정 시 카드 상단에 인라인 표시 */}
          {needsSemesterPick ? (
            <div className="pt-3 space-y-2.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" style={{ color }} />
                이 학년을 어떻게 계획할까요?
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SEMESTER_OPTIONS.map((opt, optIdx) => (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleSemesterSelect(opt.id as SemesterOption)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: optIdx * 0.06, type: 'spring', stiffness: 400, damping: 24 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex flex-col items-start gap-1 p-3 rounded-xl text-left overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: `1.5px solid ${color}40`,
                      boxShadow: `0 2px 12px rgba(0,0,0,0.2)`,
                    }}
                  >
                    <motion.span
                      className="text-xl"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      {opt.emoji}
                    </motion.span>
                    <span className="text-xs font-bold text-white">{opt.label}</span>
                    <span className="text-[12px] text-gray-500 leading-relaxed">{opt.description}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            /* ② 학기 선택 완료 후 — 계획 입력 영역 */
            <div className="pt-3 space-y-4">
              {/* 학기 변경 버튼 (작게) */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-500 flex items-center gap-1">
                  {semesterConf?.emoji} {semesterConf?.label}
                </span>
                <button
                  onClick={() => onUpdate({ ...yearPlan, semester: undefined as unknown as SemesterOption, goalGroups: [], semesterPlans: [] })}
                  className="text-[12px] text-gray-600 hover:text-gray-400 transition-colors underline"
                >
                  학기 변경
                </button>
              </div>

              {yearPlan.semester === 'split' ? (
                <div className="space-y-5">
                  {semesterPlans.map(sp => (
                    <SemesterSection
                      key={sp.semesterId}
                      semesterLabel={sp.semesterLabel}
                      semesterEmoji={sp.semesterId === 'first' ? '🌸' : '🍂'}
                      goalGroups={sp.goalGroups ?? []}
                      color={color}
                      starId={starId}
                      onUpdateGoalGroups={(groups) => updateSemesterPlanGoalGroups(sp.semesterId, groups)}
                    />
                  ))}
                </div>
              ) : (
                <SemesterSection
                  semesterLabel=""
                  semesterEmoji=""
                  goalGroups={goalGroups}
                  color={color}
                  starId={starId}
                  onUpdateGoalGroups={updateGoalGroups}
                />
              )}
            </div>
          )}

          <button onClick={onRemove}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-gray-600 hover:text-red-400 transition-colors">
            <Trash2 className="w-3 h-3" />이 학년 제거
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   STEP 3 — Continuous grade planner
══════════════════════════════════════════ */
function Step3Planner({
  yearPlans, onUpdateYears, starId, color, job,
}: {
  yearPlans: YearPlan[];
  onUpdateYears: (years: YearPlan[]) => void;
  starId: string; color: string;
  job: BuilderJob | undefined;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(
    yearPlans.length > 0 ? yearPlans[yearPlans.length - 1].gradeId : null
  );
  const [showGradePicker, setShowGradePicker] = useState(yearPlans.length === 0);
  const [pendingGradeId, setPendingGradeId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const usedIds = yearPlans.map(y => y.gradeId);

  /** 학년 선택 — 짧은 게임 피드백 후 카드 생성 */
  const handleGradeSelect = (gradeId: string) => {
    if (pendingGradeId) return;
    setPendingGradeId(gradeId);
    setTimeout(() => {
      const grade = GRADE_YEARS.find(g => g.id === gradeId)!;
      const newYear: YearPlan = {
        gradeId,
        gradeLabel: grade.label,
        semester: '',
        goals: [],
        items: [],
        goalGroups: [],
        semesterPlans: [],
      };
      onUpdateYears([...yearPlans, newYear]);
      setExpandedId(gradeId);
      setShowGradePicker(false);
      setPendingGradeId(null);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 120);
    }, 320);
  };

  const updateYear = (updated: YearPlan) => {
    onUpdateYears(yearPlans.map(y => y.gradeId === updated.gradeId ? updated : y));
  };

  const removeYear = (gradeId: string) => {
    const next = yearPlans.filter(y => y.gradeId !== gradeId);
    onUpdateYears(next);
    if (expandedId === gradeId) setExpandedId(next.length > 0 ? next[next.length - 1].gradeId : null);
  };

  const totalGoals = yearPlans.reduce((s, y) => {
    if (y.semester === 'split') {
      return s + (y.semesterPlans ?? []).reduce((ss, sp) => ss + (sp.goalGroups ?? []).length, 0);
    }
    return s + (y.goalGroups ?? []).length;
  }, 0);

  const totalItems = yearPlans.reduce((s, y) => {
    if (y.semester === 'split') {
      return s + (y.semesterPlans ?? []).reduce((ss, sp) =>
        ss + (sp.goalGroups ?? []).reduce((gs, g) => gs + (g.items ?? []).length, 0), 0);
    }
    return s + (y.goalGroups ?? []).reduce((gs, g) => gs + (g.items ?? []).length, 0);
  }, 0);

  const kingdom = careerMaker.kingdoms.find(k => k.id === starId);
  const filledStations = yearPlans.filter(y =>
    y.semester === 'split'
      ? (y.semesterPlans ?? []).some(sp => (sp.goalGroups ?? []).length > 0)
      : (y.goalGroups ?? []).length > 0
  ).length;
  const journeyPct = yearPlans.length > 0 ? Math.round((filledStations / yearPlans.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <TipBox text="각 학년이 여정의 정거장이에요. 정거장을 추가하고 눌러서 목표와 활동을 채워보세요!" />

      {/* ── Quest journey map ── */}
      <div className="relative">
        {/* 출발 */}
        <div className="flex items-center gap-3 pl-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)`, border: '2px solid rgba(255,255,255,0.25)', boxShadow: `0 0 16px ${color}66` }}>
            🚩
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold" style={{ color: `${color}cc` }}>여정 시작</div>
            <div className="text-sm font-black text-white truncate">{kingdom?.emoji} {kingdom?.name ?? '나의 왕국'}에서 출발</div>
          </div>
        </div>
        <JourneyConnector color={color} filled={yearPlans.length > 0} />

        {/* 정거장(학년) 카드 */}
        <AnimatePresence mode="popLayout">
          {yearPlans.map((year) => (
            <motion.div
              key={year.gradeId}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            >
              <YearPlanCard
                yearPlan={year} color={color} starId={starId}
                isExpanded={expandedId === year.gradeId}
                onToggle={() => setExpandedId(expandedId === year.gradeId ? null : year.gradeId)}
                onUpdate={updateYear}
                onRemove={() => removeYear(year.gradeId)}
              />
              <JourneyConnector color={color} filled />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 정거장 추가 */}
        <div className="rounded-2xl overflow-hidden transition-all"
          style={{
            border: showGradePicker ? `1.5px solid ${color}40` : '1.5px dashed rgba(255,255,255,0.12)',
            backgroundColor: showGradePicker ? `${color}08` : 'transparent',
          }}>
          {!showGradePicker ? (
            <button
              onClick={() => setShowGradePicker(true)}
              disabled={usedIds.length >= GRADE_YEARS.length}
              className="w-full flex items-center gap-3 py-3 pl-4 pr-4 text-sm font-bold transition-all active:scale-[0.99] disabled:opacity-40"
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: `1.5px dashed ${color}70`, background: `${color}12` }}>
                <Plus className="w-4 h-4" style={{ color }} />
              </div>
              <span style={{ color }}>{usedIds.length === 0 ? '첫 정거장(학년) 추가' : '다음 정거장 추가'}</span>
            </button>
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" style={{ color }} />
                  어떤 학년을 정거장에 추가할까요?
                </div>
                {yearPlans.length > 0 && (
                  <button onClick={() => setShowGradePicker(false)}>
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
              {[
                { label: '초등', emoji: '🏫', grades: GRADE_YEARS.filter(g => g.id.startsWith('elem')) },
                { label: '중학교', emoji: '🎒', grades: GRADE_YEARS.filter(g => g.id.startsWith('mid')) },
                { label: '고등학교', emoji: '🎓', grades: GRADE_YEARS.filter(g => g.id.startsWith('high')) },
                { label: '일반', emoji: '👔', grades: GRADE_YEARS.filter(g => g.id === 'univ' || g.id === 'general') },
              ].map(group => {
                const available = group.grades.filter(g => !usedIds.includes(g.id));
                if (available.length === 0) return null;
                return (
                  <div key={group.label}>
                    <div className="text-[12px] text-gray-600 font-semibold mb-1.5">{group.emoji} {group.label}</div>
                    <div className="flex gap-2 flex-wrap">
                      {available.map(g => {
                        const isPending = pendingGradeId === g.id;
                        return (
                          <motion.button
                            key={g.id}
                            onClick={() => handleGradeSelect(g.id)}
                            disabled={!!pendingGradeId}
                            initial={false}
                            animate={{
                              scale: isPending ? [1, 1.08, 1.02] : 1,
                              boxShadow: isPending
                                ? `0 0 20px ${color}66, 0 0 40px ${color}33`
                                : `0 0 0 transparent`,
                            }}
                            transition={{ duration: 0.32, ease: 'easeOut' }}
                            className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-black transition-colors disabled:opacity-90"
                            style={{
                              background: isPending
                                ? `linear-gradient(135deg, ${color}55, ${color}35)`
                                : `linear-gradient(135deg, ${color}30, ${color}18)`,
                              border: `1.5px solid ${isPending ? color : `${color}50`}`,
                              color: '#fff',
                            }}
                          >
                            {isPending && (
                              <motion.span
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                              >
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </motion.span>
                            )}
                            {g.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <JourneyConnector color={color} filled={filledStations > 0} />

        {/* 도착: 최종 목표 */}
        <div className="flex items-center gap-3 pl-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={filledStations > 0
              ? { background: `linear-gradient(135deg, ${color}, ${color}aa)`, border: '2px solid rgba(255,255,255,0.3)', boxShadow: `0 0 16px ${color}66` }
              : { background: 'rgba(255,255,255,0.05)', border: '1.5px dashed rgba(255,255,255,0.2)' }}>
            🏆
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold" style={{ color: filledStations > 0 ? `${color}cc` : 'rgba(255,255,255,0.4)' }}>최종 목표</div>
            <div className="text-sm font-black text-white truncate">{job?.icon} {job?.name ?? '목표 직업'}</div>
          </div>
        </div>
      </div>

      {/* 여정 진행도 (XP 바) */}
      {yearPlans.length > 0 && (
        <div className="px-4 py-3 rounded-xl space-y-2"
          style={{ background: `linear-gradient(135deg, ${color}1c, ${color}08)`, border: `1px solid ${color}30` }}>
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" style={{ color }} />
              여정 진행도
            </div>
            <div className="text-[12px] font-semibold" style={{ color: `${color}dd` }}>
              정거장 {yearPlans.length} · 목표 {totalGoals} · 활동 {totalItems}
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${journeyPct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 10px ${color}88` }}
            />
          </div>
          <div className="text-[12px]" style={{ color: `${color}aa` }}>
            {filledStations === yearPlans.length
              ? '모든 정거장에 목표가 있어요! 완성으로 넘어가세요 🎉'
              : `${yearPlans.length - filledStations}개 정거장에 목표를 더 채워보세요`}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

/* ══════════════════════════════════════════
   STEP 4 — Summary (상세 타임라인 미리보기)
══════════════════════════════════════════ */
function Step4Summary({ plan, color }: { plan: Partial<CareerPlan>; color: string }) {
  const years = plan.years ?? [];
  const totalGoals = years.reduce((s, y) =>
    y.semester === 'split'
      ? s + (y.semesterPlans ?? []).reduce((ss, sp) => ss + (sp.goalGroups ?? []).length, 0)
      : s + (y.goalGroups ?? []).length, 0);
  const totalActs = years.reduce((s, y) =>
    y.semester === 'split'
      ? s + (y.semesterPlans ?? []).reduce((ss, sp) => ss + (sp.goalGroups ?? []).reduce((gs, g) => gs + (g.items ?? []).length, 0), 0)
      : s + (y.goalGroups ?? []).reduce((gs, g) => gs + (g.items ?? []).length, 0), 0);

  const stats = [
    { emoji: '🚩', label: '정거장', value: years.length },
    { emoji: '🎯', label: '목표', value: totalGoals },
    { emoji: '⚡', label: '활동', value: totalActs },
  ];

  return (
    <div className="space-y-5">
      {/* 헤더: 승리 연출 */}
      <div className="relative rounded-2xl p-5 text-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}28, ${color}08)`, border: `1px solid ${color}44` }}>
        <motion.div
          className="text-5xl mb-3 inline-block"
          initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 14 }}
        >
          🏆
        </motion.div>
        <div className="text-xl font-black text-white">여정 지도 완성!</div>
        <div className="text-sm text-gray-400 mt-1.5">저장하면 타임라인에서 전체 로드맵을 볼 수 있어요</div>
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}33` }}>
            {plan.starEmoji} {plan.starName}
          </span>
          <ArrowRight className="w-4 h-4 text-gray-500" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}33` }}>
            {plan.jobEmoji} {plan.jobName}
          </span>
        </div>
      </div>

      {/* 여정 요약 스탯 */}
      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((st, i) => (
          <motion.div
            key={st.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 420, damping: 24 }}
            className="rounded-2xl py-3 flex flex-col items-center gap-0.5"
            style={{ background: `${color}12`, border: `1px solid ${color}2a` }}
          >
            <span className="text-lg leading-none">{st.emoji}</span>
            <span className="text-xl font-black text-white leading-tight">{st.value}</span>
            <span className="text-[11px] text-gray-400 font-semibold">{st.label}</span>
          </motion.div>
        ))}
      </div>

      {/* 상세 타임라인 (CareerPathDetailDialog와 동일 구조) — 상하 여백 확보로 하위 상세 잘림 방지 */}
      <div className="pb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">여정 미리보기</span>
        </div>
        <CareerPathTimelinePreview years={years} color={color} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Builder dialog
══════════════════════════════════════════ */
/** localStorage 등에서 로드한 yearPlans를 빌더 형식으로 정규화 */
function normalizeYearPlans(years: YearPlan[] | undefined): YearPlan[] {
  if (!years?.length) return [];
  return years.map((y) => ({
    ...y,
    yearId: y.yearId,
    semester: (y.semester ?? '') as SemesterOption,
    goalGroups: y.goalGroups ?? [],
    semesterPlans: y.semesterPlans ?? [],
    groups: y.groups ?? [],
    goals: y.goals ?? [],
    items: y.items ?? [],
  }));
}

export function CareerPathBuilder({ initialPlan, initialStep, onSave, onClose }: Props) {
  const [step, setStep] = useState(initialStep ?? 1);
  const [starId, setStarId] = useState(initialPlan?.starId ?? '');
  const [jobId, setJobId] = useState(initialPlan?.jobId ?? '');
  const [yearPlans, setYearPlans] = useState<YearPlan[]>(() => normalizeYearPlans(initialPlan?.years));

  const kingdom = careerMaker.kingdoms.find(k => k.id === starId);
  // 전체 왕국 직업 카탈로그에서 우선 조회하고, 없으면 대표 직업(구버전 저장 패스 호환)으로 폴백한다.
  const job = useMemo<BuilderJob | undefined>(() => {
    if (!kingdom || !jobId) return undefined;
    const full = loadKingdomJobsByKingdomId(kingdom.id).find(j => j.id === jobId);
    if (full) return { id: full.id, name: full.name, icon: full.icon, description: full.shortDescription || full.description };
    const rep = kingdom.representativeJobs.find(j => j.id === jobId);
    if (rep) return { id: rep.id, name: rep.name, icon: rep.icon, description: rep.description };
    return undefined;
  }, [kingdom, jobId]);
  const color = kingdom?.color ?? '#6C5CE7';

  const canProceed = () => {
    if (step === 1) return !!starId;
    if (step === 2) return !!jobId;
    if (step === 3) return yearPlans.length > 0 && yearPlans.every(y => ((y.semester ?? '') as string).length > 0);
    return true;
  };

  const handleSave = async () => {
    const gradeOrder = GRADE_YEARS.reduce((acc, g, i) => { acc[g.id] = i; return acc; }, {} as Record<string, number>);
    const sortedYears = yearPlans.sort((a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0));
    const star = kingdom ?? {
      id: initialPlan?.starId ?? '',
      name: initialPlan?.starName ?? '',
      emoji: initialPlan?.starEmoji ?? '⭐',
      color: initialPlan?.starColor ?? '#6C5CE7',
    };
    const jobInfo = job ?? {
      id: initialPlan?.jobId ?? '',
      name: initialPlan?.jobName ?? '',
      icon: initialPlan?.jobEmoji ?? '📌',
    };
    if (!star.id || !jobInfo.id) return;
    const plan: CareerPlan = {
      id: initialPlan?.id ?? `plan-${Date.now()}`,
      starId: star.id,
      starName: star.name,
      starEmoji: star.emoji,
      starColor: typeof star.color === 'string' ? star.color : '#6C5CE7',
      jobId: jobInfo.id,
      jobName: jobInfo.name,
      jobEmoji: jobInfo.icon,
      years: sortedYears,
      createdAt: initialPlan?.createdAt ?? new Date().toISOString(),
      title: `${jobInfo.name} 커리어 패스`,
      description: initialPlan?.description,
      isPublic: initialPlan?.isPublic,
      shareChannels: initialPlan?.shareChannels,
      shareType: initialPlan?.shareType,
      shareGroupIds: initialPlan?.shareGroupIds,
      sharedAt: initialPlan?.sharedAt,
    };
    await onSave(plan);
  };

  const headings: Record<number, { title: string; desc: string }> = {
    1: { title: '어떤 왕국으로 떠날까요?',  desc: '모험을 시작할 관심 분야의 별을 선택하세요' },
    2: { title: '함께할 직업을 정해요',     desc: `${kingdom?.name ?? ''}에서 목표로 삼을 직업을 골라보세요` },
    3: { title: '학년별 여정을 그려요',     desc: '각 학년 정거장을 눌러 목표와 활동을 채우세요' },
    4: { title: '여정 완성!',               desc: '저장하면 타임라인에서 전체 로드맵을 볼 수 있어요' },
  };

  const careerPathBuilderDialogTheme = CAREER_PATH_BUILDER_DIALOG;

  return (
    <div
      className="fixed inset-0 flex items-stretch md:items-center justify-center p-0 md:p-4"
      style={{ zIndex: CAREER_PATH_NESTED_OVERLAY_Z_INDEX }}
    >
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          backgroundColor: `rgba(0,0,0,${careerPathBuilderDialogTheme.backdropOverlayOpacity})`,
          backdropFilter: `blur(${careerPathBuilderDialogTheme.backdropBlurPx}px)`,
          WebkitBackdropFilter: `blur(${careerPathBuilderDialogTheme.backdropBlurPx}px)`,
        }}
      />
      <div
        className="relative z-10 flex flex-col w-full h-full md:h-auto md:rounded-[28px] overflow-hidden min-h-0"
        style={{
          width: '100%',
          maxWidth: `min(100%, ${careerPathBuilderDialogTheme.maxWidthPx}px)`,
          maxHeight: `min(${careerPathBuilderDialogTheme.panelMaxHeightDvh}dvh, ${careerPathBuilderDialogTheme.panelMaxHeightPx}px)`,
          marginLeft: 'auto',
          marginRight: 'auto',
          border: `1px solid ${careerPathBuilderDialogTheme.panelBorderGlow}`,
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.07), 0 0 100px rgba(124,77,255,0.16), 0 28px 72px rgba(0,0,0,0.58)',
        }}
      >
        <CareerPathBuilderDawnSky />
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div
        className="flex-shrink-0"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: careerPathBuilderDialogTheme.chromeTint,
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3.5">
          <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div className="flex-1 flex justify-center px-2">
            <QuestTrack current={step} color={color || '#6C5CE7'} onStepClick={setStep} />
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Step heading */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4">
        <h2 className="text-xl font-black text-white leading-snug">{headings[step].title}</h2>
        <p className="text-sm text-gray-400 mt-1">{headings[step].desc}</p>
        {/* Step 4는 Step4Summary에 왕국→직업 표시하므로 여기서는 생략 */}
        {step >= 2 && step !== 4 && kingdom && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}33` }}>
              {kingdom.emoji} {kingdom.name}
            </span>
            {step >= 3 && job && (
              <>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}33` }}>
                  {job.icon} {job.name}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {step === 1 && <Step1Kingdom selectedId={starId} onSelect={id => { setStarId(id); setJobId(''); }} />}
        {step === 2 && kingdom && <Step2Job kingdom={kingdom} selectedJobId={jobId} onSelect={setJobId} />}
        {step === 3 && <Step3Planner yearPlans={yearPlans} onUpdateYears={setYearPlans} starId={starId} color={color} job={job} />}
        {step === 4 && <Step4Summary plan={{ starId, starName: kingdom?.name, starEmoji: kingdom?.emoji, starColor: color, jobId, jobName: job?.name, jobEmoji: job?.icon, years: yearPlans }} color={color} />}
      </div>

      {/* Footer */}
      <div
        className="flex-shrink-0 px-5 space-y-2"
        style={{
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 16,
          backgroundColor: careerPathBuilderDialogTheme.chromeTint,
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        <button
          onClick={step === 4 ? handleSave : () => setStep(s => s + 1)}
          disabled={!canProceed()}
          className="w-full h-14 rounded-2xl font-black text-base text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-35"
          style={canProceed()
            ? { background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 6px 24px ${color}44` }
            : { backgroundColor: 'rgba(255,255,255,0.08)' }}>
          {step === 4 ? (
            <><CheckCircle2 className="w-5 h-5" />여정 저장하기</>
          ) : step === 3 ? (
            <><span>여정 미리보기</span><ChevronRight className="w-5 h-5" /></>
          ) : (
            <><span>다음으로</span><ChevronRight className="w-5 h-5" /></>
          )}
        </button>
        {step === 3 && (
          <p className="text-center text-xs text-gray-600">정거장(학년)을 1개 이상 추가하면 다음으로 넘어갈 수 있어요</p>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
