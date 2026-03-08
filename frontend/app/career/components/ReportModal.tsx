'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Flag, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import reportReasons from '@/data/report-reasons.json';

export type ReportTarget =
  | { kind: 'content'; id: string; title: string }
  | { kind: 'comment'; id: string; author: string };

type Step = 'reason' | 'detail' | 'done';

type Props = {
  target: ReportTarget;
  accentColor?: string;
  onClose: () => void;
};

export function ReportModal({ target, accentColor = '#6C5CE7', onClose }: Props) {
  const [step, setStep] = useState<Step>('reason');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [detail, setDetail] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const reasons = target.kind === 'content'
    ? reportReasons.content
    : reportReasons.comment;

  const selectedLabel = reasons.find(r => r.id === selectedReason)?.label ?? '';

  const handleSubmit = () => {
    // 실제 서비스에서는 API 호출
    console.log('[신고]', {
      target,
      reason: selectedReason,
      detail: detail.trim(),
      reportedAt: new Date().toISOString(),
    });
    setStep('done');
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
      onClick={step !== 'done' ? onClose : undefined}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#0d0d24',
          border: '1px solid rgba(255,255,255,0.09)',
          borderBottom: 'none',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <Flag style={{ width: 16, height: 16, color: '#ef4444' }} />
            <span className="text-base font-bold text-white">
              {step === 'done' ? '신고 완료' : target.kind === 'content' ? '콘텐츠 신고' : '댓글 신고'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X style={{ width: 16, height: 16, color: '#9ca3af' }} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Step 1: 신고 대상 정보 + 사유 선택 */}
          {step === 'reason' && (
            <div className="space-y-4">
              {/* 신고 대상 */}
              <div
                className="flex items-start gap-3 p-3 rounded-2xl"
                style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <AlertTriangle style={{ width: 16, height: 16, color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-red-400">
                    {target.kind === 'content' ? '신고할 콘텐츠' : '신고할 댓글'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed truncate">
                    {target.kind === 'content' ? target.title : `${target.author}의 댓글`}
                  </p>
                </div>
              </div>

              <p className="text-sm font-semibold text-white">신고 사유를 선택해 주세요</p>

              {/* 사유 목록 */}
              <div className="space-y-2">
                {reasons.map((reason) => {
                  const isSelected = selectedReason === reason.id;
                  return (
                    <button
                      key={reason.id}
                      onClick={() => setSelectedReason(reason.id)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all active:scale-[0.98]"
                      style={{
                        backgroundColor: isSelected ? `${accentColor}18` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isSelected ? accentColor + '55' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <span className="text-xl flex-shrink-0">{reason.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)' }}
                        >
                          {reason.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                          {reason.description}
                        </div>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                        style={{
                          borderColor: isSelected ? accentColor : 'rgba(255,255,255,0.2)',
                          backgroundColor: isSelected ? accentColor : 'transparent',
                        }}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: 상세 내용 입력 */}
          {step === 'detail' && (
            <div className="space-y-4">
              <div
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
              >
                <CheckCircle2 style={{ width: 15, height: 15, color: accentColor, flexShrink: 0 }} />
                <span className="text-xs font-semibold" style={{ color: accentColor }}>
                  선택된 사유: {selectedLabel}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  추가 설명 <span className="text-xs text-gray-500 font-normal">(선택)</span>
                </p>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  신고 내용을 구체적으로 작성하면 빠른 처리에 도움이 됩니다.
                </p>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="예) 3번 항목의 내용이 실제 시험 일정과 다릅니다..."
                  rows={4}
                  maxLength={300}
                  className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-gray-600 resize-none outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <div className="text-right text-[10px] text-gray-600 mt-1">
                  {detail.length}/300
                </div>
              </div>

              <div
                className="p-3 rounded-xl space-y-1.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-xs font-bold text-gray-400">신고 처리 안내</p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  • 신고 접수 후 운영팀이 검토합니다 (영업일 1~3일)<br />
                  • 허위 신고 반복 시 이용이 제한될 수 있습니다<br />
                  • 긴급한 경우 고객센터로 직접 문의해 주세요
                </p>
              </div>
            </div>
          )}

          {/* Step 3: 완료 */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)' }}
              >
                <CheckCircle2 style={{ width: 40, height: 40, color: '#22C55E' }} />
              </div>
              <div>
                <p className="text-base font-bold text-white">신고가 접수되었습니다</p>
                <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                  운영팀이 검토 후 조치하겠습니다.<br />
                  소중한 신고 감사합니다.
                </p>
              </div>
              <div
                className="w-full p-3 rounded-xl text-left space-y-1"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">신고 사유</span>
                  <span className="text-gray-300 font-semibold">{selectedLabel}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">처리 예정</span>
                  <span className="text-gray-300 font-semibold">영업일 1~3일</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div
          className="flex-shrink-0 p-4 border-t space-y-2"
          style={{
            borderColor: 'rgba(255,255,255,0.07)',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          {step === 'reason' && (
            <button
              onClick={() => selectedReason && setStep('detail')}
              className="w-full h-12 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98]"
              style={{
                background: selectedReason
                  ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
                  : 'rgba(255,255,255,0.08)',
                color: selectedReason ? '#fff' : 'rgba(255,255,255,0.3)',
                cursor: selectedReason ? 'pointer' : 'not-allowed',
              }}
            >
              다음
              <ChevronRight style={{ width: 16, height: 16, display: 'inline', marginLeft: 4 }} />
            </button>
          )}

          {step === 'detail' && (
            <div className="flex gap-2">
              <button
                onClick={() => setStep('reason')}
                className="flex-1 h-12 rounded-2xl font-semibold text-sm transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: '#ccc' }}
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 h-12 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, #ef4444, #dc2626)`,
                  boxShadow: '0 4px 16px rgba(239,68,68,0.35)',
                }}
              >
                신고 제출
              </button>
            </div>
          )}

          {step === 'done' && (
            <button
              onClick={onClose}
              className="w-full h-12 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                boxShadow: `0 4px 16px ${accentColor}44`,
              }}
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
