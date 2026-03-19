'use client';

import { useState } from 'react';
import {
  Pencil, Trash2, Share2, Globe, School, Users, ListChecks,
} from 'lucide-react';
import { LABELS } from '../config';
import type { CareerPlan } from './CareerPathBuilder';
import type { ShareType } from './community/types';
import { channelsToShareType } from './community/types';

type PlanActionBarProps = {
  plan: CareerPlan;
  showChecklistView: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onOpenShareDialog: () => void;
  onToggleChecklistView: () => void;
};

const SHARE_TYPE_COLOR: Record<ShareType, string> = {
  private: 'rgba(255,255,255,0.5)',
  public: '#22C55E',
  school: '#3B82F6',
  group: '#A855F7',
};

const SHARE_TYPE_BG: Record<ShareType, string> = {
  private: 'rgba(255,255,255,0.07)',
  public: 'rgba(34,197,94,0.18)',
  school: 'rgba(59,130,246,0.18)',
  group: 'rgba(168,85,247,0.18)',
};

const SHARE_TYPE_BORDER: Record<ShareType, string> = {
  private: 'rgba(255,255,255,0.12)',
  public: 'rgba(34,197,94,0.4)',
  school: 'rgba(59,130,246,0.4)',
  group: 'rgba(168,85,247,0.4)',
};

function ShareTypeIcon({ shareType }: { shareType: ShareType }) {
  const size = { width: 13, height: 13 };
  if (shareType === 'public') return <Globe style={size} />;
  if (shareType === 'school') return <School style={size} />;
  if (shareType === 'group') return <Users style={size} />;
  return <Share2 style={size} />;
}

export function PlanActionBar({
  plan,
  showChecklistView,
  onEdit,
  onDelete,
  onOpenShareDialog,
  onToggleChecklistView,
}: PlanActionBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const channels = plan.shareChannels ?? [];
  const hasChannels = plan.isPublic && channels.length > 0;
  const primarySt: ShareType = hasChannels ? channelsToShareType(channels) : 'private';

  return (
    <div className="px-4 py-3 space-y-2 ">
      <div className="flex gap-2">
        <button onClick={onEdit}
          className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold transition-all active:scale-100"
          style={{ backgroundColor: `${plan.starColor}22`, color: plan.starColor, border: `1px solid ${plan.starColor}44` }}>
          <Pencil style={{ width: 13, height: 13 }} />수정하기
        </button>

        <button
          onClick={onOpenShareDialog}
          className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{
            backgroundColor: hasChannels ? SHARE_TYPE_BG[primarySt] : 'rgba(255,255,255,0.07)',
            color: hasChannels ? SHARE_TYPE_COLOR[primarySt] : 'rgba(255,255,255,0.5)',
            border: `1px solid ${hasChannels ? SHARE_TYPE_BORDER[primarySt] : 'rgba(255,255,255,0.12)'}`,
          }}
        >
          {hasChannels
            ? <><ShareTypeIcon shareType={primarySt} />공유</>
            : <><Share2 style={{ width: 13, height: 13 }} />공유</>
          }
        </button>



        <button
          onClick={onToggleChecklistView}
          className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{
            backgroundColor: showChecklistView ? `${plan.starColor}18` : 'rgba(255,255,255,0.05)',
            color: showChecklistView ? plan.starColor : 'rgba(255,255,255,0.6)',
            border: `1px solid ${showChecklistView ? `${plan.starColor}44` : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          <ListChecks style={{ width: 14, height: 14 }} />
          {showChecklistView 
            ? (LABELS.timeline_hide_checklist as string ?? '체크')
            : (LABELS.timeline_show_checklist as string ?? '체크')
          }
        </button>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.28)' }}>
            <Trash2 style={{ width: 13, height: 13 }} />삭제
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button onClick={() => setShowDeleteConfirm(false)}
              className="h-9 px-3 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
              취소
            </button>
            <button onClick={onDelete}
              className="h-9 px-3 rounded-xl text-xs font-bold"
              style={{ backgroundColor: '#ef4444', color: '#fff' }}>
              삭제 확인
            </button>
          </div>
        )}
      </div>

      {plan.isPublic && (plan.shareChannels ?? []).length > 0 && (() => {
        const channelLabels = channels.map(c => {
          if (c === 'public') return '전체 공개';
          if (c === 'school') return '학교 공유';
          return `그룹 ${plan.shareGroupIds?.length ?? 0}개`;
        }).join(' · ');
        return (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{
              backgroundColor: `${SHARE_TYPE_COLOR[primarySt]}12`,
              border: `1px solid ${SHARE_TYPE_COLOR[primarySt]}30`,
            }}>
            <ShareTypeIcon shareType={primarySt} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white">{channelLabels}</div>
              <div className="text-[12px] text-gray-400">공유된 채널에서 볼 수 있어요</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
