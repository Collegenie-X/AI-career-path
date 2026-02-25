'use client';

import { useState } from 'react';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import goalTemplatesData from '@/data/goal-templates.json';

interface GoalTemplateSelectorProps {
  onSelect: (goal: string) => void;
  onClose: () => void;
  color: string;
}

type CategoryKey = keyof typeof goalTemplatesData;

export function GoalTemplateSelector({ onSelect, onClose, color }: GoalTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  const categories = Object.entries(goalTemplatesData).map(([key, data]) => ({
    key: key as CategoryKey,
    ...data,
  }));

  const handleSelectGoal = (goal: string) => {
    onSelect(goal);
    onClose();
  };

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
                className="p-4 space-y-2"
              >
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
              </motion.div>
            ) : (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 space-y-2"
              >
                {goalTemplatesData[selectedCategory].templates.map((template, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectGoal(template)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="flex-1 text-sm text-white font-medium">{template}</span>
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="text-xs font-bold px-2 py-1 rounded-lg"
                      style={{ backgroundColor: `${color}25`, color }}
                    >
                      선택
                    </motion.div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
