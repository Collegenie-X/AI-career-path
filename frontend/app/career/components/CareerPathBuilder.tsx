'use client';

import { useState, useCallback, useRef } from 'react';
import {
  X, ChevronRight, ChevronLeft, Check, Plus, Trash2,
  Wand2, Pencil, Target, Lightbulb, Sparkles,
  GraduationCap, Calendar, ArrowRight,
  CheckCircle2, ChevronDown, ChevronUp, Flame, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ITEM_TYPES, GRADE_YEARS } from '../config';
import careerMaker from '@/data/career-maker.json';
import portfolioItems from '@/data/portfolio-items.json';
import { GoalTemplateSelector } from './GoalTemplateSelector';
import { CareerPathTimelinePreview } from './CareerPathTimelinePreview';

/* ─── Types ─── */
export type ItemType = 'activity' | 'award' | 'portfolio' | 'certification';

export type PlanItem = {
  id: string;
  type: ItemType;
  title: string;
  months: number[];        // 다중 월 선택
  difficulty: number;
  cost: string;
  organizer: string;
  custom?: boolean;
};

export type PlanGroup = {
  id: string;
  label: string;
  items: PlanItem[];
};

export type YearPlan = {
  gradeId: string;
  gradeLabel: string;
  goals: string[];
  items: PlanItem[];
  groups?: PlanGroup[];
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
  isPublic?: boolean;
  shareType?: string;
  sharedAt?: string;
};

type Props = {
  initialPlan?: CareerPlan | null;
  initialStep?: number;
  onSave: (plan: CareerPlan) => void;
  onClose: () => void;
};

