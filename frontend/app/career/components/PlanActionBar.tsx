'use client';

import { useState } from 'react';
import {
  Pencil, Trash2, Share2, Globe, School, Users, ListChecks,
} from 'lucide-react';
import { LABELS } from '../config';
import type { CareerPlan } from './CareerPathBuilder';
import type { ShareType } from './community/types';
import { channelsToShareType } from './community/types';
import {
  DetailActionPillButton,
  getDetailActionPillCancelStyle,
  getDetailActionPillCheckToggleStyle,
  getDetailActionPillDeleteConfirmStyle,
  getDetailActionPillDeleteStyle,
  getDetailActionPillEditStyle,
  getDetailActionPillShareActiveStyle,
  getDetailActionPillShareNeutralStyle,
} from '@/components/detail-action-bar';

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

  const shareIconStyle = hasChannels
    ? getDetailActionPillShareActiveStyle(SHARE_TYPE_COLOR[primarySt])
    : getDetailActionPillShareNeutralStyle();

  return (
    <div className="px-4 py-3 space-y-2 ">
      <div className="flex flex-wrap gap-2">
        <DetailActionPillButton
          onClick={onEdit}
          style={getDetailActionPillEditStyle(plan.starColor)}
        >
          <Pencil style={{ width: 13, height: 13 }} />
          수정하기
        </DetailActionPillButton>

        <DetailActionPillButton onClick={onOpenShareDialog} style={shareIconStyle}>
          {hasChannels
            ? <><ShareTypeIcon shareType={primarySt} />공유</>
            : <><Share2 style={{ width: 13, height: 13 }} />공유</>
          }
        </DetailActionPillButton>

        <DetailActionPillButton
          onClick={onToggleChecklistView}
          style={getDetailActionPillCheckToggleStyle(plan.starColor, showChecklistView)}
        >
          <ListChecks style={{ width: 14, height: 14 }} />
          {showChecklistView
            ? (LABELS.timeline_hide_checklist as string ?? '체크')
            : (LABELS.timeline_show_checklist as string ?? '체크')
          }
        </DetailActionPillButton>

        {!showDeleteConfirm ? (
          <DetailActionPillButton
            onClick={() => setShowDeleteConfirm(true)}
            style={getDetailActionPillDeleteStyle()}
          >
            <Trash2 style={{ width: 13, height: 13 }} />
            삭제
          </DetailActionPillButton>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <DetailActionPillButton
              onClick={() => setShowDeleteConfirm(false)}
              style={getDetailActionPillCancelStyle()}
            >
              취소
            </DetailActionPillButton>
            <DetailActionPillButton
              onClick={onDelete}
              style={getDetailActionPillDeleteConfirmStyle()}
            >
              삭제 확인
            </DetailActionPillButton>
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
