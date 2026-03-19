'use client';

import { X, Calendar, MapPin, Users, ExternalLink, Trash2, Pencil, Video, School, GraduationCap } from 'lucide-react';
import { SESSION_TYPES, MODE_LABELS, LAUNCHPAD_LABELS } from '../config';
import type { LaunchpadSession } from '../types';
import { CommentSection } from './CommentSection';

type Props = {
  session: LaunchpadSession;
  isJoined: boolean;
  isOwner: boolean;
  onJoin: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (session: LaunchpadSession) => void;
  onClose: () => void;
};

export function SessionDetail({ session, isJoined, isOwner, onJoin, onCancel, onDelete, onEdit, onClose }: Props) {
  const typeCfg = SESSION_TYPES[session.type];
  const modeCfg = MODE_LABELS[session.mode];
  const TypeIcon = typeCfg.icon;
  const isFull   = session.currentParticipants >= session.maxParticipants;
  const isOnline = session.mode === 'online';
  const isClub   = session.mode === 'offline';

  const dateStr = new Date(session.date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

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

        {/* 헤더 */}
        <div className="px-5 pt-1 pb-3 flex items-start justify-between gap-3 flex-shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: typeCfg.bg }}>
              <TypeIcon className="w-5 h-5" style={{ color: typeCfg.color }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white leading-snug">{session.title}</div>
              <div className="text-[11px] mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span style={{ color: typeCfg.color }}>{typeCfg.label}</span>
                <span className="text-gray-600">·</span>
                <span style={{ color: modeCfg.color }}>
                  {isOnline ? '🔵 Zoom 온라인' : isClub ? '🏫 학교 동아리' : '🔀 온·오프'}
                </span>
                {session.isTeacherCreated && (
                  <>
                    <span className="text-gray-600">·</span>
                    <span className="text-yellow-400 flex items-center gap-0.5">
                      <GraduationCap className="w-3 h-3" />
                      <span style={{ fontSize: '10px' }}>{LAUNCHPAD_LABELS.teacherBadge}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>

          {/* 설명 */}
          {session.description && (
            <p className="text-sm text-gray-300 leading-relaxed">{session.description}</p>
          )}

          {/* Zoom 입장 배너 */}
          {isOnline && session.zoomLink && (
            <a
              href={session.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-2xl transition-all active:opacity-70"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.08))',
                border: '1.5px solid rgba(59,130,246,0.4)',
                boxShadow: '0 2px 16px rgba(59,130,246,0.15)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
                <Video className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-blue-300">Zoom으로 참여하기</div>
                <div className="text-[10px] text-blue-400/60 truncate">{session.zoomLink}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400 flex-shrink-0" />
            </a>
          )}

          {/* 학교 동아리 배너 */}
          {isClub && (session.schoolName || session.clubName) && (
            <div
              className="flex items-center gap-3 p-3.5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.06))',
                border: '1.5px solid rgba(34,197,94,0.3)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                <School className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-green-300">{session.schoolName ?? '학교 동아리'}</div>
                {session.clubName && <div className="text-xs text-green-400/70">{session.clubName}</div>}
              </div>
            </div>
          )}

          {/* 세부 항목 */}
          {session.agenda && session.agenda.length > 0 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.2)' }}>
              <div className="px-4 py-2.5 border-b border-white/6 flex items-center gap-2"
                style={{ backgroundColor: 'rgba(108,92,231,0.12)' }}>
                <div className="w-1 h-4 rounded-full bg-purple-400" />
                <span className="text-xs font-bold text-purple-300">세부 항목</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto"
                  style={{ backgroundColor: 'rgba(108,92,231,0.3)', color: '#a78bfa' }}>
                  {session.agenda.length}개
                </span>
              </div>
              <div className="px-4 py-3 space-y-2">
                {session.agenda.map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: 'rgba(108,92,231,0.3)', color: '#a78bfa' }}>
                      {idx + 1}
                    </div>
                    <span className="text-sm text-gray-200 leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 정보 카드들 */}
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">일시</div>
                <div className="text-sm text-white">{dateStr} {session.time}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {isOnline ? <Video className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /> : <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />}
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">장소</div>
                <div className="text-sm text-white">{session.location}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Users className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 mb-0.5">참여 현황</div>
                <div className="text-sm mb-1.5">
                  <span style={{ color: isFull ? '#EF4444' : typeCfg.color }} className="font-semibold">
                    {session.currentParticipants}명
                  </span>
                  <span className="text-gray-400"> / 최대 {session.maxParticipants}명</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((session.currentParticipants / session.maxParticipants) * 100, 100)}%`,
                      backgroundColor: isFull ? '#EF4444' : typeCfg.color,
                    }} />
                </div>
              </div>
            </div>
          </div>

          {/* 태그 */}
          {session.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {session.tags.map(tag => (
                <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${typeCfg.color}18`, color: typeCfg.color }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 자료 */}
          {session.resources.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />공유 자료
              </div>
              {session.resources.map(r => (
                <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl active:opacity-70"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: typeCfg.color }} />
                  <span className="text-sm text-white truncate">{r.title}</span>
                </a>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-600">주최: {session.hostName}</div>

          {/* 액션 버튼 */}
          <div className="pt-2 space-y-2">
            {isOwner ? (
              <div className="flex gap-2">
                <button
                  className="flex-1 h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  style={{ backgroundColor: 'rgba(108,92,231,0.2)', color: '#6C5CE7', border: '1px solid rgba(108,92,231,0.3)' }}
                  onClick={() => { onEdit(session); onClose(); }}
                >
                  <Pencil className="w-4 h-4" />수정
                </button>
                <button
                  className="flex-1 h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
                  onClick={() => onDelete(session.id)}
                >
                  <Trash2 className="w-4 h-4" />삭제
                </button>
              </div>
            ) : (
              <button
                className="w-full h-12 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
                style={
                  isJoined
                    ? { backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }
                    : isFull
                    ? { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }
                    : { background: `linear-gradient(135deg, ${typeCfg.color}, ${typeCfg.color}cc)`, color: '#fff', boxShadow: `0 4px 20px ${typeCfg.color}40` }
                }
                disabled={isFull && !isJoined}
                onClick={() => { isJoined ? onCancel(session.id) : onJoin(session.id); onClose(); }}
              >
                {isJoined ? LAUNCHPAD_LABELS.cancelButton : isFull ? LAUNCHPAD_LABELS.fullBadge : LAUNCHPAD_LABELS.joinButton}
              </button>
            )}
          </div>

          {/* 구분선 */}
          <div className="h-px my-2" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

          {/* 댓글 섹션 */}
          <CommentSection sessionId={session.id} />

          {/* 하단 여백 */}
          <div className="h-10" />
        </div>
      </div>
    </div>
  );
}
