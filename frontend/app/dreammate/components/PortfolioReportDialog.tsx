'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
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
  onEdit: () => void;
  onUpdateTodoOutput: (itemId: string, todoId: string, patch: TodoOutputPatch) => void;
  onUpdateFinalResult: (patch: FinalResultPatch) => void;
}

/* ── 핵심 성과 인라인 에디터 ── */
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
    } catch { /* ignore */ } finally {
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
      <input value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="핵심 성과 제목 (예: SW 공모전 최종 제출작)"
        className="w-full px-3 py-2 rounded-lg text-[12px] text-white placeholder:text-gray-600 outline-none" style={inputStyle} />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
        placeholder="무엇을 만들었고 어떤 점이 핵심 결과인지 적어주세요"
        rows={2} className="w-full px-3 py-2 rounded-lg text-[12px] text-white placeholder:text-gray-600 outline-none resize-none" style={inputStyle} />
      <input value={url} onChange={(e) => setUrl(e.target.value)}
        placeholder="결과물 URL (예: https://github.com/…)"
        className="w-full px-3 py-2 rounded-lg text-[12px] text-white placeholder:text-gray-600 outline-none" style={inputStyle} />
      {finalResult.imageUrl && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={finalResult.imageUrl} alt="대표 결과물" className="h-24 rounded-lg object-cover" style={{ border: '1px solid rgba(255,255,255,0.12)' }} />
          <button onClick={() => onUpdate({ finalResultImageUrl: '' })} aria-label="대표 이미지 삭제"
            className="portfolio-report-noprint absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <Trash2 className="w-2.5 h-2.5 text-gray-200" />
          </button>
        </div>
      )}
      <div className="portfolio-report-noprint flex gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handlePhoto(e.target.files?.[0])} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold text-gray-200 disabled:opacity-60"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.18)' }}>
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          {uploading ? '처리 중…' : finalResult.imageUrl ? '대표 이미지 교체' : '대표 이미지'}
        </button>
        <button onClick={() => onUpdate({ finalResultTitle: title.trim(), finalResultDescription: desc.trim(), finalResultUrl: url.trim() })}
          disabled={!dirty} className="px-4 py-2 rounded-lg text-[12px] font-bold text-white disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
          저장
        </button>
      </div>
    </div>
  );
}

