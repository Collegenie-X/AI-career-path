'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, ExternalLink, GraduationCap, Lightbulb, Target, X } from 'lucide-react';
import { GlossaryText } from '@/components/shared/GlossaryText';

type UniversityFocusDialogProps = {
  readonly universityLabel: string;
  readonly universityUrl?: string;
  readonly universityDetail?: string;
  readonly universitySource?: string;
  readonly universityIboUrl?: string;
  readonly universityIbAcceptance?: string;
  readonly universityNote?: string;
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
  universityUrl,
  universityDetail,
  universitySource,
  universityIboUrl,
  universityIbAcceptance,
  universityNote,
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
        className="w-full max-w-[28rem] md:max-w-[680px] h-[94dvh] md:max-h-[88vh] overflow-y-auto rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #0f172a, #111827)',
          border: `1px solid ${categoryColor}55`,
          boxShadow: '0 12px 56px rgba(15,23,42,0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 relative overflow-hidden p-4"
          style={{
            background: '#0c1219',
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
              <p className="text-[14px] font-bold uppercase tracking-wider mb-0.5" style={{ color: categoryColor }}>
                {categoryEmoji} {categoryShortName} · {categoryName}
              </p>
              <h2 className="text-xl font-bold text-white leading-tight">{universityLabel}</h2>
              <p className="text-[13px] text-white/60 mt-1">이 전형으로 지원할 때 알아야 할 핵심 포인트</p>
              {universityUrl && (
                <a
                  href={universityUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md text-[12px] font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    color: categoryColor,
                    background: `${categoryColor}18`,
                    border: `1px solid ${categoryColor}55`,
                  }}
                  title={universityUrl}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  입학처 공식 홈페이지 바로가기
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 대학별 상세 정보 (detail, ibAcceptance, note, source, iboUrl) */}
          {(universityDetail || universityIbAcceptance || universityNote) && (
            <div
              className="rounded-xl p-3 space-y-2"
              style={{ background: `${categoryColor}12`, border: `1px solid ${categoryColor}40` }}
            >
              <p className="text-[14px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: categoryColor }}>
                <GraduationCap className="w-3.5 h-3.5" />
                대학별 전형 상세
              </p>
              {universityIbAcceptance && (
                <div className="flex items-start gap-2 text-[13px] text-gray-200 leading-relaxed">
                  <span className="flex-shrink-0 mt-0.5 text-emerald-400">IB</span>
                  <span>{universityIbAcceptance}</span>
                </div>
              )}
              {universityDetail && (
                <p className="text-[13px] text-gray-200 leading-relaxed">
                  <GlossaryText>{universityDetail}</GlossaryText>
                </p>
              )}
              {universityNote && (
                <p className="text-[12px] text-gray-400 leading-relaxed">
                  {universityNote}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {universityIboUrl && (
                  <a
                    href={universityIboUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md hover:underline"
                    style={{ color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.35)' }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    IBO 공식 인정 현황
                  </a>
                )}
                {universitySource && (
                  <span className="text-[11px] text-gray-500 px-2 py-0.5">
                    출처: {universitySource}
                  </span>
                )}
              </div>
            </div>
          )}

          <div
            className="rounded-xl p-3"
            style={{ background: categoryBgColor, border: `1px solid ${categoryColor}40` }}
          >
            <p className="text-[14px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: categoryColor }}>
              <Target className="w-3.5 h-3.5" />
              {universityLabel} 전형 핵심
            </p>
            <ul className="space-y-1.5">
              {keyFeatures.slice(0, 4).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px] text-gray-200 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: categoryColor }} />
                  <GlossaryText>{feature}</GlossaryText>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[14px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-white/70">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              이런 학생에게 어울려요
            </p>
            <ul className="space-y-1.5">
              {targetStudents.slice(0, 4).map((student, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px] text-gray-200 leading-relaxed">
                  <span className="text-amber-300 flex-shrink-0">▸</span>
                  <GlossaryText>{student}</GlossaryText>
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
            <p className="text-[14px] font-bold uppercase tracking-wider mb-1 text-indigo-200">
              💡 다음 단계
            </p>
            <p className="text-[14px] text-white/80 leading-relaxed">
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
