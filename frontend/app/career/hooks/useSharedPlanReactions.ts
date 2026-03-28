'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeSharedPlanApi, bookmarkSharedPlanApi, hasCareerPathBackendAuth } from '@/lib/career-path/sharedPlanApi';
import { CAREER_SHARED_PLANS_QUERY_KEY } from '@/app/career/hooks/useSharedPlansQuery';
import { sharedPlanCommunityDetailQueryKey } from '@/app/career/hooks/useSharedPlanCommunityDetailQuery';
import type { SharedPlan, UserReactionState } from '@/app/career/components/community/types';

const REACTIONS_STORAGE_KEY = 'community_reactions_v1';

function loadReactionsFromStorage(): UserReactionState {
  try {
    const raw = localStorage.getItem(REACTIONS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserReactionState) : { likedPlanIds: [], bookmarkedPlanIds: [] };
  } catch {
    return { likedPlanIds: [], bookmarkedPlanIds: [] };
  }
}

function saveReactionsToStorage(reactions: UserReactionState): void {
  try {
    localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactions));
  } catch {}
}

export function useSharedPlanReactions() {
  const queryClient = useQueryClient();
  const useBackend = hasCareerPathBackendAuth();
  
  const [reactions, setReactions] = useState<UserReactionState>(() => loadReactionsFromStorage());

  useEffect(() => {
    setReactions(loadReactionsFromStorage());
  }, []);

  const likeMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (useBackend) {
        return await likeSharedPlanApi(planId);
      }
      return { like_count: 0 };
    },
    onSuccess: (data, planId) => {
      if (!useBackend) return;
      queryClient.setQueryData<SharedPlan[]>(CAREER_SHARED_PLANS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((p) => (p.id === planId ? { ...p, likes: data.like_count } : p));
      });
      queryClient.setQueryData<SharedPlan>(sharedPlanCommunityDetailQueryKey(planId), (old) =>
        old ? { ...old, likes: data.like_count } : old,
      );
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (useBackend) {
        return await bookmarkSharedPlanApi(planId);
      }
      return { bookmark_count: 0 };
    },
    onSuccess: (data, planId) => {
      if (!useBackend) return;
      queryClient.setQueryData<SharedPlan[]>(CAREER_SHARED_PLANS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((p) => (p.id === planId ? { ...p, bookmarks: data.bookmark_count } : p));
      });
      queryClient.setQueryData<SharedPlan>(sharedPlanCommunityDetailQueryKey(planId), (old) =>
        old ? { ...old, bookmarks: data.bookmark_count } : old,
      );
    },
  });

  const toggleLike = useCallback(
    (planId: string) => {
      const wasLiked = reactions.likedPlanIds.includes(planId);
      const updated: UserReactionState = {
        ...reactions,
        likedPlanIds: wasLiked
          ? reactions.likedPlanIds.filter((id) => id !== planId)
          : [...reactions.likedPlanIds, planId],
      };
      setReactions(updated);
      saveReactionsToStorage(updated);

      if (useBackend && !wasLiked) {
        likeMutation.mutate(planId);
      }
    },
    [reactions, useBackend, likeMutation]
  );

  const toggleBookmark = useCallback(
    (planId: string) => {
      const wasBookmarked = reactions.bookmarkedPlanIds.includes(planId);
      const updated: UserReactionState = {
        ...reactions,
        bookmarkedPlanIds: wasBookmarked
          ? reactions.bookmarkedPlanIds.filter((id) => id !== planId)
          : [...reactions.bookmarkedPlanIds, planId],
      };
      setReactions(updated);
      saveReactionsToStorage(updated);

      if (useBackend && !wasBookmarked) {
        bookmarkMutation.mutate(planId);
      }
    },
    [reactions, useBackend, bookmarkMutation]
  );

  return {
    reactions,
    toggleLike,
    toggleBookmark,
  };
}
