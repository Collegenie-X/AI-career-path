'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { LABELS } from '../config';

export type CareerItemExecutionRef = {
  readonly form: 'interview' | 'report' | 'paper' | 'book' | 'volunteer' | 'project' | 'campaign';
  readonly label: string;
  readonly feedId?: string;
};

const FORM_LABEL_KEYS: Record<CareerItemExecutionRef['form'], [string, string]> = {
  interview: ['execution_ref_form_interview', '인터뷰'],
  report: ['execution_ref_form_report', '탐구보고서'],
  paper: ['execution_ref_form_paper', '논문'],
  book: ['execution_ref_form_book', '책 저서'],
  volunteer: ['execution_ref_form_volunteer', '봉사활동'],
  project: ['execution_ref_form_project', '프로젝트'],
  campaign: ['execution_ref_form_campaign', '캠페인'],
};

type Props = { readonly executionRef: CareerItemExecutionRef };

/**
 * 패스 항목 → 커리어 실행 연결.
 * 패스는 "언제 무엇을 준비하는가"까지만 담고, 주차별 수행 계획은 커리어 실행에서 세운다.
 */
export function CareerPathExecutionRefChip({ executionRef }: Props) {
  const [labelKey, fallback] = FORM_LABEL_KEYS[executionRef.form] ?? ['', ''];
  const formLabel = String(LABELS[labelKey] ?? fallback);
  const href = executionRef.feedId
    ? `/dreammate?tab=feed&roadmap=${encodeURIComponent(executionRef.feedId)}`
    : '/dreammate?tab=feed';

  return (
    <Link
      href={href}
      className="mt-2 text-[11px] flex items-start gap-1.5 px-1.5 py-1 rounded-md hover:brightness-125 transition"
      style={{
        backgroundColor: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.3)',
        color: '#bbf7d0',
      }}
      title={String(LABELS.execution_ref_hint ?? '주차별 수행 계획은 커리어 실행에서 세웁니다')}
    >
      <span>🚀</span>
      <span className="flex-1 min-w-0">
        <span className="font-bold">
          {String(LABELS.execution_ref_title ?? '커리어 실행')} · {formLabel}
        </span>{' '}
        {executionRef.label}
      </span>
      <ArrowUpRight className="flex-shrink-0 mt-0.5" style={{ width: 12, height: 12 }} />
    </Link>
  );
}
