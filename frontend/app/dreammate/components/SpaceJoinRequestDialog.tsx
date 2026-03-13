'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, KeyRound, MessageSquare, Send, X } from 'lucide-react';
import { LABELS } from '../config';
import type { DreamSpace } from '../types';

interface SpaceJoinRequestDialogProps {
  space: DreamSpace;
  onClose: () => void;
  onJoin: () => void;
}

export function SpaceJoinRequestDialog({
  space,
  onClose,
  onJoin,
}: SpaceJoinRequestDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [requestMessageInput, setRequestMessageInput] = useState('');
  const [inviteCodeError, setInviteCodeError] = useState<string | null>(null);
  const [requestMessageError, setRequestMessageError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const validInviteCode = (space.inviteCode ?? space.id).toUpperCase();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleJoinByCode = () => {
    const normalizedCodeInput = inviteCodeInput.trim().toUpperCase();
    setInviteCodeError(null);
    if (!normalizedCodeInput) {
      setInviteCodeError(LABELS.spaceJoinCodeRequiredError);
      return;
    }
    if (normalizedCodeInput !== validInviteCode) {
      setInviteCodeError(LABELS.spaceJoinCodeInvalidError);
      return;
    }
    onJoin();
    onClose();
  };

  const handleJoinByRequest = () => {
    setRequestMessageError(null);
    if (!requestMessageInput.trim()) {
      setRequestMessageError(LABELS.spaceJoinRequestMessageRequiredError);
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      onJoin();
      onClose();
    }, 900);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto pb-5"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '85dvh' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-black text-white">{LABELS.spaceJoinDialogTitle}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{space.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <CheckCircle className="w-12 h-12" style={{ color: '#22C55E' }} />
            <p className="text-sm font-bold text-white">{LABELS.spaceJoinAutoAcceptedTitle}</p>
            <p className="text-xs text-gray-400">{LABELS.spaceJoinAutoAcceptedDescription}</p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-300 mb-2">
                <KeyRound className="w-3.5 h-3.5" />
                {LABELS.spaceJoinByCodeSectionLabel}
              </label>
              <div className="flex gap-2">
                <input
                  value={inviteCodeInput}
                  onChange={(event) => {
                    setInviteCodeInput(event.target.value);
                    setInviteCodeError(null);
                  }}
                  placeholder={LABELS.spaceJoinByCodePlaceholder}
                  className="flex-1 h-11 px-4 rounded-xl text-sm outline-none font-mono tracking-wider"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: inviteCodeError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                  }}
                />
                <button
                  onClick={handleJoinByCode}
                  disabled={!inviteCodeInput.trim()}
                  className="px-4 h-11 rounded-xl text-sm font-bold disabled:opacity-40 transition-all active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff' }}
                >
                  {LABELS.spaceJoinByCodeButton}
                </button>
              </div>
              {inviteCodeError && <p className="text-xs text-red-400 mt-1.5">{inviteCodeError}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <span className="text-[10px] text-gray-600 font-bold">{LABELS.spaceJoinDividerLabel}</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-300 mb-2">
                <MessageSquare className="w-3.5 h-3.5" />
                {LABELS.spaceJoinByRequestSectionLabel}
              </label>
              <textarea
                value={requestMessageInput}
                onChange={(event) => {
                  setRequestMessageInput(event.target.value);
                  setRequestMessageError(null);
                }}
                placeholder={LABELS.spaceJoinByRequestPlaceholder}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: requestMessageError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              />
              {requestMessageError && <p className="text-xs text-red-400 mt-1.5">{requestMessageError}</p>}
              <button
                onClick={handleJoinByRequest}
                disabled={!requestMessageInput.trim()}
                className="w-full h-11 mt-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-[0.98]"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <Send className="w-3.5 h-3.5" />
                {LABELS.spaceJoinByRequestButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
