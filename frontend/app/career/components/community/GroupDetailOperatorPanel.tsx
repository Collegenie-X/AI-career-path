'use client';

import { useMemo, useState, type ComponentProps } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { LABELS } from '../../config';
import { CAREER_GROUP_FORM_CONFIG } from '../../config/communityGroupForm';
import type { CareerGroupFormSubmitPayload } from '../../config/communityGroupForm';
import {
  useDeleteCareerPathGroupMutation,
  useUpdateCareerPathGroupMutation,
} from '../../hooks/useCareerPathCommunityData';
import { useAuthMeQuery } from '../../hooks/useAuthMeQuery';
import { leaveGroup } from '@/lib/careerCommunity';
import { CreateGroupFormModal } from '@/components/community/CreateGroupFormModal';
import { buildCareerGroupFormModalLabels } from './CareerCreateGroupDialog';
import { GroupDetailView } from './GroupDetailPanel';
import { CAREER_PATH_NESTED_OVERLAY_Z_INDEX } from '../expandable-detail/careerPathExpandDialog.constants';

export type GroupDetailOperatorPanelProps = Omit<
  ComponentProps<typeof GroupDetailView>,
  'isGroupOperator' | 'onRequestEditGroup' | 'onRequestDeleteGroup'
> & {
  readonly onJoinedGroupsChanged?: () => void;
};

/**
 * 그룹 상세 + 방장(생성자) 수정·삭제 API 연동.
 * 오른쪽 패널·목록 상세 공통으로 사용합니다.
 */
export function GroupDetailOperatorPanel({
  group,
  onBack,
  onJoinedGroupsChanged,
  ...rest
}: GroupDetailOperatorPanelProps) {
  const { data: me } = useAuthMeQuery();
  const updateMut = useUpdateCareerPathGroupMutation();
  const deleteMut = useDeleteCareerPathGroupMutation();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOperator = Boolean(me?.id && group.creatorId === me.id);

  const editInitial = useMemo((): CareerGroupFormSubmitPayload & { emoji: string } => {
    const category = (group.category ?? 'study') as CareerGroupFormSubmitPayload['category'];
    const mode = (group.mode ?? 'online') as CareerGroupFormSubmitPayload['mode'];
    return {
      name: group.name,
      description: group.description,
      emoji: group.emoji,
      category,
      mode,
      maxMembers: group.maxMembers ?? CAREER_GROUP_FORM_CONFIG.maxMembersDefault,
      tags: group.tags ?? [],
      isPublic: group.isPublic ?? true,
    };
  }, [group]);

  const handleEditSubmit = async (payload: CareerGroupFormSubmitPayload) => {
    await updateMut.mutateAsync({
      groupId: group.id,
      payload: {
        name: payload.name,
        emoji: payload.emoji,
        description: payload.description,
        max_members: payload.maxMembers,
        category: payload.category,
        mode: payload.mode,
        tags: payload.tags,
        is_public: payload.isPublic,
      },
    });
    setShowEdit(false);
  };

  const handleDeleteConfirm = async () => {
    await deleteMut.mutateAsync(group.id);
    leaveGroup(group.id);
    onJoinedGroupsChanged?.();
    setShowDeleteConfirm(false);
    onBack();
  };

  const editError =
    updateMut.isError && updateMut.error instanceof Error ? updateMut.error.message : null;

  return (
    <div className="px-5 sm:px-6 md:px-7 pb-10 pt-2">
      <GroupDetailView
        {...rest}
        group={group}
        onBack={onBack}
        isGroupOperator={isOperator}
        onRequestEditGroup={() => setShowEdit(true)}
        onRequestDeleteGroup={() => setShowDeleteConfirm(true)}
      />

      {showEdit && (
        <CreateGroupFormModal
          key={`edit-${group.id}`}
          initialValues={editInitial}
          dataLayer="career-edit-group-overlay"
          labels={buildCareerGroupFormModalLabels('edit')}
          overlayZIndex={CAREER_PATH_NESTED_OVERLAY_Z_INDEX}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEditSubmit}
          isSubmitting={updateMut.isPending}
          errorMessage={editError}
        />
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 pointer-events-auto"
          style={{ zIndex: CAREER_PATH_NESTED_OVERLAY_Z_INDEX }}
          role="dialog"
          aria-modal
          aria-labelledby="group-delete-confirm-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !deleteMut.isPending && setShowDeleteConfirm(false)}
            aria-label="닫기"
          />
          <div
            className="relative w-full max-w-[380px] rounded-2xl p-5 shadow-2xl"
            style={{
              backgroundColor: '#12122a',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="group-delete-confirm-title" className="text-base font-black text-white">
                  {String(LABELS.community_group_delete_confirm_title ?? '그룹 삭제')}
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {String(
                    LABELS.community_group_delete_confirm_body ??
                      '이 그룹을 삭제할까요? 되돌릴 수 없습니다.',
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteMut.isPending}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                aria-label="닫기"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteMut.isPending}
                className="flex-1 h-11 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {String(LABELS.community_group_delete_cancel_button ?? '취소')}
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                disabled={deleteMut.isPending}
                className="flex-1 h-11 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: '#DC2626' }}
              >
                {deleteMut.isPending
                  ? '…'
                  : String(LABELS.community_group_delete_confirm_button ?? '삭제하기')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
