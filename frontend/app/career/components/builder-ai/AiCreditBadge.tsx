'use client';

import Link from 'next/link';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { AI_PATH_CONFIG } from '../../utils/aiPathGenerator';
import { AI_ACCENT, AI_ACCENT_SOFT } from './AiDraftContext';

export function AiCreditBadge({ credits }: { credits: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0"
      style={{ backgroundColor: `${AI_ACCENT}24`, border: `1px solid ${AI_ACCENT}66`, color: AI_ACCENT_SOFT }}
      title="남은 AI 크레딧"
    >
      <Sparkles className="w-3 h-3" />
      크레딧 {credits}
    </span>
  );
}

export function FreeBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0"
      style={{ backgroundColor: 'rgba(34,197,94,0.16)', border: '1px solid rgba(34,197,94,0.5)', color: '#86efac' }}
    >
      {AI_PATH_CONFIG.pricing.freeBadge}
    </span>
  );
}

/** 크레딧 부족·생성 실패 안내. 수동 만들기는 항상 무료로 열려 있다 */
export function AiErrorNotice({
  kind, message, onManual, onResetTestCredits,
}: {
  kind: 'quota' | 'general';
  message: string;
  onManual?: () => void;
  onResetTestCredits?: () => void;
}) {
  const { pricing } = AI_PATH_CONFIG;
  return (
    <div
      className="rounded-2xl px-4 py-3 space-y-2.5"
      role="alert"
      style={{ backgroundColor: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.45)' }}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
        <div className="min-w-0">
          {kind === 'quota' && <div className="text-sm font-bold text-white">{pricing.emptyTitle}</div>}
          <p className="text-[12px] text-gray-300 leading-relaxed">{message}</p>
        </div>
      </div>
      {kind === 'quota' && (
        <div className="flex gap-2">
          <Link
            href={pricing.pricingRoute}
            className="flex-1 h-10 rounded-xl text-xs font-bold text-white flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${AI_ACCENT}, ${AI_ACCENT}bb)` }}
          >
            요금제 보기
          </Link>
          {onManual && (
            <button
              type="button"
              onClick={onManual}
              className="flex-1 h-10 rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              무료로 직접 만들기
            </button>
          )}
        </div>
      )}
      {kind === 'quota' && pricing.allowTestReset && onResetTestCredits && (
        <button
          type="button"
          onClick={onResetTestCredits}
          className="w-full h-9 rounded-xl text-[12px] font-semibold text-gray-300"
          style={{ border: '1px dashed rgba(255,255,255,0.25)' }}
        >
          {pricing.testResetLabel}
        </button>
      )}
    </div>
  );
}
