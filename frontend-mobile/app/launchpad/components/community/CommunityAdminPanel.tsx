'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { LAUNCHPAD_LABELS } from '../../config';
import {
  getPendingRequests,
  approveRequest,
  denyRequest,
  type CommunityJoinRequest,
} from './communityRequests';

type Props = {
  onApprove?: (requestId: string) => void;
};

export function CommunityAdminPanel({ onApprove }: Props) {
  const [requests, setRequests] = useState<CommunityJoinRequest[]>([]);
  const [expanded, setExpanded] = useState(false);

  const refresh = () => setRequests(getPendingRequests());

  useEffect(() => {
    refresh();
  }, []);

  const handleApprove = (id: string) => {
    approveRequest(id);
    refresh();
    onApprove?.();
  };

  const handleDeny = (id: string) => {
    denyRequest(id);
    refresh();
  };

  if (requests.length === 0 && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-left transition-all"
        style={{ backgroundColor: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.2)' }}
      >
        <span className="text-xs font-bold text-purple-300 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          {LAUNCHPAD_LABELS.communityAdminTitle}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.15)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2.5 px-4 text-left transition-all"
      >
        <span className="text-xs font-bold text-purple-300 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          {LAUNCHPAD_LABELS.communityAdminTitle}
          {requests.length > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(251,191,36,0.2)', color: '#FBBF24' }}
            >
              {requests.length}
            </span>
          )}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {requests.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">{LAUNCHPAD_LABELS.communityAdminEmpty}</p>
          ) : (
            requests.map(req => (
              <div
                key={req.id}
                className="rounded-xl p-3 space-y-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-sm text-gray-200 whitespace-pre-wrap">{req.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">
                    {new Date(req.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeny(req.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                      style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      <X className="w-3 h-3" />
                      {LAUNCHPAD_LABELS.communityAdminDeny}
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                      style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}
                    >
                      <Check className="w-3 h-3" />
                      {LAUNCHPAD_LABELS.communityAdminApprove}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
