'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TabBar } from '@/components/tab-bar';
import careerMakerData from '@/data/career-maker.json';
import { storage } from '@/lib/storage';
import {
  Sparkles, Filter, ChevronDown, ChevronUp,
  Plus, Check, Trophy, Activity, Award,
  BookOpen, Calendar, Star, X, GraduationCap,
  Rocket, ClipboardList,
} from 'lucide-react';

type Kingdom = typeof careerMakerData.kingdoms[0];
type CareerItem = Kingdom['careerItems'][0];

const GRADES = ['초등', '중등', '고등'] as const;
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const DIFFICULTIES = [1, 2, 3, 4, 5] as const;
const TYPES: { value: CareerItem['type']; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'activity', label: '활동', icon: Activity, color: '#3B82F6' },
  { value: 'award',    label: '수상·대회', icon: Trophy, color: '#FBBF24' },
  { value: 'certification', label: '자격증', icon: Award, color: '#22C55E' },
];

const GRADE_ICONS: Record<string, React.ElementType> = {
  '초등': BookOpen, '중등': GraduationCap, '고등': Rocket,
};

type SavedPlan = {
  id: string;
  itemId: string;
  title: string;
  type: CareerItem['type'];
  grade: string;
  targetMonth: number;
  kingdomId: string;
  kingdomName: string;
  color: string;
  savedAt: string;
};

