'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ArrowLeft, Check, Calendar, Pencil } from 'lucide-react';
import templatesData from '@/data/execution/templates.json';
import projectFieldsData from '@/data/execution/templates-project-fields.json';
import type { DreamItemType, PeriodType, RoadmapItem, RoadmapTodoItem } from '../types';

/* ── Types ─────────────────────────────────── */
interface WeeklyGoal {
  weekLabel: string;
  title: string;
  tasks: string[];
  /** 이 주차에 남기는 결과물·사진 (포트폴리오 근거) */
  output?: string;
}

interface ExecutionTemplate {
  id: string;
  title: string;
  emoji: string;
  description: string;
  period: string;
  months: number[];
  difficulty: number;
  weeklyGoals: WeeklyGoal[];
}

/** 카테고리 하위 분야(도메인) 그룹 — project 10분야, activity/paper 보강 그룹 */
interface Subgroup {
  id: string;
  label: string;
  emoji: string;
  templates: ExecutionTemplate[];
}

interface Category {
  id: string;
  label: string;
  emoji: string;
  color: string;
  tagline: string;
  /** 평면 카테고리(award 등) */
  templates?: ExecutionTemplate[];
  /** 그룹 카테고리(project/activity/paper) */
  subgroups?: Subgroup[];
}

interface ExecutionWizardPayload {
  title: string;
  description: string;
  period: PeriodType;
  starColor: string;
  focusItemTypes: DreamItemType[];
  items: RoadmapItem[];
  milestoneResults: [];
  finalResultTitle: string;
  finalResultDescription: string;
  finalResultUrl: string;
  finalResultImageUrl: string;
  groupIds: string[];
}

interface ExecutionWizardDialogProps {
  onClose: () => void;
  onSubmit: (payload: ExecutionWizardPayload) => void;
  /** "처음부터 직접 만들기" — 빈 로드맵 생성 후 에디터 열기 (페이지에서 배선) */
  onStartBlank?: () => void;
}

const DIFFICULTY_LABEL: Record<number, string> = { 1: '매우 쉬움', 2: '쉬움', 3: '보통', 4: '어려움', 5: '매우 어려움' };
const STAR_COLORS = ['#6C5CE7', '#3B82F6', '#EC4899', '#22C55E', '#F97316', '#EAB308'];
const CATEGORY_COLOR_MAP: Record<string, string> = {
  award: '#F59E0B',
  activity: '#22C55E',
  project: '#6C5CE7',
  paper: '#EC4899',
};

/** project 카테고리는 분야 파일(templates-project-fields.json)의 subgroups로 합성 */
const projectFields = ((projectFieldsData as { fields?: Subgroup[] }).fields ?? []) as Subgroup[];
const categories: Category[] = (templatesData.categories as unknown as Category[]).map((c) =>
  c.id === 'project' ? { ...c, subgroups: projectFields } : c
);

type StepKey = 'category' | 'group' | 'template' | 'weekly';

function makeId() {
  return `wizard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildSubItems(weeklyGoals: WeeklyGoal[], startMonth: number): RoadmapTodoItem[] {
  const items: RoadmapTodoItem[] = [];
  weeklyGoals.forEach((wg, idx) => {
    const month = startMonth + Math.floor(idx / 4);
    const weekNumber = (idx % 4) + 1;
    const weekLabel = `${month}월 ${weekNumber}주차`;
    // 목표 항목
    items.push({
      id: makeId(),
      weekLabel,
      weekNumber,
      entryType: 'goal',
      title: wg.title,
      isDone: false,
      plannedOutput: wg.output,
    });
    // 세부 태스크
    wg.tasks.forEach(task => {
      items.push({
        id: makeId(),
        weekLabel,
        weekNumber,
        entryType: 'task',
        title: task,
        isDone: false,
      });
    });
  });
  return items;
}

/* ═══════════════════════════════════════════
   Step: 카테고리 선택 (+ 직접 만들기)
═══════════════════════════════════════════ */
function StepCategory({
  onSelect,
  onStartBlank,
}: {
  onSelect: (cat: Category) => void;
  onStartBlank?: () => void;
}) {
  const countOf = (cat: Category) =>
    cat.subgroups
      ? cat.subgroups.reduce((sum, g) => sum + g.templates.length, 0)
      : cat.templates?.length ?? 0;

  return (
    <motion.div
      key="step-category"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pt-4 space-y-3"
    >
      <p className="text-xs text-gray-400 px-1">어떤 종류의 실행을 시작할까요?</p>
      <div className="grid grid-cols-2 gap-2.5">
        {categories.map((cat, idx) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, type: 'spring', stiffness: 400, damping: 24 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(cat)}
            className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left"
            style={{
              background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}08)`,
              border: `1.5px solid ${cat.color}35`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            }}
          >
            <span className="text-3xl">{cat.emoji}</span>
            <div>
              <div className="text-sm font-bold text-white">{cat.label}</div>
              <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">{cat.tagline}</div>
            </div>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
            >
              {cat.subgroups ? `${cat.subgroups.length}개 분야 · ` : ''}{countOf(cat)}개 템플릿
            </span>
          </motion.button>
        ))}
      </div>

      {/* 처음부터 직접 만들기 */}
      {onStartBlank && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categories.length * 0.05, type: 'spring', stiffness: 400, damping: 24 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartBlank}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left mt-1"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1.5px dashed rgba(255,255,255,0.18)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <Pencil className="w-4 h-4 text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">처음부터 직접 만들기</div>
            <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">템플릿 없이 빈 계획에서 시작해요</div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        </motion.button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Step: 분야(그룹) 선택
