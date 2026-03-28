'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchCareerPathGroups,
  fetchCareerPathSchools,
} from '@/lib/career-path/careerCommunityApi';
import type { CommunityGroup, School } from '@/app/career/components/community/types';

const groupsKey = ['careerPath', 'groups'] as const;
const schoolsKey = ['careerPath', 'schools'] as const;

function mapApiGroupToUi(g: Awaited<ReturnType<typeof fetchCareerPathGroups>>[0]): CommunityGroup {
  return {
    id: g.id,
    name: g.name,
    emoji: g.emoji,
    description: g.description ?? '',
    color: '#6366F1',
    creatorId: g.creator,
    creatorName: g.creator_name ?? '',
    memberCount: g.member_count,
    members: [],
    sharedPlanCount: 0,
    inviteCode: g.invite_code,
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
    staleTime: 60_000,
  });
}

export function useCareerPathSchoolsQuery() {
  return useQuery({
    queryKey: schoolsKey,
    queryFn: async () => {
      const rows = await fetchCareerPathSchools();
      return rows.map(mapApiSchoolToUi);
    },
    staleTime: 60_000,
  });
}
