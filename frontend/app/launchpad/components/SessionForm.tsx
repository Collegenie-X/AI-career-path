'use client';

import { useState, useRef } from 'react';
import { X, Plus, Trash2, GripVertical, CheckCircle2 } from 'lucide-react';
import { SESSION_TYPES, MODE_LABELS } from '../config';
import type { SessionType, ModeType } from '../config';
import type { LaunchpadSession, Resource, AgendaItem } from '../types';

type Props = {
  initial?: LaunchpadSession;
  onSubmit: (session: Omit<LaunchpadSession, 'id' | 'createdAt' | 'currentParticipants'>) => void;
  onClose: () => void;
};

/* ─── 세부 항목 입력 컴포넌트 ─── */
function AgendaEditor({
  items,
  onChange,
}: {
  items: AgendaItem[];
  onChange: (items: AgendaItem[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...items, { id: `ag-${Date.now()}`, text }]);
    setDraft('');
    inputRef.current?.focus();
  };

  const remove = (id: string) => onChange(items.filter(i => i.id !== id));

  const update = (id: string, text: string) =>
    onChange(items.map(i => i.id === id ? { ...i, text } : i));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
  };

  const inp: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', borderRadius: '10px',
    padding: '9px 12px', fontSize: '13px',
    outline: 'none', width: '100%',
  };

  return (
    <div className="space-y-2">
      {/* 기존 항목 목록 */}
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="flex items-center gap-2 p-2.5 rounded-xl group"
          style={{ backgroundColor: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.2)' }}
        >
          {/* 번호 */}
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
            style={{ backgroundColor: 'rgba(108,92,231,0.3)', color: '#a78bfa' }}
          >
            {idx + 1}
          </div>
          {/* 인라인 편집 */}
          <input
            style={{ ...inp, padding: '4px 8px', fontSize: '13px', backgroundColor: 'transparent', border: 'none', flex: 1 }}
            value={item.text}
            onChange={e => update(item.id, e.target.value)}
          />
          {/* 삭제 */}
          <button
            onClick={() => remove(item.id)}
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity active:opacity-100"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      ))}

      {/* 새 항목 입력 */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          style={inp}
          placeholder="항목 입력 후 Enter 또는 + 버튼"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          onClick={add}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
          style={draft.trim()
            ? { background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', boxShadow: '0 2px 10px rgba(108,92,231,0.4)' }
            : { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Plus className="w-4 h-4" style={{ color: draft.trim() ? '#fff' : '#6b7280' }} />
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-[11px] text-gray-600 text-center py-1">
          세부 항목을 추가하면 참여자들이 내용을 미리 확인할 수 있어요
        </p>
      )}
    </div>
  );
}

/* ─── 메인 폼 ─── */
export function SessionForm({ initial, onSubmit, onClose }: Props) {
  const isEdit = !!initial;

  const [title, setTitle]             = useState(initial?.title ?? '');
  const [type, setType]               = useState<SessionType>(initial?.type ?? 'seminar');
  const [mode, setMode]               = useState<ModeType>(initial?.mode ?? 'offline');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [agenda, setAgenda]           = useState<AgendaItem[]>(initial?.agenda ?? []);
  const [date, setDate]               = useState(initial?.date ?? '');
  const [time, setTime]               = useState(initial?.time ?? '');
  const [location, setLocation]       = useState(initial?.location ?? '');
  const [maxParticipants, setMax]     = useState(initial?.maxParticipants ?? 10);
  const [hostName, setHostName]       = useState(initial?.hostName ?? '');
  const [tags, setTags]               = useState(initial?.tags.join(', ') ?? '');
  const [resources, setResources]     = useState<Resource[]>(initial?.resources ?? []);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl]     = useState('');

  const addResource = () => {
    if (!newResTitle.trim() || !newResUrl.trim()) return;
    setResources(prev => [...prev, { id: `r-${Date.now()}`, title: newResTitle.trim(), url: newResUrl.trim() }]);
    setNewResTitle('');
    setNewResUrl('');
  };
  const removeResource = (id: string) => setResources(prev => prev.filter(r => r.id !== id));

  const canSubmit = title.trim() && date && time && location.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(), type, mode,
      description: description.trim(),
      agenda,
      date, time,
      location: location.trim(),
      maxParticipants,
      hostName: hostName.trim() || '익명',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      resources,
    });
  };

  const inp: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', borderRadius: '12px',
    padding: '10px 12px', fontSize: '14px',
    width: '100%', outline: 'none',
  };
  const lbl: React.CSSProperties = {
    fontSize: '12px', color: '#9ca3af',
    marginBottom: '6px', display: 'block',
  };
  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '16px',
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        animation: 'sheet-fade-in 0.2s ease-out forwards',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl flex flex-col"
        style={{
          backgroundColor: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.12)',
          borderBottom: 'none',
          maxHeight: 'calc(100dvh - 30px)',
          animation: 'sheet-slide-up 0.32s cubic-bezier(0.32, 0.72, 0, 1) forwards',
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
            <div className="text-base font-bold text-white">
              {isEdit ? '런치패드 수정' : '런치패드 열기'}
            </div>
            <div className="text-xs text-gray-500">
              {isEdit ? '내용을 수정하고 저장하세요' : '세미나 또는 실행 모임을 만들어보세요'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto overscroll-contain px-5 py-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>

          {/* ── SECTION 1: 기본 정보 ── */}
          <div style={sectionStyle}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-purple-500" />
              <span className="text-xs font-bold text-gray-300">기본 정보</span>
            </div>

            {/* 제목 */}
            <div className="mb-3">
              <label style={lbl}>제목 *</label>
              <input
                style={inp}
                placeholder="런치패드 제목을 입력하세요"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* 유형 */}
            <div className="mb-3">
              <label style={lbl}>유형 *</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(SESSION_TYPES) as [SessionType, typeof SESSION_TYPES[SessionType]][]).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button key={key}
                      className="p-2.5 rounded-xl text-center transition-all active:scale-95"
                      style={type === key
                        ? { backgroundColor: cfg.bg, border: `1.5px solid ${cfg.color}60`, color: cfg.color, boxShadow: `0 0 10px ${cfg.color}20` }
                        : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
                      onClick={() => setType(key)}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-[10px] font-semibold">{cfg.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 방식 */}
            <div>
              <label style={lbl}>진행 방식 *</label>
              <div className="flex gap-2">
                {(Object.entries(MODE_LABELS) as [ModeType, typeof MODE_LABELS[ModeType]][]).map(([key, cfg]) => (
                  <button key={key}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                    style={mode === key
                      ? { backgroundColor: `${cfg.color}22`, border: `1.5px solid ${cfg.color}60`, color: cfg.color }
                      : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
                    onClick={() => setMode(key)}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION 2: 내용 ── */}
          <div style={sectionStyle}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-gray-300">내용</span>
            </div>

            {/* 한 줄 설명 */}
            <div className="mb-4">
              <label style={lbl}>한 줄 소개</label>
              <input
                style={inp}
                placeholder="모임을 한 줄로 소개해주세요"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* 세부 항목 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label style={{ ...lbl, marginBottom: 0 }}>
                  세부 항목
                  {agenda.length > 0 && (
                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(108,92,231,0.25)', color: '#a78bfa' }}>
                      {agenda.length}개
                    </span>
                  )}
                </label>
                {agenda.length > 0 && (
                  <span className="text-[10px] text-gray-600">클릭해서 수정 가능</span>
                )}
              </div>
              <AgendaEditor items={agenda} onChange={setAgenda} />
            </div>
          </div>

          {/* ── SECTION 3: 일정 & 장소 ── */}
          <div style={sectionStyle}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-green-500" />
              <span className="text-xs font-bold text-gray-300">일정 & 장소</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label style={lbl}>날짜 *</label>
                <input type="date" style={inp} value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>시간 *</label>
                <input type="time" style={inp} value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={lbl}>장소 *</label>
              <input style={inp} placeholder="장소 또는 온라인 링크 안내" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
          </div>

          {/* ── SECTION 4: 참여 설정 ── */}
          <div style={sectionStyle}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-yellow-500" />
              <span className="text-xs font-bold text-gray-300">참여 설정</span>
            </div>

            <div className="mb-3">
              <label style={lbl}>최대 참여 인원: <span className="text-white font-bold">{maxParticipants}명</span></label>
              <input type="range" min={2} max={50} value={maxParticipants}
                onChange={e => setMax(Number(e.target.value))}
                className="w-full accent-purple-500" />
              <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                <span>2명</span><span>50명</span>
              </div>
            </div>

            <div className="mb-3">
              <label style={lbl}>주최자 이름</label>
              <input style={inp} placeholder="이름 또는 팀명 (미입력 시 익명)" value={hostName} onChange={e => setHostName(e.target.value)} />
            </div>

            <div>
              <label style={lbl}>태그 (쉼표로 구분)</label>
              <input style={inp} placeholder="예: AI, 프로젝트, 공모전" value={tags} onChange={e => setTags(e.target.value)} />
            </div>
          </div>

          {/* ── SECTION 5: 공유 자료 ── */}
          <div style={sectionStyle}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-cyan-500" />
              <span className="text-xs font-bold text-gray-300">공유 자료 링크</span>
            </div>

            <div className="space-y-2">
              {resources.map(r => (
                <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white truncate">{r.title}</div>
                    <div className="text-[10px] text-gray-500 truncate">{r.url}</div>
                  </div>
                  <button onClick={() => removeResource(r.id)} className="text-gray-600 active:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="space-y-1.5">
                <input style={{ ...inp, fontSize: '12px', padding: '8px 12px' }}
                  placeholder="자료 제목" value={newResTitle} onChange={e => setNewResTitle(e.target.value)} />
                <input style={{ ...inp, fontSize: '12px', padding: '8px 12px' }}
                  placeholder="https://..." value={newResUrl} onChange={e => setNewResUrl(e.target.value)} />
                <button
                  className="w-full h-8 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={addResource}
                >
                  <Plus className="w-3.5 h-3.5" />자료 추가
                </button>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="pt-2 pb-10">
            <button
              className="w-full rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={canSubmit
                ? { background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff', boxShadow: '0 4px 24px rgba(108,92,231,0.45)', height: '52px' }
                : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed', height: '52px' }}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEdit ? '수정 저장' : '🚀 런치패드 열기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
