'use client';

import { useState } from 'react';
import { MessageSquare, Send, Trash2, X } from 'lucide-react';

export type CommentCategory = 'question' | 'review' | 'tip' | 'warning';

export type HighSchoolCommentReply = {
  id: string;
  content: string;
  createdAt: string;
};

export type HighSchoolComment = {
  id: string;
  schoolId: string;
  category: CommentCategory;
  content: string;
  createdAt: string;
  source?: 'user' | 'dummy';
  replies: HighSchoolCommentReply[];
};

type SchoolCommentsDialogProps = {
  isOpen: boolean;
  schoolName: string;
  categoryColor: string;
  comments: HighSchoolComment[];
  formatRelativeTime: (isoTime: string) => string;
  categoryMeta: Record<CommentCategory, { label: string; color: string }>;
  onClose: () => void;
  onDeleteComment: (commentId: string) => void;
  onAddReply: (commentId: string, replyText: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
};

export function SchoolCommentsDialog({
  isOpen,
  schoolName,
  categoryColor,
  comments,
  formatRelativeTime,
  categoryMeta,
  onClose,
  onDeleteComment,
  onAddReply,
  onDeleteReply,
}: SchoolCommentsDialogProps) {
  const [replyDraftByCommentId, setReplyDraftByCommentId] = useState<Record<string, string>>({});
  const [openedReplyComposerCommentId, setOpenedReplyComposerCommentId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 p-3">
      <div
        className="w-full max-w-xl max-h-[82vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#0b1020', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: `${categoryColor}18`, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" style={{ color: categoryColor }} />
            <p className="text-sm font-bold text-white">{schoolName} 댓글 전체 보기</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {comments.length === 0 ? (
            <p className="text-[12px] text-gray-500 py-4 text-center">표시할 댓글이 없습니다.</p>
          ) : (
            comments.map((comment) => {
              const meta = categoryMeta[comment.category];
              const replyDraftText = replyDraftByCommentId[comment.id] ?? '';
              const isReplyComposerOpen = openedReplyComposerCommentId === comment.id;
              return (
                <div
                  key={comment.id}
                  className="rounded-xl p-2.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ color: meta.color, background: `${meta.color}20` }}
                      >
                        {meta.label}
                      </span>
                      {comment.source === 'dummy' ? (
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full text-violet-300 bg-violet-400/15">
                          더미
                        </span>
                      ) : null}
                      <span className="text-[12px] text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    {comment.source !== 'dummy' ? (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="p-1 rounded-md text-gray-500 hover:text-gray-300"
                        aria-label="댓글 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    ) : null}
                  </div>

                  <p className="text-[12px] text-gray-300 leading-relaxed break-words">{comment.content}</p>

                  {comment.replies.length > 0 ? (
                    <div className="mt-2 space-y-1.5 pl-2 border-l border-white/10">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="rounded-lg px-2 py-1.5 bg-white/5">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-[12px] text-gray-500">{formatRelativeTime(reply.createdAt)}</span>
                            {comment.source !== 'dummy' ? (
                              <button
                                onClick={() => onDeleteReply(comment.id, reply.id)}
                                className="p-1 rounded-md text-gray-500 hover:text-gray-300"
                                aria-label="대댓글 삭제"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            ) : null}
                          </div>
                          <p className="text-[12px] text-gray-300 leading-relaxed">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {comment.source !== 'dummy' ? (
                    <div className="mt-2.5">
                      <button
                        onClick={() => setOpenedReplyComposerCommentId(isReplyComposerOpen ? null : comment.id)}
                        className="text-[11px] font-semibold px-2 py-1 rounded-full"
                        style={{ background: `${categoryColor}20`, color: categoryColor }}
                      >
                        {isReplyComposerOpen ? '답글 닫기' : '답글 달기'}
                      </button>

                      {isReplyComposerOpen ? (
                        <div className="mt-2 flex gap-2">
                          <input
                            value={replyDraftText}
                            onChange={(event) => setReplyDraftByCommentId((previous) => ({ ...previous, [comment.id]: event.target.value }))}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                const trimmedText = replyDraftText.trim();
                                if (!trimmedText) return;
                                onAddReply(comment.id, trimmedText);
                                setReplyDraftByCommentId((previous) => ({ ...previous, [comment.id]: '' }));
                                setOpenedReplyComposerCommentId(null);
                              }
                            }}
                            placeholder="답글을 입력하세요"
                            className="flex-1 rounded-lg px-2.5 py-2 text-[12px] bg-white/5 border border-white/10 text-gray-100 outline-none"
                          />
                          <button
                            onClick={() => {
                              const trimmedText = replyDraftText.trim();
                              if (!trimmedText) return;
                              onAddReply(comment.id, trimmedText);
                              setReplyDraftByCommentId((previous) => ({ ...previous, [comment.id]: '' }));
                              setOpenedReplyComposerCommentId(null);
                            }}
                            disabled={!replyDraftText.trim()}
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={replyDraftText.trim()
                              ? { background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}cc)`, color: '#fff' }
                              : { background: 'rgba(255,255,255,0.07)', color: '#6b7280' }}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
