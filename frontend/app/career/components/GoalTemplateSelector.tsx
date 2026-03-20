'use client';

import { useState, useMemo } from 'react';
import { X, Sparkles, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import goalTemplatesData from '@/data/goal-templates.json';
import { GOAL_TEMPLATE_SELECTOR_DIALOG } from '../config';

/** 템플릿 항목: 문자열 또는 { label, icon?, description? } */
type TemplateItem = string | { label: string; icon?: string; description?: string };

function normalizeTemplate(t: TemplateItem): { label: string; icon: string; description: string } {
  if (typeof t === 'string') {
    return { label: t, icon: '•', description: '' };
  }
  return {
    label: t.label,
    icon: t.icon ?? '•',
    description: t.description ?? '',
  };
}

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
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color }} />
            <h3 className="text-lg font-bold text-white">
              {selectedCategory ? goalTemplatesData[selectedCategory].label : '목표 템플릿 선택'}
            </h3>
          </div>
          <button
            onClick={selectedCategory ? () => setSelectedCategory(null) : onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
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
                          <div className="text-xs text-gray-400">{category.templates.length}개 템플릿</div>
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

                {/* 템플릿 목록 — 아이콘 + 제목만 (호버·팝업 상세 없음) */}
                <div className="space-y-2">
                  {categoryTemplates.map((t, idx) => {
                    const { label, icon } = normalizeTemplate(t);
                    const isConfirming = confirmingGoal === label;
                    return (
                      <motion.button
                        key={idx}
                        disabled={!!confirmingGoal}
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
                          !confirmingGoal
                            ? { scale: 1.01, x: 4, boxShadow: `0 0 16px ${color}33`, borderColor: `${color}55` }
                            : {}
                        }
                        whileTap={!confirmingGoal ? { scale: 0.99 } : {}}
                        onClick={() => {
                          if (confirmingGoal) return;
                          handleSelectGoal(label);
                        }}
                        className="relative w-full flex items-center gap-3 p-3.5 rounded-xl transition-[box-shadow,border-color] text-left disabled:opacity-95"
                        style={{
                          backgroundColor: isConfirming ? `${color}15` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isConfirming ? `${color}55` : 'rgba(255,255,255,0.08)'}`,
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
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{
                            backgroundColor: `${color}18`,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white leading-snug">{label}</div>
                        </div>
                      </motion.button>
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
