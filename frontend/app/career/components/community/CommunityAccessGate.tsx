'use client';

import { useState, useEffect } from 'react';
import { Users, KeyRound, Send, MessageSquare } from 'lucide-react';
import {
  hasCommunityAccess,
  setCommunityAccess,
  addCommunityJoinRequest,
} from '@/lib/communityAccess';

const DEMO_INVITE_CODE = 'DREAM2024';

const LABELS = {
  title: '커뮤니티는 제한적으로 운영됩니다',
  desc: '초대받은 분이거나 가입 요청 후 승인된 분만 이용할 수 있어요. 같은 목표를 가진 사람들과 안전하게 함께할 수 있습니다.',
  inviteLabel: '초대 코드 입력',
  invitePlaceholder: '초대 코드를 입력하세요',
  inviteButton: '코드로 입장하기',
  inviteSuccess: '입장 완료! 커뮤니티를 이용할 수 있어요',
  inviteError: '유효하지 않은 초대 코드예요',
  requestLabel: '가입 요청',
  requestDesc: '자기소개를 남기면 즉시 가입됩니다',
  requestIntroLabel: '간단한 자기 소개',
  requestIntroPlaceholder: '이름, 관심 분야, 가입 동기 등을 간단히 적어주세요',
  requestIntroRequired: '자기 소개를 입력해주세요',
  requestSubmit: '요청 보내기',
} as const;

type RequestStep = 'choose' | 'form';

type Props = {
  onAccessGranted: () => void;
  onBack?: () => void;
};

export function CommunityAccessGate({ onAccessGranted, onBack }: Props) {
  const [inviteCode, setInviteCode] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [requestStep, setRequestStep] = useState<RequestStep>('choose');
  const [introMessage, setIntroMessage] = useState('');
  const [introError, setIntroError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInviteSubmit = () => {
    setInviteError(null);
    const code = inviteCode.trim().toUpperCase();
    if (!code) { setInviteError(LABELS.inviteError); return; }
    if (code === DEMO_INVITE_CODE) {
      setCommunityAccess(true);
      setInviteSuccess(true);
      setTimeout(() => onAccessGranted(), 600);
    } else {
      setInviteError(LABELS.inviteError);
    }
  };

  const handleRequestFormSubmit = () => {
    setIntroError(null);
    const msg = introMessage.trim();
    if (!msg) { setIntroError(LABELS.requestIntroRequired); return; }
    addCommunityJoinRequest(msg);  // 즉시 access 부여
    setInviteSuccess(true);
    setTimeout(() => onAccessGranted(), 600);
  };

  if (!mounted) return null;

  return (
    <div className="py-6 px-4 space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-gray-400 active:text-white transition-colors"
        >
          ← 목록으로
        </button>
      )}

      <div className="text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(108,92,231,0.12)', border: '1px dashed rgba(108,92,231,0.35)' }}
        >
          <Users className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">{LABELS.title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-[280px] mx-auto">{LABELS.desc}</p>
      </div>

      {inviteSuccess ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}
        >
          <p className="text-sm font-semibold text-green-400">{LABELS.inviteSuccess}</p>
        </div>
      ) : requestStep === 'form' ? (
        <div className="space-y-4">
          <button
            onClick={() => setRequestStep('choose')}
            className="flex items-center gap-1 text-xs text-gray-400 active:text-white transition-colors"
          >
            ← 이전
          </button>
          <div className="space-y-2">
            <label className="text-xs text-gray-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              {LABELS.requestIntroLabel} *
            </label>
            <textarea
              value={introMessage}
              onChange={e => { setIntroMessage(e.target.value); setIntroError(null); }}
              placeholder={LABELS.requestIntroPlaceholder}
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: introError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
              }}
            />
            {introError && <p className="text-xs text-red-400">{introError}</p>}
          </div>
          <button
            onClick={handleRequestFormSubmit}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff' }}
          >
            <Send className="w-4 h-4" />
            {LABELS.requestSubmit}
          </button>
        </div>
      ) : (
        <>
          {/* 초대 코드 */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              {LABELS.inviteLabel}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={e => { setInviteCode(e.target.value); setInviteError(null); }}
                placeholder={LABELS.invitePlaceholder}
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: inviteError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                }}
              />
              <button
                onClick={handleInviteSubmit}
                className="px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff' }}
              >
                {LABELS.inviteButton}
              </button>
            </div>
            {inviteError && <p className="text-xs text-red-400">{inviteError}</p>}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <span className="text-[10px] text-gray-500">또는</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* 가입 요청 */}
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs text-gray-400 mb-2">{LABELS.requestDesc}</p>
            <button
              onClick={() => setRequestStep('form')}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Send className="w-4 h-4" />
              {LABELS.requestLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
