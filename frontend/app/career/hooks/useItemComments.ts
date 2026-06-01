'use client';

import { useState, useEffect, useCallback } from 'react';

export type PlanItemCommentKind =
  | 'problem'
  | 'debug'
  | 'progress'
  | 'resource'
  | 'reflection'
  | 'note';

export type PlanItemComment = {
  id: string;
  kind: PlanItemCommentKind;
  body: string;
  url?: string;
  createdAt: string;
};

const STORAGE_KEY = 'career_item_comments_v1';

function readAll(): Record<string, PlanItemComment[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, PlanItemComment[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useItemComments(itemId: string) {
  const [comments, setComments] = useState<PlanItemComment[]>([]);

  useEffect(() => {
    const all = readAll();
    setComments(all[itemId] ?? []);
  }, [itemId]);

  const addComment = useCallback(
    (draft: { kind: PlanItemCommentKind; body: string; url?: string }) => {
      const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const newComment: PlanItemComment = {
        id,
        kind: draft.kind,
        body: draft.body.trim(),
        url: draft.url?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => {
        const next = [newComment, ...prev];
        const all = readAll();
        all[itemId] = next;
        writeAll(all);
        return next;
      });
      return newComment;
    },
    [itemId]
  );

  const deleteComment = useCallback(
    (commentId: string) => {
      setComments((prev) => {
        const next = prev.filter((c) => c.id !== commentId);
        const all = readAll();
        all[itemId] = next;
        writeAll(all);
        return next;
      });
    },
    [itemId]
  );

  return { comments, addComment, deleteComment };
}
