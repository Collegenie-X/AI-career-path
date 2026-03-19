'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Flag, X } from 'lucide-react';
import { LABELS, ROADMAP_REPORT_REASONS } from '../config';

interface RoadmapReportDialogProps {
  roadmapTitle: string;
  onClose: () => void;
  onSubmit: (reasonId: string, detail: string) => void;
}

export function RoadmapReportDialog({
  roadmapTitle,
  onClose,
  onSubmit,
}: RoadmapReportDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);
  const [detailInput, setDetailInput] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = () => {
    if (!selectedReasonId) {
      setReasonError(LABELS.roadmapReportReasonRequiredError);
      return;
    }
    onSubmit(selectedReasonId, detailInput);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto pb-5"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '85dvh' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
          <div className="min-w-0">
            <h3 className="text-base font-black text-white flex items-center gap-1.5">
              <Flag className="w-4 h-4 text-red-400" />
              {LABELS.roadmapReportDialogTitle}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{roadmapTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
            <p className="text-sm font-bold text-white">{LABELS.roadmapReportSuccessTitle}</p>
            <p className="text-xs text-gray-400">{LABELS.roadmapReportSuccessDescription}</p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-300 mb-2">{LABELS.roadmapReportReasonSectionTitle}</p>
              <div className="space-y-2">
                {ROADMAP_REPORT_REASONS.map((reason) => {
                  const isSelected = selectedReasonId === reason.id;
                  return (
                    <button
                      key={reason.id}
                      onClick={() => {
                        setSelectedReasonId(reason.id);
                        setReasonError(null);
                      }}
                      className="w-full rounded-xl p-3 text-left transition-all active:scale-[0.99]"
                      style={{
                        backgroundColor: isSelected ? 'rgba(108,92,231,0.18)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isSelected ? 'rgba(108,92,231,0.6)' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <p className="text-xs font-bold text-white">{reason.emoji} {reason.label}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{reason.description}</p>
                    </button>
                  );
                })}
              </div>
              {reasonError && <p className="text-xs text-red-400 mt-2">{reasonError}</p>}
            </div>

            <div>
              <p className="text-xs font-bold text-gray-300 mb-2">{LABELS.roadmapReportDetailSectionTitle}</p>
              <textarea
                value={detailInput}
                onChange={(event) => setDetailInput(event.target.value)}
                placeholder={LABELS.roadmapReportDetailPlaceholder}
                rows={4}
                maxLength={300}
                className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder-gray-500 outline-none resize-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl text-sm font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
              >
                {LABELS.roadmapReportCancelButton}
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 h-11 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                {LABELS.roadmapReportSubmitButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
