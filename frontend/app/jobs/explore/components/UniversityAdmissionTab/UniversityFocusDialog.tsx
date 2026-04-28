'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, GraduationCap, Lightbulb, Target, X } from 'lucide-react';

type UniversityFocusDialogProps = {
  readonly universityLabel: string;
  readonly categoryName: string;
  readonly categoryShortName: string;
  readonly categoryEmoji: string;
  readonly categoryColor: string;
  readonly categoryBgColor: string;
  readonly keyFeatures: string[];
  readonly targetStudents: string[];
  readonly onClose: () => void;
};

/**
 * 단일 대학에 초점을 맞춘 3단계 다이얼로그.
 * 카테고리(전형) 맥락 + 그 대학에 지원할 때 알아야 할 핵심 정보를 한 화면에 보여줍니다.
 */
export function UniversityFocusDialog({
  universityLabel,
  categoryName,
  categoryShortName,
  categoryEmoji,
  categoryColor,
  categoryBgColor,
  keyFeatures,
  targetStudents,
  onClose,
}: UniversityFocusDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-2 md:p-4"
      style={{ background: 'rgba(2,6,23,0.86)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[28rem] md:max-w-[34rem] h-[94dvh] md:max-h-[88vh] overflow-y-auto rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(17,24,39,0.98))',
          border: `1px solid ${categoryColor}55`,
          boxShadow: '0 12px 56px rgba(15,23,42,0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 relative overflow-hidden p-4"
          style={{
            background: `linear-gradient(135deg, ${categoryColor}28, ${categoryColor}0a)`,
            borderBottom: `1px solid ${categoryColor}30`,
          }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-30"
            style={{ background: `radial-gradient(circle, ${categoryColor}, transparent)` }}
            aria-hidden
          />
          <div className="absolute top-3 right-3 z-10">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/15 hover:rotate-90"
              style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${categoryColor}55` }}
              aria-label="닫기"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div className="relative flex items-start gap-3 pr-10">
            <div
              className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: categoryBgColor,
                border: `2px solid ${categoryColor}`,
                boxShadow: `0 0 16px ${categoryColor}40`,
              }}
            >
              <GraduationCap className="w-7 h-7" style={{ color: categoryColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: categoryColor }}>
                {categoryEmoji} {categoryShortName} · {categoryName}
              </p>
              <h2 className="text-lg font-bold text-white leading-tight">{universityLabel}</h2>
              <p className="text-xs text-white/60 mt-1">이 전형으로 지원할 때 알아야 할 핵심 포인트</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            className="rounded-xl p-3"
            style={{ background: categoryBgColor, border: `1px solid ${categoryColor}40` }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: categoryColor }}>
              <Target className="w-3.5 h-3.5" />
              {universityLabel} 전형 핵심
            </p>
            <ul className="space-y-1.5">
              {keyFeatures.slice(0, 4).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-gray-200 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: categoryColor }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-white/70">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              이런 학생에게 어울려요
            </p>
            <ul className="space-y-1.5">
              {targetStudents.slice(0, 4).map((student, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-gray-200 leading-relaxed">
                  <span className="text-amber-300 flex-shrink-0">▸</span>
                  <span>{student}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-xl p-3"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 100%)',
              border: '1px solid rgba(129,140,248,0.35)',
            }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-indigo-200">
              💡 다음 단계
            </p>
            <p className="text-[12px] text-white/80 leading-relaxed">
              {universityLabel}에 {categoryShortName} 전형으로 지원하려면, 왼쪽의 <strong className="text-white">전형 상세 패널</strong>에서
              <strong style={{ color: categoryColor }}> 학년별 로드맵</strong>과 <strong style={{ color: categoryColor }}>AI 2028 전략</strong> 탭을 확인하세요.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
