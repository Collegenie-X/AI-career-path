'use client';

import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { AI_PATH_CONFIG, fillTemplate, getOperationCost } from '../../utils/aiPathGenerator';
import { AI_ACCENT, AI_ACCENT_SOFT } from './AiDraftContext';
import { AiCreditBadge, FreeBadge } from './AiCreditBadge';

type Props = {
  color: string;
  credits: number;
  onSelect: (mode: 'auto' | 'manual') => void;
};

export function StartModeChooser({ color, credits, onSelect }: Props) {
  const { startModes, pricing } = AI_PATH_CONFIG;
  return (
    <div className="space-y-3">
      {startModes.map((mode, idx) => {
        const isAuto = mode.id === 'auto';
        const accent = isAuto ? AI_ACCENT : color;
        return (
          <motion.button
            key={mode.id}
            type="button"
            onClick={() => onSelect(mode.id)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, type: 'spring', stiffness: 380, damping: 26 }}
            whileTap={{ scale: 0.985 }}
            className="w-full text-left rounded-2xl p-4 space-y-3"
            style={{
              border: `1.5px solid ${accent}66`,
              background: `linear-gradient(160deg, ${accent}26 0%, ${accent}0a 100%)`,
              boxShadow: isAuto ? `0 0 28px ${accent}22` : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: `${accent}2e`, border: `1px solid ${accent}55` }}
              >
                {mode.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-black text-white">{mode.title}</span>
                  {isAuto ? <AiCreditBadge credits={credits} /> : <FreeBadge />}
                </div>
                <p className="text-[13px] text-gray-300 mt-0.5 leading-snug">{mode.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: isAuto ? AI_ACCENT_SOFT : color }} />
            </div>
            <ul className="space-y-1 pl-1">
              {mode.points.map((point) => (
                <li key={point} className="flex items-center gap-2 text-[12px] text-gray-300">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isAuto ? AI_ACCENT_SOFT : color }} strokeWidth={3} />
                  {point}
                </li>
              ))}
            </ul>
            {isAuto && (
              <p className="text-[11.5px] leading-relaxed" style={{ color: AI_ACCENT_SOFT }}>
                생성 1회에 크레딧 {getOperationCost('generate')}개 · {fillTemplate(pricing.trialNote, { n: pricing.freeTrialCredits })}
              </p>
            )}
          </motion.button>
        );
      })}
      <p className="text-center text-[12px] text-gray-500 pt-1">어느 쪽으로 시작해도 나중에 자유롭게 고칠 수 있어요</p>
    </div>
  );
}
