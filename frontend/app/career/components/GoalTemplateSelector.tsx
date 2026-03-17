'use client';

import { useState, useMemo } from 'react';
import { X, Sparkles, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import goalTemplatesData from '@/data/goal-templates.json';

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
    onSelect(goal);
    onClose();
  };

  const categoryTemplates = selectedCategory
    ? goalTemplatesData[selectedCategory].templates as TemplateItem[]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #12122a 100%)',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
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
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 72px)' }}>
          <AnimatePresence mode="wait">
            {!selectedCategory ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 space-y-4"
              >
                {/* 이전 선택된 목표 — 카테고리 목록 상단 */}
                {previouslySelected.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" style={{ color }} />
                      <span className="text-xs font-bold text-gray-400">이미 선택한 목표</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {previouslySelected.map((goal) => (
                        <motion.button
                          key={goal}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSelectGoal(goal)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                          style={{
                            backgroundColor: `${color}18`,
                            border: `1px solid ${color}40`,
                            color: '#fff',
                          }}
                        >
                          <Check className="w-3.5 h-3.5" style={{ color }} />
                          {goal}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 카테고리 목록 */}
                <div className="space-y-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(category.key)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${category.color}15, ${category.color}08)`,
                        border: `1.5px solid ${category.color}30`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{
                            background: `${category.color}25`,
                            border: `1px solid ${category.color}40`,
                          }}
                        >
                          {category.emoji}
                        </div>
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
                className="p-4 space-y-3"
              >
                {/* 이전 선택 — 카테고리 내 상단 */}
                {prevInCategory.length > 0 && (
                  <div className="space-y-2 pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" style={{ color }} />
                      <span className="text-xs font-bold text-gray-400">이미 선택한 목표</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prevInCategory.map((goal) => (
                        <motion.button
                          key={goal}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSelectGoal(goal)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                          style={{
                            backgroundColor: `${color}18`,
                            border: `1px solid ${color}40`,
                            color: '#fff',
                          }}
                        >
                          <Check className="w-3.5 h-3.5" style={{ color }} />
                          {goal}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 템플릿 목록 — 아이콘 + 제목 + 설명 */}
                <div className="space-y-2">
                  {categoryTemplates.map((t, idx) => {
                    const { label, icon, description } = normalizeTemplate(t);
                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelectGoal(label)}
                        className="w-full flex items-start gap-3 p-3.5 rounded-xl transition-all text-left"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
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
                          {description && (
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{description}</div>
                          )}
                        </div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: `${color}25`, color }}
                        >
                          선택
                        </motion.div>
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
