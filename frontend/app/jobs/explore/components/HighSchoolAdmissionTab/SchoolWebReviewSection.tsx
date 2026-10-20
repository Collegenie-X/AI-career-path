'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { SchoolWebReview, SchoolWebReviewKind } from '../../types';
import { GlossaryText } from '../UniversityAdmissionTab/GlossaryText';

function HL({ text }: { text: string }) {
  return <GlossaryText>{text}</GlossaryText>;
}

const KIND_META: Record<SchoolWebReviewKind, { label: string; color: string }> = {
  official: { label: '🏫 학교 공식', color: '#60a5fa' },
  stats: { label: '📊 공시·통계', color: '#34d399' },
  news: { label: '📰 기사', color: '#fbbf24' },
  alumni: { label: '🎓 졸업생 후기', color: '#f472b6' },
  blog: { label: '✍️ 블로그·커뮤니티', color: '#a78bfa' },
};

const KIND_ORDER: SchoolWebReviewKind[] = ['alumni', 'blog', 'news', 'stats', 'official'];

/**
 * 학교 상세 — 홈페이지·공시·기사·졸업생 후기에서 모은 이야기 (항목마다 출처 링크)
 */
export function SchoolWebReviewSection({ review, color }: { review?: SchoolWebReview; color: string }) {
  const [filter, setFilter] = useState<SchoolWebReviewKind | 'all'>('all');
  if (!review || !review.items?.length) return null;

  const counts = review.items.reduce<Partial<Record<SchoolWebReviewKind, number>>>((acc, item) => {
    acc[item.kind] = (acc[item.kind] ?? 0) + 1;
    return acc;
  }, {});
  const kinds = KIND_ORDER.filter((k) => counts[k]);
  const items = filter === 'all' ? review.items : review.items.filter((item) => item.kind === filter);

  return (
    <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}30` }}>
      <p className="text-xs font-bold flex items-center gap-1.5" style={{ color }}>
        🔎 웹에서 모은 학교 이야기
      </p>
      <p className="text-[11px] text-gray-500 mt-0.5">
        홈페이지·학교알리미·기사·졸업생 후기 {review.items.length}건 · {review.asOf} 조사 · 카드마다 출처 링크
      </p>
      <p className="text-sm text-gray-100 leading-relaxed mt-2"><HL text={review.headline} /></p>

      {review.factChecks && review.factChecks.length > 0 && (
        <div className="mt-2.5 rounded-xl p-2.5" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <p className="text-[11px] font-bold mb-1.5" style={{ color: '#fbbf24' }}>
            ✅ 조사로 바로잡은 정보 {review.factChecks.length}
          </p>
          <ul className="space-y-1.5">
            {review.factChecks.map((fc, i) => (
              <li key={i} className="text-xs text-gray-200 leading-relaxed">
                • <HL text={fc.content} />{' '}
                <a
                  href={fc.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] inline-flex items-center gap-0.5 hover:opacity-80"
                  style={{ color: '#fbbf24' }}
                >
                  ({fc.source.label}
                  <ExternalLink className="w-2.5 h-2.5" />)
                </a>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-gray-500 mt-1.5">다른 설명과 다르면 이 내용이 더 최신이에요.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className="text-[11px] font-bold px-2 py-1 rounded-full transition-all"
          style={{
            background: filter === 'all' ? `${color}35` : 'rgba(255,255,255,0.06)',
            color: filter === 'all' ? color : '#9ca3af',
          }}
        >
          전체 {review.items.length}
        </button>
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className="text-[11px] font-bold px-2 py-1 rounded-full transition-all"
            style={{
              background: filter === k ? `${KIND_META[k].color}30` : 'rgba(255,255,255,0.06)',
              color: filter === k ? KIND_META[k].color : '#9ca3af',
            }}
          >
            {KIND_META[k].label} {counts[k]}
          </button>
        ))}
      </div>

      <div className="space-y-2 mt-2.5">
        {items.map((item, i) => {
          const meta = KIND_META[item.kind] ?? KIND_META.blog;
          return (
            <div
              key={`${item.title}-${i}`}
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)', borderLeft: `3px solid ${meta.color}` }}
            >
              <div className="px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="text-lg">{item.emoji}</span>
                <p className="text-xs font-bold text-white flex-1 min-w-0 break-words">{item.title}</p>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${meta.color}22`, color: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
              <div className="px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-sm text-gray-200 leading-relaxed"><HL text={item.content} /></p>
                {item.source?.url && (
                  <a
                    href={item.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-[11px] px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 hover:opacity-80 break-all"
                    style={{ background: `${meta.color}15`, color: meta.color }}
                  >
                    🔗 {item.source.label}
                    <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed mt-2.5">
        ⚠️ 후기·블로그는 개인 경험이라 해마다 달라요. 숫자는 출처 연도를 꼭 확인하고, 최신 정보는 학교 홈페이지·학교알리미에서 다시 보세요.
      </p>
    </div>
  );
}
