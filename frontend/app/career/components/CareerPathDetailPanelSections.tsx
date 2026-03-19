'use client';

import { ThumbsUp } from 'lucide-react';
import type { CareerPathTemplate } from '@/data/career-path-templates-index';

type Template = CareerPathTemplate;

type AdmissionTypeStrategiesTemplate = Template & {
  admissionTypeStrategies?: Record<string, string>;
};

type SuccessStoriesTemplate = Template & {
  successStories?: Array<{
    year: string;
    admissionType?: string;
    schoolName?: string;
    quote: string;
    strategy: string;
    tips?: string[];
  }>;
};

/* ─── 수시·정시·유학 전략 섹션 ─── */
export function AdmissionTypeStrategiesSection({ template }: { readonly template: Template }) {
  const tpl = template as AdmissionTypeStrategiesTemplate;
  if (!tpl.admissionTypeStrategies) return null;

  return (
    <div className="rounded-2xl overflow-hidden space-y-2"
      style={{ border: `1px solid ${template.starColor}30`, backgroundColor: `${template.starColor}0c` }}>
      <div className="px-4 py-2.5 font-bold text-[14px] text-white"
        style={{ backgroundColor: `${template.starColor}20` }}>
        수시 · 정시 · 유학 전략
      </div>
      <div className="px-4 pb-4 space-y-2">
        {Object.entries(tpl.admissionTypeStrategies).map(([type, strategy]) => (
          strategy && (
            <div key={type} className="flex gap-2">
              <span className="text-[13px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${template.starColor}30`, color: template.starColor }}>
                {type}
              </span>
              <span className="text-[13px] text-gray-300 leading-relaxed">{strategy}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

/* ─── 합격 후기 섹션 ─── */
export function SuccessStoriesSection({ template }: { readonly template: Template }) {
  const tpl = template as SuccessStoriesTemplate;
  if (!tpl.successStories?.length) return null;

  return (
    <div className="rounded-2xl overflow-hidden space-y-2"
      style={{ border: '1px solid rgba(251,191,36,0.3)', backgroundColor: 'rgba(251,191,36,0.06)' }}>
      <div className="px-4 py-2.5 font-bold text-[14px] text-white flex items-center gap-2"
        style={{ backgroundColor: 'rgba(251,191,36,0.15)' }}>
        <ThumbsUp style={{ width: 14, height: 14, color: '#FBBF24' }} />
        합격 후기
      </div>
      <div className="px-4 pb-4 space-y-4">
        {tpl.successStories.map((s, i) => (
          <div key={i} className="rounded-xl p-3 space-y-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-bold text-amber-400">{s.year}</span>
              {(s.admissionType || s.schoolName) && (
                <span className="text-[13px] text-gray-500">{s.admissionType ?? s.schoolName}</span>
              )}
            </div>
            <p className="text-[13px] text-amber-100/90 italic leading-relaxed">&ldquo;{s.quote}&rdquo;</p>
            <p className="text-[13px] text-gray-400 leading-relaxed">{s.strategy}</p>
            {s.tips?.length ? (
              <ul className="text-[13px] text-gray-500 space-y-0.5 list-disc list-inside">
                {s.tips.map((tip, j) => <li key={j}>{tip}</li>)}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
