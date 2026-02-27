'use client';

import { Calendar, MapPin, Users, ExternalLink, Pencil, ChevronRight } from 'lucide-react';
import { SESSION_TYPES, MODE_LABELS, LAUNCHPAD_LABELS } from '../config';
import type { LaunchpadSession } from '../types';

type Props = {
  session: LaunchpadSession;
  isJoined: boolean;
  isOwner: boolean;
  onJoin: (id: string) => void;
  onCancel: (id: string) => void;
  onDetail: (session: LaunchpadSession) => void;
  onEdit: (session: LaunchpadSession) => void;
};

export function SessionCard({ session, isJoined, isOwner, onJoin, onCancel, onDetail, onEdit }: Props) {
  const typeCfg = SESSION_TYPES[session.type];
  const modeCfg = MODE_LABELS[session.mode];
  const TypeIcon = typeCfg.icon;
  const isFull = session.currentParticipants >= session.maxParticipants;
  const fillRatio = Math.min(session.currentParticipants / session.maxParticipants, 1);

  const dateStr = new Date(session.date).toLocaleDateString('ko-KR', {
    month: 'short', day: 'numeric', weekday: 'short',
  });

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: `1px solid ${typeCfg.color}28`,
        boxShadow: `0 2px 16px ${typeCfg.color}10`,
      }}
      onClick={() => onDetail(session)}
    >
      {/* 상단 컬러 바 */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(to right, ${typeCfg.color}, ${typeCfg.color}44)` }} />

      <div className="p-4">
        {/* 상단 행 */}
        <div className="flex items-start gap-3 mb-3">
          {/* 아이콘 */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${typeCfg.color}30, ${typeCfg.color}15)`, border: `1px solid ${typeCfg.color}40` }}
          >
            <TypeIcon className="w-5 h-5" style={{ color: typeCfg.color }} />
          </div>

          {/* 제목 + 배지 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-bold text-white leading-snug line-clamp-2 flex-1">{session.title}</div>
              {/* 오너 수정 버튼 */}
              {isOwner && (
                <button
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                  style={{ backgroundColor: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.3)' }}
                  onClick={e => { e.stopPropagation(); onEdit(session); }}
                >
                  <Pencil className="w-3 h-3 text-purple-400" />
                </button>
              )}
            </div>

            {/* 타입 + 방식 배지 */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${typeCfg.color}20`, color: typeCfg.color }}>
                {typeCfg.label}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${modeCfg.color}18`, color: modeCfg.color }}>
                {modeCfg.label}
              </span>
              {isJoined && !isOwner && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
                  ✓ {LAUNCHPAD_LABELS.joinedBadge}
                </span>
              )}
              {isOwner && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(108,92,231,0.2)', color: '#a78bfa' }}>
                  👑 {LAUNCHPAD_LABELS.myBadge}
                </span>
              )}
              {isFull && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>
                  🔒 {LAUNCHPAD_LABELS.fullBadge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 설명 */}
        {session.description && (
          <p className="text-xs text-gray-400 line-clamp-1 leading-relaxed mb-2">{session.description}</p>
        )}

        {/* 세부 항목 미리보기 */}
        {session.agenda && session.agenda.length > 0 && (
          <div className="mb-3 px-3 py-2 rounded-xl space-y-1"
            style={{ backgroundColor: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.18)' }}>
            {session.agenda.slice(0, 3).map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                  style={{ backgroundColor: 'rgba(108,92,231,0.3)', color: '#a78bfa' }}>
                  {idx + 1}
                </span>
                <span className="text-[11px] text-gray-300 truncate">{item.text}</span>
              </div>
            ))}
            {session.agenda.length > 3 && (
              <div className="text-[10px] text-gray-600 pl-6">+{session.agenda.length - 3}개 더보기</div>
            )}
          </div>
        )}

        {/* 메타 정보 */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <Calendar className="w-3 h-3" style={{ color: typeCfg.color }} />
            <span>{dateStr} {session.time}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500 min-w-0">
            <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: typeCfg.color }} />
            <span className="truncate">{session.location}</span>
          </div>
        </div>

        {/* 참여 현황 바 */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <div className="flex items-center gap-1" style={{ color: isFull ? '#EF4444' : typeCfg.color }}>
              <Users className="w-3 h-3" />
              <span className="font-bold">{session.currentParticipants}/{session.maxParticipants}명</span>
            </div>
            <span className="text-gray-600">by {session.hostName}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${fillRatio * 100}%`,
                background: isFull
                  ? 'linear-gradient(to right, #EF4444, #f87171)'
                  : `linear-gradient(to right, ${typeCfg.color}, ${typeCfg.color}99)`,
                boxShadow: `0 0 6px ${isFull ? '#EF4444' : typeCfg.color}60`,
              }}
            />
          </div>
        </div>

        {/* 자료 미리보기 */}
        {session.resources.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
            <ExternalLink className="w-3 h-3" />
            <span>공유 자료 {session.resources.length}개</span>
          </div>
        )}

        {/* 액션 버튼 */}
        {/* <button
          className="w-full h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          style={
            isOwner
              ? { backgroundColor: 'rgba(108,92,231,0.15)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.25)' }
              : isJoined
              ? { backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
              : isFull
              ? { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.06)' }
              : {
                  background: `linear-gradient(135deg, ${typeCfg.color}, ${typeCfg.color}cc)`,
                  color: '#fff',
                  boxShadow: `0 2px 12px ${typeCfg.color}40`,
                }
          }
          onClick={e => {
            e.stopPropagation();
            if (isOwner) { onDetail(session); return; }
            if (isFull && !isJoined) return;
            isJoined ? onCancel(session.id) : onJoin(session.id);
          }}
          disabled={isFull && !isJoined && !isOwner}
        >
          {isOwner ? (
            <><span>상세 보기</span><ChevronRight className="w-3.5 h-3.5" /></>
          ) : isJoined ? (
            LAUNCHPAD_LABELS.cancelButton
          ) : isFull ? (
            LAUNCHPAD_LABELS.fullBadge
          ) : (
            <><span>{LAUNCHPAD_LABELS.joinButton}</span><ChevronRight className="w-3.5 h-3.5" /></>
          )}
        </button> */}
      </div>
    </div>
  );
}
