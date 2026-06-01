'use client';

import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Trash2, Send } from 'lucide-react';
import type { RoadmapGoalComment, RoadmapGoalCommentKind } from '../../types';
import { getRoadmapGoalStatusMeta } from '../../utils/roadmapGoalStatus';
import {
  GOAL_COMMENT_KINDS,
  formatGoalCommentTime as formatRelativeTime,
  getGoalCommentKindMeta,
} from '../../utils/roadmapGoalCommentKinds';

interface RoadmapEditorWeekGoalCommentsProps {
  comments: RoadmapGoalComment[];
  onChange: (next: RoadmapGoalComment[]) => void;
}

/**
 * 주차 목표별 Jira 스타일 코멘트 스레드.
 * 진짜 문제와 그로 인해 바뀐 변화를 시간순으로 쌓아 추적한다.
 */
export function RoadmapEditorWeekGoalComments({ comments, onChange }: RoadmapEditorWeekGoalCommentsProps) {
  const [isOpen, setIsOpen] = useState(comments.length > 0);
  const [draftKind, setDraftKind] = useState<RoadmapGoalCommentKind>('problem');
  const [draftBody, setDraftBody] = useState('');

  const addComment = () => {
    const body = draftBody.trim();
    if (!body) return;
    const nextComment: RoadmapGoalComment = {
      id: `goal-comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind: draftKind,
      body,
      createdAt: new Date().toISOString(),
    };
    onChange([nextComment, ...comments]);
    setDraftBody('');
  };

  const removeComment = (commentId: string) => {
    onChange(comments.filter(comment => comment.id !== commentId));
  };

  return (
    <div className="mt-1.5 rounded-lg bg-white/[0.03] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-400">
          <MessageSquare className="h-3.5 w-3.5 text-sky-300" />
          코멘트
          {comments.length > 0 && (
            <span className="rounded-full bg-sky-500/20 px-1.5 text-[10px] font-bold text-sky-200">
              {comments.length}
            </span>
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2">
          {/* 입력부 */}
          <div className="rounded-lg bg-white/[0.04] p-2">
            <div className="flex flex-wrap gap-1">
              {GOAL_COMMENT_KINDS.map(kind => {
                const isActive = draftKind === kind.key;
                return (
                  <button
                    key={kind.key}
                    type="button"
                    onClick={() => setDraftKind(kind.key)}
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold transition-all"
                    style={{
                      backgroundColor: isActive ? `${kind.color}26` : 'rgba(255,255,255,0.06)',
                      color: isActive ? kind.color : 'rgba(255,255,255,0.42)',
                      border: isActive ? `1px solid ${kind.color}55` : '1px solid transparent',
                    }}
                  >
                    {kind.emoji} {kind.label}
                  </button>
                );
              })}
            </div>
            <textarea
              value={draftBody}
              onChange={event => setDraftBody(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) addComment();
              }}
              placeholder="발견한 진짜 문제, 바뀐 변화, 디버깅 과정을 기록하세요… (⌘/Ctrl+Enter)"
              rows={2}
              className="mt-1.5 w-full resize-none rounded-md bg-transparent px-1 text-[11px] leading-relaxed text-white placeholder-gray-600 outline-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addComment}
                disabled={!draftBody.trim()}
                className="flex items-center gap-1 rounded-lg bg-sky-500/22 px-2.5 py-1 text-[11px] font-bold text-sky-200 transition-all hover:bg-sky-500/32 disabled:opacity-30"
              >
                <Send className="h-3 w-3" />
                기록
              </button>
            </div>
          </div>

          {/* 스레드 */}
          {comments.length === 0 ? (
            <p className="px-1 text-[10px] text-gray-600">
              아직 코멘트가 없어요. 진행하며 문제와 변화를 기록해 보세요.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {comments.map(comment => {
                const isStatusChange = comment.kind === 'status';
                const kind = getGoalCommentKindMeta(comment.kind);
                return (
                  <li
                    key={comment.id}
                    className="group rounded-lg px-2 py-1.5"
                    style={{ backgroundColor: `${kind.color}12`, border: `1px solid ${kind.color}24` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ backgroundColor: `${kind.color}22`, color: kind.color }}
                      >
                        {kind.emoji} {kind.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
                        <button
                          type="button"
                          onClick={() => removeComment(comment.id)}
                          className="flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-500/20 group-hover:opacity-100"
                          aria-label="코멘트 삭제"
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                    {isStatusChange && comment.statusFrom && comment.statusTo ? (
                      <div className="mt-1 flex items-center gap-1.5 px-0.5">
                        {[comment.statusFrom, comment.statusTo].map((status, index) => {
                          const meta = getRoadmapGoalStatusMeta(status);
                          return (
                            <span key={`${comment.id}-${index}`} className="flex items-center gap-1">
                              {index === 1 && <span className="text-[11px] text-gray-500">→</span>}
                              <span
                                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                                style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                              >
                                {meta.emoji} {meta.label}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-1 whitespace-pre-wrap px-0.5 text-[11px] leading-relaxed text-gray-200">
                        {comment.body}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
