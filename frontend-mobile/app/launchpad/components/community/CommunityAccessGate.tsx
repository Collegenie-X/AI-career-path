'use client';

import { useState, useEffect } from 'react';
import { Users, KeyRound, Send, Loader2, MessageSquare } from 'lucide-react';
import { LAUNCHPAD_LABELS, COMMUNITY_DEMO_INVITE_CODE } from '../../config';
import { addJoinRequest, hasPendingRequest, getMyRequestId, approveRequest } from './communityRequests';

const STORAGE_KEY_ACCESS = 'launchpad_community_access';

function setAccess(granted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY_ACCESS, granted ? 'true' : 'false');
  } catch {}
}

type Props = {
  onAccessGranted: () => void;
  onBack?: () => void;
};

type RequestStep = 'choose' | 'form' | 'pending';

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
    setRequestStep(hasPendingRequest() ? 'pending' : 'choose');
  }, []);

  const handleInviteSubmit = () => {
    setInviteError(null);
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      setInviteError(LAUNCHPAD_LABELS.communityGateInviteError);
      return;
    }
    if (code === COMMUNITY_DEMO_INVITE_CODE) {
      setAccess(true);
      setInviteSuccess(true);
      setTimeout(() => onAccessGranted(), 600);
    } else {
      setInviteError(LAUNCHPAD_LABELS.communityGateInviteError);
    }
  };

  const handleRequestFormSubmit = () => {
    setIntroError(null);
    const msg = introMessage.trim();
    if (!msg) {
      setIntroError(LAUNCHPAD_LABELS.communityGateRequestIntroRequired);
      return;
    }
    addJoinRequest(msg);  // 내부에서 즉시 access 부여
    setInviteSuccess(true);
    setTimeout(() => onAccessGranted(), 600);
  };

  if (!mounted) return null;

  return (
    <div className="py-6 px-4 space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-gray-400 active:text-white transition-colors mb-2"
        >
          ← 목록으로
        </button>
      )}
      <div className="text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4"
          style={{ backgroundColor: 'rgba(108,92,231,0.12)', border: '1px dashed rgba(108,92,231,0.35)' }}
        >
          <Users className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">{LAUNCHPAD_LABELS.communityGateTitle}</h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-[280px] mx-auto">
          {LAUNCHPAD_LABELS.communityGateDesc}
        </p>
      </div>

      {requestStep === 'form' ? (
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
              {LAUNCHPAD_LABELS.communityGateRequestIntroLabel} *
            </label>
            <textarea
              value={introMessage}
              onChange={e => {
                setIntroMessage(e.target.value);
                setIntroError(null);
              }}
              placeholder={LAUNCHPAD_LABELS.communityGateRequestIntroPlaceholder}
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-colors"
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
            {LAUNCHPAD_LABELS.communityGateRequestSubmit}
          </button>
        </div>
      ) : requestStep === 'pending' ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <Loader2 className="w-10 h-10 text-amber-400 mx-auto mb-3 animate-spin" />
          <p className="text-sm font-semibold text-amber-200">{LAUNCHPAD_LABELS.communityGateRequestPending}</p>
          <p className="text-xs text-gray-500 mt-1">{LAUNCHPAD_LABELS.communityGateRequestPendingDesc}</p>
          <p className="text-[10px] text-gray-600 mt-3">
            (데모: 초대 코드 <code className="px-1 py-0.5 rounded bg-white/10">DREAM2024</code>로 바로 입장 가능)
          </p>
          <button
            onClick={() => {
              const myId = getMyRequestId();
              if (myId) {
                approveRequest(myId);
                setAccess(true);
                setTimeout(() => onAccessGranted(), 300);
              }
            }}
            className="mt-3 text-[10px] text-purple-400 underline"
          >
            {LAUNCHPAD_LABELS.communityAdminDemoApprove}
          </button>
        </div>
      ) : inviteSuccess ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}
        >
          <p className="text-sm font-semibold text-green-400">{LAUNCHPAD_LABELS.communityGateInviteSuccess}</p>
        </div>
      ) : (
        <>
          {/* 초대 코드 입력 */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              {LAUNCHPAD_LABELS.communityGateInviteLabel}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={e => {
                  setInviteCode(e.target.value);
                  setInviteError(null);
                }}
                placeholder={LAUNCHPAD_LABELS.communityGateInvitePlaceholder}
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: inviteError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                }}
              />
              <button
                onClick={handleInviteSubmit}
                className="px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff' }}
              >
                {LAUNCHPAD_LABELS.communityGateInviteButton}
              </button>
            </div>
            {inviteError && <p className="text-xs text-red-400">{inviteError}</p>}
          </div>

          {/* 구분선 */}
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
            <p className="text-xs text-gray-400 mb-2">{LAUNCHPAD_LABELS.communityGateRequestDesc}</p>
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
              {LAUNCHPAD_LABELS.communityGateRequestButton}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
