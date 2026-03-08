'use client';

import { useState } from 'react';
import { Zap, ChevronDown, CheckCircle2, Rocket, School, Video, X } from 'lucide-react';
import { SESSION_TYPES, MODE_LABELS, SCHOOL_LIST, CAREER_PATH_QUICK_TEMPLATES } from '../config';
import type { SessionType, ModeType, PurposeTagKey } from '../config';
import type { LaunchpadSession, AgendaItem } from '../types';

type Props = {
  onSubmit: (session: Omit<LaunchpadSession, 'id' | 'createdAt' | 'currentParticipants'>) => void;
  onClose: () => void;
  onOpenFullForm: () => void;
};

/* ─── 선택 드롭다운 ─── */
function SelectBox<T extends string>({
  label,
  value,
  options,
  onChange,
  color,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; emoji?: string; desc?: string }[];
  onChange: (v: T) => void;
  color?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
        style={{
          backgroundColor: open ? `${color ?? '#6C5CE7'}18` : 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${open ? (color ?? '#6C5CE7') + '60' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        <div className="flex items-center gap-2">
          {selected?.emoji && <span className="text-base leading-none">{selected.emoji}</span>}
          <div className="text-left">
            <div className="text-[10px] text-gray-500 leading-none mb-0.5">{label}</div>
            <div className="text-sm font-bold" style={{ color: open ? (color ?? '#6C5CE7') : '#fff' }}>
              {selected?.label ?? '선택'}
            </div>
          </div>
        </div>
        <ChevronDown
          className="w-4 h-4 transition-transform flex-shrink-0"
          style={{
            color: 'rgba(255,255,255,0.4)',
            transform: open ? 'rotate(180deg)' : undefined,
          }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
          style={{
            backgroundColor: '#1e1e38',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors"
              style={{
                backgroundColor: value === opt.value ? `${color ?? '#6C5CE7'}18` : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {opt.emoji && <span className="text-base leading-none flex-shrink-0">{opt.emoji}</span>}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: value === opt.value ? (color ?? '#6C5CE7') : '#e5e7eb' }}>
                  {opt.label}
                </div>
                {opt.desc && <div className="text-[10px] text-gray-600 truncate">{opt.desc}</div>}
              </div>
              {value === opt.value && (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: color ?? '#6C5CE7' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 메인 QuickCreator ─── */
export function QuickCreator({ onSubmit, onClose, onOpenFullForm }: Props) {
  const [templateId, setTemplateId] = useState<string>(CAREER_PATH_QUICK_TEMPLATES[0].id);
  const [type, setType]             = useState<SessionType>('career_explore');
  const [mode, setMode]             = useState<ModeType>('online');
  const [school, setSchool]         = useState<string>('');
  const [date, setDate]             = useState('');
  const [time, setTime]             = useState('19:00');
  const [zoomLink, setZoomLink]     = useState('');
  const [hostName, setHostName]     = useState('');
  const [step, setStep]             = useState<1 | 2>(1);

  const selectedTemplate = CAREER_PATH_QUICK_TEMPLATES.find(t => t.id === templateId) ?? CAREER_PATH_QUICK_TEMPLATES[0];

  const applyTemplate = (id: string) => {
    const tpl = CAREER_PATH_QUICK_TEMPLATES.find(t => t.id === id);
    if (!tpl) return;
    setTemplateId(id);
    setType(tpl.type);
    setMode(tpl.mode);
  };

  const canProceed1 = !!templateId;
  const canSubmit   = date && time && (mode !== 'offline' || school);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const tpl = selectedTemplate;

    const agenda: AgendaItem[] = tpl.agenda.map((text, i) => ({
      id: `ag-${Date.now()}-${i}`,
      text,
    }));

    const session: Omit<LaunchpadSession, 'id' | 'createdAt' | 'currentParticipants'> = {
      title:           tpl.sessionTitle,
      type,
      mode,
      description:     tpl.description,
      agenda,
      date,
      time,
      location:        mode === 'online' ? '온라인 (Zoom)' : mode === 'offline' ? `${school} 진로실` : '온라인 (Zoom) + 오프라인',
      zoomLink:        mode !== 'offline' ? (zoomLink || undefined) : undefined,
      schoolName:      mode === 'offline' ? school : undefined,
      clubName:        mode === 'offline' ? '진로 동아리' : undefined,
      purposeTags:     [...tpl.purposeTags] as PurposeTagKey[],
      maxParticipants: mode === 'offline' ? 20 : 30,
      hostName:        hostName.trim() || '익명',
      tags:            [...tpl.tags],
      resources:       [],
    };

    onSubmit(session);
  };

  const inp: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 12px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  };

  const typeOptions = (Object.entries(SESSION_TYPES) as [SessionType, typeof SESSION_TYPES[SessionType]][]).map(
    ([key, cfg]) => ({ value: key, label: cfg.label, desc: cfg.desc })
  );
  const modeOptions = (Object.entries(MODE_LABELS) as [ModeType, typeof MODE_LABELS[ModeType]][]).map(
    ([key, cfg]) => ({ value: key, label: cfg.label, desc: cfg.desc })
  );
  const schoolOptions = SCHOOL_LIST.map(s => ({ value: s, label: s }));

  const templateOptions = CAREER_PATH_QUICK_TEMPLATES.map(t => ({
    value: t.id,
    label: t.label,
    emoji: t.emoji,
    desc:  t.description.slice(0, 30) + '...',
  }));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', animation: 'sheet-fade-in 0.2s ease-out forwards' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl flex flex-col"
        style={{
          backgroundColor: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.12)',
          borderBottom: 'none',
          maxHeight: 'calc(100dvh - 60px)',
          animation: 'sheet-slide-up 0.32s cubic-bezier(0.32,0.72,0,1) forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/25" />
        </div>

        {/* 헤더 */}
        <div className="px-5 pt-1 pb-3 flex items-center justify-between flex-shrink-0 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)' }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-white">빠른 생성</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">커리어 패스에서 자동으로 내용을 채워드려요</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenFullForm}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              전체 폼
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>

          {step === 1 ? (
            <>
              {/* STEP 1: 커리어 패스 템플릿 선택 */}
              <div
                className="p-4 rounded-2xl"
                style={{ backgroundColor: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-yellow-400" />
                  <span className="text-xs font-bold text-yellow-300">커리어 패스 연동</span>
                  <span className="text-[10px] text-gray-600">— 선택 시 내용 자동 완성</span>
                </div>
                <SelectBox
                  label="어떤 커리어 패스인가요?"
                  value={templateId}
                  options={templateOptions}
                  onChange={applyTemplate}
                  color="#FBBF24"
                />
              </div>

              {/* 선택된 템플릿 미리보기 */}
              <div
                className="p-4 rounded-2xl"
                style={{ backgroundColor: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.2)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{selectedTemplate.emoji}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{selectedTemplate.sessionTitle}</div>
                    <div className="text-[11px] text-gray-500">{selectedTemplate.description}</div>
                  </div>
                </div>
                <div className="space-y-1.5 mt-3">
                  {selectedTemplate.agenda.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: 'rgba(108,92,231,0.3)', color: '#a78bfa' }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-[11px] text-gray-400">{item}</span>
                    </div>
                  ))}
                  {selectedTemplate.agenda.length > 3 && (
                    <div className="text-[10px] text-gray-600 pl-6">+{selectedTemplate.agenda.length - 3}개 더</div>
                  )}
                </div>
              </div>

              {/* 유형 & 방식 선택 */}
              <div className="grid grid-cols-2 gap-3">
                <SelectBox
                  label="유형"
                  value={type}
                  options={typeOptions}
                  onChange={setType}
                  color="#6C5CE7"
                />
                <SelectBox
                  label="진행 방식"
                  value={mode}
                  options={modeOptions}
                  onChange={setMode}
                  color="#3B82F6"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceed1}
                className="w-full h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={canProceed1
                  ? { background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff', boxShadow: '0 4px 20px rgba(108,92,231,0.4)' }
                  : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }}
              >
                다음: 일정 설정
                <Rocket className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {/* STEP 2: 일정 & 추가 정보 */}
              <div
                className="p-3 rounded-xl flex items-center gap-3"
                style={{ backgroundColor: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.2)' }}
              >
                <span className="text-xl">{selectedTemplate.emoji}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{selectedTemplate.sessionTitle}</div>
                  <div className="text-[10px] text-gray-500">
                    {SESSION_TYPES[type].label} · {MODE_LABELS[mode].label}
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto text-[11px] text-purple-400 font-semibold flex-shrink-0"
                >
                  변경
                </button>
              </div>

              {/* 날짜/시간 */}
              <div
                className="p-4 rounded-2xl space-y-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 rounded-full bg-green-400" />
                  <span className="text-xs font-bold text-gray-300">일정</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[11px] text-gray-500 mb-1">날짜 *</div>
                    <input type="date" style={inp} value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 mb-1">시간</div>
                    <input type="time" style={inp} value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* 온라인: Zoom 링크 */}
              {mode !== 'offline' && (
                <div
                  className="p-4 rounded-2xl"
                  style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Video className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-blue-300">Zoom 링크</span>
                  </div>
                  <input
                    style={inp}
                    placeholder="https://zoom.us/j/..."
                    value={zoomLink}
                    onChange={e => setZoomLink(e.target.value)}
                  />
                </div>
              )}

              {/* 오프라인: 학교 선택 */}
              {mode === 'offline' && (
                <div
                  className="p-4 rounded-2xl"
                  style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <School className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-bold text-green-300">학교 (동아리) *</span>
                  </div>
                  <SelectBox
                    label="학교명"
                    value={school}
                    options={[{ value: '', label: '학교를 선택하세요' }, ...schoolOptions]}
                    onChange={setSchool}
                    color="#22C55E"
                  />
                </div>
              )}

              {/* 주최자 */}
              <div>
                <div className="text-[11px] text-gray-500 mb-1">주최자 이름 (선택)</div>
                <input
                  style={inp}
                  placeholder="이름 또는 팀명 (미입력 시 익명)"
                  value={hostName}
                  onChange={e => setHostName(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pb-10">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 rounded-2xl text-sm font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex-[2] h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={canSubmit
                    ? { background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff', boxShadow: '0 4px 20px rgba(108,92,231,0.4)' }
                    : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  🚀 런치패드 열기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
