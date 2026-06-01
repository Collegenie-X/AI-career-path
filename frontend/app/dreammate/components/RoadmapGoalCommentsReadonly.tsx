'use client';

import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import type { RoadmapGoalComment } from '../types';
import { getGoalCommentKindMeta, formatGoalCommentTime } from '../utils/roadmapGoalCommentKinds';
import { getRoadmapGoalStatusMeta } from '../utils/roadmapGoalStatus';

interface RoadmapGoalCommentsReadonlyProps {
  comments: RoadmapGoalComment[];
}

/**
 * 상세(읽기) 화면에서 주차 목표의 Jira 코멘트 스레드를 펼쳐 보는 읽기 전용 뷰.
 * 진짜 문제·바뀐 변화·상태 변경 기록을 그대로 노출해 피드에서도 추적 과정을 보여준다.
 */
export function RoadmapGoalCommentsReadonly({ comments }: RoadmapGoalCommentsReadonlyProps) {
  const [open, setOpen] = useState(false);
  if (comments.length === 0) return null;

  return (
    <div className="mt-1 ml-2">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-gray-400 transition-colors hover:bg-white/5"
      >
        <MessageSquare className="h-3 w-3 text-sky-300" />
        진행 메모
        <span className="rounded-full bg-sky-500/20 px-1.5 text-[10px] font-bold text-sky-200">{comments.length}</span>
        {open ? <ChevronUp className="h-3 w-3 text-gray-500" /> : <ChevronDown className="h-3 w-3 text-gray-500" />}
      </button>

      {open && (
        <ul className="mt-1 space-y-1 border-l border-white/[0.08] pl-2">
          {comments.map(comment => {
            const isStatusChange = comment.kind === 'status';
            const kind = getGoalCommentKindMeta(comment.kind);
            return (
              <li
                key={comment.id}
                className="rounded-md px-1.5 py-1"
                style={{ backgroundColor: `${kind.color}12`, border: `1px solid ${kind.color}24` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: `${kind.color}22`, color: kind.color }}
                  >
                    {kind.emoji} {kind.label}
                  </span>
                  <span className="text-[10px] text-gray-500">{formatGoalCommentTime(comment.createdAt)}</span>
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
                  <p className="mt-0.5 whitespace-pre-wrap px-0.5 text-[11px] leading-relaxed text-gray-300">
                    {comment.body}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
