'use client';

import { useMemo } from 'react';
import { Check, ClipboardList, Megaphone, Users } from 'lucide-react';
import {
  LABELS,
  PARTICIPATION_FLOW_STEPS,
  SPACE_PROGRAM_TYPES,
  SPACE_RECRUITMENT_STATUSES,
} from '../config';
import type {
  ParticipationApplicationStatus,
  SpaceNotice,
  SpaceParticipationApplication,
  SpaceProgramProposal,
  SpaceRecruitmentStatus,
} from '../types';

interface ParticipationFlowTrackerProps {
  status: ParticipationApplicationStatus;
}

function ParticipationFlowTracker({ status }: ParticipationFlowTrackerProps) {
  const currentIndex = PARTICIPATION_FLOW_STEPS.findIndex(step => step.id === status);
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {PARTICIPATION_FLOW_STEPS.map((step, index) => {
        const isComplete = index <= currentIndex;
        return (
          <div
            key={step.id}
            className="rounded-lg px-2 py-2 text-center"
            style={{
              backgroundColor: isComplete ? `${step.color}24` : 'rgba(148,163,184,0.12)',
              border: `1px solid ${isComplete ? `${step.color}55` : 'rgba(148,163,184,0.2)'}`,
            }}
          >
            <p className="text-xs font-bold" style={{ color: isComplete ? step.color : '#94A3B8' }}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

interface SpaceNoticePanelProps {
  notices: SpaceNotice[];
  canManage: boolean;
  noticeTitle: string;
  noticeContent: string;
  onNoticeTitleChange: (value: string) => void;
  onNoticeContentChange: (value: string) => void;
  onCreateNotice: () => void;
}

export function SpaceNoticePanel({
  notices,
  canManage,
  noticeTitle,
  noticeContent,
  onNoticeTitleChange,
  onNoticeContentChange,
  onCreateNotice,
}: SpaceNoticePanelProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Megaphone className="w-4 h-4 text-purple-300" />
        <span className="text-xs font-bold text-gray-300">{LABELS.spaceNoticeTitle}</span>
      </div>
      {canManage && (
        <div
          className="rounded-xl p-3 space-y-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <input
            value={noticeTitle}
            onChange={event => onNoticeTitleChange(event.target.value)}
            placeholder="공지 제목"
            className="w-full h-10 px-3 rounded-lg text-xs text-white placeholder-gray-500 outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <textarea
            value={noticeContent}
            onChange={event => onNoticeContentChange(event.target.value)}
            placeholder="공지 내용을 입력하세요"
            className="w-full min-h-[72px] px-3 py-2 rounded-lg text-xs text-white placeholder-gray-500 outline-none resize-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <button
            onClick={onCreateNotice}
            disabled={!noticeTitle.trim() || !noticeContent.trim()}
            className="h-9 px-3 rounded-lg text-xs font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
          >
            {LABELS.spaceNoticeCreateButton}
          </button>
        </div>
      )}
      {notices.length === 0 ? (
        <div className="rounded-xl p-4 text-center" style={{ border: '1px dashed rgba(255,255,255,0.15)' }}>
          <p className="text-xs text-gray-500">{LABELS.spaceNoticeEmpty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notices.map(notice => (
            <article
              key={notice.id}
              className="rounded-xl p-3"
              style={{ backgroundColor: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.22)' }}
            >
              <p className="text-xs font-bold text-white">{notice.title}</p>
              <p className="text-sm text-gray-300 mt-1 whitespace-pre-line">{notice.content}</p>
              <p className="text-xs text-gray-500 mt-2">{notice.createdByName}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

interface ProgramProposalCardsProps {
  proposals: SpaceProgramProposal[];
}

export function ProgramProposalCards({ proposals }: ProgramProposalCardsProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-pink-300" />
        <span className="text-xs font-bold text-gray-300">{LABELS.spaceProgramProposalTitle}</span>
      </div>
      {proposals.length === 0 ? (
        <div className="rounded-xl p-4 text-center" style={{ border: '1px dashed rgba(255,255,255,0.15)' }}>
          <p className="text-xs text-gray-500">{LABELS.spaceProgramProposalEmpty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {proposals.map(proposal => {
            const proposalType = SPACE_PROGRAM_TYPES.find(type => type.id === proposal.programType);
            return (
              <article
                key={proposal.id}
                className="rounded-xl p-3"
                style={{
                  backgroundColor: `${proposalType?.color ?? '#6C5CE7'}12`,
                  border: `1px solid ${proposalType?.color ?? '#6C5CE7'}33`,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-white">{proposal.title}</p>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${proposalType?.color ?? '#6C5CE7'}25`,
                      color: proposalType?.color ?? '#ddd6fe',
                    }}
                  >
                    {proposalType?.emoji} {proposalType?.label}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1">{proposal.summary}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <InfoCard label="목표" value={proposal.template.goal} />
                  <InfoCard label="기간" value={proposal.template.duration} />
                  <InfoCard label="준비물" value={proposal.template.preparations.join(', ')} />
                  <InfoCard label="비용" value={proposal.template.estimatedCost} />
                  <InfoCard label="인원" value={proposal.template.participantCapacity} />
                </div>
                <div className="mt-2 space-y-1">
                  {proposal.template.weeklyDeliverables.map(weekly => (
                    <p key={`${proposal.id}-${weekly.weekLabel}`} className="text-xs text-gray-400">
                      {weekly.weekLabel}: {weekly.deliverable}
                    </p>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg px-2 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-200 mt-0.5">{value}</p>
    </div>
  );
}

interface ParticipationApplicationPanelProps {
  recruitmentStatus: SpaceRecruitmentStatus;
  currentUserApplication: SpaceParticipationApplication | null;
  pendingApplications: SpaceParticipationApplication[];
  canManage: boolean;
  applyMessage: string;
  onApplyMessageChange: (value: string) => void;
  onApply: () => void;
  onApprove: (applicationId: string) => void;
  onAdvanceApplicationStatus: (applicationId: string) => void;
}

function getNextActionLabel(status: ParticipationApplicationStatus): string | null {
  if (status === 'approved') return LABELS.spaceJoinConfirmButton;
  if (status === 'confirmed') return LABELS.spaceProgressCheckButton;
  return null;
}

export function ParticipationApplicationPanel({
  recruitmentStatus,
  currentUserApplication,
  pendingApplications,
  canManage,
  applyMessage,
  onApplyMessageChange,
  onApply,
  onApprove,
  onAdvanceApplicationStatus,
}: ParticipationApplicationPanelProps) {
  const recruitmentMeta = useMemo(
    () => SPACE_RECRUITMENT_STATUSES.find(status => status.id === recruitmentStatus),
    [recruitmentStatus],
  );
  const nextActionLabel = currentUserApplication ? getNextActionLabel(currentUserApplication.status) : null;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-green-300" />
        <span className="text-xs font-bold text-gray-300">{LABELS.spaceApplicationFlowTitle}</span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${recruitmentMeta?.color ?? '#64748B'}22`,
            color: recruitmentMeta?.color ?? '#94A3B8',
          }}
        >
          {recruitmentMeta?.label ?? '모집중'}
        </span>
      </div>

      {currentUserApplication ? (
        <div
          className="rounded-xl p-3 space-y-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-xs font-bold text-white">내 신청 상태</p>
          <ParticipationFlowTracker status={currentUserApplication.status} />
          {nextActionLabel && (
            <button
              onClick={() => onAdvanceApplicationStatus(currentUserApplication.id)}
              className="h-9 px-3 rounded-lg text-xs font-bold text-white"
              style={{ backgroundColor: 'rgba(108,92,231,0.3)' }}
            >
              {nextActionLabel}
            </button>
          )}
        </div>
      ) : (
        <div
          className="rounded-xl p-3 space-y-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <textarea
            value={applyMessage}
            onChange={event => onApplyMessageChange(event.target.value)}
            placeholder={LABELS.spaceApplyMessagePlaceholder}
            className="w-full min-h-[72px] px-3 py-2 rounded-lg text-xs text-white placeholder-gray-500 outline-none resize-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            disabled={recruitmentStatus === 'closed'}
          />
          <button
            onClick={onApply}
            disabled={recruitmentStatus === 'closed' || !applyMessage.trim()}
            className="h-9 px-3 rounded-lg text-xs font-bold text-white disabled:opacity-40"
            style={{ backgroundColor: 'rgba(34,197,94,0.28)' }}
          >
            {LABELS.spaceJoinApplyButton}
          </button>
        </div>
      )}

      {canManage && (
        <div
          className="rounded-xl p-3 space-y-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-xs font-bold text-white">{LABELS.spacePendingApplicationsTitle} ({pendingApplications.length})</p>
          {pendingApplications.length === 0 ? (
            <p className="text-sm text-gray-500">대기 중인 신청이 없습니다.</p>
          ) : (
            pendingApplications.map(application => (
              <div
                key={application.id}
                className="rounded-lg p-2 flex items-center justify-between gap-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">
                    {application.applicantEmoji} {application.applicantName} · {application.applicantGrade}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">{application.message}</p>
                </div>
                <button
                  onClick={() => onApprove(application.id)}
                  className="h-7 px-2 rounded-md text-xs font-bold text-white flex items-center gap-1"
                  style={{ backgroundColor: 'rgba(59,130,246,0.35)' }}
                >
                  <Check className="w-3 h-3" /> 승인
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
