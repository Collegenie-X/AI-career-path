'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import type { OperatorComment, OperatorCommentNode } from './types';

type CommunityCommentBubbleProps = {
  readonly node: OperatorCommentNode;
  readonly depth: number;
  readonly onReport: (comment: OperatorComment) => void;
  readonly onReply: (id: string) => void;
  readonly replyTargetId: string | null;
  readonly onReplySubmit: (parentId: string, text: string) => void;
  readonly onReplyCancel: () => void;
  readonly starColor: string;
};

const ROLE_COLORS: Record<string, string> = {
  operator: '#a78bfa',
  teacher: '#60a5fa',
  peer: '#9ca3af',
};

const ROLE_LABELS: Record<string, string> = {
  operator: '운영자',
  teacher: '선생님',
  peer: '학생',
};

export function CommunityCommentBubble({
  node,
  depth,
  onReport,
  onReply,
  replyTargetId,
  onReplySubmit,
  onReplyCancel,
  starColor,
}: CommunityCommentBubbleProps) {
  const isReplyTarget = replyTargetId === node.id;
  const [replyText, setReplyText] = useState('');
  const roleColor = ROLE_COLORS[node.authorRole] ?? '#9ca3af';

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <div
        className="rounded-2xl px-4 py-3 space-y-1.5"
        style={{
          backgroundColor: depth === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${depth === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{node.authorEmoji}</span>
            <span className="text-xs font-bold text-white">{node.authorName}</span>
            <span
              className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${roleColor}18`, color: roleColor }}
            >
              {ROLE_LABELS[node.authorRole] ?? node.authorRole}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onReply(node.id)}
              className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg"
            >
              답글
            </button>
            <button
              onClick={() => onReport(node)}
              className="p-1 rounded-lg transition-all"
              style={{ color: 'rgba(255,255,255,0.2)' }}
              title="신고"
            >
              <Flag style={{ width: 11, height: 11 }} />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{node.content}</p>
        <p className="text-[11px] text-gray-600">
          {new Date(node.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
        </p>
      </div>

      {isReplyTarget && (
        <div className="mt-2 ml-6 flex gap-2">
          <input
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && replyText.trim()) {
                onReplySubmit(node.id, replyText.trim());
                setReplyText('');
                onReplyCancel();
              }
              if (e.key === 'Escape') onReplyCancel();
            }}
            placeholder="답글 작성..."
            className="flex-1 px-3 py-2 rounded-xl text-sm text-white bg-transparent border outline-none"
            style={{ borderColor: `${starColor}40` }}
            autoFocus
          />
          <button
            onClick={() => {
              if (replyText.trim()) {
                onReplySubmit(node.id, replyText.trim());
                setReplyText('');
                onReplyCancel();
              }
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${starColor}, ${starColor}cc)` }}
          >
            작성
          </button>
          <button
            onClick={onReplyCancel}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ccc' }}
          >
            취소
          </button>
        </div>
      )}

      {node.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.replies.map(reply => (
            <CommunityCommentBubble
              key={reply.id}
              node={reply}
              depth={depth + 1}
              onReport={onReport}
              onReply={onReply}
              replyTargetId={replyTargetId}
              onReplySubmit={onReplySubmit}
              onReplyCancel={onReplyCancel}
              starColor={starColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
