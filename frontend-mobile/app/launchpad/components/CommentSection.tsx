'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Reply, Trash2, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { LAUNCHPAD_LABELS } from '../config';
import type { Comment, Reply as ReplyType } from '../types';

const COMMENTS_KEY = 'launchpad_comments';

function loadComments(sessionId: string): Comment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (raw) {
      const all = JSON.parse(raw) as Record<string, Comment[]>;
      return all[sessionId] ?? [];
    }
  } catch {}
  return [];
}

function saveComments(sessionId: string, comments: Comment[]) {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Comment[]>) : {};
    all[sessionId] = comments;
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
  } catch {}
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

/* ─── 답글 아이템 ─── */
function ReplyItem({
  reply,
  onDelete,
}: {
  reply: ReplyType;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="flex items-start gap-2 pl-3 py-2.5 rounded-xl"
      style={{ backgroundColor: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.12)' }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
        style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.5), rgba(59,130,246,0.4))' }}
      >
        {reply.author.slice(0, 1).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[11px] font-bold text-purple-300">{reply.author}</span>
          <span className="text-[10px] text-gray-600">{timeAgo(reply.createdAt)}</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed break-words">{reply.text}</p>
      </div>
      <button
        onClick={() => onDelete(reply.id)}
        className="flex-shrink-0 p-1 rounded-lg transition-colors active:opacity-70"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ─── 댓글 아이템 ─── */
function CommentItem({
  comment,
  onDeleteComment,
  onAddReply,
  onDeleteReply,
}: {
  comment: Comment;
  onDeleteComment: (id: string) => void;
  onAddReply: (commentId: string, text: string, author: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');

  const handleReplySubmit = () => {
    const text = replyText.trim();
    if (!text) return;
    onAddReply(comment.id, text, replyAuthor.trim() || '익명');
    setReplyText('');
    setReplyOpen(false);
    setShowReplies(true);
  };

  const inp: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: '10px',
    padding: '8px 10px',
    fontSize: '12px',
    outline: 'none',
    width: '100%',
  };

  return (
    <div className="space-y-2">
      {/* 댓글 본문 */}
      <div
        className="p-3 rounded-2xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-start gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #3B82F6)' }}
          >
            {comment.author.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-white">{comment.author}</span>
              <span className="text-[10px] text-gray-600">{timeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed break-words">{comment.text}</p>
          </div>
          <button
            onClick={() => onDeleteComment(comment.id)}
            className="flex-shrink-0 p-1 rounded-lg transition-colors active:opacity-70"
            style={{ color: 'rgba(255,255,255,0.18)' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-3 mt-2 pl-9">
          <button
            onClick={() => setReplyOpen(v => !v)}
            className="flex items-center gap-1 text-[11px] font-semibold transition-colors active:opacity-70"
            style={{ color: replyOpen ? '#6C5CE7' : 'rgba(255,255,255,0.3)' }}
          >
            <Reply className="w-3 h-3" />
            {LAUNCHPAD_LABELS.replySubmit}
          </button>
          {comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(v => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold transition-colors"
              style={{ color: 'rgba(108,92,231,0.8)' }}
            >
              {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              답글 {comment.replies.length}개
            </button>
          )}
        </div>
      </div>

      {/* 답글 작성 폼 */}
      {replyOpen && (
        <div
          className="ml-4 p-3 rounded-xl space-y-2"
          style={{ backgroundColor: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.15)' }}
        >
          <input
            style={inp}
            placeholder="닉네임 (선택)"
            value={replyAuthor}
            onChange={e => setReplyAuthor(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              style={{ ...inp, flex: 1 }}
              placeholder={LAUNCHPAD_LABELS.replyPlaceholder}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleReplySubmit(); } }}
            />
            <button
              onClick={handleReplySubmit}
              disabled={!replyText.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
              style={replyText.trim()
                ? { background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', boxShadow: '0 2px 10px rgba(108,92,231,0.4)' }
                : { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Send className="w-3.5 h-3.5" style={{ color: replyText.trim() ? '#fff' : '#4b5563' }} />
            </button>
          </div>
        </div>
      )}

      {/* 답글 목록 */}
      {showReplies && comment.replies.length > 0 && (
        <div className="ml-4 space-y-1.5">
          {comment.replies.map(reply => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              onDelete={replyId => onDeleteReply(comment.id, replyId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 메인 CommentSection ─── */
export function CommentSection({ sessionId }: { sessionId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState('');
  const [author, setAuthor] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setComments(loadComments(sessionId));
  }, [sessionId]);

  if (!mounted) return null;

  const persist = (next: Comment[]) => {
    setComments(next);
    saveComments(sessionId, next);
  };

  const handleAddComment = () => {
    const text = draft.trim();
    if (!text) return;
    const c: Comment = {
      id: `c-${Date.now()}`,
      text,
      author: author.trim() || '익명',
      createdAt: new Date().toISOString(),
      replies: [],
    };
    persist([...comments, c]);
    setDraft('');
  };

  const handleDeleteComment = (id: string) => persist(comments.filter(c => c.id !== id));

  const handleAddReply = (commentId: string, text: string, replyAuthor: string) => {
    const r: ReplyType = {
      id: `r-${Date.now()}`,
      text,
      author: replyAuthor,
      createdAt: new Date().toISOString(),
    };
    persist(comments.map(c => c.id === commentId ? { ...c, replies: [...c.replies, r] } : c));
  };

  const handleDeleteReply = (commentId: string, replyId: string) => {
    persist(comments.map(c =>
      c.id === commentId ? { ...c, replies: c.replies.filter(r => r.id !== replyId) } : c
    ));
  };

  const inp: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 12px',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4" style={{ color: '#6C5CE7' }} />
        <span className="text-sm font-bold text-white">댓글</span>
        {comments.length > 0 && (
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(108,92,231,0.3)', color: '#a78bfa' }}
          >
            {comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)}
          </span>
        )}
      </div>

      {/* 댓글 작성 */}
      <div
        className="p-3 rounded-2xl mb-4 space-y-2"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <input
          style={inp}
          placeholder="닉네임 (선택, 미입력 시 익명)"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            style={{ ...inp, flex: 1 }}
            placeholder={LAUNCHPAD_LABELS.commentPlaceholder}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(); } }}
          />
          <button
            onClick={handleAddComment}
            disabled={!draft.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
            style={draft.trim()
              ? { background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', boxShadow: '0 2px 12px rgba(108,92,231,0.4)' }
              : { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Send className="w-4 h-4" style={{ color: draft.trim() ? '#fff' : '#374151' }} />
          </button>
        </div>
      </div>

      {/* 댓글 없음 */}
      {comments.length === 0 && (
        <div className="py-6 text-center">
          <div className="text-2xl mb-2">💬</div>
          <p className="text-xs text-gray-600">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
        </div>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-3">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onDeleteComment={handleDeleteComment}
            onAddReply={handleAddReply}
            onDeleteReply={handleDeleteReply}
          />
        ))}
      </div>
    </div>
  );
}
