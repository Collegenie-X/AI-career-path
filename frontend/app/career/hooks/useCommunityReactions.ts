'use client';

import { useState, useEffect } from 'react';
import communityData from '@/data/share-community.json';
import type { SharedPlan } from '../components/community/types';

const REACTIONS_STORAGE_KEY = 'community_reactions_v1';

type CommunityReactionsState = {
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
};

type UseCommunityReactionsReturn = {
  reactions: CommunityReactionsState;
  handleToggleLike: (planId: string) => void;
  handleToggleBookmark: (planId: string) => void;
};

function buildInitialCounts(sharedPlans: SharedPlan[]): Pick<CommunityReactionsState, 'likeCounts' | 'bookmarkCounts'> {
  const likeCounts: Record<string, number> = {};
  const bookmarkCounts: Record<string, number> = {};
  sharedPlans.forEach(p => { likeCounts[p.id] = p.likes; bookmarkCounts[p.id] = p.bookmarks; });
  return { likeCounts, bookmarkCounts };
}

export function useCommunityReactions(): UseCommunityReactionsReturn {
  const sharedPlans = communityData.sharedPlans as SharedPlan[];

  const [reactions, setReactions] = useState<CommunityReactionsState>(() => ({
    likedPlanIds: [],
    bookmarkedPlanIds: [],
    ...buildInitialCounts(sharedPlans),
  }));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REACTIONS_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { likedPlanIds: string[]; bookmarkedPlanIds: string[] };
      const likeCounts: Record<string, number> = {};
      const bookmarkCounts: Record<string, number> = {};
      sharedPlans.forEach(p => {
        likeCounts[p.id] = p.likes + (saved.likedPlanIds.includes(p.id) ? 1 : 0);
        bookmarkCounts[p.id] = p.bookmarks + (saved.bookmarkedPlanIds.includes(p.id) ? 1 : 0);
      });
      setReactions({ ...saved, likeCounts, bookmarkCounts });
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistReactions = (updated: CommunityReactionsState) => {
    localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify({
      likedPlanIds: updated.likedPlanIds,
      bookmarkedPlanIds: updated.bookmarkedPlanIds,
    }));
  };

  const handleToggleLike = (planId: string) => {
    setReactions(prev => {
      const wasLiked = prev.likedPlanIds.includes(planId);
      const likedPlanIds = wasLiked
        ? prev.likedPlanIds.filter(id => id !== planId)
        : [...prev.likedPlanIds, planId];
      const base = sharedPlans.find(p => p.id === planId)?.likes ?? 0;
      const updated = { ...prev, likedPlanIds, likeCounts: { ...prev.likeCounts, [planId]: base + (wasLiked ? 0 : 1) } };
      persistReactions(updated);
      return updated;
    });
  };

  const handleToggleBookmark = (planId: string) => {
    setReactions(prev => {
      const wasBookmarked = prev.bookmarkedPlanIds.includes(planId);
      const bookmarkedPlanIds = wasBookmarked
        ? prev.bookmarkedPlanIds.filter(id => id !== planId)
        : [...prev.bookmarkedPlanIds, planId];
      const base = sharedPlans.find(p => p.id === planId)?.bookmarks ?? 0;
      const updated = { ...prev, bookmarkedPlanIds, bookmarkCounts: { ...prev.bookmarkCounts, [planId]: base + (wasBookmarked ? 0 : 1) } };
      persistReactions(updated);
      return updated;
    });
  };

  return { reactions, handleToggleLike, handleToggleBookmark };
}
