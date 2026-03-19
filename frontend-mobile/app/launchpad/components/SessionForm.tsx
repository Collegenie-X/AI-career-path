'use client';

import { useState, useRef } from 'react';
import { X, Plus, Trash2, CheckCircle2, Video, School, ChevronDown } from 'lucide-react';
import { SESSION_TYPES, MODE_LABELS, SCHOOL_LIST, PURPOSE_TAGS } from '../config';
import type { SessionType, ModeType, PurposeTagKey } from '../config';
import type { LaunchpadSession, Resource, AgendaItem } from '../types';

type Props = {
  initial?: LaunchpadSession;
  onSubmit: (session: Omit<LaunchpadSession, 'id' | 'createdAt' | 'currentParticipants'>) => void;
  onClose: () => void;
};

/* ─── 세부 항목 편집기 ─── */
function AgendaEditor({ items, onChange }: { items: AgendaItem[]; onChange: (items: AgendaItem[]) => void }) {
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
  const update = (id: string, text: string) => onChange(items.map(i => i.id === id ? { ...i, text } : i));

  const inp: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', borderRadius: '10px',
    padding: '9px 12px', fontSize: '13px', outline: 'none', width: '100%',
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-xl group"
          style={{ backgroundColor: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.2)' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
            style={{ backgroundColor: 'rgba(108,92,231,0.3)', color: '#a78bfa' }}>
            {idx + 1}
          </div>
          <input
            style={{ ...inp, padding: '4px 8px', fontSize: '13px', backgroundColor: 'transparent', border: 'none', flex: 1 }}
            value={item.text}
            onChange={e => update(item.id, e.target.value)}
          />
          <button onClick={() => remove(item.id)}
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity active:opacity-100"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          style={inp}
          placeholder="항목 입력 후 Enter 또는 + 버튼"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button onClick={add}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
          style={draft.trim()
            ? { background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', boxShadow: '0 2px 10px rgba(108,92,231,0.4)' }
            : { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Plus className="w-4 h-4" style={{ color: draft.trim() ? '#fff' : '#6b7280' }} />
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-[11px] text-gray-600 text-center py-1">세부 항목을 추가하면 참여자들이 내용을 미리 확인할 수 있어요</p>
      )}
    </div>
  );
}

/* ─── 학교 선택 드롭다운 ─── */
function SchoolSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState(false);
  const [custom, setCustom] = useState('');

  const selected = SCHOOL_LIST.includes(value as typeof SCHOOL_LIST[number]) ? value : (value ? '기타 학교 직접 입력' : '');

  const handleSelect = (v: string) => {
    if (v === '기타 학교 직접 입력') {
      setCustomInput(true);
      setOpen(false);
    } else {
      onChange(v);
      setCustomInput(false);
      setOpen(false);
    }
  };

  const inp: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', borderRadius: '12px', padding: '10px 12px', fontSize: '14px', width: '100%', outline: 'none',
  };

  if (customInput) {
    return (
      <div className="flex gap-2">
        <input
          style={inp}
          placeholder="학교명 직접 입력"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (custom.trim()) { onChange(custom.trim()); setCustomInput(false); } } }}
        />
        <button
          onClick={() => { if (custom.trim()) { onChange(custom.trim()); setCustomInput(false); } }}
          className="px-3 rounded-xl text-xs font-bold transition-all"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff' }}
        >
          확인
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all"
        style={{
          backgroundColor: open ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${open ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.12)'}`,
          color: selected ? '#fff' : '#6b7280',
        }}
      >
        <div className="flex items-center gap-2">
          <School className="w-4 h-4" style={{ color: '#22C55E' }} />
          <span className="text-sm">{selected || '학교를 선택하세요'}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-auto"
          style={{
            backgroundColor: '#1e1e38',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            maxHeight: '200px',
          }}
        >
          {SCHOOL_LIST.map(s => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
              style={{
                color: value === s ? '#22C55E' : '#e5e7eb',
                backgroundColor: value === s ? 'rgba(34,197,94,0.1)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 메인 폼 ─── */
export function SessionForm({ initial, onSubmit, onClose }: Props) {
  const isEdit = !!initial;

  const [title, setTitle]             = useState(initial?.title ?? '');
  const [type, setType]               = useState<SessionType>(initial?.type ?? 'career_explore');
  const [mode, setMode]               = useState<ModeType>(initial?.mode ?? 'online');
  const [purposeTags, setPurposeTags] = useState<PurposeTagKey[]>(initial?.purposeTags ?? []);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [agenda, setAgenda]           = useState<AgendaItem[]>(initial?.agenda ?? []);
  const [date, setDate]               = useState(initial?.date ?? '');
  const [time, setTime]               = useState(initial?.time ?? '');
  const [location, setLocation]       = useState(initial?.location ?? '');
  const [zoomLink, setZoomLink]       = useState(initial?.zoomLink ?? '');
  const [schoolName, setSchoolName]   = useState(initial?.schoolName ?? '');
  const [clubName, setClubName]       = useState(initial?.clubName ?? '');
  const [maxParticipants, setMax]     = useState(initial?.maxParticipants ?? 20);
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

  const effectiveLocation = mode !== 'offline'
    ? (location || '온라인 (Zoom)')
    : (location || (schoolName ? `${schoolName} 진로실` : ''));

  const canSubmit = title.trim() && date && time && purposeTags.length > 0 && (mode === 'offline' ? schoolName : true);

  const togglePurposeTag = (key: PurposeTagKey) => {
    setPurposeTags(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      type,
      mode,
      description: description.trim(),
      agenda,
      date,
      time,
      location: effectiveLocation || location.trim(),
      zoomLink: mode !== 'offline' && zoomLink.trim() ? zoomLink.trim() : undefined,
      schoolName: mode === 'offline' && schoolName ? schoolName : undefined,
      clubName: mode === 'offline' && clubName.trim() ? clubName.trim() : undefined,
      purposeTags,
      maxParticipants,
      hostName: hostName.trim() || '익명',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      resources,
    });
  };

  const inp: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', borderRadius: '12px', padding: '10px 12px', fontSize: '14px', width: '100%', outline: 'none',
  };
  const lbl: React.CSSProperties = { fontSize: '12px', color: '#9ca3af', marginBottom: '6px', display: 'block' };
  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '16px',
  };

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
          maxHeight: 'calc(100dvh - 30px)',
          animation: 'sheet-slide-up 0.32s cubic-bezier(0.32,0.72,0,1) forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/25" />
        </div>

        <div className="px-5 pt-1 pb-3 flex items-center justify-between flex-shrink-0 border-b border-white/10">
          <div>
            <div className="text-base font-bold text-white">{isEdit ? '런치패드 수정' : '런치패드 열기'}</div>
            <div className="text-xs text-gray-500">{isEdit ? '내용을 수정하고 저장하세요' : '커리어 모임을 만들어보세요'}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>

          {/* ── 기본 정보 ── */}
          <div style={sectionStyle}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-purple-500" />
              <span className="text-xs font-bold text-gray-300">기본 정보</span>
            </div>

            <div className="mb-3">
              <label style={lbl}>제목 *</label>
              <input style={inp} placeholder="런치패드 제목을 입력하세요" value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className="mb-3">
              <label style={lbl}>유형 *</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.entries(SESSION_TYPES) as [SessionType, typeof SESSION_TYPES[SessionType]][]).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button key={key}
                      className="p-2 rounded-xl text-center transition-all active:scale-95"
                      style={type === key
                        ? { backgroundColor: cfg.bg, border: `1.5px solid ${cfg.color}60`, color: cfg.color, boxShadow: `0 0 10px ${cfg.color}20` }
                        : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
                      onClick={() => setType(key)}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-[9px] font-semibold leading-tight">{cfg.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-3">
              <label style={lbl}>목적 태그 * <span className="text-[10px] text-gray-600">(1개 이상 선택)</span></label>
              <div className="flex flex-wrap gap-1.5">
                {PURPOSE_TAGS.map(tag => {
                  const isSelected = purposeTags.includes(tag.key);
                  return (
                    <button key={tag.key}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                      style={isSelected
                        ? { backgroundColor: 'rgba(108,92,231,0.2)', border: '1.5px solid rgba(108,92,231,0.5)', color: '#a78bfa' }
                        : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280' }}
                      onClick={() => togglePurposeTag(tag.key)}
                    >
                      <span>{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={lbl}>진행 방식 *</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(MODE_LABELS) as [ModeType, typeof MODE_LABELS[ModeType]][]).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button key={key}
                      className="flex flex-col items-center py-2.5 px-1 rounded-xl text-xs font-semibold transition-all active:scale-95"
                      style={mode === key
                        ? { backgroundColor: `${cfg.color}22`, border: `1.5px solid ${cfg.color}60`, color: cfg.color }
                        : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
                      onClick={() => setMode(key)}
                    >
                      <Icon className="w-3.5 h-3.5 mb-1" />
                      <span className="text-[10px] leading-tight text-center">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── 온라인: Zoom 설정 ── */}
          {mode !== 'offline' && (
            <div style={{ ...sectionStyle, borderColor: 'rgba(59,130,246,0.25)', backgroundColor: 'rgba(59,130,246,0.04)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-300">Zoom 온라인 설정</span>
              </div>
              <div>
                <label style={lbl}>Zoom 링크</label>
                <input
                  style={inp}
                  placeholder="https://zoom.us/j/..."
                  value={zoomLink}
                  onChange={e => setZoomLink(e.target.value)}
                />
                <p className="text-[11px] text-gray-600 mt-1">참여자에게 공유될 Zoom 미팅 링크를 입력하세요</p>
              </div>
            </div>
          )}

          {/* ── 오프라인: 학교 동아리 설정 ── */}
          {mode === 'offline' && (
            <div style={{ ...sectionStyle, borderColor: 'rgba(34,197,94,0.25)', backgroundColor: 'rgba(34,197,94,0.04)' }}>
              <div className="flex items-center gap-2 mb-3">
                <School className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-green-300">학교 동아리 설정</span>
              </div>
              <div className="mb-3">
                <label style={lbl}>학교명 *</label>
                <SchoolSelect value={schoolName} onChange={setSchoolName} />
              </div>
              <div>
                <label style={lbl}>동아리명</label>
                <input
                  style={inp}
                  placeholder="예: 진로탐색 동아리"
                  value={clubName}
                  onChange={e => setClubName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── 내용 ── */}
          <div style={sectionStyle}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-gray-300">내용</span>
            </div>
            <div className="mb-4">
              <label style={lbl}>한 줄 소개</label>
              <input style={inp} placeholder="모임을 한 줄로 소개해주세요" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
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
                {agenda.length > 0 && <span className="text-[10px] text-gray-600">클릭해서 수정 가능</span>}
              </div>
              <AgendaEditor items={agenda} onChange={setAgenda} />
            </div>
          </div>

          {/* ── 일정 & 장소 ── */}
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
              <label style={lbl}>장소 {mode !== 'offline' ? '(자동: 온라인 Zoom)' : ''}</label>
              <input
                style={inp}
                placeholder={mode !== 'offline' ? '온라인 (Zoom)' : '예: 학교 진로상담실'}
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* ── 참여 설정 ── */}
          <div style={sectionStyle}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-yellow-500" />
              <span className="text-xs font-bold text-gray-300">참여 설정</span>
            </div>
            <div className="mb-3">
              <label style={lbl}>최대 참여 인원: <span className="text-white font-bold">{maxParticipants}명</span></label>
              <input type="range" min={2} max={mode === 'offline' ? 30 : 100} value={maxParticipants}
                onChange={e => setMax(Number(e.target.value))}
                className="w-full accent-purple-500" />
              <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                <span>2명</span><span>{mode === 'offline' ? '30명' : '100명'}</span>
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

          {/* ── 공유 자료 ── */}
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

          {/* 제출 */}
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
