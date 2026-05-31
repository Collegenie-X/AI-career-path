'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Users, BarChart3, Sparkles, Wallet, ExternalLink, X, Lightbulb, Trophy } from 'lucide-react';

type ScheduleRow = { label: string; value: string };

export type ActivityDetail = {
  summary?: string;
  schedule?: ScheduleRow[];
  eligibility?: string[];
  scale?: string[];
  pastWorks?: string[];
  programs?: string[];
  cost?: string;
  tips?: string[];
};

export type ActivityDialogData = {
  name: string;
  org: string;
  grades: string;
  url: string;
  note?: string;
  emoji: string;
  color: string;
  detail?: ActivityDetail;
};

/** ==text== 마커를 형광펜 강조로 렌더링 */
function HL({ text }: { readonly text: string }) {
  const parts = text.split(/==(.+?)==/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm px-0.5 font-medium not-italic" style={{ background: 'rgba(250,204,21,0.14)', color: 'inherit' }}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * 봉사·캠프·수상·전시 활동 상세 팝업.
 * 일정(개최/접수일)·자격·규모·부대 프로그램·비용을 보여주고, 공식 홈페이지로 바로가기 링크를 제공합니다.
 */
export function ActivityDetailDialog({ data, onClose }: { readonly data: ActivityDialogData; readonly onClose: () => void }) {
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

  const { color } = data;
  const detail = data.detail;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-2 md:p-4"
      style={{ background: 'rgba(2,6,23,0.86)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[28rem] md:max-w-[620px] h-[92dvh] md:max-h-[88vh] overflow-y-auto rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #0f172a, #111827)',
          border: `1px solid ${color}55`,
          boxShadow: '0 12px 56px rgba(15,23,42,0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 relative overflow-hidden p-4" style={{ background: '#0c1219', borderBottom: `1px solid ${color}30` }}>
          <div
            className="pointer-events-none absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-30"
            style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
            aria-hidden
          />
          <div className="absolute top-3 right-3 z-10">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/15 hover:rotate-90"
              style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${color}55` }}
              aria-label="닫기"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div className="relative flex items-start gap-3 pr-10">
            <div
              className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${color}22`, border: `2px solid ${color}`, boxShadow: `0 0 16px ${color}40` }}
            >
              {data.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold uppercase tracking-wider mb-0.5" style={{ color }}>
                {data.org} · {data.grades}
              </p>
              <h2 className="text-xl font-bold text-white leading-tight">{data.name}</h2>
              {data.note && <p className="text-[13px] text-white/60 mt-1">{data.note}</p>}
              <a
                href={data.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md text-[12px] font-semibold transition-all hover:scale-[1.02]"
                style={{ color, background: `${color}18`, border: `1px solid ${color}55` }}
                title={data.url}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                공식 홈페이지 바로가기
              </a>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {detail?.summary && (
            <p className="text-[14px] text-white/85 leading-relaxed"><HL text={detail.summary} /></p>
          )}

          {/* 일정 (개최/접수일) */}
          {detail?.schedule?.length ? (
            <div className="rounded-xl p-3" style={{ background: `${color}12`, border: `1px solid ${color}40` }}>
              <p className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color }}>
                <CalendarDays className="w-3.5 h-3.5" />
                일정 · 접수일
              </p>
              <div className="space-y-1.5">
                {detail.schedule.map((row, i) => (
                  <div key={i} className="flex gap-2 text-[13px]">
                    <span className="flex-shrink-0 font-semibold text-white/90 min-w-[88px]">{row.label}</span>
                    <span className="text-white/75 leading-relaxed">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* 자격 · 대상 */}
          {detail?.eligibility?.length ? (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-white/70">
                <Users className="w-3.5 h-3.5" style={{ color }} />
                자격 · 대상
              </p>
              <ul className="space-y-1.5">
                {detail.eligibility.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-gray-200 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5" style={{ color }}>▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* 규모 */}
          {detail?.scale?.length ? (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-white/70">
                <BarChart3 className="w-3.5 h-3.5" style={{ color }} />
                규모
              </p>
              <ul className="space-y-1.5">
                {detail.scale.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-gray-200 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5" style={{ color }}>▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* 이전 출품작·수상작 예시 */}
          {detail?.pastWorks?.length ? (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-white/70">
                <Trophy className="w-3.5 h-3.5" style={{ color }} />
                이전 출품작 · 수상작 예시
              </p>
              <ul className="space-y-1.5">
                {detail.pastWorks.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-gray-200 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5" style={{ color }}>▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* 부대 프로그램 */}
          {detail?.programs?.length ? (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-white/70">
                <Sparkles className="w-3.5 h-3.5" style={{ color }} />
                체험 · 부대 프로그램
              </p>
              <ul className="space-y-1.5">
                {detail.programs.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-gray-200 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5" style={{ color }}>▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* 비용 */}
          {detail?.cost && (
            <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Wallet className="w-4 h-4 flex-shrink-0" style={{ color }} />
              <span className="text-[13px] text-white/85"><span className="font-semibold text-white/70">비용: </span>{detail.cost}</span>
            </div>
          )}

          {/* 팁 */}
          {detail?.tips?.length ? (
            <div
              className="rounded-xl p-3"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 100%)', border: '1px solid rgba(129,140,248,0.35)' }}
            >
              <p className="text-[13px] font-bold uppercase tracking-wider mb-1 text-indigo-200 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                활용 팁
              </p>
              {detail.tips.map((tip, i) => (
                <p key={i} className="text-[13px] text-white/80 leading-relaxed"><HL text={tip} /></p>
              ))}
            </div>
          ) : null}

          {!detail && (
            <p className="text-[13px] text-white/60 leading-relaxed">자세한 일정·자격·규모는 위 공식 홈페이지에서 확인하세요.</p>
          )}

          <p className="text-[11px] text-white/40 leading-relaxed text-center pt-1">
            ⚠️ 일정·비용·자격은 매년 변동될 수 있어요. 참여 전 공식 홈페이지에서 최신 정보를 꼭 확인하세요.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
