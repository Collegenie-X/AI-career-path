/**
 * 커뮤니티 그룹 생성 폼 — 카테고리·모드·정원 등은 JSON에서 로드합니다.
 */
import communityGroupsConfig from '@/data/career/config/community-groups.json';

export type CareerGroupCategoryId =
  (typeof communityGroupsConfig.categories)[number]['id'];

export type CareerGroupModeId = (typeof communityGroupsConfig.modes)[number]['id'];

export const CAREER_GROUP_FORM_CONFIG = communityGroupsConfig as {
  readonly categories: readonly {
    readonly id: CareerGroupCategoryId;
    readonly label: string;
    readonly emoji: string;
    readonly color: string;
  }[];
  readonly modes: readonly { readonly id: CareerGroupModeId; readonly label: string }[];
  readonly maxMembersMin: number;
  readonly maxMembersMax: number;
  readonly maxMembersDefault: number;
};

export type CareerGroupFormSubmitPayload = {
  name: string;
  description: string;
  emoji: string;
  category: CareerGroupCategoryId;
  mode: CareerGroupModeId;
  maxMembers: number;
  tags: string[];
  isPublic: boolean;
};

export function getCategoryColorForCareerGroup(categoryId: CareerGroupCategoryId): string {
  const row = CAREER_GROUP_FORM_CONFIG.categories.find(c => c.id === categoryId);
  return row?.color ?? '#6366F1';
}