function StarField() {
  const stars = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: ((i * 149.3) % 100),
    y: ((i * 79.7) % 100),
    size: (i % 3) + 1,
    delay: (i * 0.35) % 3,
    dur: 2 + (i % 3),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size, opacity: 0.25,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Filter Chip ─── */
function FilterChip({
  label, active, color, onClick,
}: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
      style={active
        ? { backgroundColor: color, color: '#fff', boxShadow: `0 0 8px ${color}66` }
        : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/* ─── Career Item Card ─── */
function CareerItemCard({
  item, kingdom, onAdd, saved,
}: { item: CareerItem; kingdom: Kingdom; onAdd: (item: CareerItem, grade: string, month: number) => void; saved: boolean }) {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(item.grades[0]);
  const [selectedMonth, setSelectedMonth] = useState(item.months[0]);

  const typeConfig = TYPES.find(t => t.value === item.type)!;
  const TypeIcon = typeConfig.icon;

  const diffStars = Array.from({ length: 5 }, (_, i) => i < item.difficulty);

  return (
    <div
      className="glass-card p-4 rounded-2xl"
      style={{ border: saved ? `1px solid ${kingdom.color}66` : '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Top Row */}
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${typeConfig.color}22`, border: `1px solid ${typeConfig.color}33` }}
        >
          <TypeIcon className="w-5 h-5" style={{ color: typeConfig.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: `${typeConfig.color}22`, color: typeConfig.color }}
            >
              {typeConfig.label}
            </span>
            {item.online && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400">
                온라인
              </span>
            )}
          </div>
          <div className="font-semibold text-white text-sm leading-snug">{item.title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.organizer} · {item.cost}</div>
        </div>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={saved
            ? { backgroundColor: `${kingdom.color}33`, border: `1px solid ${kingdom.color}` }
            : { backgroundColor: 'rgba(255,255,255,0.08)' }}
          onClick={() => setShowDetail(d => !d)}
        >
          {showDetail ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
      </div>

      {/* Difficulty */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] text-gray-500">난이도</span>
        <div className="flex gap-0.5">
          {diffStars.map((filled, i) => (
            <Star
              key={i}
              className="w-2.5 h-2.5"
              style={{ color: filled ? '#FBBF24' : 'rgba(255,255,255,0.15)' }}
              fill={filled ? '#FBBF24' : 'none'}
            />
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {showDetail && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
          <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-gray-400">
                #{tag}
              </span>
            ))}
          </div>

          {/* Grade Selector */}
          <div>
            <div className="text-[10px] text-gray-500 mb-1.5 flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              내 학년 선택
            </div>
            <div className="flex gap-2">
              {item.grades.map(g => (
                <button
                  key={g}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={selectedGrade === g
                    ? { backgroundColor: kingdom.color, color: '#fff' }
                    : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                  onClick={() => setSelectedGrade(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Month Selector */}
          <div>
            <div className="text-[10px] text-gray-500 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              목표 월 선택
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.months.map(m => (
                <button
                  key={m}
                  className="w-10 h-8 rounded-lg text-xs font-semibold transition-all"
                  style={selectedMonth === m
                    ? { backgroundColor: kingdom.color, color: '#fff' }
                    : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                  onClick={() => setSelectedMonth(m)}
                >
                  {m}월
                </button>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <button
            className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all"
            style={saved
              ? { background: `linear-gradient(135deg, #22C55E, #16A34A)` }
              : { background: `linear-gradient(135deg, ${kingdom.color}, ${kingdom.color}aa)` }}
            onClick={() => onAdd(item, selectedGrade, selectedMonth)}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                계획 추가됨
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                내 커리어 계획에 추가
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Plan Badge ─── */
function PlanBadge({ plan, onRemove }: { plan: SavedPlan; onRemove: (id: string) => void }) {
  const typeConfig = TYPES.find(t => t.value === plan.type)!;
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ backgroundColor: `${plan.color}18`, border: `1px solid ${plan.color}33` }}
    >
      <div className="text-xs" style={{ color: plan.color }}>
        {plan.grade} {plan.targetMonth}월
      </div>
      <div className="text-xs text-white font-medium flex-1 min-w-0 truncate">{plan.title}</div>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0"
        style={{ backgroundColor: `${typeConfig.color}22`, color: typeConfig.color }}
      >
        {typeConfig.label}
      </span>
      <button onClick={() => onRemove(plan.id)} className="flex-shrink-0">
        <X className="w-3 h-3 text-gray-500" />
      </button>
    </div>
  );
}

/* ─── Inner Content (uses useSearchParams) ─── */
function CareerMakerContent() {
  const searchParams = useSearchParams();
  const initKingdomId = searchParams.get('kingdom') ?? careerMakerData.kingdoms[0].id;

  const [selectedKingdomId, setSelectedKingdomId] = useState(initKingdomId);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [showPlans, setShowPlans] = useState(false);

  const kingdoms = careerMakerData.kingdoms;
  const kingdom = kingdoms.find(k => k.id === selectedKingdomId) ?? kingdoms[0];

  /* Load saved plans from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('career_plans');
      if (raw) setSavedPlans(JSON.parse(raw));
    } catch {}
  }, []);

  const persistPlans = (plans: SavedPlan[]) => {
    setSavedPlans(plans);
    localStorage.setItem('career_plans', JSON.stringify(plans));
  };

  /* Filtered items */
  const filteredItems = kingdom.careerItems.filter(item => {
    if (selectedGrades.length > 0 && !item.grades.some(g => selectedGrades.includes(g))) return false;
    if (selectedMonths.length > 0 && !item.months.some(m => selectedMonths.includes(m))) return false;
    if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(item.difficulty)) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(item.type)) return false;
    return true;
  });

  const toggle = <T,>(arr: T[], val: T) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const addToPlan = (item: CareerItem, grade: string, month: number) => {
    const existing = savedPlans.find(p => p.itemId === item.id);
    if (existing) return;
    const plan: SavedPlan = {
      id: `${item.id}-${Date.now()}`,
      itemId: item.id,
      title: item.title,
      type: item.type,
      grade,
      targetMonth: month,
      kingdomId: kingdom.id,
      kingdomName: kingdom.name,
      color: kingdom.color,
      savedAt: new Date().toISOString(),
    };
    persistPlans([...savedPlans, plan]);

    /* Add to timeline */
    try {
      const LABEL: Record<string, string> = { activity: '활동', award: '수상·대회', certification: '자격증' };
      storage.timeline.add({
        id: `career-${Date.now()}`,
        type: 'camp',
        title: item.title,
        description: `커리어 계획 추가: ${item.title} (${LABEL[item.type]})`,
        date: new Date().toISOString(),
        xp: 10,
      });
      storage.xp.add(10, 'career_plan', item.title);
    } catch {}
  };

  const removeFromPlan = (id: string) => persistPlans(savedPlans.filter(p => p.id !== id));

  const savedItemIds = new Set(savedPlans.map(p => p.itemId));

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <StarField />

      {/* Header */}
      <div
        className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 px-4 py-3"
        style={{ backgroundColor: 'rgba(26,26,46,0.9)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              커리어 패스 제작소
            </h1>
            <p className="text-xs text-gray-400">나만의 활동·수상·자격증 로드맵</p>
          </div>
          <button
            className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            onClick={() => setShowPlans(p => !p)}
          >
            <ClipboardList className="w-5 h-5 text-white" />
            {savedPlans.length > 0 && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: '#6C5CE7' }}
              >
                {savedPlans.length}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Saved Plans Panel */}
      {showPlans && (
        <div
          className="sticky top-[64px] z-10 border-b border-white/10 px-4 py-4"
          style={{ backgroundColor: 'rgba(20,20,40,0.97)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              내 커리어 계획 ({savedPlans.length}개)
            </div>
            <button className="text-xs text-gray-500" onClick={() => setShowPlans(false)}>닫기</button>
          </div>
          {savedPlans.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-3">아직 추가한 계획이 없어요</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedPlans
                .slice()
                .sort((a, b) => a.targetMonth - b.targetMonth)
                .map(p => (
                  <PlanBadge key={p.id} plan={p} onRemove={removeFromPlan} />
                ))}
            </div>
          )}
        </div>
      )}

      <div className="relative z-10 px-4 pt-4 space-y-4">
        {/* Kingdom Selector */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">왕국 선택</div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {kingdoms.map(k => (
              <button
                key={k.id}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={selectedKingdomId === k.id
                  ? { backgroundColor: k.color, color: '#fff', boxShadow: `0 0 12px ${k.color}66` }
                  : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                onClick={() => setSelectedKingdomId(k.id)}
              >
                <span>{k.emoji}</span>
                <span>{k.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Kingdom Info */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{
            background: `linear-gradient(135deg, ${kingdom.bgColor}ee, ${kingdom.bgColor}88)`,
            border: `1px solid ${kingdom.color}33`,
          }}
        >
          <span className="text-3xl">{kingdom.emoji}</span>
          <div>
            <div className="font-bold text-white">{kingdom.name}</div>
            <div className="text-xs mt-0.5" style={{ color: `${kingdom.color}cc` }}>
              {kingdom.careerItems.length}개 활동/수상/자격증
            </div>
          </div>
          <button
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              backgroundColor: `${kingdom.color}22`,
              color: kingdom.color,
              border: `1px solid ${kingdom.color}44`,
            }}
            onClick={() => setShowFilters(f => !f)}
          >
            <Filter className="w-3.5 h-3.5" />
            필터
            {(selectedGrades.length + selectedMonths.length + selectedDifficulties.length + selectedTypes.length) > 0 && (
              <span
                className="w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold"
                style={{ backgroundColor: kingdom.color, color: '#fff' }}
              >
                {selectedGrades.length + selectedMonths.length + selectedDifficulties.length + selectedTypes.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass-card p-4 rounded-2xl space-y-4">
            {/* Type */}
            <div>
              <div className="text-xs text-gray-400 mb-2">유형</div>
              <div className="flex gap-2 flex-wrap">
                {TYPES.map(t => (
                  <FilterChip
                    key={t.value}
                    label={t.label}
                    active={selectedTypes.includes(t.value)}
                    color={t.color}
                    onClick={() => setSelectedTypes(v => toggle(v, t.value))}
                  />
                ))}
              </div>
            </div>
            {/* Grade */}
            <div>
              <div className="text-xs text-gray-400 mb-2">학년</div>
              <div className="flex gap-2">
                {GRADES.map(g => (
                  <FilterChip
                    key={g}
                    label={g}
                    active={selectedGrades.includes(g)}
                    color={kingdom.color}
                    onClick={() => setSelectedGrades(v => toggle(v, g))}
                  />
                ))}
              </div>
            </div>
            {/* Month */}
            <div>
              <div className="text-xs text-gray-400 mb-2">월</div>
              <div className="flex flex-wrap gap-1.5">
                {MONTHS.map((m, i) => (
                  <FilterChip
                    key={i}
                    label={m}
                    active={selectedMonths.includes(i + 1)}
                    color={kingdom.color}
                    onClick={() => setSelectedMonths(v => toggle(v, i + 1))}
                  />
                ))}
              </div>
            </div>
            {/* Difficulty */}
            <div>
              <div className="text-xs text-gray-400 mb-2">난이도</div>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <FilterChip
                    key={d}
                    label={`${'★'.repeat(d)}`}
                    active={selectedDifficulties.includes(d)}
                    color={kingdom.color}
                    onClick={() => setSelectedDifficulties(v => toggle(v, d))}
                  />
                ))}
              </div>
            </div>
            {/* Reset */}
            <button
              className="text-xs text-gray-500 underline"
              onClick={() => {
                setSelectedGrades([]);
                setSelectedMonths([]);
                setSelectedDifficulties([]);
                setSelectedTypes([]);
              }}
            >
              필터 초기화
            </button>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">
            {filteredItems.length}개 결과
          </div>
          <div className="text-xs text-gray-500">탭해서 상세 보기</div>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <Sparkles className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">조건에 맞는 항목이 없어요</p>
            <p className="text-xs text-gray-600 mt-1">필터를 조정해보세요</p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredItems.map(item => (
              <CareerItemCard
                key={item.id}
                item={item}
                kingdom={kingdom}
                onAdd={addToPlan}
                saved={savedItemIds.has(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
}

/* ─── Page (wrapped in Suspense for useSearchParams) ─── */
export default function CareerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Sparkles className="w-6 h-6 text-primary animate-pulse" /></div>}>
      <CareerMakerContent />
    </Suspense>
  );
}
