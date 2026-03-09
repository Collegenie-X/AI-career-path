'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { KeyRound, MessageSquare, Send, X, CheckCircle } from 'lucide-react';

type JoinTarget = 'school' | 'group' | 'club';

const TARGET_LABELS: Record<JoinTarget, string> = {
  school: '학교',
  group: '그룹',
  club: '동아리',
};

type Props = {
  target: JoinTarget;
  targetName: string;
  validCode: string;
  onClose: () => void;
  onJoin: () => void;
};

export function JoinRequestDialog({ target, targetName, validCode, onClose, onJoin }: Props) {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => setMounted(true), []);

  const targetLabel = TARGET_LABELS[target];
  const codePlaceholder = target === 'club' ? '예: CLUB-SH-001' : target === 'school' ? '예: FUTURE2024' : '예: LP-AI-001';

  const handleCodeJoin = () => {
    setCodeError(null);
    const entered = code.trim().toUpperCase();
    if (!entered) { setCodeError('코드를 입력해주세요'); return; }
    if (entered !== validCode.toUpperCase()) { setCodeError('유효하지 않은 코드예요'); return; }
    onJoin();
    onClose();
  };

  const handleRequestJoin = () => {
    setMessageError(null);
    if (!message.trim()) { setMessageError('간단한 자기 소개를 입력해주세요'); return; }
    setDone(true);
    setTimeout(() => {
      onJoin();
      onClose();
    }, 1200);
  };

  if (!mounted) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto pb-5"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '85dvh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-black text-white">{targetLabel} 참여하기</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{targetName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <CheckCircle className="w-12 h-12" style={{ color: '#22C55E' }} />
            <p className="text-sm font-bold text-white">가입 요청을 보냈어요!</p>
            <p className="text-xs text-gray-400">운영자 승인 후 참여됩니다</p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-300 mb-2">
                <KeyRound className="w-3.5 h-3.5" />
                초대 코드로 즉시 참여
              </label>
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={e => { setCode(e.target.value); setCodeError(null); }}
                  placeholder={codePlaceholder}
                  className="flex-1 h-11 px-4 rounded-xl text-sm outline-none font-mono tracking-wider"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: codeError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                  }}
                />
                <button
                  onClick={handleCodeJoin}
                  disabled={!code.trim()}
                  className="px-4 h-11 rounded-xl text-sm font-bold disabled:opacity-40 transition-all active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff' }}
                >
                  참여
                </button>
              </div>
              {codeError && <p className="text-xs text-red-400 mt-1.5">{codeError}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <span className="text-[10px] text-gray-600 font-bold">또는</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-300 mb-2">
                <MessageSquare className="w-3.5 h-3.5" />
                가입 요청 보내기
              </label>
              <textarea
                value={message}
                onChange={e => { setMessage(e.target.value); setMessageError(null); }}
                placeholder="이름, 관심 분야, 가입 동기를 간단히 적어주세요"
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: messageError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              />
              {messageError && <p className="text-xs text-red-400 mt-1.5">{messageError}</p>}
              <button
                onClick={handleRequestJoin}
                disabled={!message.trim()}
                className="w-full h-11 mt-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-[0.98]"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <Send className="w-3.5 h-3.5" />
                요청 보내기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
