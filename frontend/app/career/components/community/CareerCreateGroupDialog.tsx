'use client';

import { LABELS } from '../../config';
import type { CareerGroupFormSubmitPayload } from '../../config/communityGroupForm';
import {
  CreateGroupFormModal,
  type CreateGroupFormModalLabels,
} from '@/components/community/CreateGroupFormModal';

type Props = {
  onClose: () => void;
  onSubmit: (payload: CareerGroupFormSubmitPayload) => void | Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

/** 생성·수정 모달 공통 라벨 (career-content.json) */
export function buildCareerGroupFormModalLabels(mode: 'create' | 'edit'): CreateGroupFormModalLabels {
  const base: CreateGroupFormModalLabels = {
    title: String(LABELS.community_group_create ?? '새 그룹 만들기'),
    iconLabel: String(LABELS.community_group_icon_label ?? '그룹 아이콘'),
    nameLabel: String(LABELS.community_group_name_label ?? '그룹 이름'),
    namePlaceholder: String(LABELS.community_group_name_placeholder ?? ''),
    descLabel: String(LABELS.community_group_desc_label ?? '설명'),
    descPlaceholder: String(LABELS.community_group_desc_placeholder ?? ''),
    categoryLabel: String(LABELS.community_group_category_label ?? '카테고리'),
    modeLabel: String(LABELS.community_group_mode_label ?? '진행 방식'),
    maxMembersLabel: String(LABELS.community_group_max_members_label ?? '최대 인원'),
    tagsLabel: String(LABELS.community_group_tags_label ?? '태그'),
    tagsPlaceholder: String(LABELS.community_group_tags_placeholder ?? ''),
    tagsHint: String(LABELS.community_group_tags_hint ?? ''),
    publicToggleLabel: String(LABELS.community_group_public_toggle_label ?? '목록에 공개'),
    publicToggleDesc: String(LABELS.community_group_public_toggle_desc ?? ''),
    submitButton: String(LABELS.community_group_create_button ?? '그룹 만들기'),
    pendingButton: String(LABELS.community_group_creating ?? '만드는 중…'),
  };
  if (mode === 'edit') {
    return {
      ...base,
      title: String(LABELS.community_group_edit_modal_title ?? '그룹 정보 수정'),
      submitButton: String(LABELS.community_group_edit_save_button ?? '저장하기'),
      pendingButton: String(LABELS.community_group_edit_pending ?? '저장 중…'),
    };
  }
  return base;
}

export function CareerCreateGroupDialog({
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: Props) {
  return (
    <CreateGroupFormModal
      dataLayer="career-create-group-overlay"
      labels={buildCareerGroupFormModalLabels('create')}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
    />
  );
}
