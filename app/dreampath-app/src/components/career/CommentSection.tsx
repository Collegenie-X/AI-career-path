import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS, type CareerPathComment } from '../../config/career-path';
import { storage } from '../../lib/storage';
import seedComments from '../../data/career-path-seed-comments.json';

interface CommentSectionProps {
  templateId: string;
  accentColor: string;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return '방금';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffWeeks < 5) return `${diffWeeks}주 전`;
  return `${diffMonths}개월 전`;
}

/* ─── Single comment row ─── */
function CommentRow({
  comment, isLiked, isOwn, accentColor, onLike, onEdit, onDelete,
}: {
  comment: CareerPathComment;
  isLiked: boolean;
  isOwn: boolean;
  accentColor: string;
  onLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={rowStyles.container}>
      <View style={rowStyles.avatar}>
        <Text style={rowStyles.avatarEmoji}>{comment.authorEmoji}</Text>
      </View>
      <View style={rowStyles.body}>
        <View style={rowStyles.headerRow}>
          <View style={rowStyles.headerLeft}>
            <Text style={rowStyles.authorName}>{comment.authorName}</Text>
            <Text style={rowStyles.timeAgo}>{formatTimeAgo(comment.createdAt)}</Text>
          </View>
          <View style={rowStyles.headerActions}>
            {isOwn ? (
              <>
                <TouchableOpacity onPress={onEdit} style={rowStyles.actionIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={rowStyles.actionIconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={rowStyles.actionIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={rowStyles.actionIconText}>🗑</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={rowStyles.actionIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={rowStyles.reportIcon}>⚑</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={rowStyles.content}>{comment.content}</Text>
        <TouchableOpacity onPress={onLike} style={rowStyles.likeRow} activeOpacity={0.7}>
          <Text style={[rowStyles.likeThumb, isLiked && { color: accentColor }]}>
            👍
          </Text>
          {comment.likes > 0 && (
            <Text style={[rowStyles.likeCount, isLiked && { color: accentColor }]}>
              {comment.likes}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: { flexDirection: 'row', gap: SPACING.md },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarEmoji: { fontSize: 18 },
  body: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  authorName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  timeAgo: { fontSize: 11, color: '#6B7280' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionIcon: { padding: 6 },
  actionIconText: { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  reportIcon: { fontSize: 11, color: 'rgba(255,255,255,0.25)' },
  content: { fontSize: FONT_SIZES.sm, color: '#D1D5DB', lineHeight: 20, marginTop: 2 },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm },
  likeThumb: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  likeCount: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
});

/* ─── Edit inline input ─── */
function EditInput({ initialValue, accentColor, onSave, onCancel }: {
  initialValue: string; accentColor: string; onSave: (text: string) => void; onCancel: () => void;
}) {
  const [text, setText] = useState(initialValue);
  return (
    <View style={editStyles.container}>
      <TextInput
        style={editStyles.input}
        value={text}
        onChangeText={setText}
        autoFocus
        multiline
        maxLength={500}
      />
      <View style={editStyles.buttonRow}>
        <TouchableOpacity onPress={onCancel} style={editStyles.cancelButton}>
          <Text style={editStyles.cancelText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { if (text.trim()) onSave(text.trim()); }}
          style={[editStyles.saveButton, { backgroundColor: accentColor }]}
        >
          <Text style={editStyles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const editStyles = StyleSheet.create({
  container: { marginLeft: 48, gap: SPACING.sm },
  input: {
    fontSize: FONT_SIZES.sm, color: '#fff',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'transparent',
  },
  buttonRow: { flexDirection: 'row', gap: SPACING.sm },
  cancelButton: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cancelText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#fff' },
  saveButton: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
  saveText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#fff' },
});

/* ─── Main section ─── */
export function CommentSection({ templateId, accentColor }: CommentSectionProps) {
  const [comments, setComments] = useState<CareerPathComment[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    loadComments();
  }, [templateId]);

  const loadComments = useCallback(async () => {
    let fetched = await storage.careerPathComments.getByTemplate(templateId);
    if (fetched.length === 0) {
      const seeds = seedComments.filter((c) => c.templateId === templateId);
      for (const seed of seeds) {
        await storage.careerPathComments.add(seed as CareerPathComment);
      }
      fetched = await storage.careerPathComments.getByTemplate(templateId);
    }
    const liked = await storage.careerPathComments.getLikedIds();
    setComments(fetched);
    setLikedIds(liked);
  }, [templateId]);

  const handleAdd = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const newComment: CareerPathComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      templateId,
      authorName: '나',
      authorEmoji: '😊',
      content: trimmed,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = await storage.careerPathComments.add(newComment);
    setComments(updated);
    setInputText('');
  }, [inputText, templateId]);

  const handleEdit = useCallback(async (commentId: string, content: string) => {
    const updated = await storage.careerPathComments.update(commentId, content);
    setComments(updated);
    setEditingId(null);
  }, []);

  const handleDelete = useCallback(async (commentId: string) => {
    Alert.alert('댓글 삭제', '댓글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: async () => {
          const updated = await storage.careerPathComments.remove(commentId);
          setComments(updated);
        },
      },
    ]);
  }, []);

  const handleLike = useCallback(async (commentId: string) => {
    const result = await storage.careerPathComments.toggleLike(commentId);
    setLikedIds(result.likedIds);
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likes: result.liked ? c.likes + 1 : Math.max(0, c.likes - 1) }
          : c
      )
    );
  }, []);

  const hasInput = inputText.trim().length > 0;

  return (
    <View style={sectionStyles.container}>
      {/* Header */}
      <View style={sectionStyles.headerRow}>
        <Text style={sectionStyles.headerIcon}>💬</Text>
        <Text style={sectionStyles.headerTitle}>{CAREER_LABELS.commentSectionTitle} {comments.length}개</Text>
      </View>

      {/* Input */}
      <View style={sectionStyles.inputRow}>
        <View style={sectionStyles.inputAvatar}>
          <Text style={{ fontSize: 18 }}>😊</Text>
        </View>
        <View style={sectionStyles.inputWrapper}>
          <TextInput
            style={sectionStyles.input}
            placeholder={CAREER_LABELS.commentPlaceholder}
            placeholderTextColor="#4B5563"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          {hasInput && (
            <View style={sectionStyles.inputButtons}>
              <TouchableOpacity onPress={() => setInputText('')} style={sectionStyles.inputCancel}>
                <Text style={sectionStyles.inputCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                style={[sectionStyles.inputSubmit, { backgroundColor: accentColor }]}
              >
                <Text style={sectionStyles.inputSubmitText}>{CAREER_LABELS.commentSubmit}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Comment list */}
      {comments.length === 0 ? (
        <View style={sectionStyles.emptyContainer}>
          <Text style={sectionStyles.emptyIcon}>💬</Text>
          <Text style={sectionStyles.emptyText}>{CAREER_LABELS.commentEmpty}</Text>
        </View>
      ) : (
        <View style={sectionStyles.commentList}>
          {comments.map((comment) =>
            editingId === comment.id ? (
              <EditInput
                key={comment.id}
                initialValue={comment.content}
                accentColor={accentColor}
                onSave={(text) => handleEdit(comment.id, text)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <CommentRow
                key={comment.id}
                comment={comment}
                isLiked={likedIds.includes(comment.id)}
                isOwn={comment.authorName === '나'}
                accentColor={accentColor}
                onLike={() => handleLike(comment.id)}
                onEdit={() => setEditingId(comment.id)}
                onDelete={() => handleDelete(comment.id)}
              />
            )
          )}
        </View>
      )}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    marginTop: SPACING.xl, paddingTop: SPACING.xl,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  headerIcon: { fontSize: 16 },
  headerTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },

  inputRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  inputAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  inputWrapper: { flex: 1 },
  input: {
    fontSize: FONT_SIZES.sm, color: '#fff',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  inputButtons: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  inputCancel: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inputCancelText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#ccc' },
  inputSubmit: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
  inputSubmitText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#fff' },

  commentList: { gap: SPACING.lg },
  emptyContainer: { paddingVertical: SPACING.xxxl, alignItems: 'center', gap: SPACING.sm },
  emptyIcon: { fontSize: 40, color: '#374151' },
  emptyText: { fontSize: FONT_SIZES.sm, color: '#6B7280' },
});
