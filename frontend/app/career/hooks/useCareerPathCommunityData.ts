'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCareerPathGroup,
  fetchCareerPathGroups,
  fetchCareerPathSchools,
} from '@/lib/career-path/careerCommunityApi';
import type { CommunityGroup, School } from '@/app/career/components/community/types';
import { joinGroup } from '@/lib/careerCommunity';
import {
  getCategoryColorForCareerGroup,
  type CareerGroupCategoryId,
  type CareerGroupModeId,
} from '@/app/career/config/communityGroupForm';
import { CAREER_QUERY_GC_TIME_MS, CAREER_QUERY_STALE_TIME_MS } from './careerPathQueryCache';

const groupsKey = ['careerPath', 'groups'] as const;
const schoolsKey = ['careerPath', 'schools'] as const;

function mapApiGroupToUi(g: Awaited<ReturnType<typeof fetchCareerPathGroups>>[0]): CommunityGroup {
  const category = (g.category ?? 'study') as CareerGroupCategoryId;
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
    mode: (g.mode ?? 'online') as CareerGroupModeId,
    members: [],
    sharedPlanCount: 0,
    inviteCode: g.invite_code,
    tags: Array.isArray(g.tags) ? g.tags : [],
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
      return rows.map(mapApiGroupToUi);
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
