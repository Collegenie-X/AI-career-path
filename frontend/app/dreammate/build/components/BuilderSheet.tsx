'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  title: string;
  emoji?: string;
  accent?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** 기존 로드맵 편집기와 동일한 바텀시트 패턴 (rounded-t-3xl · #12122a) */
export function BuilderSheet({ title, emoji, accent = '#8b5cf6', onClose, children, footer }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[680px] rounded-t-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/45 ring-1 ring-white/[0.07] max-h-[88vh]"
        style={{ background: 'linear-gradient(180deg, #1a1035 0%, #12122a 100%)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 min-w-0">
            {emoji && <span className="text-lg">{emoji}</span>}
            <h3 className="text-base font-black text-white truncate">{title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">{children}</div>
        {footer && (
          <div className="flex-shrink-0 px-5 py-3" style={{ background: 'linear-gradient(to top, #12122a, rgba(18,18,42,0.9), transparent)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
