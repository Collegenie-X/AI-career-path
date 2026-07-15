'use client';

import { ThumbsUp, ExternalLink } from 'lucide-react';
import type { CareerPathTemplate } from '@/data/path-templates';

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

/* ─── 봉사·캠프·수상·전시 추천 활동 섹션 ─── */
const ACTIVITY_GROUPS = [
  { key: 'volunteer', label: '봉사활동', emoji: '🤝', color: '#60a5fa' },
  { key: 'camp', label: '캠프', emoji: '🏕️', color: '#fbbf24' },
  { key: 'award', label: '수상·대회', emoji: '🏆', color: '#f472b6' },
  { key: 'exhibition', label: '전시회·메이커', emoji: '🎨', color: '#a78bfa' },
] as const;

type RecommendedActivities = NonNullable<CareerPathTemplate['recommendedActivities']>;

export function RecommendedActivitiesSection({ template }: { readonly template: Template }) {
  const activities = template.recommendedActivities;
  if (!activities) return null;

  const groups = ACTIVITY_GROUPS.filter(
    (g) => (activities[g.key as keyof RecommendedActivities]?.length ?? 0) > 0,
  );
  if (!groups.length) return null;

  return (
    <div className="rounded-2xl overflow-hidden space-y-2"
      style={{ border: `1px solid ${template.starColor}30`, backgroundColor: `${template.starColor}0c` }}>
      <div className="px-4 py-2.5 font-bold text-[14px] text-white"
        style={{ backgroundColor: `${template.starColor}20` }}>
        🌟 봉사 · 캠프 · 수상 · 전시 추천 활동
      </div>
      <div className="px-4 pb-4 space-y-4">
        {groups.map((g) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const items = (activities[g.key as keyof RecommendedActivities] ?? []) as any[];
          return (
            <div key={g.key} className="space-y-2">
              <h4 className="text-[13px] font-bold flex items-center gap-1.5" style={{ color: g.color }}>
                <span>{g.emoji}</span>{g.label}
              </h4>
              <div className="space-y-1.5">
                {items.map((item, i) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const it = item as any;
                  const meta = [it.host, it.period, it.venue, it.result, it.hours]
                    .filter(Boolean).join(' · ');
                  const desc = it.description || it.outcome;
                  return (
                    <div key={i} className="rounded-lg px-3 py-2"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[13px] font-semibold text-white">{it.title}</span>
                        {it.url && (
                          <a href={it.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center text-[11px] hover:underline"
                            style={{ color: g.color }}>
                            <ExternalLink style={{ width: 11, height: 11 }} />
                          </a>
                        )}
                      </div>
                      {meta && <p className="text-[12px] text-gray-400 mt-0.5">{meta}</p>}
                      {desc && <p className="text-[12px] text-gray-500 leading-relaxed mt-0.5">{desc}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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
        {tpl.successStories.map((s: { year: string; admissionType?: string; schoolName?: string; quote: string; strategy: string; tips?: string[] }, i) => (
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
