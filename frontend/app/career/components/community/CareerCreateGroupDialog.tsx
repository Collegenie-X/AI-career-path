'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Video, School, Shuffle, Globe, Lock } from 'lucide-react';
import { LABELS } from '../../config';
import {
  CAREER_GROUP_FORM_CONFIG,
  type CareerGroupFormSubmitPayload,
  type CareerGroupCategoryId,
  type CareerGroupModeId,
} from '../../config/communityGroupForm';

const MODE_ICONS = {
  online: Video,
  offline: School,
  hybrid: Shuffle,
} as const;

type Props = {
  onClose: () => void;
  onSubmit: (payload: CareerGroupFormSubmitPayload) => void | Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function CareerCreateGroupDialog({
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('👥');
  const [category, setCategory] = useState<CareerGroupCategoryId>('study');
  const [mode, setMode] = useState<CareerGroupModeId>('online');
  const [maxMembers, setMaxMembers] = useState(CAREER_GROUP_FORM_CONFIG.maxMembersDefault);
  const [tagsInput, setTagsInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const EMOJI_OPTIONS = ['👥', '💻', '🎨', '🔬', '🏥', '⚖️', '🚀', '🎵', '📚', '🌱', '🎮', '🏆'];
  const pending = Boolean(isSubmitting);
  const { maxMembersMin, maxMembersMax } = CAREER_GROUP_FORM_CONFIG;

  const parseTags = (raw: string): string[] =>
    raw.split(/[,，]/).map(t => t.trim()).filter(Boolean).slice(0, 20);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || pending) return;
    const clampedMax = Math.min(maxMembersMax, Math.max(maxMembersMin, maxMembers));
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      emoji,
      category,
      mode,
      maxMembers: clampedMax,
      tags: parseTags(tagsInput),
      isPublic,
    });
  };

  const overlay = (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center pointer-events-auto"
      data-layer="career-create-group-overlay"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => { if (!pending) onClose(); }}
      />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto flex flex-col"
        style={{
          backgroundColor: '#12122a',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: 'calc(100vh - 80px)',
          marginBottom: 80,
        }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-black text-white">
            {String(LABELS.community_group_create ?? '새 그룹 만들기')}
          </h3>
          <button
            type="button"
            onClick={() => { if (!pending) onClose(); }}
            disabled={pending}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-50"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 space-y-4 pb-10">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">
              {String(LABELS.community_group_icon_label ?? '그룹 아이콘')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  disabled={pending}
                  onClick={() => setEmoji(e)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all disabled:opacity-50"
                  style={emoji === e
                    ? { backgroundColor: 'rgba(108,92,231,0.2)', border: '2px solid #6C5CE7' }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">
              {String(LABELS.community_group_name_label ?? '그룹 이름')}
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={String(LABELS.community_group_name_placeholder ?? '')}
              disabled={pending}
              className="w-full min-h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none disabled:opacity-50"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">
              {String(LABELS.community_group_desc_label ?? '설명')}
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={String(LABELS.community_group_desc_placeholder ?? '')}
              disabled={pending}
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none disabled:opacity-50"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">
              {String(LABELS.community_group_category_label ?? '카테고리')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CAREER_GROUP_FORM_CONFIG.categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  disabled={pending}
                  onClick={() => setCategory(cat.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all disabled:opacity-50"
                  style={category === cat.id
                    ? { backgroundColor: `${cat.color}22`, border: `2px solid ${cat.color}`, color: '#fff' }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">
              {String(LABELS.community_group_mode_label ?? '진행 방식')}
            </label>
            <div className="flex gap-2">
              {CAREER_GROUP_FORM_CONFIG.modes.map(m => {
                const Icon = MODE_ICONS[m.id];
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={pending}
                    onClick={() => setMode(m.id)}
                    className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-bold transition-all disabled:opacity-50"
                    style={active
                      ? { backgroundColor: 'rgba(108,92,231,0.2)', border: '2px solid #6C5CE7', color: '#fff' }
                      : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    <Icon className="w-4 h-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">
              {String(LABELS.community_group_max_members_label ?? '최대 인원')}
              <span className="text-gray-500 font-normal ml-1">
                ({maxMembersMin}–{maxMembersMax})
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={maxMembersMin}
                max={maxMembersMax}
                value={maxMembers}
                disabled={pending}
                onChange={e => setMaxMembers(Number(e.target.value))}
                className="flex-1 accent-[#6C5CE7]"
              />
              <span className="text-sm font-bold text-white w-12 text-right tabular-nums">{maxMembers}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">
              {String(LABELS.community_group_tags_label ?? '태그')}
            </label>
            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder={String(LABELS.community_group_tags_placeholder ?? '')}
              disabled={pending}
              className="w-full min-h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none disabled:opacity-50"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <p className="text-[11px] text-gray-500 mt-1">
              {String(LABELS.community_group_tags_hint ?? '쉼표로 구분 · 최대 20개')}
            </p>
          </div>

          <div
            className="flex items-center justify-between px-3 py-3 rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-2">
              {isPublic ? <Globe className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-gray-500" />}
              <div>
                <div className="text-xs font-bold text-white">
                  {String(LABELS.community_group_public_toggle_label ?? '목록에 공개')}
                </div>
                <div className="text-[11px] text-gray-500">
                  {String(LABELS.community_group_public_toggle_desc ?? '끄면 초대로만 참여할 수 있어요')}
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => setIsPublic(!isPublic)}
              className="relative w-12 h-7 rounded-full transition-colors disabled:opacity-50"
              style={{ backgroundColor: isPublic ? '#6C5CE7' : 'rgba(255,255,255,0.15)' }}
            >
              <span
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ left: isPublic ? '26px' : '4px' }}
              />
            </button>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-400" role="alert">
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || pending}
            className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
          >
            {pending
              ? String(LABELS.community_group_creating ?? '만드는 중…')
              : String(LABELS.community_group_create_button ?? '그룹 만들기')}
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
}
