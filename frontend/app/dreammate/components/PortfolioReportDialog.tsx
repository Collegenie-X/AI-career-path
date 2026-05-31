'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Pencil, CheckCircle2, Circle, Camera, LinkIcon, Trophy, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import type { SharedRoadmap } from '../types';
import { buildPortfolioReport, type PortfolioWeek } from '../utils/buildPortfolioReport';
import { compressImageFile } from '../utils/compressImageFile';
import { DREAM_ITEM_TYPES } from '../config';
import { ROADMAP_DETAIL_PORTAL_Z_INDEX } from '../config/roadmap-detail-dialog-display.config';

const PERIOD_LABEL: Record<string, string> = {
  afterschool: '방과후',
  vacation: '방학',
  semester: '학기중',
};

type TodoOutputPatch = { outputRef?: string; outputImageUrl?: string; note?: string };
type FinalResultPatch = {
  finalResultTitle?: string;
  finalResultDescription?: string;
  finalResultUrl?: string;
  finalResultImageUrl?: string;
};

interface PortfolioReportDialogProps {
  roadmap: SharedRoadmap;
  onClose: () => void;
  /** 실행계획 구조(제목·시기·주차 항목)를 수정하러 편집기로 이동 */
  onEdit: () => void;
  /** 주차별 결과물(링크·사진·메모) 인라인 저장 */
  onUpdateTodoOutput: (itemId: string, todoId: string, patch: TodoOutputPatch) => void;
  /** 핵심 성과(최종 결과물) 인라인 저장 */
  onUpdateFinalResult: (patch: FinalResultPatch) => void;
}

/* ── 핵심 성과(최종 결과물) 인라인 에디터 ── */
function FinalResultEditor({
  finalResult,
  accent,
  onUpdate,
}: {
  finalResult: { title?: string; description?: string; url?: string; imageUrl?: string };
  accent: string;
  onUpdate: (patch: FinalResultPatch) => void;
}) {
  const [title, setTitle] = useState(finalResult.title ?? '');
  const [desc, setDesc] = useState(finalResult.description ?? '');
  const [url, setUrl] = useState(finalResult.url ?? '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTitle(finalResult.title ?? ''); }, [finalResult.title]);
  useEffect(() => { setDesc(finalResult.description ?? ''); }, [finalResult.description]);
  useEffect(() => { setUrl(finalResult.url ?? ''); }, [finalResult.url]);

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImageFile(file);
      onUpdate({ finalResultImageUrl: dataUrl });
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const dirty =
    title !== (finalResult.title ?? '') ||
    desc !== (finalResult.description ?? '') ||
    url !== (finalResult.url ?? '');

  const inputStyle = { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="rounded-xl px-3.5 py-3 space-y-2" style={{ backgroundColor: `${accent}10`, border: `1px solid ${accent}30` }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="핵심 성과 제목 (예: SW 공모전 최종 제출작)"
        className="w-full px-3 py-2 rounded-lg text-[12px] text-white placeholder:text-gray-600 outline-none"
        style={inputStyle}
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="무엇을 만들었고 어떤 점이 핵심 결과인지 적어주세요"
        rows={2}
        className="w-full px-3 py-2 rounded-lg text-[12px] text-white placeholder:text-gray-600 outline-none resize-none"
        style={inputStyle}
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="결과물 URL (예: https://github.com/…)"
        className="w-full px-3 py-2 rounded-lg text-[12px] text-white placeholder:text-gray-600 outline-none"
        style={inputStyle}
      />
      {finalResult.imageUrl && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={finalResult.imageUrl} alt="대표 결과물" className="h-24 rounded-lg object-cover" style={{ border: '1px solid rgba(255,255,255,0.12)' }} />
          <button
            onClick={() => onUpdate({ finalResultImageUrl: '' })}
            aria-label="대표 이미지 삭제"
            className="portfolio-report-noprint absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          >
            <Trash2 className="w-2.5 h-2.5 text-gray-200" />
          </button>
        </div>
      )}
      <div className="portfolio-report-noprint flex gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handlePhoto(e.target.files?.[0])} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold text-gray-200 disabled:opacity-60"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.18)' }}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          {uploading ? '처리 중…' : finalResult.imageUrl ? '대표 이미지 교체' : '대표 이미지'}
        </button>
        <button
          onClick={() => onUpdate({ finalResultTitle: title.trim(), finalResultDescription: desc.trim(), finalResultUrl: url.trim() })}
          disabled={!dirty}
          className="px-4 py-2 rounded-lg text-[12px] font-bold text-white disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
        >
          저장
        </button>
      </div>
    </div>
  );
}

