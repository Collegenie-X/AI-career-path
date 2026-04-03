'use client';

import { LABELS as CAREER_LABELS } from '@/app/career/config';
import type { CareerGroupFormSubmitPayload } from '@/app/career/config/communityGroupForm';
import {
  CreateGroupFormModal,
  type CreateGroupFormModalLabels,
} from '@/components/community/CreateGroupFormModal';
import { LABELS } from '../config';

type DreamMateCreateSpaceDialogProps = {
  readonly onClose: () => void;
  readonly onSubmit: (payload: CareerGroupFormSubmitPayload) => void;
};

/**
 * 커리어 패스 `CareerCreateGroupDialog`와 동일한 폼 UI(`CreateGroupFormModal`)를 쓰고,
 * 제출 페이로드만 드림메이트 스페이스 생성 로직에서 처리합니다.
 */
function buildDreamMateCreateSpaceFormLabels(): CreateGroupFormModalLabels {
  return {
    title: String(LABELS.spaceGroupFormDialogTitle ?? CAREER_LABELS.community_group_create),
    iconLabel: String(CAREER_LABELS.community_group_icon_label),
    nameLabel: String(CAREER_LABELS.community_group_name_label),
    namePlaceholder: String(CAREER_LABELS.community_group_name_placeholder),
    descLabel: String(CAREER_LABELS.community_group_desc_label),
    descPlaceholder: String(CAREER_LABELS.community_group_desc_placeholder),
    categoryLabel: String(CAREER_LABELS.community_group_category_label),
    modeLabel: String(CAREER_LABELS.community_group_mode_label),
    maxMembersLabel: String(CAREER_LABELS.community_group_max_members_label),
    tagsLabel: String(CAREER_LABELS.community_group_tags_label),
    tagsPlaceholder: String(CAREER_LABELS.community_group_tags_placeholder),
    tagsHint: String(CAREER_LABELS.community_group_tags_hint),
    publicToggleLabel: String(CAREER_LABELS.community_group_public_toggle_label),
    publicToggleDesc: String(CAREER_LABELS.community_group_public_toggle_desc),
    submitButton: String(LABELS.spaceGroupFormSubmitButton ?? CAREER_LABELS.community_group_create_button),
    pendingButton: String(LABELS.spaceGroupFormSubmitPending ?? CAREER_LABELS.community_group_creating),
  };
}

export function DreamMateCreateSpaceDialog({ onClose, onSubmit }: DreamMateCreateSpaceDialogProps) {
  return (
    <CreateGroupFormModal
      dataLayer="dreammate-create-space-overlay"
      labels={buildDreamMateCreateSpaceFormLabels()}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
