'use client';

import { useState } from 'react';
import {
  X, Globe, Shield, Lock, Users, Check, AlertTriangle,
} from 'lucide-react';
import type { ShareType } from './types';

type ShareOption = {
  id: ShareType;
  label: string;
  description: string;
  icon: typeof Globe;
  color: string;
  bgColor: string;
  borderColor: string;
};

const SHARE_OPTIONS: ShareOption[] = [
  {
    id: 'public',
    label: '전체 공유',
    description: '같은 학교 친구들과 그룹 멤버 모두 볼 수 있어요',
    icon: Globe,
    color: '#22C55E',
    bgColor: 'rgba(34,197,94,0.12)',
    borderColor: 'rgba(34,197,94,0.35)',
  },
  {
    id: 'operator',
    label: '운영자 공유',
    description: '진로 선생님만 볼 수 있어요 (비공개)',
    icon: Shield,
    color: '#6C5CE7',
    bgColor: 'rgba(108,92,231,0.12)',
    borderColor: 'rgba(108,92,231,0.35)',
  },
];

type Props = {
  planTitle: string;
  currentShareType: ShareType | null;
  onConfirm: (shareType: ShareType) => void;
  onMakePrivate: () => void;
  onClose: () => void;
};

export function ShareSettingsDialog({
  planTitle, currentShareType, onConfirm, onMakePrivate, onClose,
}: Props) {
  const [selected, setSelected] = useState<ShareType | null>(currentShareType);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto animate-slide-up flex flex-col"
        style={{
          backgroundColor: '#12122a',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: 'calc(100vh - 80px)',
          marginBottom: 80,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-lg font-black text-white">공유 설정</h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{planTitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Privacy notice */}
        <div className="mx-5 mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
          style={{ backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#FBBF24' }} />
          <p className="text-[11px] text-gray-300 leading-relaxed">
            나의 커리어 패스는 <span className="font-bold text-white">프라이버시</span>가 중요해요.
            공유 범위를 직접 선택할 수 있습니다.
          </p>
        </div>

        {/* Options */}
        <div className="px-5 space-y-2.5 pb-3">
          {SHARE_OPTIONS.map((option) => {
            const isActive = selected === option.id;
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className="w-full flex items-start gap-3.5 p-4 rounded-2xl text-left transition-all"
                style={{
                  backgroundColor: isActive ? option.bgColor : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isActive ? option.borderColor : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${option.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: option.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{option.label}</span>
                    {isActive && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: option.color }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="px-5 pb-8 pt-3 space-y-2">
          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
          >
            {selected ? (selected === 'public' ? '전체 공유하기' : '운영자에게 공유하기') : '공유 방식을 선택하세요'}
          </button>

          {currentShareType && (
            <button
              onClick={onMakePrivate}
              className="w-full h-10 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              공유 해제 (비공개로 전환)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
