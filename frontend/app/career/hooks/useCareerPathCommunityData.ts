'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCareerPathGroup,
  deleteCareerPathGroup,
  fetchCareerPathGroups,
  fetchCareerPathSchools,
  updateCareerPathGroup,
} from '@/lib/career-path/careerCommunityApi';
import type { CommunityGroup, School } from '@/app/career/components/community/types';
import { joinGroup } from '@/lib/careerCommunity';
import { isUuidString } from '@/lib/career-path/isUuidString';
import {
  getCategoryColorForCareerGroup,
  type CareerGroupCategoryId,
  type CareerGroupModeId,
} from '@/app/career/config/communityGroupForm';
import { CAREER_QUERY_GC_TIME_MS, CAREER_QUERY_STALE_TIME_MS } from './careerPathQueryCache';

const groupsKey = ['careerPath', 'groups'] as const;
const schoolsKey = ['careerPath', 'schools'] as const;

function normalizeGroupMode(m: string | undefined): CareerGroupModeId {
  if (m === 'offline') return 'offline';
  if (m === 'hybrid') return 'hybrid';
  return 'online';
}

function normalizeGroupCategory(m: string | undefined): CareerGroupCategoryId {
  const v = m ?? 'study';
  if (
    v === 'study' ||
    v === 'project' ||
    v === 'mentoring' ||
    v === 'school_club' ||
    v === 'other'
  ) {
    return v;
  }
  return 'study';
}

function mapApiGroupToUi(g: Awaited<ReturnType<typeof fetchCareerPathGroups>>[0]): CommunityGroup {
  const category = normalizeGroupCategory(g.category);
  return {
    id: g.id,
    name: g.name,
    emoji: g.emoji,
    description: g.description ?? '',
    color: getCategoryColorForCareerGroup(category),
    creatorId: g.creator,
    creatorName: g.creator_name ?? '',
    memberCount: g.member_count,
    maxMembers: g.max_members ?? 50,
    category,
    mode: normalizeGroupMode(g.mode) as CommunityGroup['mode'],
    members: [],
    sharedPlanCount: 0,
    inviteCode: g.invite_code,
    tags: Array.isArray(g.tags) ? g.tags : [],
    isPublic: g.is_public ?? true,
    createdAt: g.created_at ?? new Date().toISOString(),
    updatedAt: g.updated_at,
  };
}

function mapApiSchoolToUi(s: Awaited<ReturnType<typeof fetchCareerPathSchools>>[0]): School {
  return {
    id: s.id,
    name: s.name,
    code: s.code,
    operatorId: s.operator ?? '',
    operatorName: s.operator_name ?? '',
    operatorEmoji: '',
    grades: Array.isArray(s.grades) ? (s.grades as string[]) : [],
    memberCount: s.member_count,
    description: s.description ?? undefined,
    createdAt: s.created_at ?? new Date().toISOString(),
    updatedAt: s.updated_at,
  };
}

export function useCareerPathGroupsQuery() {
  return useQuery({
    queryKey: groupsKey,
    queryFn: async () => {
      const rows = await fetchCareerPathGroups();
      return rows
        .filter(row => isUuidString(row.id))
        .map(mapApiGroupToUi);
    },
    staleTime: CAREER_QUERY_STALE_TIME_MS.communityGroups,
    gcTime: CAREER_QUERY_GC_TIME_MS,
  });
}

export function useCareerPathSchoolsQuery() {
  return useQuery({
    queryKey: schoolsKey,
    queryFn: async () => {
      const rows = await fetchCareerPathSchools();
      return rows.map(mapApiSchoolToUi);
    },
    staleTime: CAREER_QUERY_STALE_TIME_MS.communitySchools,
    gcTime: CAREER_QUERY_GC_TIME_MS,
  });
}

/** 그룹 생성 후 목록 캐시 무효화 + 로컬 가입 ID에 새 그룹 반영 */
export function useCreateCareerPathGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCareerPathGroup,
    onSuccess: (created) => {
      joinGroup(created.id);
      void queryClient.invalidateQueries({ queryKey: groupsKey });
    },
  });
}

export function useUpdateCareerPathGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: string;
      payload: Parameters<typeof updateCareerPathGroup>[1];
    }) => updateCareerPathGroup(groupId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupsKey });
    },
  });
}

export function useDeleteCareerPathGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCareerPathGroup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupsKey });
    },
  });
}