/* ── 주차별 행 + 인라인 결과 기록 ── */
function WeekRow({ week, accent, onUpdate }: { week: PortfolioWeek; accent: string; onUpdate: (patch: TodoOutputPatch) => void }) {
  const [open, setOpen] = useState(false);
  const [draftRef, setDraftRef] = useState(week.recordedOutput ?? '');
  const [draftNote, setDraftNote] = useState(week.note ?? '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraftRef(week.recordedOutput ?? ''); }, [week.recordedOutput]);
  useEffect(() => { setDraftNote(week.note ?? ''); }, [week.note]);

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImageFile(file);
      onUpdate({ outputImageUrl: dataUrl });
    } catch { /* 무시 */ } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const dirty = draftRef !== (week.recordedOutput ?? '') || draftNote !== (week.note ?? '');

  return (
    <div className="rounded-xl px-3.5 py-3 space-y-2"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* 주차 헤더 */}
      <div className="flex items-start gap-2">
        {week.isDone
          ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accent }} />
          : <Circle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-600" />}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold mb-0.5" style={{ color: accent }}>{week.weekLabel}</div>
          <div className="text-[13px] text-white font-semibold leading-snug">{week.goalTitle}</div>

          {/* 하위 태스크 */}
          {week.tasks.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {week.tasks.map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  {t.isDone
                    ? <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-emerald-400/70" />
                    : <Circle className="w-3 h-3 flex-shrink-0 text-gray-600" />}
                  <span className={t.isDone ? 'line-through text-gray-600' : ''}>{t.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 산출 / 기준 칩 — 항목별 */}
      {(week.itemTargetOutput || week.itemSuccessCriteria) && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {week.itemTargetOutput && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold"
              style={{ backgroundColor: 'rgba(6,182,212,0.12)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.2)' }}>
              산출 · {week.itemTargetOutput}
            </span>
          )}
          {week.itemSuccessCriteria && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold"
              style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}>
              기준 · {week.itemSuccessCriteria}
            </span>
          )}
        </div>
      )}

      {/* 계획 산출물 */}
      {week.plannedOutput && (
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Camera className="w-3 h-3 flex-shrink-0 text-gray-500" />
          <span>목표 결과물 · {week.plannedOutput}</span>
        </div>
      )}

      {/* 기록된 산출물·메모 */}
      {week.recordedOutput && (
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: accent }}>
          <LinkIcon className="w-3 h-3 flex-shrink-0" />
          <span className="break-all">기록 · {week.recordedOutput}</span>
        </div>
      )}
      {week.note && <p className="text-[11px] text-gray-400 leading-snug">메모 · {week.note}</p>}

      {/* 사진 썸네일 */}
      {week.outputImageUrl && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={week.outputImageUrl} alt={`${week.weekLabel} 결과물`}
            className="h-20 rounded-lg object-cover" style={{ border: '1px solid rgba(255,255,255,0.12)' }} />
          <button onClick={() => onUpdate({ outputImageUrl: '' })} aria-label="사진 삭제"
            className="portfolio-report-noprint absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <Trash2 className="w-2.5 h-2.5 text-gray-200" />
          </button>
        </div>
      )}

      {/* 인라인 결과 기록 토글 */}
      <button onClick={() => setOpen((v) => !v)}
        className="portfolio-report-noprint inline-flex items-center gap-1 text-[11px] font-semibold"
        style={{ color: accent }}>
        <ChevronDown className="w-3 h-3 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
        결과물 기록
      </button>

      {open && (
        <div className="portfolio-report-noprint space-y-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => void handlePhoto(e.target.files?.[0])} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold text-gray-200 disabled:opacity-60"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.18)' }}>
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            {uploading ? '사진 처리 중…' : week.outputImageUrl ? '사진 교체' : '사진 첨부'}
          </button>
          <input value={draftRef} onChange={(e) => setDraftRef(e.target.value)}
            placeholder="산출물 링크·파일명 (예: 기획서.pdf, github.com/…)"
            className="w-full px-3 py-2 rounded-lg text-[12px] text-white placeholder:text-gray-600 outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <textarea value={draftNote} onChange={(e) => setDraftNote(e.target.value)}
            placeholder="진행 메모 (선택)" rows={2}
            className="w-full px-3 py-2 rounded-lg text-[12px] text-white placeholder:text-gray-600 outline-none resize-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <button onClick={() => onUpdate({ outputRef: draftRef.trim(), note: draftNote.trim() })}
            disabled={!dirty} className="w-full py-2 rounded-lg text-[12px] font-bold text-white disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
            기록 저장
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   인쇄/PDF 전용 정적 문서 — 화면에선 숨김, 인쇄 시에만 표시.
   인터랙티브 시트와 분리해 일반 문서 흐름으로 깔끔하게 페이지 분할.
   ════════════════════════════════════════════════════════════ */
function PortfolioReportPrintView({
  report,
  typeMeta,
  periodLabel,
  accent,
  itemGroups,
}: {
  report: ReturnType<typeof buildPortfolioReport>;
  typeMeta: (typeof DREAM_ITEM_TYPES)[number] | undefined;
  periodLabel: string;
  accent: string;
  itemGroups: { item: SharedRoadmap['items'][number]; weeks: PortfolioWeek[] }[];
}) {
  const ink = '#1f2937';
  const sub = '#4b5563';
  const muted = '#6b7280';
  const line = '#e5e7eb';
  const fr = report.finalResult;
  const hasFinal = Boolean(fr.title || fr.description || fr.url || fr.imageUrl);

  const chipOutput: CSSProperties = {
    display: 'inline-block', padding: '2px 7px', fontSize: 10, fontWeight: 700,
    border: '1px solid #0891b2', borderRadius: 4, color: '#0e7490', marginRight: 5, marginTop: 3,
  };
  const chipCriteria: React.CSSProperties = {
    display: 'inline-block', padding: '2px 7px', fontSize: 10, fontWeight: 700,
    border: '1px solid #059669', borderRadius: 4, color: '#065f46', marginRight: 5, marginTop: 3,
  };

  return (
    <div className="portfolio-report-print" aria-hidden style={{ color: ink, fontFamily: 'inherit' }}>
      {/* ── 문서 헤더 ── */}
      <header style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: muted, letterSpacing: 0.2 }}>
          {typeMeta?.label ?? '프로젝트'} · {periodLabel} · 진행률 {report.progress.pct}% ({report.progress.done}/{report.progress.total})
        </div>
        <h1 style={{ fontSize: 21, fontWeight: 900, color: ink, margin: '5px 0 0', lineHeight: 1.25 }}>{report.title}</h1>
        {report.description && (
          <p style={{ fontSize: 11, color: sub, margin: '7px 0 0', lineHeight: 1.55 }}>{report.description}</p>
        )}
      </header>

      {/* ── 진행률 ── */}
      <div className="pp-avoid" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: ink }}>실행 진행률</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: accent }}>
            {report.progress.done}/{report.progress.total} · {report.progress.pct}%
          </span>
        </div>
        <div style={{ height: 7, background: '#eceef1', borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{ width: `${report.progress.pct}%`, height: '100%', background: accent, borderRadius: 9999 }} />
        </div>
      </div>

      {/* ── 주차별 실행 & 산출물 ── */}
      <h2 className="pp-h2" style={{ fontSize: 13, fontWeight: 800, color: ink, borderLeft: `3px solid ${accent}`, paddingLeft: 8, margin: '0 0 10px' }}>
        주차별 실행 &amp; 산출물
      </h2>

      {itemGroups.map(({ item, weeks }) => (
        <section key={item.id} className="pp-item" style={{ border: `1.5px solid ${line}`, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
          {/* 항목 헤더 */}
          <div className="pp-avoid" style={{ background: '#f6f7f9', padding: '9px 12px', borderBottom: `1px solid ${line}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: muted }}>{typeMeta?.label}</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: ink, lineHeight: 1.3, margin: '2px 0 4px' }}>{item.title}</div>
            {(item.targetOutput || item.successCriteria) && (
              <div>
                {item.targetOutput && <span style={chipOutput}>산출 · {item.targetOutput}</span>}
                {item.successCriteria && <span style={chipCriteria}>기준 · {item.successCriteria}</span>}
              </div>
            )}
          </div>

          {/* 주차 행 */}
          {weeks.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: 10.5, color: muted }}>등록된 주차 항목이 없습니다.</div>
          ) : (
            weeks.map((w, idx) => (
              <div key={w.key} className="pp-avoid" style={{ padding: '8px 12px', borderTop: idx === 0 ? 'none' : `1px solid #f1f2f4` }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: muted }}>
                  {w.weekLabel}{w.isDone ? ' · 완료' : ''}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: ink, lineHeight: 1.35, margin: '1px 0 0' }}>
                  {w.goalTitle}
                </div>
                {w.tasks.length > 0 && (
                  <ul style={{ margin: '4px 0 0', padding: '0 0 0 14px', listStyle: 'disc' }}>
                    {w.tasks.map((t, i) => (
                      <li key={i} style={{ fontSize: 10.5, color: t.isDone ? '#9ca3af' : sub, textDecoration: t.isDone ? 'line-through' : 'none', lineHeight: 1.45 }}>
                        {t.title}
                      </li>
                    ))}
                  </ul>
                )}
                {(w.itemTargetOutput || w.itemSuccessCriteria) && (
                  <div style={{ marginTop: 4 }}>
                    {w.itemTargetOutput && <span style={chipOutput}>산출 · {w.itemTargetOutput}</span>}
                    {w.itemSuccessCriteria && <span style={chipCriteria}>기준 · {w.itemSuccessCriteria}</span>}
                  </div>
                )}
                {w.plannedOutput && <div style={{ fontSize: 10.5, color: muted, marginTop: 3 }}>목표 결과물 · {w.plannedOutput}</div>}
                {w.recordedOutput && <div style={{ fontSize: 10.5, color: accent, marginTop: 2, fontWeight: 600 }}>기록 · {w.recordedOutput}</div>}
                {w.note && <div style={{ fontSize: 10.5, color: sub, marginTop: 2 }}>메모 · {w.note}</div>}
              </div>
            ))
          )}
        </section>
      ))}

      {/* ── 결과물 갤러리 ── */}
      {report.photos.length > 0 && (
        <>
          <h2 className="pp-h2" style={{ fontSize: 13, fontWeight: 800, color: ink, borderLeft: `3px solid ${accent}`, paddingLeft: 8, margin: '16px 0 10px' }}>
            결과물 갤러리
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 6 }}>
            {report.photos.map((p, i) => (
              <figure key={i} className="pp-avoid" style={{ margin: 0, border: `1px solid ${line}`, borderRadius: 6, overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.caption ?? `결과물 ${i + 1}`} style={{ width: '100%', height: 88, objectFit: 'cover', display: 'block' }} />
                {p.caption && <figcaption style={{ fontSize: 9, color: muted, padding: '3px 6px' }}>{p.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </>
      )}

      {/* ── 핵심 성과 ── */}
      {hasFinal && (
        <>
          <h2 className="pp-h2" style={{ fontSize: 13, fontWeight: 800, color: ink, borderLeft: `3px solid ${accent}`, paddingLeft: 8, margin: '16px 0 10px' }}>
            핵심 성과
          </h2>
          <div className="pp-avoid" style={{ border: `1.5px solid ${accent}`, borderRadius: 8, padding: '11px 13px' }}>
            {fr.title && <div style={{ fontSize: 13, fontWeight: 800, color: ink }}>{fr.title}</div>}
            {fr.description && <p style={{ fontSize: 11, color: sub, margin: '4px 0 0', lineHeight: 1.55 }}>{fr.description}</p>}
            {fr.url && <div style={{ fontSize: 10.5, color: accent, marginTop: 4, fontWeight: 600 }}>{fr.url}</div>}
            {fr.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fr.imageUrl} alt="대표 결과물" style={{ height: 110, borderRadius: 6, objectFit: 'cover', marginTop: 8, border: `1px solid ${line}` }} />
            )}
          </div>
        </>
      )}

      {/* ── 푸터 ── */}
      <footer style={{ marginTop: 20, paddingTop: 8, borderTop: `1px solid ${line}`, fontSize: 9, color: '#9ca3af', textAlign: 'right' }}>
        AI CareerPath · 결과 리포트 · {report.title}
      </footer>
    </div>
  );
}