═══════════════════════════════════════════ */
function StepGroup({ category, onSelect }: { category: Category; onSelect: (g: Subgroup) => void }) {
  const groups = category.subgroups ?? [];
  return (
    <motion.div
      key="step-group"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="pt-4 space-y-3"
    >
      <p className="text-xs text-gray-400 px-1">어떤 분야에 도전할까요?</p>
      <div className="grid grid-cols-2 gap-2.5">
        {groups.map((g, idx) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, type: 'spring', stiffness: 400, damping: 24 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(g)}
            className="flex flex-col items-start gap-1.5 p-3.5 rounded-2xl text-left"
            style={{
              background: `linear-gradient(135deg, ${category.color}18, ${category.color}06)`,
              border: `1.5px solid ${category.color}30`,
            }}
          >
            <span className="text-2xl">{g.emoji}</span>
            <div className="text-sm font-bold text-white leading-snug">{g.label}</div>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${category.color}22`, color: category.color }}
            >
              {g.templates.length}개 템플릿
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Step: 템플릿 선택 (그룹이면 분야 칩으로 이동)
═══════════════════════════════════════════ */
function StepTemplate({
  category,
  templates,
  siblingGroups,
  activeGroupId,
  onPickGroup,
  onSelect,
}: {
  category: Category;
  templates: ExecutionTemplate[];
  siblingGroups?: Subgroup[];
  activeGroupId?: string;
  onPickGroup?: (g: Subgroup) => void;
  onSelect: (t: ExecutionTemplate) => void;
}) {
  return (
    <motion.div
      key="step-template"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="pt-4 space-y-2"
    >
      {/* 분야 칩 — 뒤로가기 없이 다른 분야로 이동 */}
      {siblingGroups && siblingGroups.length > 1 && onPickGroup && (
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-hide">
          {siblingGroups.map((g) => {
            const active = g.id === activeGroupId;
            return (
              <button
                key={g.id}
                onClick={() => onPickGroup(g)}
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap transition-all flex-shrink-0"
                style={active
                  ? { backgroundColor: category.color, color: '#fff', boxShadow: `0 0 10px ${category.color}55` }
                  : { backgroundColor: `${category.color}14`, color: 'rgba(255,255,255,0.6)', border: `1px solid ${category.color}25` }}
              >
                <span>{g.emoji}</span>{g.label}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 px-1">어떤 활동을 할 건가요?</p>
      {templates.map((tmpl, idx) => (
        <motion.button
          key={tmpl.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04, type: 'spring', stiffness: 380, damping: 24 }}
          whileHover={{ scale: 1.01, boxShadow: `0 0 16px ${category.color}33` }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(tmpl)}
          className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left"
          style={{
            background: `linear-gradient(135deg, ${category.color}15, ${category.color}06)`,
            border: `1.5px solid ${category.color}30`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: `${category.color}18`, border: `1px solid ${category.color}30` }}
          >
            {tmpl.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">{tmpl.title}</div>
            <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">{tmpl.description}</div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{ backgroundColor: `${category.color}18`, color: category.color }}
              >
                {tmpl.weeklyGoals.length}주 플랜
              </span>
              <span className="text-[10px] text-gray-500">
                {'★'.repeat(tmpl.difficulty)}{'☆'.repeat(5 - tmpl.difficulty)} {DIFFICULTY_LABEL[tmpl.difficulty]}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        </motion.button>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Step: 주별 목표 확인 & 시작 월 선택
═══════════════════════════════════════════ */
function StepWeekly({
  template,
  color,
  onConfirm,
}: {
  template: ExecutionTemplate;
  color: string;
  onConfirm: (enabled: boolean[], startMonth: number, chosenColor: string) => void;
}) {
  const [enabled, setEnabled] = useState<boolean[]>(template.weeklyGoals.map(() => true));
  const [startMonth, setStartMonth] = useState(template.months[0] ?? 3);
  const [chosenColor, setChosenColor] = useState(color);

  const toggle = (idx: number) =>
    setEnabled(prev => prev.map((v, i) => (i === idx ? !v : v)));

  const enabledCount = enabled.filter(Boolean).length;

  return (
    <motion.div
      key="step-weekly"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="pt-4 space-y-4"
    >
      {/* 시작 월 & 색상 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1.5">
          <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> 시작 월
          </span>
          <div className="flex flex-wrap gap-1">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
              <button
                key={m}
                onClick={() => setStartMonth(m)}
                className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                style={startMonth === m
                  ? { backgroundColor: chosenColor, color: '#fff', boxShadow: `0 0 10px ${chosenColor}66` }
                  : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-gray-400">색상</span>
          <div className="flex flex-wrap gap-1.5">
            {STAR_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setChosenColor(c)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform"
                style={{ backgroundColor: c, transform: chosenColor === c ? 'scale(1.2)' : 'scale(1)', boxShadow: chosenColor === c ? `0 0 10px ${c}` : undefined }}
              >
                {chosenColor === c && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 주별 목표 목록 */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-gray-400 px-0.5">
          포함할 주차를 선택하세요 <span className="text-white font-bold">{enabledCount}</span>/{template.weeklyGoals.length}주
        </p>
        {template.weeklyGoals.map((wg, idx) => {
          const month = startMonth + Math.floor(idx / 4);
          const week = (idx % 4) + 1;
          const isOn = enabled[idx];
          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggle(idx)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all"
              style={{
                backgroundColor: isOn ? `${chosenColor}12` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isOn ? `${chosenColor}40` : 'rgba(255,255,255,0.06)'}`,
                opacity: isOn ? 1 : 0.45,
              }}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: isOn ? chosenColor : 'rgba(255,255,255,0.1)' }}
              >
                {isOn && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold" style={{ color: isOn ? chosenColor : '#6b7280' }}>
                  {month}월 {week}주차 · {wg.weekLabel}
                </span>
                <div className="text-xs text-white leading-snug truncate">{wg.title}</div>
                {wg.output && (
                  <div className="mt-1 flex items-center gap-1 min-w-0">
                    <span className="text-[10px] flex-shrink-0" aria-hidden>📸</span>
                    <span className="text-[10px] text-gray-400 leading-snug truncate" title={wg.output}>
                      결과물 · {wg.output}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-600 flex-shrink-0 self-start mt-0.5">{wg.tasks.length}개 태스크</span>
            </motion.button>
          );
        })}
      </div>

      {/* 생성 버튼 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={enabledCount === 0}
        onClick={() => onConfirm(enabled, startMonth, chosenColor)}
        className="w-full py-3.5 rounded-2xl text-sm font-black text-white disabled:opacity-40"
        style={{ background: `linear-gradient(135deg, ${chosenColor}, ${chosenColor}cc)`, boxShadow: `0 6px 24px ${chosenColor}44` }}
      >
        {enabledCount}주 실행 계획 생성하기 🚀
      </motion.button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Main Wizard
═══════════════════════════════════════════ */
export function ExecutionWizardDialog({ onClose, onSubmit, onStartBlank }: ExecutionWizardDialogProps) {
  const [step, setStep] = useState<StepKey>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Subgroup | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ExecutionTemplate | null>(null);

  const isGrouped = !!selectedCategory?.subgroups;
  const stepOrder: StepKey[] = isGrouped
    ? ['category', 'group', 'template', 'weekly']
    : ['category', 'template', 'weekly'];
  const stepIndex = stepOrder.indexOf(step);

  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedGroup(null);
    setSelectedTemplate(null);
    setStep(cat.subgroups ? 'group' : 'template');
  };

  const handleSelectGroup = (g: Subgroup) => {
    setSelectedGroup(g);
    setStep('template');
  };

  const handleSelectTemplate = (tmpl: ExecutionTemplate) => {
    setSelectedTemplate(tmpl);
    setStep('weekly');
  };

  const handleBack = () => {
    if (step === 'weekly') {
      setStep('template');
      setSelectedTemplate(null);
    } else if (step === 'template') {
      if (isGrouped) {
        setStep('group');
        setSelectedGroup(null);
      } else {
        setStep('category');
        setSelectedCategory(null);
      }
    } else if (step === 'group') {
      setStep('category');
      setSelectedCategory(null);
    }
  };

  const handleConfirm = (enabled: boolean[], startMonth: number, chosenColor: string) => {
    if (!selectedTemplate || !selectedCategory) return;

    const activeGoals = selectedTemplate.weeklyGoals.filter((_, i) => enabled[i]);
    const subItems = buildSubItems(activeGoals, startMonth);

    const allMonths = activeGoals.map((_, i) => startMonth + Math.floor(i / 4));
    const uniqueMonths = [...new Set(allMonths)].sort((a, b) => a - b);

    const item: RoadmapItem = {
      id: makeId(),
      type: selectedCategory.id as DreamItemType,
      title: selectedTemplate.title,
      months: uniqueMonths.length > 0 ? uniqueMonths : [startMonth],
      difficulty: selectedTemplate.difficulty,
      subItems,
    };

    const payload: ExecutionWizardPayload = {
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      period: selectedTemplate.period as PeriodType,
      starColor: chosenColor,
      focusItemTypes: [selectedCategory.id as DreamItemType],
      items: [item],
      milestoneResults: [],
      finalResultTitle: '',
      finalResultDescription: '',
      finalResultUrl: '',
      finalResultImageUrl: '',
      groupIds: [],
    };

    onSubmit(payload);
  };

  const headerTitle =
    step === 'category' ? '실행 카테고리 선택' :
    step === 'group' ? (selectedCategory?.label ?? '') :
    step === 'template' ? (selectedGroup?.label ?? selectedCategory?.label ?? '') :
    (selectedTemplate?.title ?? '');

  const categoryColor = selectedCategory?.color ?? '#6C5CE7';

  // 평면 카테고리는 templates, 그룹 카테고리는 선택한 분야의 templates
  const templateList = isGrouped
    ? selectedGroup?.templates ?? []
    : selectedCategory?.templates ?? [];

  const stepDots = stepOrder.map((_, i) => (
    <span
      key={i}
      className="w-1.5 h-1.5 rounded-full transition-all"
      style={{ backgroundColor: i <= stepIndex ? categoryColor : 'rgba(255,255,255,0.2)', width: i === stepIndex ? 16 : 6 }}
    />
  ));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          maxWidth: 680,
          maxHeight: '88vh',
          background: 'linear-gradient(180deg, #1a1035 0%, #12122a 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 60px rgba(108,92,231,0.15), 0 20px 50px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(12,6,32,0.7)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {step !== 'category' && (
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${categoryColor}22`, border: `1px solid ${categoryColor}44` }}
              >
                <ArrowLeft className="w-3.5 h-3.5" style={{ color: categoryColor }} />
              </button>
            )}
            <div className="min-w-0">
              <h3 className="text-base font-black text-white truncate">{headerTitle}</h3>
              <div className="flex items-center gap-1 mt-0.5">{stepDots}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <AnimatePresence mode="wait">
            {step === 'category' && (
              <StepCategory onSelect={handleSelectCategory} onStartBlank={onStartBlank} />
            )}
            {step === 'group' && selectedCategory && (
              <StepGroup category={selectedCategory} onSelect={handleSelectGroup} />
            )}
            {step === 'template' && selectedCategory && (
              <StepTemplate
                category={selectedCategory}
                templates={templateList}
                siblingGroups={isGrouped ? selectedCategory.subgroups : undefined}
                activeGroupId={selectedGroup?.id}
                onPickGroup={isGrouped ? handleSelectGroup : undefined}
                onSelect={handleSelectTemplate}
              />
            )}
            {step === 'weekly' && selectedTemplate && (
              <StepWeekly
                template={selectedTemplate}
                color={CATEGORY_COLOR_MAP[selectedCategory?.id ?? ''] ?? '#6C5CE7'}
                onConfirm={handleConfirm}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
