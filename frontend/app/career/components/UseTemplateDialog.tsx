'use client';

import { useState } from 'react';
import { LABELS } from '../config';

type UseTemplateDialogProps = {
  readonly templateTitle: string;
  readonly starColor: string;
  readonly onConfirm: (customTitle: string) => void;
  readonly onClose: () => void;
};

export function UseTemplateDialog({
  templateTitle,
  starColor,
  onConfirm,
  onClose,
}: UseTemplateDialogProps) {
  const [copiedTitle, setCopiedTitle] = useState(templateTitle);

  return (
    <div
      className="fixed inset-0 z-[10020] flex items-end justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl p-5 space-y-4"
        style={{ backgroundColor: '#0d0d24', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1.5">
          <h3 className="text-base font-black text-white">
            {(LABELS.explore_use_path_dialog_title as string) ?? '나만의 패스로 바로 적용할까요?'}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {(LABELS.explore_use_path_dialog_notice as string) ?? '원본을 그대로 복사하기보다, 내 목표와 일정에 맞게 수정해서 사용하는 것을 추천해요.'}
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400">
            {(LABELS.explore_use_path_dialog_title_label as string) ?? '카피 제목'}
          </label>
          <input
            value={copiedTitle}
            onChange={(e) => setCopiedTitle(e.target.value)}
            placeholder={(LABELS.explore_use_path_dialog_title_placeholder as string) ?? '예: 나의 AI 연구원 커리어 패스'}
            className="w-full h-11 px-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${starColor}45` }}
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="h-11 rounded-xl text-sm font-bold text-white/75"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            {(LABELS.explore_use_path_dialog_cancel as string) ?? '취소'}
          </button>
          <button
            onClick={() => {
              const trimmedTitle = copiedTitle.trim();
              onConfirm(trimmedTitle.length > 0 ? trimmedTitle : templateTitle);
            }}
            className="h-11 rounded-xl text-sm font-black text-white"
            style={{ background: `linear-gradient(135deg, ${starColor}, ${starColor}cc)` }}
          >
            {(LABELS.explore_use_path_dialog_confirm as string) ?? '나만의 패스로 적용하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