export function PortfolioReportDialog({ roadmap, onClose, onEdit, onUpdateTodoOutput, onUpdateFinalResult }: PortfolioReportDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const report = buildPortfolioReport(roadmap);
  const typeMeta = DREAM_ITEM_TYPES.find((t) => t.value === report.type);
  const accent = report.starColor || typeMeta?.color || '#6C5CE7';
  const periodLabel = PERIOD_LABEL[report.period] ?? report.period;

  const handlePrint = () => { if (typeof window !== 'undefined') window.print(); };

  /* 항목별로 그룹핑 (PDF 섹션 분리용) */
  const itemGroups = roadmap.items.map((item) => ({
    item,
    weeks: report.weeks.filter((w) => w.itemId === item.id),
  }));

  return createPortal(
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center portfolio-report-overlay"
      style={{ zIndex: ROADMAP_DETAIL_PORTAL_Z_INDEX, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="portfolio-report-screen portfolio-report-sheet relative w-full md:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
        style={{ backgroundColor: '#140e28', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 헤더 ── */}
        <div className="sticky top-0 z-10 px-5 py-4 flex items-start justify-between gap-3"
          style={{ background: `linear-gradient(135deg, ${accent}40 0%, rgba(20,14,40,0) 70%), #140e28`, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-300">
              <span>{typeMeta?.emoji ?? '🚀'} {typeMeta?.label ?? '프로젝트'}</span>
              <span className="text-gray-500">·</span>
              <span>{periodLabel}</span>
            </div>
            <h2 className="mt-1 text-base md:text-lg font-black text-white leading-snug">{report.title}</h2>
            <p className="mt-0.5 text-[11px] text-gray-400">결과 리포트 · 실행 진행에 따라 자동 정리됩니다</p>
          </div>
          <button onClick={onClose} aria-label="닫기"
            className="portfolio-report-noprint flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* ── 진행률 ── */}
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

          {/* ── 개요 ── */}
          {report.description && (
            <section>
              <h3 className="text-[12px] font-bold text-gray-300 mb-1">개요</h3>
              <p className="text-[13px] text-gray-200 leading-relaxed">{report.description}</p>
            </section>
          )}

          {/* ── 주차별 실행 & 산출물 (항목별 그룹) ── */}
          <section>
            <h3 className="text-[12px] font-bold text-gray-300 mb-3">주차별 실행 &amp; 산출물</h3>
            <div className="space-y-4">
              {itemGroups.map(({ item, weeks }) => (
                <div key={item.id} className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${accent}30` }}>
                  {/* 항목 헤더 */}
                  <div className="px-3.5 py-2.5 flex items-start justify-between gap-2"
                    style={{ backgroundColor: `${accent}18`, borderBottom: `1px solid ${accent}22` }}>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-gray-400 mb-0.5">
                        {typeMeta?.emoji} {typeMeta?.label}
                      </div>
                      <div className="text-[13px] font-black text-white leading-snug">{item.title}</div>
                    </div>
                    {(item.targetOutput || item.successCriteria) && (
                      <div className="flex flex-wrap gap-1 pt-0.5 justify-end shrink-0">
                        {item.targetOutput && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: 'rgba(6,182,212,0.15)', color: '#67e8f9' }}>
                            산출 · {item.targetOutput}
                          </span>
                        )}
                        {item.successCriteria && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>
                            기준 · {item.successCriteria}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* 주차 목록 */}
                  <div className="p-2.5 space-y-2">
                    {weeks.length === 0
                      ? <p className="text-[11px] text-gray-600 px-1">등록된 주차 항목이 없습니다.</p>
                      : weeks.map((w) => (
                          <WeekRow key={w.key} week={w} accent={accent}
                            onUpdate={(patch) => onUpdateTodoOutput(w.itemId, w.todoId, patch)} />
                        ))
                    }
                  </div>
                </div>
              ))}
              {report.weeks.length === 0 && itemGroups.length === 0 && (
                <p className="text-[12px] text-gray-500">아직 주차 항목이 없습니다.</p>
              )}
            </div>
          </section>

          {/* ── 결과물 갤러리 ── */}
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
              <div className="rounded-xl px-3.5 py-4 text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}>
                <Camera className="w-5 h-5 mx-auto text-gray-600 mb-1.5" />
                <p className="text-[11px] text-gray-400">아직 등록된 결과물 사진이 없어요.</p>
                <p className="text-[10px] text-gray-600 mt-0.5">각 주차의 '결과물 기록'에서 사진을 첨부하면 여기에 모입니다.</p>
              </div>
            )}
          </section>

          {/* ── 핵심 성과 ── */}
          <section>
            <h3 className="text-[12px] font-bold text-gray-300 mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" style={{ color: accent }} /> 핵심 성과
            </h3>
            <FinalResultEditor finalResult={report.finalResult} accent={accent} onUpdate={onUpdateFinalResult} />
          </section>
        </div>

        {/* ── 액션 바 ── */}
        <div className="portfolio-report-noprint sticky bottom-0 px-5 py-3 flex gap-2"
          style={{ backgroundColor: '#140e28', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={onEdit}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-1.5"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
            <Pencil className="w-3.5 h-3.5" /> 계획 수정
          </button>
          <button onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-gray-200 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <Printer className="w-3.5 h-3.5" /> 인쇄·PDF
          </button>
        </div>
      </div>

      {/* ── 인쇄/PDF 전용 정적 문서 (화면 숨김) ── */}
      <PortfolioReportPrintView
        report={report}
        typeMeta={typeMeta}
        periodLabel={periodLabel}
        accent={accent}
        itemGroups={itemGroups}
      />

      {/* ══ 인쇄/PDF 스타일 — 화면 시트는 숨기고 정적 문서만 출력 ══ */}
      <style jsx global>{`
        .portfolio-report-print { display: none; }

        @media print {
          @page { size: A4; margin: 12mm 13mm; }

          html, body { background: #fff !important; height: auto !important; }

          /* 앱 콘텐츠를 레이아웃에서 완전히 제거 (visibility는 공간을 차지해 빈 페이지가 생김) */
          body > * { display: none !important; }

          /* 포털 오버레이만 일반 흐름으로 노출 */
          .portfolio-report-overlay {
            display: block !important;
            position: static !important;
            inset: auto !important;
            background: #fff !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /* 인터랙티브 시트는 인쇄에서 제거, 정적 문서만 흐름대로 */
          .portfolio-report-screen { display: none !important; }
          .portfolio-report-print {
            display: block !important;
            position: static !important;
            width: 100% !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* 행·박스가 페이지 경계에서 잘리지 않도록 */
          .pp-avoid { break-inside: avoid; page-break-inside: avoid; }
          .pp-item { break-inside: auto; }
          .pp-h2 { break-after: avoid; page-break-after: avoid; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
