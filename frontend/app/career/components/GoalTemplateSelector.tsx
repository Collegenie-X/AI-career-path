'use client';

import { useState, useMemo } from 'react';
import { X, Sparkles, ChevronRight, Check, Pencil, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import goalTemplatesData from '@/data/goal-templates.json';
import { GOAL_TEMPLATE_SELECTOR_DIALOG } from '../config';

/** 템플릿 항목: 문자열 또는 게임화 메타 포함 객체 */
type TierKey = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
type TemplateItem =
  | string
  | {
      label: string;
      icon?: string;
      description?: string;
      tagline?: string;
      tier?: TierKey;
      xp?: number;
    };

type NormalizedTemplate = {
  label: string;
  icon: string;
  description: string;
  tagline: string;
  tier: TierKey;
  xp: number;
};

function normalizeTemplate(t: TemplateItem): NormalizedTemplate {
  if (typeof t === 'string') {
    return { label: t, icon: '•', description: '', tagline: '', tier: 'C', xp: 100 };
  }
  return {
    label: t.label,
    icon: t.icon ?? '•',
    description: t.description ?? '',
    tagline: t.tagline ?? '',
    tier: (t.tier ?? 'C') as TierKey,
    xp: t.xp ?? 100,
  };
}

/** 티어별 컬러·라벨 (RPG 등급 느낌) */
const TIER_STYLE: Record<TierKey, { color: string; label: string; glow: string }> = {
  E: { color: '#94A3B8', label: 'E', glow: 'rgba(148,163,184,0.45)' },
  D: { color: '#34D399', label: 'D', glow: 'rgba(52,211,153,0.45)' },
  C: { color: '#60A5FA', label: 'C', glow: 'rgba(96,165,250,0.5)' },
  B: { color: '#A78BFA', label: 'B', glow: 'rgba(167,139,250,0.55)' },
  A: { color: '#F472B6', label: 'A', glow: 'rgba(244,114,182,0.6)' },
  S: { color: '#FBBF24', label: 'S', glow: 'rgba(251,191,36,0.7)' },
};

interface GoalTemplateSelectorProps {
  onSelect: (goal: string) => void;
  onClose: () => void;
  color: string;
  /** 이미 선택된 목표 목록 (상단에 우선 표시) */
  previouslySelected?: string[];
}

type CategoryKey = keyof typeof goalTemplatesData;

export function GoalTemplateSelector({
  onSelect,
  onClose,
  color,
  previouslySelected = [],
}: GoalTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [confirmingGoal, setConfirmingGoal] = useState<string | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState<string>('');

  const startEdit = (idx: number, label: string) => {
    setEditingIdx(idx);
    setEditLabel(label);
  };
  const cancelEdit = () => {
    setEditingIdx(null);
    setEditLabel('');
  };
  const submitEdit = () => {
    const trimmed = editLabel.trim();
    if (!trimmed) return;
    cancelEdit();
    handleSelectGoal(trimmed);
  };

  const categories = Object.entries(goalTemplatesData).map(([key, data]) => ({
    key: key as CategoryKey,
    ...data,
  }));

  /** 현재 카테고리에서 이전 선택된 항목만 필터 */
  const prevInCategory = useMemo(() => {
    if (!selectedCategory || previouslySelected.length === 0) return [];
    const cat = goalTemplatesData[selectedCategory];
    const labels = new Set(
      cat.templates.map((t) => normalizeTemplate(t as TemplateItem).label)
    );
    return previouslySelected.filter((g) => labels.has(g));
  }, [selectedCategory, previouslySelected]);

  const handleSelectGoal = (goal: string) => {
    if (confirmingGoal) return;
    setConfirmingGoal(goal);
    setTimeout(() => {
      onSelect(goal);
      onClose();
      setConfirmingGoal(null);
    }, 380);
  };

  const categoryTemplates = selectedCategory
    ? goalTemplatesData[selectedCategory].templates as TemplateItem[]
    : [];

  const dialogTheme = GOAL_TEMPLATE_SELECTOR_DIALOG;
  const currentLinkedGoal = previouslySelected[0] ?? null;
  const currentLinkedGoalInCategory = prevInCategory[0] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
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
          boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 0 60px rgba(124,77,255,0.12), 0 20px 50px rgba(0,0,0,0.5)`,
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
            {selectedCategory && (
              <button
                onClick={() => {
                  cancelEdit();
                  setSelectedCategory(null);
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                style={{ backgroundColor: `${color}22`, border: `1px solid ${color}55` }}
                title="카테고리로 돌아가기"
              >
                <ArrowLeft className="w-4 h-4" style={{ color }} />
              </button>
            )}
            {!selectedCategory && <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color }} />}
            <div className="flex flex-col leading-tight min-w-0">
              <h3 className="text-lg font-bold text-white truncate">
                {selectedCategory ? goalTemplatesData[selectedCategory].label : '목표 퀘스트 선택'}
              </h3>
              <span className="text-[10.5px] text-gray-400 truncate">
                {selectedCategory
                  ? (goalTemplatesData[selectedCategory] as { tagline?: string }).tagline ?? '나만의 도전 시작!'
                  : '카테고리를 골라 모험을 시작하자!'}
              </span>
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
          <AnimatePresence mode="wait">
            {!selectedCategory ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="pt-4 space-y-4"
              >
                {/* 이전 선택된 목표 — 카테고리 목록 상단 */}
                {currentLinkedGoal && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" style={{ color }} />
                      <span className="text-xs font-bold text-gray-400">현재 연계 목표</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[currentLinkedGoal].map((goal) => {
                        const isConfirming = confirmingGoal === goal;
                        return (
                          <motion.button
                            key={goal}
                            disabled={!!confirmingGoal}
                            whileHover={!confirmingGoal ? { scale: 1.03 } : {}}
                            whileTap={!confirmingGoal ? { scale: 0.97 } : {}}
                            onClick={() => handleSelectGoal(goal)}
                            animate={
                              isConfirming
                                ? { scale: [1, 1.08, 1.02], boxShadow: [`0 0 0 transparent`, `0 0 16px ${color}66`, `0 0 12px ${color}44`] }
                                : {}
                            }
                            transition={{ duration: 0.38, ease: 'easeOut' }}
                            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-90"
                            style={{
                              backgroundColor: isConfirming ? `${color}35` : `${color}18`,
                              border: `1px solid ${isConfirming ? color : `${color}40`}`,
                              color: '#fff',
                            }}
                          >
                            {isConfirming && (
                              <motion.span
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                              >
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </motion.span>
                            )}
                            <Check className="w-3.5 h-3.5" style={{ color }} />
                            {goal}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 카테고리 목록 */}
                <div className="space-y-2.5">
                  {categories.map((category, catIdx) => (
                    <motion.button
                      key={category.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIdx * 0.04, type: 'spring', stiffness: 400, damping: 24 }}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        boxShadow: `0 0 20px ${category.color}44, 0 4px 20px rgba(0,0,0,0.25)`,
                        borderColor: category.color,
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(category.key)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl transition-[box-shadow,border-color]"
                      style={{
                        background: `linear-gradient(135deg, ${category.color}18, ${category.color}08)`,
                        border: `1.5px solid ${category.color}35`,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{
                            background: `${category.color}25`,
                            border: `1px solid ${category.color}45`,
                            boxShadow: `0 0 0 1px ${category.color}22`,
                          }}
                          whileHover={{ scale: 1.08 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          {category.emoji}
                        </motion.div>
                        <div className="text-left">
                          <div className="text-white font-bold text-base">{category.label}</div>
                          {(category as { tagline?: string }).tagline && (
                            <div className="text-[11px] text-gray-300/90 mt-0.5">
                              {(category as { tagline?: string }).tagline}
                            </div>
                          )}
                          <div
                            className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              backgroundColor: `${category.color}22`,
                              border: `1px solid ${category.color}55`,
                              color: category.color,
                            }}
                          >
                            <span>⚔️</span>
                            <span>{category.templates.length} 퀘스트</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="pt-4 space-y-3"
              >
                {/* 이전 선택 — 카테고리 내 상단 */}
                {currentLinkedGoalInCategory && (
                  <div className="space-y-2 pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" style={{ color }} />
                      <span className="text-xs font-bold text-gray-400">현재 연계 목표</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[currentLinkedGoalInCategory].map((goal) => {
                        const isConfirming = confirmingGoal === goal;
                        return (
                          <motion.button
                            key={goal}
                            disabled={!!confirmingGoal}
                            whileHover={!confirmingGoal ? { scale: 1.03 } : {}}
                            whileTap={!confirmingGoal ? { scale: 0.97 } : {}}
                            onClick={() => handleSelectGoal(goal)}
                            animate={
                              isConfirming
                                ? { scale: [1, 1.08, 1.02], boxShadow: [`0 0 0 transparent`, `0 0 16px ${color}66`, `0 0 12px ${color}44`] }
                                : {}
                            }
                            transition={{ duration: 0.38, ease: 'easeOut' }}
                            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-90"
                            style={{
                              backgroundColor: isConfirming ? `${color}35` : `${color}18`,
                              border: `1px solid ${isConfirming ? color : `${color}40`}`,
                              color: '#fff',
                            }}
                          >
                            {isConfirming && (
                              <motion.span
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                              >
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </motion.span>
                            )}
                            <Check className="w-3.5 h-3.5" style={{ color }} />
                            {goal}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 안내 문구: 카드 클릭 = 바로 추가 / 연필 = 내 말로 수정 */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                  <span>💡 카드를 누르면 바로 추가, 연필을 누르면 내 말로 수정할 수 있어요</span>
                </div>

                {/* 템플릿 목록 — 제목·태그라인·세부설명 + 인라인 수정 */}
                <div className="space-y-2">
                  {categoryTemplates.map((t, idx) => {
                    const { label, icon, tagline, tier, description } = normalizeTemplate(t);
                    const tierStyle = TIER_STYLE[tier];
                    const isConfirming = confirmingGoal === label || (editingIdx === idx && confirmingGoal === editLabel.trim());
                    const isEditing = editingIdx === idx;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          ...(isConfirming
                            ? { scale: [1, 1.02, 1.01], boxShadow: ['0 0 0 transparent', `0 0 20px ${color}55`, `0 0 14px ${color}44`] }
                            : {}),
                        }}
                        transition={{ delay: idx * 0.02, duration: isConfirming ? 0.38 : 0.2 }}
                        whileHover={
                          !confirmingGoal && !isEditing
                            ? { scale: 1.005, boxShadow: `0 0 16px ${color}33` }
                            : {}
                        }
                        className="relative w-full rounded-xl transition-[box-shadow,border-color] disabled:opacity-95"
                        style={{
                          backgroundColor: isConfirming
                            ? `${color}15`
                            : isEditing
                            ? `${color}10`
                            : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${
                            isConfirming || isEditing ? `${color}66` : 'rgba(255,255,255,0.08)'
                          }`,
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

                        {/* 메인 카드 영역 (클릭 시 바로 추가) */}
                        <div className="flex items-start gap-3 p-3.5">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{
                              backgroundColor: `${color}18`,
                              border: `1px solid ${color}30`,
                            }}
                          >
                            {icon}
                          </div>

                          <button
                            type="button"
                            disabled={!!confirmingGoal || isEditing}
                            onClick={() => {
                              if (confirmingGoal || isEditing) return;
                              handleSelectGoal(label);
                            }}
                            className="flex-1 min-w-0 text-left disabled:cursor-default"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-black flex-shrink-0"
                                style={{
                                  background: `linear-gradient(135deg, ${tierStyle.color}, ${tierStyle.color}cc)`,
                                  color: '#0b0820',
                                  boxShadow: `0 0 8px ${tierStyle.glow}`,
                                }}
                                title={`${tierStyle.label}티어`}
                              >
                                {tierStyle.label}
                              </span>
                              <span className="text-sm font-bold text-white leading-snug">
                                {label}
                              </span>
                              {tagline && (
                                <span
                                  className="text-[10.5px] px-1.5 py-0.5 rounded-md font-medium"
                                  style={{ backgroundColor: `${color}22`, color: '#e9e6ff' }}
                                >
                                  {tagline}
                                </span>
                              )}
                            </div>
                            {description && (
                              <div
                                className="mt-1 leading-relaxed"
                                style={{
                                  fontSize: '11px',
                                  color: 'rgba(255,255,255,0.42)',
                                  letterSpacing: '0.1px',
                                }}
                              >
                                {description}
                              </div>
                            )}
                          </button>

                          {/* 수정 버튼 */}
                          {!isEditing && (
                            <button
                              type="button"
                              disabled={!!confirmingGoal}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirmingGoal) return;
                                startEdit(idx, label);
                              }}
                              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.12)',
                              }}
                              title="내 말로 수정해서 추가"
                            >
                              <Pencil className="w-3.5 h-3.5 text-gray-300" />
                            </button>
                          )}
                        </div>

                        {/* 인라인 수정 모드 */}
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="px-3.5 pb-3.5 space-y-2"
                          >
                            <input
                              autoFocus
                              type="text"
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') submitEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              placeholder="목표를 내 말로 적어보세요"
                              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                              style={{
                                backgroundColor: 'rgba(0,0,0,0.35)',
                                border: `1px solid ${color}66`,
                              }}
                              maxLength={60}
                            />
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10.5px] text-gray-400">
                                {editLabel.trim().length}/60자 · Enter로 추가, Esc로 취소
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300"
                                  style={{
                                    backgroundColor: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                  }}
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  onClick={submitEdit}
                                  disabled={!editLabel.trim()}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                                  style={{
                                    backgroundColor: color,
                                    color: '#0b0820',
                                    boxShadow: `0 0 12px ${color}55`,
                                  }}
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                  이 목표로 추가
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