/* ── 주차별 행 + 인라인 결과 기록 에디터 ── */
function WeekRow({
  week,
  accent,
  onUpdate,
}: {
  week: PortfolioWeek;
  accent: string;
  onUpdate: (patch: TodoOutputPatch) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftRef, setDraftRef] = useState(week.recordedOutput ?? '');
  const [draftNote, setDraftNote] = useState(week.note ?? '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // props가 외부 저장으로 갱신되면 draft 동기화
  useEffect(() => { setDraftRef(week.recordedOutput ?? ''); }, [week.recordedOutput]);
  useEffect(() => { setDraftNote(week.note ?? ''); }, [week.note]);

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImageFile(file);
      onUpdate({ outputImageUrl: dataUrl });
    } catch {
      /* 무시: 변환 실패 시 그대로 둠 */
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const dirty = draftRef !== (week.recordedOutput ?? '') || draftNote !== (week.note ?? '');

  return (
    <div
      className="rounded-xl px-3.5 py-3"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start gap-2">
        {week.isDone ? (
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accent }} />
        ) : (
          <Circle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-600" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold" style={{ color: accent }}>{week.weekLabel}</div>
          <div className="text-[13px] text-white font-semibold leading-snug">{week.goalTitle}</div>

          {week.plannedOutput && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-400">
              <Camera className="w-3 h-3 flex-shrink-0" />
              <span className="leading-snug">목표 결과물 · {week.plannedOutput}</span>
            </div>
          )}
          {week.recordedOutput && (
            <div className="mt-1 flex items-center gap-1.5 text-[11px]" style={{ color: accent }}>
              <LinkIcon className="w-3 h-3 flex-shrink-0" />
              <span className="leading-snug break-all">기록 · {week.recordedOutput}</span>
            </div>
          )}
          {week.note && <p className="mt-1 text-[11px] text-gray-400 leading-snug">메모 · {week.note}</p>}

          {/* 기록한 사진 썸네일 */}
          {week.outputImageUrl && (
            <div className="mt-2 relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={week.outputImageUrl}
                alt={`${week.weekLabel} 결과물`}
                className="h-20 rounded-lg object-cover"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              />
              <button
                onClick={() => onUpdate({ outputImageUrl: '' })}
                aria-label="사진 삭제"
                className="portfolio-report-noprint absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
              >
                <Trash2 className="w-2.5 h-2.5 text-gray-200" />
              </button>
            </div>
          )}

          {/* 인라인 기록 토글 */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="portfolio-report-noprint mt-2 inline-flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: accent }}
          >
            <ChevronDown className="w-3 h-3 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
            결과물 기록
          </button>

          {open && (
            <div className="portfolio-report-noprint mt-2 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handlePhoto(e.target.files?.[0])}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold text-gray-200 disabled:opacity-60"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.18)' }}
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                {uploading ? '사진 처리 중…' : week.outputImageUrl ? '사진 교체' : '사진 첨부'}
              </button>
              <input
                value={draftRef}
                onChange={(e) => setDraftRef(e.target.value)}
                placeholder="산출물 링크·파일명 (예: 기획서.pdf, github.com/…)"
                className="w-full px-3 py-2 rounded-lg text-[12px] text-white placeholder:text-gray-600 outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <textarea
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                placeholder="진행 메모 (선택)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-[12px] text-white placeholder:text-gray-600 outline-none resize-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                onClick={() => onUpdate({ outputRef: draftRef.trim(), note: draftNote.trim() })}
                disabled={!dirty}
                className="w-full py-2 rounded-lg text-[12px] font-bold text-white disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
              >
                기록 저장
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PortfolioReportDialog({ roadmap, onClose, onEdit, onUpdateTodoOutput, onUpdateFinalResult }: PortfolioReportDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const report = buildPortfolioReport(roadmap);
  const typeMeta = DREAM_ITEM_TYPES.find((t) => t.value === report.type);
  const accent = report.starColor || typeMeta?.color || '#6C5CE7';

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center portfolio-report-overlay"
      style={{ zIndex: ROADMAP_DETAIL_PORTAL_Z_INDEX, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="portfolio-report-sheet relative w-full md:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
        style={{ backgroundColor: '#140e28', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className="sticky top-0 z-10 px-5 py-4 flex items-start justify-between gap-3"
          style={{ background: `linear-gradient(135deg, ${accent}33, #140e28 80%)`, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-300">
              <span>{typeMeta?.emoji ?? '🚀'} {typeMeta?.label ?? '프로젝트'}</span>
              <span className="text-gray-500">·</span>
              <span>{PERIOD_LABEL[report.period] ?? report.period}</span>
            </div>
            <h2 className="mt-1 text-base md:text-lg font-black text-white leading-snug">{report.title}</h2>
            <p className="mt-0.5 text-[11px] text-gray-400">결과 리포트 · 실행 진행에 따라 자동 정리됩니다</p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="portfolio-report-noprint flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 진행률 */}
          <section>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-bold text-white">실행 진행률</span>
              <span className="text-[12px] font-black" style={{ color: accent }}>
                {report.progress.done}/{report.progress.total} · {report.progress.pct}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${report.progress.pct}%`, backgroundColor: accent }} />
            </div>
          </section>

          {/* 개요 */}
          {report.description && (
            <section>
              <h3 className="text-[12px] font-bold text-gray-300 mb-1">개요</h3>
              <p className="text-[13px] text-gray-200 leading-relaxed">{report.description}</p>
            </section>
          )}

          {/* 주차별 실행 & 산출물 */}
          <section>
            <h3 className="text-[12px] font-bold text-gray-300 mb-2">주차별 실행 & 산출물</h3>
            <div className="space-y-2">
              {report.weeks.map((w) => (
                <WeekRow
                  key={w.key}
                  week={w}
                  accent={accent}
                  onUpdate={(patch) => onUpdateTodoOutput(w.itemId, w.todoId, patch)}
                />
              ))}
              {report.weeks.length === 0 && (
                <p className="text-[12px] text-gray-500">아직 주차 항목이 없습니다.</p>
              )}
            </div>
          </section>

          {/* 결과물 갤러리 (사진) */}
          <section>
            <h3 className="text-[12px] font-bold text-gray-300 mb-2">결과물 갤러리</h3>
            {report.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {report.photos.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <figure key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <img src={p.src} alt={p.caption ?? `결과물 ${i + 1}`} className="w-full h-28 object-cover" />
                    {p.caption && <figcaption className="px-2 py-1 text-[10px] text-gray-400 truncate">{p.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl px-3.5 py-4 text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}
              >
                <Camera className="w-5 h-5 mx-auto text-gray-600 mb-1.5" />
                <p className="text-[11px] text-gray-400">아직 등록된 결과물 사진이 없어요.</p>
                <p className="text-[10px] text-gray-600 mt-0.5">각 주차의 ‘결과물 기록’에서 사진을 첨부하면 여기에 모입니다.</p>
              </div>
            )}
          </section>

          {/* 핵심 성과 (최종 결과) — 인라인 편집 */}
          <section>
            <h3 className="text-[12px] font-bold text-gray-300 mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" style={{ color: accent }} /> 핵심 성과
            </h3>
            <FinalResultEditor finalResult={report.finalResult} accent={accent} onUpdate={onUpdateFinalResult} />
          </section>
        </div>

        {/* 액션 */}
        <div
          className="portfolio-report-noprint sticky bottom-0 px-5 py-3 flex gap-2"
          style={{ backgroundColor: '#140e28', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-1.5"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            <Pencil className="w-3.5 h-3.5" /> 계획 수정
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-gray-200 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <Printer className="w-3.5 h-3.5" /> 인쇄·PDF
          </button>
        </div>
      </div>

      {/* 인쇄 시: 리포트 시트만 보이도록 */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .portfolio-report-sheet, .portfolio-report-sheet * { visibility: visible !important; }
          .portfolio-report-overlay { position: absolute !important; inset: 0 !important; background: #fff !important; backdrop-filter: none !important; }
          .portfolio-report-sheet { position: absolute !important; left: 0; top: 0; max-height: none !important; box-shadow: none !important; }
          .portfolio-report-noprint { display: none !important; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