/* ─── Step config ─── */
const STEPS = [
  { id: 1, title: '왕국 선택',   emoji: '🌟' },
  { id: 2, title: '직업 선택',   emoji: '🎯' },
  { id: 3, title: '계획 세우기', emoji: '📋' },
  { id: 4, title: '완성!',       emoji: '🎉' },
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

/* ─── Step dots ─── */
function StepDots({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="rounded-full transition-all duration-300"
          style={{ width: i + 1 === current ? 20 : 7, height: 7, backgroundColor: i + 1 <= current ? color : 'rgba(255,255,255,0.15)' }} />
      ))}
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
          <span className="text-[10px] text-gray-500">추천:</span>
          <button
            onClick={() => onChange([...presetMonths].sort((a, b) => a - b))}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
            style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            {presetMonths.map(m => `${m}월`).join(', ')} 선택
          </button>
          <button
            onClick={() => onChange([])}
            className="text-[10px] text-gray-600 underline"
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
        <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
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
      <div className="grid grid-cols-2 gap-2.5">
        {careerMaker.kingdoms.map(k => (
          <button key={k.id} onClick={() => onSelect(k.id)}
            className="relative flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all duration-200 active:scale-[0.97]"
            style={selectedId === k.id
              ? { background: `linear-gradient(135deg, ${k.color}33, ${k.color}18)`, border: `2px solid ${k.color}`, boxShadow: `0 0 20px ${k.color}30` }
              : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
            {selectedId === k.id && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: k.color }}>
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <span className="text-3xl">{k.emoji}</span>
            <div className="text-center">
              <div className="text-sm font-bold" style={{ color: selectedId === k.id ? k.color : 'rgba(255,255,255,0.8)' }}>{k.name}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{k.description.slice(0, 22)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   STEP 2 — Job
══════════════════════════════════════════ */
function Step2Job({ kingdom, selectedJobId, onSelect }: { kingdom: typeof careerMaker.kingdoms[0]; selectedJobId: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
        style={{ background: `linear-gradient(135deg, ${kingdom.color}22, ${kingdom.color}08)`, border: `1px solid ${kingdom.color}33` }}>
        <span className="text-xl">{kingdom.emoji}</span>
        <div>
          <div className="text-sm font-bold text-white">{kingdom.name}</div>
          <div className="text-xs text-gray-400">{kingdom.description}</div>
        </div>
      </div>
      <TipBox text={`${kingdom.name}의 대표 직업이에요. 가장 흥미로운 직업을 하나 선택하세요!`} />
      <div className="space-y-2.5">
        {kingdom.representativeJobs.map(job => (
          <button key={job.id} onClick={() => onSelect(job.id)}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.99]"
            style={selectedJobId === job.id
              ? { background: `linear-gradient(135deg, ${kingdom.color}25, ${kingdom.color}10)`, border: `2px solid ${kingdom.color}` }
              : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: selectedJobId === job.id ? `linear-gradient(135deg, ${kingdom.color}33, ${kingdom.color}18)` : 'rgba(255,255,255,0.06)' }}>
              {job.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base" style={{ color: selectedJobId === job.id ? kingdom.color : 'white' }}>{job.name}</div>
              <div className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{job.description}</div>
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={selectedJobId === job.id ? { backgroundColor: kingdom.color } : { border: '1.5px solid rgba(255,255,255,0.15)' }}>
              {selectedJobId === job.id ? <Check className="w-4 h-4 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
            </div>
          </button>
        ))}
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
};

function AddItemSheet({
  starId, color, onAdd, onClose,
}: {
  starId: string; color: string;
  onAdd: (item: Omit<PlanItem, 'id'>) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'pick' | 'custom'>('pick');
  const [filterType, setFilterType] = useState('all');

  // Recommend mode state
  const [selectedSuggest, setSelectedSuggest] = useState<SuggestedItem | null>(null);
  const [suggestMonths, setSuggestMonths] = useState<number[]>([]);

  // Custom mode state
  const [customType, setCustomType] = useState<ItemType>('activity');
  const [customTitle, setCustomTitle] = useState('');
  const [customMonths, setCustomMonths] = useState<number[]>([3]);
  const [customDifficulty, setCustomDifficulty] = useState(2);
  const [customCost, setCustomCost] = useState('무료');
  const [customOrganizer, setCustomOrganizer] = useState('');

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
  }));

  const allItems: SuggestedItem[] = [...careerItems, ...portItems];
  const filtered = filterType === 'all' ? allItems : allItems.filter(it => it.type === filterType);

  const handleSelectSuggest = (item: SuggestedItem) => {
    setSelectedSuggest(item);
    setSuggestMonths([...item.months].sort((a, b) => a - b));
  };

  const handleAddSuggest = () => {
    if (!selectedSuggest || suggestMonths.length === 0) return;
    onAdd({
      type: selectedSuggest.type as ItemType,
      title: selectedSuggest.title,
      months: suggestMonths,
      difficulty: selectedSuggest.difficulty,
      cost: selectedSuggest.cost,
      organizer: selectedSuggest.organizer ?? '',
    });
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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/8 flex-shrink-0">
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
        <div className="flex gap-2 px-4 pt-3 pb-2 flex-shrink-0">
          {(['pick', 'custom'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setSelectedSuggest(null); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={mode === m ? { backgroundColor: color, color: '#fff' } : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
              {m === 'pick' ? <><Wand2 className="w-4 h-4" />추천 선택</> : <><Pencil className="w-4 h-4" />직접 입력</>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-5">
          {/* ── Recommend mode ── */}
          {mode === 'pick' && !selectedSuggest && (
            <div className="space-y-2.5 pt-1">
              {/* Type filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {[{ value: 'all', label: '전체', emoji: '✨' }, ...ITEM_TYPES.map(t => ({ value: t.value, label: t.label, emoji: t.emoji }))].map(t => (
                  <button key={t.value} onClick={() => setFilterType(t.value)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={filterType === t.value ? { backgroundColor: color, color: '#fff' } : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="py-10 text-center text-sm text-gray-500">항목이 없어요</div>
              )}

              {filtered.map(item => {
                const tc = ITEM_TYPES.find(t => t.value === item.type)!;
                return (
                  <button key={item.id} onClick={() => handleSelectSuggest(item)}
                    className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all active:scale-[0.99]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${tc?.color ?? color}18` }}>{tc?.emoji ?? '📌'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white leading-snug">{item.title}</div>
                      {(item as SuggestedItem).subtitle && (
                        <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{(item as SuggestedItem).subtitle}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold" style={{ color: tc?.color ?? color }}>{tc?.label}</span>
                        <span className="text-[10px] text-gray-500">
                          {item.months.slice(0, 3).map(m => `${m}월`).join('·')}
                          {item.months.length > 3 ? ' 외' : ''}
                        </span>
                        {'organizer' in item && item.organizer && item.organizer !== '개인' && (
                          <span className="text-[10px] text-gray-600">{item.organizer}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Recommend mode: month picker ── */}
          {mode === 'pick' && selectedSuggest && (
            <div className="space-y-4 pt-2">
              {/* Selected item preview */}
              <div className="rounded-2xl p-3.5"
                style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">
                    {ITEM_TYPES.find(t => t.value === selectedSuggest.type)?.emoji ?? '📌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm leading-snug">{selectedSuggest.title}</div>
                    {selectedSuggest.subtitle && (
                      <div className="text-xs text-gray-400 mt-0.5">{selectedSuggest.subtitle}</div>
                    )}
                    {selectedSuggest.tip && (
                      <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg"
                        style={{ backgroundColor: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
                        <Info className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] text-purple-300 leading-relaxed">{selectedSuggest.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
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
                disabled={suggestMonths.length === 0}
                onClick={handleAddSuggest}
                className="w-full h-12 rounded-xl font-bold text-white transition-all disabled:opacity-40"
                style={suggestMonths.length > 0
                  ? { background: `linear-gradient(135deg, ${color}, ${color}aa)`, boxShadow: `0 4px 14px ${color}44` }
                  : { backgroundColor: 'rgba(255,255,255,0.08)' }}>
                {suggestMonths.length > 0
                  ? `${suggestMonths.map(m => `${m}월`).join(', ')} — 추가하기`
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
                <div className="text-xs text-gray-400 mb-2 font-semibold">이름 *</div>
                <input type="text" value={customTitle} onChange={e => setCustomTitle(e.target.value)}
                  placeholder={
                    customType === 'activity' ? '예: 전국 AI 해커톤 참가' :
                    customType === 'award' ? '예: 교내 과학탐구대회 금상' :
                    customType === 'portfolio' ? '예: 기후변화 탐구 보고서' :
                    '예: 컴퓨터활용능력 1급'
                  }
                  className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
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
                    className="w-full h-10 px-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-2 font-semibold">주관 / 출처</div>
                  <input type="text" value={customOrganizer} onChange={e => setCustomOrganizer(e.target.value)} placeholder="예: 학교·자체"
                    className="w-full h-10 px-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>

              <button
                disabled={!customTitle.trim() || customMonths.length === 0}
                onClick={() => {
                  if (!customTitle.trim() || customMonths.length === 0) return;
                  onAdd({ type: customType, title: customTitle.trim(), months: customMonths, difficulty: customDifficulty, cost: customCost, organizer: customOrganizer, custom: true });
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
   Single year card
══════════════════════════════════════════ */
function YearPlanCard({
  yearPlan, color, starId, isExpanded, onToggle, onUpdate, onRemove,
}: {
  yearPlan: YearPlan; color: string; starId: string;
  isExpanded: boolean; onToggle: () => void;
  onUpdate: (y: YearPlan) => void; onRemove: () => void;
}) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [addItemGroupId, setAddItemGroupId] = useState<string | undefined>(undefined);
  const [goalInput, setGoalInput] = useState('');
  const [showGoalTemplates, setShowGoalTemplates] = useState(false);
  const [editingGoalIdx, setEditingGoalIdx] = useState<number | null>(null);
  const [editingGoalText, setEditingGoalText] = useState('');
  const [celebrateGoal, setCelebrateGoal] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemTitle, setEditingItemTitle] = useState('');
  const [celebrateItemId, setCelebrateItemId] = useState<string | null>(null);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [groupInput, setGroupInput] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupLabel, setEditingGroupLabel] = useState('');

  const addGoal = () => {
    if (!goalInput.trim()) return;
    const newGoals = [...yearPlan.goals, goalInput.trim()];
    onUpdate({ ...yearPlan, goals: newGoals });
    setGoalInput('');
    
    // 🎉 Celebration effect
    const newIdx = newGoals.length - 1;
    setCelebrateGoal(newIdx);
    setTimeout(() => setCelebrateGoal(null), 1000);
  };

  const removeGoal = (idx: number) => {
    onUpdate({ ...yearPlan, goals: yearPlan.goals.filter((_, i) => i !== idx) });
  };

  const startEditGoal = (idx: number) => {
    setEditingGoalIdx(idx);
    setEditingGoalText(yearPlan.goals[idx]);
  };

  const saveEditGoal = () => {
    if (editingGoalIdx === null) return;
    if (!editingGoalText.trim()) {
      removeGoal(editingGoalIdx);
    } else {
      const newGoals = [...yearPlan.goals];
      newGoals[editingGoalIdx] = editingGoalText.trim();
      onUpdate({ ...yearPlan, goals: newGoals });
    }
    setEditingGoalIdx(null);
    setEditingGoalText('');
  };

  const selectGoalTemplate = (goal: string) => {
    const newGoals = [...yearPlan.goals, goal];
    onUpdate({ ...yearPlan, goals: newGoals });
    
    // 🎉 Celebration effect
    const newIdx = newGoals.length - 1;
    setCelebrateGoal(newIdx);
    setTimeout(() => setCelebrateGoal(null), 1000);
  };

  const addItem = (item: Omit<PlanItem, 'id'>, groupId?: string) => {
    const newItem: PlanItem = { ...item, id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}` };
    if (groupId) {
      const groups = (yearPlan.groups ?? []).map(g =>
        g.id === groupId ? { ...g, items: [...g.items, newItem] } : g
      );
      onUpdate({ ...yearPlan, groups });
    } else {
      onUpdate({ ...yearPlan, items: [...yearPlan.items, newItem] });
    }
    setCelebrateItemId(newItem.id);
    setTimeout(() => setCelebrateItemId(null), 1000);
  };

  const removeItem = (id: string, groupId?: string) => {
    if (groupId) {
      const groups = (yearPlan.groups ?? []).map(g =>
        g.id === groupId ? { ...g, items: g.items.filter(it => it.id !== id) } : g
      );
      onUpdate({ ...yearPlan, groups });
    } else {
      onUpdate({ ...yearPlan, items: yearPlan.items.filter(it => it.id !== id) });
    }
  };

  const startEditItem = (item: PlanItem) => {
    setEditingItemId(item.id);
    setEditingItemTitle(item.title);
  };

  const saveEditItem = (itemId: string, groupId?: string) => {
    if (!editingItemTitle.trim()) {
      removeItem(itemId, groupId);
    } else if (groupId) {
      const groups = (yearPlan.groups ?? []).map(g =>
        g.id === groupId ? { ...g, items: g.items.map(it => it.id === itemId ? { ...it, title: editingItemTitle.trim() } : it) } : g
      );
      onUpdate({ ...yearPlan, groups });
    } else {
      const newItems = yearPlan.items.map(it =>
        it.id === itemId ? { ...it, title: editingItemTitle.trim() } : it
      );
      onUpdate({ ...yearPlan, items: newItems });
    }
    setEditingItemId(null);
    setEditingItemTitle('');
  };

  const addGroup = (label: string) => {
    const newGroup: PlanGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      label,
      items: [],
    };
    onUpdate({ ...yearPlan, groups: [...(yearPlan.groups ?? []), newGroup] });
  };

  const removeGroup = (groupId: string) => {
    onUpdate({ ...yearPlan, groups: (yearPlan.groups ?? []).filter(g => g.id !== groupId) });
  };

  const renameGroup = (groupId: string, label: string) => {
    const groups = (yearPlan.groups ?? []).map(g => g.id === groupId ? { ...g, label } : g);
    onUpdate({ ...yearPlan, groups });
  };

  const allGroupItems = (yearPlan.groups ?? []).flatMap(g => g.items);
  const totalCount = yearPlan.goals.length + yearPlan.items.length + allGroupItems.length;

  // summarize months across all items for the header
  const allMonths = [...new Set([...yearPlan.items, ...allGroupItems].flatMap(it => it.months))].sort((a, b) => a - b);

  return (
    <>
      <div className="rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          border: `1.5px solid ${isExpanded ? color : color + '30'}`,
          background: isExpanded ? `linear-gradient(180deg, ${color}18 0%, ${color}08 100%)` : `${color}08`,
        }}>
        {/* Card header */}
        <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer" onClick={onToggle}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, color: '#fff' }}>
            {yearPlan.gradeLabel}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm">
              {GRADE_YEARS.find(g => g.id === yearPlan.gradeId)?.fullLabel ?? yearPlan.gradeLabel}
            </div>
            {totalCount > 0 ? (
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {yearPlan.goals.length > 0 && <span className="text-[10px] text-gray-400">🎯 {yearPlan.goals.length}개 목표</span>}
                {yearPlan.items.length > 0 && (
                  <span className="text-[10px] text-gray-400">
                    {yearPlan.items.slice(0, 3).map(it => ITEM_TYPES.find(t => t.value === it.type)?.emoji).join('')}
                    {' '}{yearPlan.items.length}개 항목
                  </span>
                )}
                {allMonths.length > 0 && (
                  <span className="text-[10px]" style={{ color: `${color}99` }}>
                    📅 {allMonths.slice(0, 4).map(m => `${m}월`).join('·')}{allMonths.length > 4 ? '…' : ''}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-gray-600 mt-0.5">탭해서 계획 추가하기</div>
            )}
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>

        {/* Expanded body */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4" style={{ borderTop: `1px solid ${color}20` }}>
            {/* Goals */}
            <div className="pt-3">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Target className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-xs font-bold text-white">이 학년의 목표</span>
                <span className="text-[10px] text-gray-500 ml-1">2~3개 추천</span>
              </div>
              
              <AnimatePresence>
                {yearPlan.goals.map((goal, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ 
                      opacity: 1, 
                      scale: celebrateGoal === idx ? [1, 1.05, 1] : 1,
                      y: 0 
                    }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1.5 group relative overflow-hidden"
                    style={{ 
                      backgroundColor: `${color}14`, 
                      border: `1px solid ${color}22`,
                      boxShadow: celebrateGoal === idx ? `0 0 20px ${color}66` : 'none'
                    }}
                  >
                    {celebrateGoal === idx && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 0] }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 rounded-xl"
                        style={{ 
                          background: `radial-gradient(circle, ${color}44 0%, transparent 70%)`,
                          pointerEvents: 'none'
                        }}
                      />
                    )}
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    
                    {editingGoalIdx === idx ? (
                      <input
                        type="text"
                        value={editingGoalText}
                        onChange={(e) => setEditingGoalText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditGoal();
                          if (e.key === 'Escape') setEditingGoalIdx(null);
                        }}
                        onBlur={saveEditGoal}
                        autoFocus
                        className="flex-1 bg-transparent text-sm text-white outline-none"
                      />
                    ) : (
                      <span 
                        className="flex-1 text-sm text-white cursor-pointer"
                        onClick={() => startEditGoal(idx)}
                      >
                        {goal}
                      </span>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeGoal(idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-gray-600 hover:text-red-400" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {yearPlan.goals.length < 5 && (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={goalInput} 
                    onChange={e => setGoalInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addGoal(); }}
                    placeholder={`${yearPlan.gradeLabel} 목표를 입력하세요`}
                    className="flex-1 h-10 px-3.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} 
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowGoalTemplates(true)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ backgroundColor: `${color}15`, border: `1px solid ${color}33`, color }}
                    title="목표 템플릿 선택"
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addGoal}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ backgroundColor: `${color}25`, border: `1px solid ${color}44`, color }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>
            
            {showGoalTemplates && (
              <GoalTemplateSelector
                onSelect={selectGoalTemplate}
                onClose={() => setShowGoalTemplates(false)}
                color={color}
              />
            )}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

            {/* Items section header */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" style={{ color }} />
                  <span className="text-xs font-bold text-white">활동 · 수상 · 작품 · 자격증</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setAddItemGroupId(undefined); setShowAddItem(true); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${color}30, ${color}15)`, border: `1px solid ${color}50`, color }}>
                    <Plus className="w-3 h-3" />항목
                  </button>
                  <button
                    onClick={() => setShowAddGroup(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                    <Plus className="w-3 h-3" />그룹
                  </button>
                </div>
              </div>

              {/* Add group input */}
              {showAddGroup && (
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={groupInput}
                    onChange={(e) => setGroupInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && groupInput.trim()) { addGroup(groupInput.trim()); setGroupInput(''); setShowAddGroup(false); }
                      if (e.key === 'Escape') { setGroupInput(''); setShowAddGroup(false); }
                    }}
                    placeholder="예: 1학기, 여름방학, 3~6월..."
                    autoFocus
                    className="flex-1 h-9 px-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: `1px solid ${color}44` }}
                  />
                  <button
                    onClick={() => { if (groupInput.trim()) { addGroup(groupInput.trim()); setGroupInput(''); setShowAddGroup(false); } }}
                    disabled={!groupInput.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30"
                    style={{ backgroundColor: color }}>
                    <Check className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => { setGroupInput(''); setShowAddGroup(false); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              )}

              {/* Groups */}
              {(yearPlan.groups ?? []).length > 0 && (
                <div className="space-y-3 mb-3">
                  {(yearPlan.groups ?? []).map(group => (
                    <div key={group.id} className="rounded-2xl overflow-hidden"
                      style={{ border: `1px solid ${color}28`, backgroundColor: `${color}06` }}>
                      {/* Group header */}
                      <div className="flex items-center gap-2 px-3 py-2"
                        style={{ borderBottom: group.items.length > 0 ? `1px solid ${color}18` : 'none' }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        {editingGroupId === group.id ? (
                          <input
                            type="text"
                            value={editingGroupLabel}
                            onChange={(e) => setEditingGroupLabel(e.target.value)}
                            onBlur={() => { if (editingGroupLabel.trim()) renameGroup(group.id, editingGroupLabel.trim()); setEditingGroupId(null); }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { if (editingGroupLabel.trim()) renameGroup(group.id, editingGroupLabel.trim()); setEditingGroupId(null); }
                              if (e.key === 'Escape') setEditingGroupId(null);
                            }}
                            autoFocus
                            className="flex-1 bg-transparent text-xs font-bold text-white outline-none"
                          />
                        ) : (
                          <span
                            className="flex-1 text-xs font-bold cursor-text"
                            style={{ color }}
                            onClick={() => { setEditingGroupId(group.id); setEditingGroupLabel(group.label); }}
                          >
                            {group.label}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-600">{group.items.length}개</span>
                        <button
                          onClick={() => { setAddItemGroupId(group.id); setShowAddItem(true); }}
                          className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                          style={{ backgroundColor: `${color}18`, color }}>
                          <Plus className="w-3 h-3" />추가
                        </button>
                        <button onClick={() => removeGroup(group.id)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                      {/* Group items */}
                      {group.items.length > 0 && (
                        <div className="px-3 py-2 space-y-1.5">
                          <AnimatePresence>
                            {group.items.map(item => {
                              const tc = ITEM_TYPES.find(t => t.value === item.type)!;
                              const monthLabel = item.months.length === 1
                                ? `${item.months[0]}월`
                                : item.months.length <= 3
                                ? item.months.map(m => `${m}월`).join('·')
                                : `${item.months[0]}~${item.months[item.months.length - 1]}월`;
                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, y: -6 }}
                                  animate={{ opacity: 1, y: 0, scale: celebrateItemId === item.id ? [1, 1.04, 1] : 1 }}
                                  exit={{ opacity: 0, x: -16 }}
                                  transition={{ duration: 0.25 }}
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl group"
                                  style={{ backgroundColor: `${tc.color}10`, border: `1px solid ${tc.color}22` }}
                                >
                                  <span className="text-base flex-shrink-0">{tc.emoji}</span>
                                  <div className="flex-1 min-w-0">
                                    {editingItemId === item.id ? (
                                      <input
                                        type="text"
                                        value={editingItemTitle}
                                        onChange={(e) => setEditingItemTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') saveEditItem(item.id, group.id);
                                          if (e.key === 'Escape') setEditingItemId(null);
                                        }}
                                        onBlur={() => saveEditItem(item.id, group.id)}
                                        autoFocus
                                        className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                                      />
                                    ) : (
                                      <div className="text-sm font-semibold text-white line-clamp-1 cursor-pointer"
                                        onClick={() => startEditItem(item)}>
                                        {item.title}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                      <span className="text-[10px] font-bold" style={{ color: tc.color }}>{tc.label}</span>
                                      <span className="text-[10px] text-gray-500">📅 {monthLabel}</span>
                                    </div>
                                  </div>
                                  <button onClick={() => removeItem(item.id, group.id)}
                                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <Trash2 className="w-3 h-3 text-gray-600" />
                                  </button>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      )}
                      {group.items.length === 0 && (
                        <button
                          onClick={() => { setAddItemGroupId(group.id); setShowAddItem(true); }}
                          className="w-full py-3 flex items-center justify-center gap-1.5 text-xs"
                          style={{ color: `${color}66` }}>
                          <Plus className="w-3.5 h-3.5" />이 그룹에 항목 추가
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Ungrouped items */}
              {yearPlan.items.length === 0 && (yearPlan.groups ?? []).length === 0 ? (
                <button onClick={() => { setAddItemGroupId(undefined); setShowAddItem(true); }}
                  className="w-full py-4 rounded-2xl flex flex-col items-center gap-1.5 transition-all active:scale-[0.99]"
                  style={{ border: `1.5px dashed ${color}30`, backgroundColor: `${color}06` }}>
                  <div className="flex gap-1.5 text-lg">{ITEM_TYPES.map(t => <span key={t.value}>{t.emoji}</span>)}</div>
                  <span className="text-xs text-gray-500">항목 추가 또는 그룹으로 묶기</span>
                </button>
              ) : yearPlan.items.length > 0 ? (
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {yearPlan.items.map(item => {
                      const tc = ITEM_TYPES.find(t => t.value === item.type)!;
                      const monthLabel = item.months.length === 1
                        ? `${item.months[0]}월`
                        : item.months.length <= 3
                        ? item.months.map(m => `${m}월`).join('·')
                        : `${item.months[0]}~${item.months[item.months.length - 1]}월`;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ 
                            opacity: 1, 
                            scale: celebrateItemId === item.id ? [1, 1.05, 1] : 1,
                            y: 0 
                          }}
                          exit={{ opacity: 0, scale: 0.95, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl group relative overflow-hidden"
                          style={{ 
                            backgroundColor: `${tc.color}10`, 
                            border: `1px solid ${tc.color}22`,
                            boxShadow: celebrateItemId === item.id ? `0 0 20px ${tc.color}66` : 'none'
                          }}
                        >
                          {celebrateItemId === item.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.5, 0] }}
                              transition={{ duration: 0.8 }}
                              className="absolute inset-0 rounded-xl"
                              style={{ 
                                background: `radial-gradient(circle, ${tc.color}44 0%, transparent 70%)`,
                                pointerEvents: 'none'
                              }}
                            />
                          )}
                          <span className="text-lg flex-shrink-0">{tc.emoji}</span>
                          <div className="flex-1 min-w-0">
                            {editingItemId === item.id ? (
                              <input
                                type="text"
                                value={editingItemTitle}
                                onChange={(e) => setEditingItemTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditItem(item.id);
                                  if (e.key === 'Escape') setEditingItemId(null);
                                }}
                                onBlur={() => saveEditItem(item.id)}
                                autoFocus
                                className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                              />
                            ) : (
                              <div 
                                className="text-sm font-semibold text-white line-clamp-1 cursor-pointer"
                                onClick={() => startEditItem(item)}
                              >
                                {item.title}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] font-bold" style={{ color: tc.color }}>{tc.label}</span>
                              <span className="text-[10px] text-gray-500">📅 {monthLabel}</span>
                              {item.cost !== '무료' && item.cost !== '자체 제작' && (
                                <span className="text-[10px] text-gray-600">{item.cost}</span>
                              )}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItem(item.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-600" />
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { setAddItemGroupId(undefined); setShowAddItem(true); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                    style={{ border: `1px dashed ${color}30`, color: `${color}80` }}
                  >
                    <Plus className="w-3.5 h-3.5" />더 추가하기
                  </motion.button>
                </div>
              ) : null}
            </div>

            <button onClick={onRemove}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-gray-600 hover:text-red-400 transition-colors">
              <Trash2 className="w-3 h-3" />이 학년 제거
            </button>
          </div>
        )}
      </div>

      {showAddItem && (
        <AddItemSheet
          starId={starId}
          color={color}
          onAdd={(item) => addItem(item, addItemGroupId)}
          onClose={() => { setShowAddItem(false); setAddItemGroupId(undefined); }}
        />
      )}
    </>
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
  job: typeof careerMaker.kingdoms[0]['representativeJobs'][0] | undefined;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(
    yearPlans.length > 0 ? yearPlans[yearPlans.length - 1].gradeId : null
  );
  const [showGradePicker, setShowGradePicker] = useState(yearPlans.length === 0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const usedIds = yearPlans.map(y => y.gradeId);

  const addGrade = (gradeId: string) => {
    const grade = GRADE_YEARS.find(g => g.id === gradeId)!;
    const newYear: YearPlan = { gradeId, gradeLabel: grade.label, goals: [], items: [] };
    onUpdateYears([...yearPlans, newYear]);
    setExpandedId(gradeId);
    setShowGradePicker(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
  };

  const updateYear = (updated: YearPlan) => {
    onUpdateYears(yearPlans.map(y => y.gradeId === updated.gradeId ? updated : y));
  };

  const removeYear = (gradeId: string) => {
    const next = yearPlans.filter(y => y.gradeId !== gradeId);
    onUpdateYears(next);
    if (expandedId === gradeId) setExpandedId(next.length > 0 ? next[next.length - 1].gradeId : null);
  };

  const totalItems = yearPlans.reduce((s, y) => s + y.items.length + (y.groups ?? []).reduce((gs, g) => gs + g.items.length, 0), 0);
  const totalGoals = yearPlans.reduce((s, y) => s + y.goals.length, 0);

  return (
    <div className="space-y-4">
      <TipBox text={`${job?.name ?? ''}의 커리어를 학년별로 쌓아가 보세요. 학년을 추가하면 계획표가 바로 펼쳐져요!`} />

      {yearPlans.length === 0 && (
        <div className="rounded-2xl py-8 flex flex-col items-center gap-3"
          style={{ border: '1.5px dashed rgba(108,92,231,0.35)', backgroundColor: 'rgba(108,92,231,0.05)' }}>
          <div className="text-4xl">📅</div>
          <div className="text-sm font-bold text-white">첫 번째 학년을 추가해요</div>
          <div className="text-xs text-gray-500">아래에서 시작 학년을 선택하세요</div>
        </div>
      )}

      {/* Stacked grade cards */}
      {yearPlans.length > 0 && (
        <div className="space-y-0">
          {yearPlans.map((year, idx) => (
            <div key={year.gradeId} className="relative">
              {idx < yearPlans.length - 1 && (
                <div className="absolute left-[21px] top-full z-10" style={{ width: 2, height: 12, backgroundColor: `${color}40` }} />
              )}
              <div className={idx > 0 ? 'mt-3' : ''}>
                <YearPlanCard
                  yearPlan={year} color={color} starId={starId}
                  isExpanded={expandedId === year.gradeId}
                  onToggle={() => setExpandedId(expandedId === year.gradeId ? null : year.gradeId)}
                  onUpdate={updateYear}
                  onRemove={() => removeYear(year.gradeId)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add grade section */}
      <div className="rounded-2xl overflow-hidden transition-all"
        style={{
          border: showGradePicker ? `1.5px solid ${color}40` : '1.5px dashed rgba(255,255,255,0.1)',
          backgroundColor: showGradePicker ? `${color}08` : 'transparent',
        }}>
        {!showGradePicker ? (
          <button
            onClick={() => setShowGradePicker(true)}
            disabled={usedIds.length >= GRADE_YEARS.length}
            className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all active:scale-[0.99]"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ border: `1.5px dashed ${color}60` }}>
              <Plus className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <span style={{ color }}>{usedIds.length === 0 ? '학년 선택하기' : '다음 학년 추가하기'}</span>
          </button>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" style={{ color }} />
                어떤 학년을 추가할까요?
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
            ].map(group => {
              const available = group.grades.filter(g => !usedIds.includes(g.id));
              if (available.length === 0) return null;
              return (
                <div key={group.label}>
                  <div className="text-[10px] text-gray-600 font-semibold mb-1.5">{group.emoji} {group.label}</div>
                  <div className="flex gap-2 flex-wrap">
                    {available.map(g => (
                      <button key={g.id} onClick={() => addGrade(g.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95"
                        style={{ background: `linear-gradient(135deg, ${color}30, ${color}18)`, border: `1.5px solid ${color}50`, color }}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {(totalItems > 0 || totalGoals > 0) && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.22)' }}>
          <Flame className="w-4 h-4 text-green-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-green-300">
              {yearPlans.length}개 학년 · {totalGoals}개 목표 · {totalItems}개 항목
            </div>
            <div className="text-[10px] text-green-500 mt-0.5">완성 버튼을 눌러 저장하세요!</div>
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
  const allItems = years.flatMap(y => [
    ...y.items,
    ...(y.groups ?? []).flatMap(g => g.items),
  ]);

  return (
    <div className="space-y-5">
      {/* 헤더: 완성 안내 */}
      <div className="rounded-2xl p-5 text-center"
        style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)`, border: `1px solid ${color}33` }}>
        <div className="text-5xl mb-3">🎉</div>
        <div className="text-xl font-black text-white">커리어 패스 완성!</div>
        <div className="text-sm text-gray-400 mt-1.5">저장 후 타임라인에서 전체 로드맵을 확인하세요</div>
      </div>

      {/* 왕국 → 직업 플로우 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}33` }}
        >
          {plan.starEmoji} {plan.starName}
        </span>
        <ArrowRight className="w-4 h-4 text-gray-500" />
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}33` }}
        >
          {plan.jobEmoji} {plan.jobName}
        </span>
      </div>

      {/* 상세 타임라인 (CareerPathDetailDialog와 동일 구조) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">학년별 계획</span>
          <span className="text-[11px] text-gray-600">{years.length}개 학년 · {allItems.length}개 항목</span>
        </div>
        <CareerPathTimelinePreview years={years} color={color} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Builder dialog
══════════════════════════════════════════ */
export function CareerPathBuilder({ initialPlan, initialStep, onSave, onClose }: Props) {
  const [step, setStep] = useState(initialStep ?? 1);
  const [starId, setStarId] = useState(initialPlan?.starId ?? '');
  const [jobId, setJobId] = useState(initialPlan?.jobId ?? '');
  const [yearPlans, setYearPlans] = useState<YearPlan[]>(initialPlan?.years ?? []);

  const kingdom = careerMaker.kingdoms.find(k => k.id === starId);
  const job = kingdom?.representativeJobs.find(j => j.id === jobId);
  const color = kingdom?.color ?? '#6C5CE7';

  const canProceed = () => {
    if (step === 1) return !!starId;
    if (step === 2) return !!jobId;
    if (step === 3) return yearPlans.length > 0;
    return true;
  };

  const handleSave = () => {
    if (!kingdom || !job) return;
    const gradeOrder = GRADE_YEARS.reduce((acc, g, i) => { acc[g.id] = i; return acc; }, {} as Record<string, number>);
    const plan: CareerPlan = {
      id: initialPlan?.id ?? `plan-${Date.now()}`,
      starId: kingdom.id, starName: kingdom.name, starEmoji: kingdom.emoji, starColor: kingdom.color,
      jobId: job.id, jobName: job.name, jobEmoji: job.icon,
      years: yearPlans.sort((a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0)),
      createdAt: initialPlan?.createdAt ?? new Date().toISOString(),
      title: `${job.name} 커리어 패스`,
    };
    onSave(plan);
  };

  const headings: Record<number, { title: string; desc: string }> = {
    1: { title: '어떤 왕국이 끌리나요?',    desc: '관심 분야에 가까운 별을 선택하세요' },
    2: { title: '목표 직업을 선택하세요',   desc: `${kingdom?.name ?? ''}에서 원하는 직업을 골라보세요` },
    3: { title: '학년별 계획을 세워요',     desc: '학년 추가 → 목표·활동·작품·자격증을 채워가세요' },
    4: { title: '커리어 패스 완성!',        desc: '저장 후 타임라인에서 전체 로드맵을 확인하세요' },
  };

  const stepConf = STEPS[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#08081a', maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', backgroundColor: 'rgba(8,8,26,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-between px-4 py-3.5">
          <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div className="text-center space-y-1.5">
            <div className="text-xs text-gray-500 font-semibold">{stepConf.emoji} {stepConf.title}</div>
            <StepDots current={step} total={4} color={color || '#6C5CE7'} />
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
        {step >= 2 && kingdom && (
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
      <div className="flex-shrink-0 px-5 space-y-2"
        style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, backgroundColor: 'rgba(8,8,26,0.95)' }}>
        <button
          onClick={step === 4 ? handleSave : () => setStep(s => s + 1)}
          disabled={!canProceed()}
          className="w-full h-14 rounded-2xl font-black text-base text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-35"
          style={canProceed()
            ? { background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 6px 24px ${color}44` }
            : { backgroundColor: 'rgba(255,255,255,0.08)' }}>
          {step === 4 ? (
            <><CheckCircle2 className="w-5 h-5" />저장하고 타임라인 보기</>
          ) : step === 3 ? (
            <><span>미리보기</span><ChevronRight className="w-5 h-5" /></>
          ) : (
            <><span>다음으로</span><ChevronRight className="w-5 h-5" /></>
          )}
        </button>
        {step === 3 && (
          <p className="text-center text-xs text-gray-600">학년을 1개 이상 추가해야 다음으로 넘어갈 수 있어요</p>
        )}
      </div>
    </div>
  );
}
