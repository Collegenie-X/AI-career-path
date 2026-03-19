'use client';

import { ThumbsUp, Edit2, Trash2, Flag } from 'lucide-react';

export type DetailPanelComment = {
  id: string;
  userId: string;
  userName: string;
  userEmoji: string;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
};

type CareerPathDetailPanelCommentProps = {
  readonly comment: DetailPanelComment;
  readonly accentColor: string;
  readonly onLike: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly onReport: () => void;
  readonly isEditing: boolean;
  readonly editText: string;
  readonly onEditTextChange: (v: string) => void;
  readonly onSaveEdit: () => void;
  readonly onCancelEdit: () => void;
};

export function CareerPathDetailPanelComment({
  comment,
  accentColor,
  onLike,
  onEdit,
  onDelete,
  onReport,
  isEditing,
  editText,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
}: CareerPathDetailPanelCommentProps) {
  const isOwn = comment.userId === 'current';

  return (
    <div className="flex gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      >
        {comment.userEmoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{comment.userName}</span>
            <span className="text-[12px] text-gray-500">{comment.timestamp}</span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {isOwn ? (
              <>
                <button onClick={onEdit} className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'rgba(255,255,255,0.35)' }} title="수정">
                  <Edit2 style={{ width: 13, height: 13 }} />
                </button>
                <button onClick={onDelete} className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'rgba(255,255,255,0.35)' }} title="삭제">
                  <Trash2 style={{ width: 13, height: 13 }} />
                </button>
              </>
            ) : (
              <button onClick={onReport} className="p-1.5 rounded-lg transition-all"
                style={{ color: 'rgba(255,255,255,0.25)' }} title="신고">
                <Flag style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
              className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent border outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={onCancelEdit} className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                취소
              </button>
              <button onClick={onSaveEdit} className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: accentColor, color: '#fff' }}>
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-300 mt-1 leading-relaxed">{comment.content}</p>
            <button onClick={onLike} className="flex items-center gap-1.5 mt-2 transition-all active:scale-95">
              <ThumbsUp
                style={{
                  width: 14, height: 14,
                  color: comment.liked ? accentColor : 'rgba(255,255,255,0.4)',
                  fill: comment.liked ? accentColor : 'none',
                }}
              />
              {comment.likes > 0 && (
                <span className="text-xs font-semibold"
                  style={{ color: comment.liked ? accentColor : 'rgba(255,255,255,0.4)' }}>
                  {comment.likes}
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
